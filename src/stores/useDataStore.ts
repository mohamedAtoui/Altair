// ── NEBULA 3D Visualization — Data Store ─────────────────────────────
import { create } from 'zustand';
import type {
  DataRow,
  ColumnMeta,
  DataMapping,
  ColumnStats,
  CorrelationResult,
  FilterState,
} from '../types/index';

interface DataState {
  rows: DataRow[];
  columns: ColumnMeta[];
  mapping: DataMapping;
  umapEmbedding: number[][] | null;
  processingProgress: number;
  stats: ColumnStats[];
  correlations: CorrelationResult[];
  filters: FilterState;
}

interface DataActions {
  setData: (rows: DataRow[], columns: ColumnMeta[]) => void;
  setMapping: (partial: Partial<DataMapping>) => void;
  setUmapEmbedding: (embedding: number[][]) => void;
  setProcessingProgress: (n: number) => void;
  setStats: (stats: ColumnStats[]) => void;
  setCorrelations: (correlations: CorrelationResult[]) => void;
  setFilter: (category: string, visible: boolean) => void;
  resetFilters: () => void;
  clear: () => void;
}

const defaultMapping: DataMapping = {
  positionMode: 'umap',
  xColumn: undefined,
  yColumn: undefined,
  zColumn: undefined,
  colorColumn: undefined,
  sizeColumn: undefined,
  labelColumn: undefined,
};

export const useDataStore = create<DataState & DataActions>((set) => ({
  // ── State ──────────────────────────────────────────────────────────
  rows: [],
  columns: [],
  mapping: { ...defaultMapping },
  umapEmbedding: null,
  processingProgress: 0,
  stats: [],
  correlations: [],
  filters: {},

  // ── Actions ────────────────────────────────────────────────────────
  setData: (rows, columns) => set({ rows, columns }),

  setMapping: (partial) =>
    set((s) => ({ mapping: { ...s.mapping, ...partial } })),

  setUmapEmbedding: (embedding) => set({ umapEmbedding: embedding }),

  setProcessingProgress: (n) => set({ processingProgress: n }),

  setStats: (stats) => set({ stats }),

  setCorrelations: (correlations) => set({ correlations }),

  setFilter: (category, visible) =>
    set((s) => ({ filters: { ...s.filters, [category]: visible } })),

  resetFilters: () => set({ filters: {} }),

  clear: () =>
    set({
      rows: [],
      columns: [],
      mapping: { ...defaultMapping },
      umapEmbedding: null,
      processingProgress: 0,
      stats: [],
      correlations: [],
      filters: {},
    }),
}));
