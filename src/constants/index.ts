// ── Topologies of Thoughts — Tunable Constants ─────────────────────

// ── One‑Euro filter parameters ──────────────────────────────────────
export const ONE_EURO_BETA = 0.007;
export const ONE_EURO_MIN_CUTOFF = 1.0;
export const ONE_EURO_D_CUTOFF = 1.0;

// ── Gesture detection thresholds ────────────────────────────────────
export const PINCH_DISTANCE = 0.05;
export const FIST_CURL_THRESHOLD = 0.08;
export const POINT_EXTEND_THRESHOLD = 0.15;
export const GESTURE_DEBOUNCE_FRAMES = 3;
export const SWIPE_VELOCITY_THRESHOLD = 0.04;
export const SWIPE_COOLDOWN_MS = 1500;

// ── Physics / animation ─────────────────────────────────────────────
export const REPEL_RADIUS = 2.0;
export const REPEL_STRENGTH = 0.15;
export const SPRING_STIFFNESS = 0.08;
export const COLLAPSE_SPEED = 0.1;
export const LERP_ALPHA = 0.08;
export const DAMP_LAMBDA = 4;
export const TOPOLOGY_TRANSITION_MS = 800;

// ── Visual / post‑processing ────────────────────────────────────────
export const BLOOM_INTENSITY = 1.5;
export const BLOOM_THRESHOLD = 0.2;
export const BLOOM_SMOOTHING = 0.4;
export const DEFAULT_PARTICLE_COLOR = '#ffffff';
export const HAND_CURSOR_COLOR = '#00ffa3';
export const PARTICLE_EMISSIVE_MULTIPLIER = 2.0;
export const HIGHLIGHT_EMISSIVE = 1.5;
export const DIM_EMISSIVE = 0.3;

// ── Node sizes ──────────────────────────────────────────────────────
export const NODE_BASE_SIZE = 0.05;
export const NODE_HUB_SIZE = 0.15;

// ── Neon edge colors ────────────────────────────────────────────────
export const EDGE_CYAN = '#00e5ff';
export const EDGE_MAGENTA = '#e040fb';
export const EDGE_WHITE = '#ffffff';

// ── Graph / topology ───────────────────────────────────────────────
export const ACCENT_COLOR = '#00ffa3';
export const EDGE_COLOR = '#ffffff';
export const EDGE_OPACITY = 0.08;
export const TOPOLOGY_PANEL_WIDTH = 280;

// ── Scene defaults ──────────────────────────────────────────────────
export const SCENE_SCALE = 4.0;
export const CAMERA_POSITION = [0, 0, 8] as const;
export const CAMERA_FOV = 50;
export const MAX_DPR = 1.5;
export const SELECT_DISTANCE = 0.5;

// ── Hand‑tracking / webcam ──────────────────────────────────────────
export const HAND_TRACKING_FPS = 30;
export const WEBCAM_WIDTH = 640;
export const WEBCAM_HEIGHT = 480;

// ── UI layout ───────────────────────────────────────────────────────
export const PANEL_WIDTH = 280;
export const PANEL_COLLAPSED_WIDTH = 48;
export const WEBCAM_PREVIEW_WIDTH = 160;
export const WEBCAM_PREVIEW_HEIGHT = 120;

// ── Presentation / story mode ───────────────────────────────────────
export const SNAPSHOT_TRANSITION_DURATION = 1.0;
export const STORY_AUTO_ADVANCE_MS = 5000;

// ── UMAP dimensionality reduction ───────────────────────────────────
export const UMAP_N_COMPONENTS = 3;
export const UMAP_N_NEIGHBORS = 15;
export const UMAP_MIN_DIST = 0.1;
