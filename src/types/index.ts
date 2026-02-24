// ── Topologies of Thoughts — Shared Types ──────────────────────────

/** Recognised hand‑gesture states. */
export const Gesture = {
  None: 'None',
  OpenHand: 'OpenHand',
  Pinch: 'Pinch',
  Fist: 'Fist',
  Point: 'Point',
  SwipeLeft: 'SwipeLeft',
  SwipeRight: 'SwipeRight',
} as const;
export type Gesture = (typeof Gesture)[keyof typeof Gesture];

/** A single row of imported data (every cell is either a string or a number). */
export type DataRow = Record<string, string | number>;

/** High‑level classification of a data column. */
export type ColumnType = 'numeric' | 'categorical' | 'text';

/** Metadata / summary statistics for one column of the dataset. */
export interface ColumnMeta {
  name: string;
  type: ColumnType;
  min?: number;
  max?: number;
  mean?: number;
  stddev?: number;
  categories?: string[];
  uniqueCount: number;
}

/** Which columns drive position, colour, size, and labels in the scene. */
export interface DataMapping {
  positionMode: 'umap' | 'manual';
  xColumn?: string;
  yColumn?: string;
  zColumn?: string;
  colorColumn?: string;
  sizeColumn?: string;
  labelColumn?: string;
}

/**
 * GPU‑friendly buffers that back the particle cloud.
 * All typed arrays are interleaved vec3 / scalar data.
 */
export interface ParticleData {
  count: number;
  basePositions: Float32Array;
  currentPositions: Float32Array;
  targetPositions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  scales: Float32Array;
}

/** A saved camera / mapping / filter state that can be revisited. */
export interface SceneSnapshot {
  id: string;
  name: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  mapping: DataMapping;
  filters: Record<string, boolean>;
  highlightedCluster: string | null;
  labels: FloatingLabelData[];
}

/** A text label anchored at a 3‑D world position. */
export interface FloatingLabelData {
  id: string;
  text: string;
  position: [number, number, number];
}

/**
 * MediaPipe hand landmarks — 21 points, each represented as [x, y, z].
 * Values are normalised to 0‑1 relative to the image frame.
 */
export type HandLandmarks = number[][];

/** Per‑category visibility toggles. */
export type FilterState = Record<string, boolean>;

/** Descriptive statistics for a single column. */
export interface ColumnStats {
  column: string;
  type: ColumnType;
  count: number;
  min?: number;
  max?: number;
  mean?: number;
  stddev?: number;
  valueCounts?: Record<string, number>;
}

/** Pearson‑r correlation between two numeric columns. */
export interface CorrelationResult {
  col1: string;
  col2: string;
  r: number;
  strength: 'strong' | 'moderate' | 'weak';
}

/** An edge between two nodes in the graph. */
export interface GraphEdge {
  source: number;
  target: number;
  weight: number;
}

/** A label displayed on an edge in distributed mode. */
export interface EdgeLabel {
  source: number;
  target: number;
  text: string;
}

/** Available topology layout modes. */
export type TopologyMode = 'centralized' | 'decentralized' | 'distributed';

/** Configuration for a topology mode's display in the panel. */
export interface TopologyModeConfig {
  id: TopologyMode;
  name: string;
  description: string;
  diagramNodes: [number, number][];
  diagramEdges: [number, number][];
}

/** Cluster label positioned in 3D space. */
export interface ClusterLabel {
  text: string;
  position: [number, number, number];
  color: string;
}
