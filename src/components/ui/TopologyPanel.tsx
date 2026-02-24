import { useCallback, useMemo } from 'react';
import { useGraphStore } from '../../stores/useGraphStore';
import { useParticleStore } from '../../stores/useParticleStore';
import { useDataStore } from '../../stores/useDataStore';
import {
  computeCentralizedLayout,
  computeDecentralizedLayout,
  computeDistributedLayout,
} from '../../lib/layoutEngine';
import { computeTopologyColors } from '../../lib/dataProcessing';
import type { TopologyMode, TopologyModeConfig } from '../../types/index';
import { TOPOLOGY_PANEL_WIDTH, TOPOLOGY_TRANSITION_MS } from '../../constants/index';
import { schemeTableau10 } from 'd3-scale-chromatic';

const TOPOLOGY_MODES: TopologyModeConfig[] = [
  {
    id: 'centralized',
    name: 'Centralized',
    description: 'Hub-and-spoke — one central node connects to all others',
    diagramNodes: [[50, 50], [20, 20], [80, 20], [20, 80], [80, 80], [50, 15], [50, 85]],
    diagramEdges: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]],
  },
  {
    id: 'decentralized',
    name: 'Decentralized',
    description: 'Clustered — dense local groups with sparse bridges',
    diagramNodes: [[25, 30], [35, 20], [20, 45], [70, 55], [80, 70], [75, 40]],
    diagramEdges: [[0, 1], [0, 2], [1, 2], [3, 4], [3, 5], [4, 5], [2, 5]],
  },
  {
    id: 'distributed',
    name: 'Distributed',
    description: 'k-NN network — each node connected to nearest neighbors',
    diagramNodes: [[30, 20], [70, 20], [50, 50], [30, 80], [70, 80], [15, 50], [85, 50]],
    diagramEdges: [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [3, 4], [0, 5], [1, 6], [3, 5], [4, 6]],
  },
];

function TopologyDiagram({ mode, isActive }: { mode: TopologyModeConfig; isActive: boolean }) {
  const accentColor = isActive ? '#00ffa3' : 'rgba(255,255,255,0.3)';
  const nodeColor = isActive ? '#00ffa3' : '#ffffff';

  return (
    <svg width="60" height="60" viewBox="0 0 100 100" style={{ display: 'block' }}>
      {mode.diagramEdges.map(([a, b], i) => {
        const [x1, y1] = mode.diagramNodes[a];
        const [x2, y2] = mode.diagramNodes[b];
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={accentColor}
            strokeWidth="1.5"
            opacity={isActive ? 0.6 : 0.3}
          />
        );
      })}
      {mode.diagramNodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === 0 && mode.id === 'centralized' ? 5 : 3}
          fill={nodeColor}
          opacity={isActive ? 1 : 0.5}
        />
      ))}
    </svg>
  );
}

export function TopologyPanel() {
  const topologyMode = useGraphStore((s) => s.topologyMode);
  const showEdges = useGraphStore((s) => s.showEdges);
  const toggleEdges = useGraphStore((s) => s.toggleEdges);
  const showLabels = useGraphStore((s) => s.showLabels);
  const toggleLabels = useGraphStore((s) => s.toggleLabels);

  const currentMode = useMemo(
    () => TOPOLOGY_MODES.find((m) => m.id === topologyMode) ?? TOPOLOGY_MODES[2],
    [topologyMode]
  );

  const handleModeChange = useCallback(
    (mode: TopologyMode) => {
      const particle = useParticleStore.getState();
      const dataStore = useDataStore.getState();
      const graphStore = useGraphStore.getState();

      if (particle.count === 0) return;

      const { basePositions, count } = particle;

      // Get category info
      const colorCol = dataStore.columns.find((c) => c.name === dataStore.mapping.colorColumn);
      const categoryNames = colorCol?.categories ?? [];
      const categoryColors = schemeTableau10.slice(0, categoryNames.length) as unknown as string[];

      // Build category indices
      const catMap = new Map((categoryNames).map((c, i) => [c, i]));
      const catIndices = new Int32Array(count);
      for (let i = 0; i < count; i++) {
        const val = String(dataStore.rows[i]?.[dataStore.mapping.colorColumn ?? ''] ?? '');
        catIndices[i] = catMap.get(val) ?? 0;
      }

      // Labels for edge labels
      const labelCol = dataStore.mapping.labelColumn;
      const labels = labelCol ? dataStore.rows.map((r) => String(r[labelCol] ?? '')) : undefined;

      // Clear old state
      useGraphStore.setState({ edgeLabels: [], clusterLabels: [], hubNodeIndex: null });

      let newPositions: Float32Array;
      let newEdges = graphStore.edges;

      switch (mode) {
        case 'centralized': {
          const result = computeCentralizedLayout(basePositions, count, graphStore.edges);
          newPositions = result.positions;
          newEdges = result.edges;
          useGraphStore.setState({ hubNodeIndex: result.hubIndex });
          break;
        }
        case 'decentralized': {
          const result = computeDecentralizedLayout(
            basePositions, count, catIndices, categoryNames, categoryColors
          );
          newPositions = result.positions;
          newEdges = result.edges;
          useGraphStore.setState({ clusterLabels: result.clusterLabels });
          break;
        }
        case 'distributed':
        default: {
          const result = computeDistributedLayout(basePositions, count, 4, labels);
          newPositions = result.positions;
          newEdges = result.edges;
          useGraphStore.setState({ edgeLabels: result.edgeLabels });
          break;
        }
      }

      // Topology colors
      const topologyColors = computeTopologyColors(
        count, mode,
        mode === 'centralized' ? useGraphStore.getState().hubNodeIndex : null,
        catIndices,
      );

      // Apply transition
      useParticleStore.getState().setTargetPositions(newPositions);
      useGraphStore.setState({ edges: newEdges, topologyMode: mode });

      const { colors } = useParticleStore.getState();
      for (let i = 0; i < count * 3; i++) {
        colors[i] = topologyColors[i];
      }

      // Commit after transition
      setTimeout(() => {
        useParticleStore.getState().commitPositions();
      }, TOPOLOGY_TRANSITION_MS);
    },
    []
  );

  const toggleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const switchStyle = (on: boolean): React.CSSProperties => ({
    width: 28,
    height: 14,
    borderRadius: 0,
    background: on ? 'rgba(0,255,163,0.3)' : 'rgba(255,255,255,0.08)',
    border: `1px solid ${on ? '#00ffa3' : 'rgba(255,255,255,0.15)'}`,
    position: 'relative',
    transition: 'all 150ms ease',
    flexShrink: 0,
  });

  const switchDotStyle = (on: boolean): React.CSSProperties => ({
    width: 8,
    height: 8,
    background: on ? '#00ffa3' : 'rgba(255,255,255,0.4)',
    position: 'absolute',
    top: 2,
    left: on ? 16 : 2,
    transition: 'all 150ms ease',
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 800,
        width: TOPOLOGY_PANEL_WIDTH,
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 0,
        padding: 16,
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.08) transparent',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '3px',
          color: '#00ffa3',
          marginBottom: 16,
        }}
      >
        Topology
      </div>

      {/* Current mode name */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.92)',
          marginBottom: 4,
        }}
      >
        // {currentMode.name.toUpperCase()}
      </div>
      <div
        style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          marginBottom: 16,
          lineHeight: 1.4,
        }}
      >
        {currentMode.description}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '8px 0 12px' }} />

      {/* Mode list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
        {TOPOLOGY_MODES.map((mode) => {
          const isActive = mode.id === topologyMode;
          return (
            <div
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                cursor: 'pointer',
                background: isActive ? 'rgba(0,255,163,0.06)' : 'transparent',
                border: isActive
                  ? '1px solid rgba(0,255,163,0.2)'
                  : '1px solid transparent',
                transition: 'all 150ms ease',
              }}
            >
              <TopologyDiagram mode={mode} isActive={isActive} />
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: isActive ? '#00ffa3' : 'rgba(255,255,255,0.6)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {mode.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '8px 0 12px' }} />

      {/* Toggle switches */}
      <div onClick={toggleEdges} style={toggleStyle}>
        <span>Show Edges</span>
        <div style={switchStyle(showEdges)}>
          <div style={switchDotStyle(showEdges)} />
        </div>
      </div>

      <div onClick={toggleLabels} style={toggleStyle}>
        <span>Show Labels</span>
        <div style={switchStyle(showLabels)}>
          <div style={switchDotStyle(showLabels)} />
        </div>
      </div>
    </div>
  );
}
