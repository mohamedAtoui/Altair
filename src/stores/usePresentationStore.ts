// ── NEBULA 3D Visualization — Presentation Store ─────────────────────
import { create } from 'zustand';
import type { SceneSnapshot } from '../types/index';

interface PresentationState {
  snapshots: SceneSnapshot[];
  activeIndex: number;
  isStoryMode: boolean;
  isPlaying: boolean;
}

interface PresentationActions {
  addSnapshot: (snapshot: SceneSnapshot) => void;
  removeSnapshot: (id: string) => void;
  setActiveIndex: (idx: number) => void;
  toggleStoryMode: () => void;
  togglePlaying: () => void;
  updateSnapshot: (id: string, partial: Partial<SceneSnapshot>) => void;
}

export const usePresentationStore = create<
  PresentationState & PresentationActions
>((set) => ({
  // ── State ──────────────────────────────────────────────────────────
  snapshots: [],
  activeIndex: 0,
  isStoryMode: false,
  isPlaying: false,

  // ── Actions ────────────────────────────────────────────────────────
  addSnapshot: (snapshot) =>
    set((s) => ({ snapshots: [...s.snapshots, snapshot] })),

  removeSnapshot: (id) =>
    set((s) => ({
      snapshots: s.snapshots.filter((snap) => snap.id !== id),
    })),

  setActiveIndex: (idx) => set({ activeIndex: idx }),

  toggleStoryMode: () => set((s) => ({ isStoryMode: !s.isStoryMode })),

  togglePlaying: () => set((s) => ({ isPlaying: !s.isPlaying })),

  updateSnapshot: (id, partial) =>
    set((s) => ({
      snapshots: s.snapshots.map((snap) =>
        snap.id === id ? { ...snap, ...partial } : snap,
      ),
    })),
}));
