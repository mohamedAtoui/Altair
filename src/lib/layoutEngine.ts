import type { GraphEdge, EdgeLabel } from '../types/index';
import { computeKnnEdges } from './graphProcessing';
import { SCENE_SCALE } from '../constants/index';

/**
 * Centralized layout: hub-and-spoke.
 * Finds the highest-degree node (or centroid-nearest), places it at origin,
 * arranges others on a sphere via fibonacci spiral.
 */
export function computeCentralizedLayout(
  basePositions: Float32Array,
  count: number,
  edges: GraphEdge[],
): { positions: Float32Array; edges: GraphEdge[]; hubIndex: number } {
  if (count === 0) return { positions: new Float32Array(0), edges: [], hubIndex: -1 };

  // Find hub: highest degree node
  const degree = new Int32Array(count);
  for (const e of edges) {
    degree[e.source]++;
    degree[e.target]++;
  }

  let hubIndex = 0;
  let maxDeg = 0;
  for (let i = 0; i < count; i++) {
    if (degree[i] > maxDeg) {
      maxDeg = degree[i];
      hubIndex = i;
    }
  }

  // Fallback: closest to centroid
  if (maxDeg === 0) {
    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      cx += basePositions[i3];
      cy += basePositions[i3 + 1];
      cz += basePositions[i3 + 2];
    }
    cx /= count; cy /= count; cz /= count;
    let bestDist = Infinity;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const dx = basePositions[i3] - cx;
      const dy = basePositions[i3 + 1] - cy;
      const dz = basePositions[i3 + 2] - cz;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bestDist) { bestDist = d; hubIndex = i; }
    }
  }

  const positions = new Float32Array(count * 3);
  const radius = SCENE_SCALE * 0.9;

  // Hub at origin
  positions[hubIndex * 3] = 0;
  positions[hubIndex * 3 + 1] = 0;
  positions[hubIndex * 3 + 2] = 0;

  // Others on fibonacci sphere
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  let idx = 0;
  for (let i = 0; i < count; i++) {
    if (i === hubIndex) continue;
    const t = idx / (count - 2);
    const phi = Math.acos(1 - 2 * (idx + 0.5) / (count - 1));
    const theta = goldenAngle * idx;

    const i3 = i * 3;
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    idx++;
  }

  // Star edges: hub connects to every other node
  const starEdges: GraphEdge[] = [];
  for (let i = 0; i < count; i++) {
    if (i === hubIndex) continue;
    const a = Math.min(i, hubIndex);
    const b = Math.max(i, hubIndex);
    starEdges.push({ source: a, target: b, weight: 0.8 });
  }

  return { positions, edges: starEdges, hubIndex };
}

/**
 * Decentralized layout: cluster-based.
 * Groups nodes by category index, positions each cluster on a sphere,
 * spreads nodes within cluster with gaussian offset.
 */
export function computeDecentralizedLayout(
  basePositions: Float32Array,
  count: number,
  categoryIndices: Int32Array,
  categoryNames: string[],
  categoryColors: string[],
): {
  positions: Float32Array;
  edges: GraphEdge[];
  clusterLabels: { text: string; position: [number, number, number]; color: string }[];
} {
  if (count === 0) {
    return { positions: new Float32Array(0), edges: [], clusterLabels: [] };
  }

  // Group nodes by category
  const groups = new Map<number, number[]>();
  for (let i = 0; i < count; i++) {
    const cat = categoryIndices[i];
    const g = groups.get(cat);
    if (g) g.push(i); else groups.set(cat, [i]);
  }

  const numGroups = groups.size;
  const positions = new Float32Array(count * 3);
  const clusterCenters = new Map<number, [number, number, number]>();

  // Distribute cluster centers on sphere
  const clusterRadius = SCENE_SCALE * 0.7;
  const spreadRadius = SCENE_SCALE * 0.35;
  let groupIdx = 0;

  for (const [cat, members] of groups) {
    // Fibonacci point for cluster center
    const phi = Math.acos(1 - 2 * (groupIdx + 0.5) / numGroups);
    const theta = Math.PI * (1 + Math.sqrt(5)) * groupIdx;

    const cx = clusterRadius * Math.sin(phi) * Math.cos(theta);
    const cy = clusterRadius * Math.sin(phi) * Math.sin(theta);
    const cz = clusterRadius * Math.cos(phi);
    clusterCenters.set(cat, [cx, cy, cz]);

    // Place members around cluster center
    for (let m = 0; m < members.length; m++) {
      const nodeIdx = members[m];
      const i3 = nodeIdx * 3;

      // Gaussian-ish spread using the original position as seed for variation
      const angle1 = (m / members.length) * Math.PI * 2;
      const angle2 = ((m * 0.618) % 1) * Math.PI;
      const r = spreadRadius * (0.2 + 0.8 * Math.sqrt(m / Math.max(members.length, 1)));

      positions[i3] = cx + r * Math.sin(angle2) * Math.cos(angle1);
      positions[i3 + 1] = cy + r * Math.sin(angle2) * Math.sin(angle1);
      positions[i3 + 2] = cz + r * Math.cos(angle2);
    }

    groupIdx++;
  }

  // Edges: intra-cluster (2-3 nearest) + inter-cluster bridges
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  const addEdge = (a: number, b: number, w: number) => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const key = `${lo}-${hi}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ source: lo, target: hi, weight: w });
    }
  };

  // Intra-cluster edges: connect each node to 2-3 nearest within cluster
  for (const [, members] of groups) {
    for (const node of members) {
      const ni3 = node * 3;
      const dists: { idx: number; dist: number }[] = [];
      for (const other of members) {
        if (other === node) continue;
        const oi3 = other * 3;
        const dx = positions[ni3] - positions[oi3];
        const dy = positions[ni3 + 1] - positions[oi3 + 1];
        const dz = positions[ni3 + 2] - positions[oi3 + 2];
        dists.push({ idx: other, dist: dx * dx + dy * dy + dz * dz });
      }
      dists.sort((a, b) => a.dist - b.dist);
      const k = Math.min(3, dists.length);
      for (let n = 0; n < k; n++) {
        addEdge(node, dists[n].idx, 0.7);
      }
    }
  }

  // Inter-cluster edges: connect cluster centroids (use nearest members)
  const catKeys = [...groups.keys()];
  for (let a = 0; a < catKeys.length; a++) {
    for (let b = a + 1; b < catKeys.length; b++) {
      const membersA = groups.get(catKeys[a])!;
      const membersB = groups.get(catKeys[b])!;
      // Find closest pair between clusters
      let bestDist = Infinity;
      let bestA = membersA[0], bestB = membersB[0];
      for (const na of membersA.slice(0, 10)) {
        for (const nb of membersB.slice(0, 10)) {
          const na3 = na * 3, nb3 = nb * 3;
          const dx = positions[na3] - positions[nb3];
          const dy = positions[na3 + 1] - positions[nb3 + 1];
          const dz = positions[na3 + 2] - positions[nb3 + 2];
          const d = dx * dx + dy * dy + dz * dz;
          if (d < bestDist) { bestDist = d; bestA = na; bestB = nb; }
        }
      }
      addEdge(bestA, bestB, 0.3);
    }
  }

  // Cluster labels
  const clusterLabels: { text: string; position: [number, number, number]; color: string }[] = [];
  for (const [cat, center] of clusterCenters) {
    const name = categoryNames[cat] ?? `Cluster ${cat}`;
    const color = categoryColors[cat] ?? '#00ffa3';
    clusterLabels.push({
      text: name,
      position: [center[0], center[1] + spreadRadius * 0.8, center[2]],
      color,
    });
  }

  return { positions, edges, clusterLabels };
}

/**
 * Distributed layout: k-NN network.
 * Keeps base UMAP positions and computes k-NN edges with edge labels.
 */
export function computeDistributedLayout(
  basePositions: Float32Array,
  count: number,
  k: number = 4,
  labels?: string[],
): { positions: Float32Array; edges: GraphEdge[]; edgeLabels: EdgeLabel[] } {
  if (count === 0) {
    return { positions: new Float32Array(0), edges: [], edgeLabels: [] };
  }

  // Use base positions as-is
  const positions = new Float32Array(basePositions);

  // Compute k-NN edges
  const edges = computeKnnEdges(basePositions, count, k);

  // Generate edge labels from label data
  const edgeLabels: EdgeLabel[] = [];
  if (labels && labels.length >= count) {
    // Only label a subset of edges (max ~40) for performance
    const maxLabels = Math.min(edges.length, 40);
    for (let i = 0; i < maxLabels; i++) {
      const e = edges[i];
      const srcLabel = labels[e.source] ?? '';
      const tgtLabel = labels[e.target] ?? '';
      if (srcLabel && tgtLabel) {
        // Create short combined label
        const src = srcLabel.length > 12 ? srcLabel.slice(0, 12) : srcLabel;
        const tgt = tgtLabel.length > 12 ? tgtLabel.slice(0, 12) : tgtLabel;
        edgeLabels.push({
          source: e.source,
          target: e.target,
          text: `${src} — ${tgt}`,
        });
      }
    }
  }

  return { positions, edges, edgeLabels };
}
