import type { GraphEdge, DataRow } from '../types/index';

/**
 * Brute-force k-NN on 3D positions. Returns deduplicated symmetric edges.
 */
export function computeKnnEdges(
  positions: Float32Array,
  count: number,
  k: number
): GraphEdge[] {
  if (count < 2 || k < 1) return [];
  const effectiveK = Math.min(k, count - 1);
  const edgeSet = new Set<string>();
  const edges: GraphEdge[] = [];

  for (let i = 0; i < count; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;

    // Compute distances to all other points
    const dists: { idx: number; dist: number }[] = [];
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      const jx = j * 3;
      const dx = positions[ix] - positions[jx];
      const dy = positions[iy] - positions[jx + 1];
      const dz = positions[iz] - positions[jx + 2];
      dists.push({ idx: j, dist: dx * dx + dy * dy + dz * dz });
    }

    // Partial sort: find k nearest
    dists.sort((a, b) => a.dist - b.dist);

    for (let n = 0; n < effectiveK; n++) {
      const neighbor = dists[n];
      const a = Math.min(i, neighbor.idx);
      const b = Math.max(i, neighbor.idx);
      const key = `${a}-${b}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({
          source: a,
          target: b,
          weight: 1 / (1 + Math.sqrt(neighbor.dist)),
        });
      }
    }
  }

  return edges;
}

/**
 * Compute centroid positions per category for bracket labels.
 */
export function computeCategoryCentroids(
  positions: Float32Array,
  rows: DataRow[],
  colorColumn: string,
  count: number
): { text: string; position: [number, number, number] }[] {
  const groups = new Map<string, { sum: [number, number, number]; count: number }>();

  for (let i = 0; i < count; i++) {
    const cat = String(rows[i]?.[colorColumn] ?? '');
    if (!cat) continue;
    const i3 = i * 3;
    const existing = groups.get(cat);
    if (existing) {
      existing.sum[0] += positions[i3];
      existing.sum[1] += positions[i3 + 1];
      existing.sum[2] += positions[i3 + 2];
      existing.count++;
    } else {
      groups.set(cat, {
        sum: [positions[i3], positions[i3 + 1], positions[i3 + 2]],
        count: 1,
      });
    }
  }

  const centroids: { text: string; position: [number, number, number] }[] = [];
  for (const [text, { sum, count: n }] of groups) {
    centroids.push({
      text,
      position: [sum[0] / n, sum[1] / n, sum[2] / n],
    });
  }

  return centroids;
}
