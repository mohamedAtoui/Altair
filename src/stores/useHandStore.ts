// ── NEBULA 3D Visualization — Hand Tracking Store ────────────────────
import { create } from 'zustand';
import { Gesture } from '../types/index';

interface HandState {
  rawLandmarks: number[][] | null;
  smoothedPosition: [number, number, number];
  worldPosition: [number, number, number];
  currentGesture: Gesture;
  gestureConfidence: number;
  isHandDetected: boolean;
}

interface HandActions {
  setRawLandmarks: (landmarks: number[][] | null) => void;
  setSmoothedPosition: (position: [number, number, number]) => void;
  setWorldPosition: (position: [number, number, number]) => void;
  setCurrentGesture: (gesture: Gesture, confidence: number) => void;
  setHandDetected: (detected: boolean) => void;
}

export const useHandStore = create<HandState & HandActions>((set) => ({
  // ── State ──────────────────────────────────────────────────────────
  rawLandmarks: null,
  smoothedPosition: [0, 0, 0],
  worldPosition: [0, 0, 0],
  currentGesture: Gesture.None,
  gestureConfidence: 0,
  isHandDetected: false,

  // ── Actions ────────────────────────────────────────────────────────
  setRawLandmarks: (landmarks) => set({ rawLandmarks: landmarks }),

  setSmoothedPosition: (position) => set({ smoothedPosition: position }),

  setWorldPosition: (position) => set({ worldPosition: position }),

  setCurrentGesture: (gesture, confidence) =>
    set({ currentGesture: gesture, gestureConfidence: confidence }),

  setHandDetected: (detected) => set({ isHandDetected: detected }),
}));
