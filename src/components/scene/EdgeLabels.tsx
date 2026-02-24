import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Vector3 } from 'three';
import { useGraphStore } from '../../stores/useGraphStore';
import { useParticleStore } from '../../stores/useParticleStore';

const _tempVec = new Vector3();
const MAX_VISIBLE_LABELS = 18;

interface VisibleLabel {
  key: string;
  text: string;
  position: [number, number, number];
  opacity: number;
}

export function EdgeLabels() {
  const topologyMode = useGraphStore((s) => s.topologyMode);
  const edgeLabels = useGraphStore((s) => s.edgeLabels);
  const showLabels = useGraphStore((s) => s.showLabels);
  const visibleRef = useRef<VisibleLabel[]>([]);

  const { camera } = useThree();

  useFrame(() => {
    if (topologyMode !== 'distributed' || !showLabels || edgeLabels.length === 0) {
      visibleRef.current = [];
      return;
    }

    const { currentPositions } = useParticleStore.getState();
    const camPos = camera.position;

    // Calculate midpoints and distances for each label
    const candidates: { label: typeof edgeLabels[0]; midpoint: [number, number, number]; dist: number }[] = [];

    for (const label of edgeLabels) {
      const s3 = label.source * 3;
      const t3 = label.target * 3;
      const mx = (currentPositions[s3] + currentPositions[t3]) / 2;
      const my = (currentPositions[s3 + 1] + currentPositions[t3 + 1]) / 2;
      const mz = (currentPositions[s3 + 2] + currentPositions[t3 + 2]) / 2;

      _tempVec.set(mx, my, mz);
      const dist = _tempVec.distanceTo(camPos);

      candidates.push({
        label,
        midpoint: [mx, my, mz],
        dist,
      });
    }

    // Sort by distance, take nearest
    candidates.sort((a, b) => a.dist - b.dist);
    const visible = candidates.slice(0, MAX_VISIBLE_LABELS);

    visibleRef.current = visible.map((v) => ({
      key: `${v.label.source}-${v.label.target}`,
      text: v.label.text,
      position: v.midpoint,
      opacity: Math.max(0.1, Math.min(0.7, 1 - v.dist / 20)),
    }));
  });

  if (topologyMode !== 'distributed' || !showLabels) return null;

  return (
    <group>
      {visibleRef.current.map((v) => (
        <Text
          key={v.key}
          position={v.position}
          fontSize={0.08}
          color="#00e5ff"
          anchorX="center"
          anchorY="middle"
          font={undefined}
          fillOpacity={v.opacity}
          outlineWidth={0.002}
          outlineColor="#000000"
        >
          {v.text}
        </Text>
      ))}
    </group>
  );
}
