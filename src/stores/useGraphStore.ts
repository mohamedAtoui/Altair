import { create } from 'zustand';
import type { GraphEdge, TopologyMode, EdgeLabel, ClusterLabel } from '../types/index';

interface GraphState {
  edges: GraphEdge[];
  topologyMode: TopologyMode;
  showLabels: boolean;
  showEdges: boolean;
  edgeLabels: EdgeLabel[];
  clusterLabels: ClusterLabel[];
  hubNodeIndex: number | null;
}

interface GraphActions {
  setEdges: (edges: GraphEdge[]) => void;
  setTopologyMode: (mode: TopologyMode) => void;
  toggleLabels: () => void;
  toggleEdges: () => void;
  setEdgeLabels: (labels: EdgeLabel[]) => void;
  setClusterLabels: (labels: ClusterLabel[]) => void;
  setHubNodeIndex: (index: number | null) => void;
}

export const useGraphStore = create<GraphState & GraphActions>((set) => ({
  edges: [],
  topologyMode: 'distributed',
  showLabels: true,
  showEdges: true,
  edgeLabels: [],
  clusterLabels: [],
  hubNodeIndex: null,

  setEdges: (edges) => set({ edges }),
  setTopologyMode: (mode) => set({ topologyMode: mode }),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleEdges: () => set((s) => ({ showEdges: !s.showEdges })),
  setEdgeLabels: (labels) => set({ edgeLabels: labels }),
  setClusterLabels: (labels) => set({ clusterLabels: labels }),
  setHubNodeIndex: (index) => set({ hubNodeIndex: index }),
}));
