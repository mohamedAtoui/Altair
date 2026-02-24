import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Vector3 } from 'three';
import { useGraphStore } from '../../stores/useGraphStore';
import { useParticleStore } from '../../stores/useParticleStore';
import { useDataStore } from '../../stores/useDataStore';

const _tempVec = new Vector3();
const MAX_PROXIMITY_LABELS = 12;

interface VisibleNodeLabel {
  index: number;
  text: string;
  position: [number, number, number];
  opacity: number;
}

export function NodeLabels() {
  const showLabels = useGraphStore((s) => s.showLabels);
  const topologyMode = useGraphStore((s) => s.topologyMode);
  const clusterLabels = useGraphStore((s) => s.clusterLabels);
  const selectedIndex = useParticleStore((s) => s.selectedIndex);
  const count = useParticleStore((s) => s.count);
  const nodeLabelsRef = useRef<VisibleNodeLabel[]>([]);

  const { camera } = useThree();

  useFrame(() => {
    if (!showLabels || count === 0) {
      nodeLabelsRef.current = [];
      return;
    }

    const { currentPositions } = useParticleStore.getState();
    const { rows, mapping } = useDataStore.getState();
    const labelCol = mapping.labelColumn;
    if (!labelCol || rows.length === 0) {
      nodeLabelsRef.current = [];
      return;
    }

    const camPos = camera.position;

    // Compute distances for all nodes
    const distances: { index: number; dist: number }[] = [];
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      _tempVec.set(currentPositions[i3], currentPositions[i3 + 1], currentPositions[i3 + 2]);
      distances.push({ index: i, dist: _tempVec.distanceTo(camPos) });
    }

    // Sort by distance, take nearest
    distances.sort((a, b) => a.dist - b.dist);

    const visible: VisibleNodeLabel[] = [];

    // Always show selected node
    if (selectedIndex !== null && selectedIndex >= 0 && rows[selectedIndex]) {
      const i3 = selectedIndex * 3;
      const text = String(rows[selectedIndex][labelCol] ?? '');
      if (text) {
        visible.push({
          index: selectedIndex,
          text,
          position: [currentPositions[i3], currentPositions[i3 + 1] + 0.15, currentPositions[i3 + 2]],
          opacity: 1.0,
        });
      }
    }

    // Add nearest nodes
    const shownIndices = new Set(visible.map((v) => v.index));
    for (const d of distances) {
      if (visible.length >= MAX_PROXIMITY_LABELS) break;
      if (shownIndices.has(d.index)) continue;

      const text = String(rows[d.index]?.[labelCol] ?? '');
      if (!text) continue;

      const i3 = d.index * 3;
      const opacity = Math.max(0.15, Math.min(0.8, 1 - d.dist / 15));

      visible.push({
        index: d.index,
        text: text.length > 20 ? text.slice(0, 20) + '...' : text,
        position: [currentPositions[i3], currentPositions[i3 + 1] + 0.12, currentPositions[i3 + 2]],
        opacity,
      });
    }

    nodeLabelsRef.current = visible;
  });

  if (!showLabels || count === 0) return null;

  return (
    <group>
      {/* Node text labels */}
      {nodeLabelsRef.current.map((v) => (
        <Text
          key={v.index}
          position={v.position}
          fontSize={0.07}
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
          fillOpacity={v.opacity}
          outlineWidth={0.003}
          outlineColor="#000000"
        >
          {v.text}
        </Text>
      ))}

      {/* Cluster labels in decentralized mode */}
      {topologyMode === 'decentralized' &&
        clusterLabels.map((cl) => (
          <Text
            key={cl.text}
            position={cl.position}
            fontSize={0.18}
            color={cl.color}
            anchorX="center"
            anchorY="bottom"
            fillOpacity={0.9}
            outlineWidth={0.005}
            outlineColor="#000000"
            fontWeight="bold"
          >
            {cl.text.toUpperCase()}
          </Text>
        ))}
    </group>
  );
}
