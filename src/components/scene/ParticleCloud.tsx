import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color } from 'three';
import { useParticleStore } from '../../stores/useParticleStore';
import { useGraphStore } from '../../stores/useGraphStore';

const _dummy = new Object3D();
const _color = new Color();

export function ParticleCloud() {
  const meshRef = useRef<InstancedMesh>(null);
  const count = useParticleStore((s) => s.count);
  const pulseRef = useRef(0);

  const maxCount = useMemo(() => Math.max(count, 1000), [count]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { currentPositions, colors, sizes, scales, count: n } = useParticleStore.getState();
    if (n === 0) return;

    const { hubNodeIndex, topologyMode } = useGraphStore.getState();

    // Pulse animation for hub node
    pulseRef.current += delta * 3;
    const hubPulse = 1 + Math.sin(pulseRef.current) * 0.15;

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      let s = sizes[i] * (scales[i] ?? 1);

      // Hub node gets 3x size with pulsing in centralized mode
      if (topologyMode === 'centralized' && i === hubNodeIndex) {
        s *= 3 * hubPulse;
      }

      _dummy.position.set(
        currentPositions[i3],
        currentPositions[i3 + 1],
        currentPositions[i3 + 2]
      );
      _dummy.scale.setScalar(s);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);

      _color.setRGB(colors[i3], colors[i3 + 1], colors[i3 + 2]);
      mesh.setColorAt(i, _color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.count = n;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxCount]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial
        vertexColors
        emissive="#ffffff"
        emissiveIntensity={2.0}
        transparent
        opacity={0.9}
        depthWrite={false}
        roughness={0.3}
        metalness={0.1}
      />
    </instancedMesh>
  );
}
