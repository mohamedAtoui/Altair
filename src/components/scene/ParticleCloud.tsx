import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color } from 'three';
import { useParticleStore } from '../../stores/useParticleStore';

const _dummy = new Object3D();
const _color = new Color();

export function ParticleCloud() {
  const meshRef = useRef<InstancedMesh>(null);
  const count = useParticleStore((s) => s.count);

  const maxCount = useMemo(() => Math.max(count, 1000), [count]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { currentPositions, colors, sizes, scales, count: n } = useParticleStore.getState();
    if (n === 0) return;

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      const s = sizes[i] * (scales[i] ?? 1);

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
        emissive={[2, 3, 5]}
        emissiveIntensity={0.6}
        toneMapped={false}
        vertexColors
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}
