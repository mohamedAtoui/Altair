// ── NEBULA 3D Visualization — App Store ──────────────────────────────
import { create } from 'zustand';

export type AppMode = 'idle' | 'loading' | 'exploring' | 'presenting';

interface AppState {
  mode: AppMode;
  isHandTrackingActive: boolean;
  isPanelCollapsed: boolean;
  isWebcamVisible: boolean;
  isOnboardingComplete: boolean;
  error: string | null;
}

interface AppActions {
  setMode: (mode: AppMode) => void;
  setHandTrackingActive: (active: boolean) => void;
  togglePanel: () => void;
  toggleWebcam: () => void;
  setOnboardingComplete: (complete: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  // ── State ──────────────────────────────────────────────────────────
  mode: 'idle',
  isHandTrackingActive: true,
  isPanelCollapsed: false,
  isWebcamVisible: true,
  isOnboardingComplete: false,
  error: null,

  // ── Actions ────────────────────────────────────────────────────────
  setMode: (mode) => set({ mode }),
  setHandTrackingActive: (active) => set({ isHandTrackingActive: active }),
  togglePanel: () => set((s) => ({ isPanelCollapsed: !s.isPanelCollapsed })),
  toggleWebcam: () => set((s) => ({ isWebcamVisible: !s.isWebcamVisible })),
  setOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
  setError: (error) => set({ error }),
}));
