// ── Topologies of Thoughts — Particle Store ─────────────────────────
import { create } from 'zustand';

interface ParticleState {
  count: number;
  basePositions: Float32Array;
  currentPositions: Float32Array;
  targetPositions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  scales: Float32Array;
  selectedIndex: number | null;
  highlightedCluster: string | null;
}

interface ParticleActions {
  initializeRandom: (count: number) => void;
  setFromData: (
    positions: Float32Array,
    colors: Float32Array,
    sizes: Float32Array,
  ) => void;
  resetTargets: () => void;
  setSelectedIndex: (idx: number | null) => void;
  setHighlightedCluster: (cluster: string | null) => void;
  setTargetPositions: (positions: Float32Array) => void;
  commitPositions: () => void;
}

// Default white nodes
const DEFAULT_R = 1.0;
const DEFAULT_G = 1.0;
const DEFAULT_B = 1.0;

const DEFAULT_SIZE = 0.05;
const DEFAULT_SCALE = 1;

export const useParticleStore = create<ParticleState & ParticleActions>(
  (set, get) => ({
    // ── State ────────────────────────────────────────────────────────
    count: 0,
    basePositions: new Float32Array(0),
    currentPositions: new Float32Array(0),
    targetPositions: new Float32Array(0),
    colors: new Float32Array(0),
    sizes: new Float32Array(0),
    scales: new Float32Array(0),
    selectedIndex: null,
    highlightedCluster: null,

    // ── Actions ──────────────────────────────────────────────────────

    initializeRandom: (count) => {
      const posLength = count * 3;
      const basePositions = new Float32Array(posLength);
      const colors = new Float32Array(posLength);
      const sizes = new Float32Array(count);
      const scales = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        // Random position in [-4, 4] for x, y, z
        const i3 = i * 3;
        basePositions[i3] = Math.random() * 8 - 4;
        basePositions[i3 + 1] = Math.random() * 8 - 4;
        basePositions[i3 + 2] = Math.random() * 8 - 4;

        // Default white color
        colors[i3] = DEFAULT_R;
        colors[i3 + 1] = DEFAULT_G;
        colors[i3 + 2] = DEFAULT_B;

        // Default size and scale
        sizes[i] = DEFAULT_SIZE;
        scales[i] = DEFAULT_SCALE;
      }

      // Copy base to current and target
      const currentPositions = new Float32Array(basePositions);
      const targetPositions = new Float32Array(basePositions);

      set({
        count,
        basePositions,
        currentPositions,
        targetPositions,
        colors,
        sizes,
        scales,
        selectedIndex: null,
        highlightedCluster: null,
      });
    },

    setFromData: (positions, colors, sizes) => {
      const count = positions.length / 3;
      const currentPositions = new Float32Array(positions);
      const targetPositions = new Float32Array(positions);
      const scales = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        scales[i] = DEFAULT_SCALE;
      }

      set({
        count,
        basePositions: positions,
        currentPositions,
        targetPositions,
        colors,
        sizes,
        scales,
      });
    },

    resetTargets: () => {
      const { basePositions } = get();
      set({ targetPositions: new Float32Array(basePositions) });
    },

    setSelectedIndex: (idx) => set({ selectedIndex: idx }),

    setHighlightedCluster: (cluster) => set({ highlightedCluster: cluster }),

    /** Set new target positions for topology transitions (animate via damping). */
    setTargetPositions: (positions) => {
      set({ targetPositions: new Float32Array(positions) });
    },

    /** Copy current positions to base (after transition settles). */
    commitPositions: () => {
      const { currentPositions } = get();
      set({ basePositions: new Float32Array(currentPositions) });
    },
  }),
);
