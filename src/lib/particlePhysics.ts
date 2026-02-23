import {
  REPEL_RADIUS,
  REPEL_STRENGTH,
  COLLAPSE_SPEED,
  DAMP_LAMBDA,
} from '../constants/index';

/**
 * Push particles away from hand position with inverse-square falloff.
 */
export function applyRepel(
  currentPositions: Float32Array,
  targetPositions: Float32Array,
  basePositions: Float32Array,
  handX: number,
  handY: number,
  handZ: number,
  count: number
) {
  const r2 = REPEL_RADIUS * REPEL_RADIUS;
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const dx = currentPositions[i3] - handX;
    const dy = currentPositions[i3 + 1] - handY;
    const dz = currentPositions[i3 + 2] - handZ;
    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq < r2 && distSq > 0.001) {
      const dist = Math.sqrt(distSq);
      const force = REPEL_STRENGTH * (1 - dist / REPEL_RADIUS);
      const nx = dx / dist;
      const ny = dy / dist;
      const nz = dz / dist;
      targetPositions[i3] = currentPositions[i3] + nx * force;
      targetPositions[i3 + 1] = currentPositions[i3 + 1] + ny * force;
      targetPositions[i3 + 2] = currentPositions[i3 + 2] + nz * force;
    } else {
      // Spring back to base
      targetPositions[i3] = basePositions[i3];
      targetPositions[i3 + 1] = basePositions[i3 + 1];
      targetPositions[i3 + 2] = basePositions[i3 + 2];
    }
  }
}

/**
 * Collapse all particles to origin (or category centroids if provided).
 */
export function applyCollapse(
  targetPositions: Float32Array,
  count: number,
  centroids?: Map<number, [number, number, number]>,
  categoryIndices?: Int32Array
) {
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    if (centroids && categoryIndices) {
      const cat = categoryIndices[i];
      const c = centroids.get(cat);
      if (c) {
        targetPositions[i3] = c[0];
        targetPositions[i3 + 1] = c[1];
        targetPositions[i3 + 2] = c[2];
        continue;
      }
    }
    targetPositions[i3] = 0;
    targetPositions[i3 + 1] = 0;
    targetPositions[i3 + 2] = 0;
  }
}

/**
 * Spring particles back to their base positions.
 */
export function applySpringBack(
  targetPositions: Float32Array,
  basePositions: Float32Array,
  count: number
) {
  for (let i = 0; i < count * 3; i++) {
    targetPositions[i] = basePositions[i];
  }
}

/**
 * Frame-rate independent damping: moves current toward target.
 * Uses THREE.MathUtils.damp formula: current + (target - current) * (1 - e^(-lambda * dt))
 */
export function dampPositions(
  currentPositions: Float32Array,
  targetPositions: Float32Array,
  count: number,
  delta: number,
  lambda: number = DAMP_LAMBDA
) {
  const factor = 1 - Math.exp(-lambda * delta);
  for (let i = 0; i < count * 3; i++) {
    currentPositions[i] += (targetPositions[i] - currentPositions[i]) * factor;
  }
}

/**
 * Find the nearest particle to a given 3D point.
 * Returns index and distance, or -1 if none found.
 */
export function findNearestParticle(
  positions: Float32Array,
  count: number,
  px: number,
  py: number,
  pz: number,
  maxDistance: number
): { index: number; distance: number } {
  let bestIdx = -1;
  let bestDist = maxDistance * maxDistance;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const dx = positions[i3] - px;
    const dy = positions[i3 + 1] - py;
    const dz = positions[i3 + 2] - pz;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 < bestDist) {
      bestDist = d2;
      bestIdx = i;
    }
  }

  return { index: bestIdx, distance: Math.sqrt(bestDist) };
}

/**
 * Compute category centroids from particle base positions.
 */
export function computeCentroids(
  basePositions: Float32Array,
  categoryIndices: Int32Array,
  count: number
): Map<number, [number, number, number]> {
  const sums = new Map<number, [number, number, number, number]>();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const cat = categoryIndices[i];
    const s = sums.get(cat) ?? [0, 0, 0, 0];
    s[0] += basePositions[i3];
    s[1] += basePositions[i3 + 1];
    s[2] += basePositions[i3 + 2];
    s[3]++;
    sums.set(cat, s);
  }

  const centroids = new Map<number, [number, number, number]>();
  for (const [cat, s] of sums) {
    centroids.set(cat, [s[0] / s[3], s[1] / s[3], s[2] / s[3]]);
  }
  return centroids;
}
