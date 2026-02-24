// ── Topologies of Thoughts — App Store ──────────────────────────────
import { create } from 'zustand';

export type AppMode = 'idle' | 'loading' | 'exploring' | 'presenting';
export type HandTrackingStatus = 'off' | 'initializing' | 'active' | 'error';

interface AppState {
  mode: AppMode;
  isHandTrackingActive: boolean;
  handTrackingStatus: HandTrackingStatus;
  isPanelCollapsed: boolean;
  isWebcamVisible: boolean;
  isOnboardingComplete: boolean;
  error: string | null;
}

interface AppActions {
  setMode: (mode: AppMode) => void;
  setHandTrackingActive: (active: boolean) => void;
  setHandTrackingStatus: (status: HandTrackingStatus) => void;
  togglePanel: () => void;
  toggleWebcam: () => void;
  setOnboardingComplete: (complete: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  mode: 'idle',
  isHandTrackingActive: false,
  handTrackingStatus: 'off',
  isPanelCollapsed: true,
  isWebcamVisible: true,
  isOnboardingComplete: false,
  error: null,

  setMode: (mode) => set({ mode }),
  setHandTrackingActive: (active) => set({ isHandTrackingActive: active }),
  setHandTrackingStatus: (status) => set({ handTrackingStatus: status }),
  togglePanel: () => set((s) => ({ isPanelCollapsed: !s.isPanelCollapsed })),
  toggleWebcam: () => set((s) => ({ isWebcamVisible: !s.isWebcamVisible })),
  setOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
  setError: (error) => set({ error }),
}));
