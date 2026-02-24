import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Trail } from '@react-three/drei';
import { useHandStore } from '../../stores/useHandStore';
import { Gesture } from '../../types/index';

export function HandCursor() {
  const meshRef = useRef<Mesh>(null);
  const isDetected = useHandStore((s) => s.isHandDetected);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { worldPosition, currentGesture, isHandDetected } = useHandStore.getState();

    // Lerp position
    mesh.position.x += (worldPosition[0] - mesh.position.x) * 0.2;
    mesh.position.y += (worldPosition[1] - mesh.position.y) * 0.2;
    mesh.position.z += (worldPosition[2] - mesh.position.z) * 0.2;

    // Size varies by gesture
    let targetScale = 0.12;
    switch (currentGesture) {
      case Gesture.OpenHand:
        targetScale = 0.2;
        break;
      case Gesture.Pinch:
        targetScale = 0.06;
        break;
      case Gesture.Fist:
        targetScale = 0.16;
        break;
      case Gesture.Point:
        targetScale = 0.08;
        break;
    }

    const s = mesh.scale.x;
    const ns = s + (targetScale - s) * 0.15;
    mesh.scale.setScalar(ns);

    // Visibility
    const targetOpacity = isHandDetected ? 0.4 : 0;
    const mat = mesh.material as any;
    if (mat) {
      mat.opacity += (targetOpacity - mat.opacity) * 0.1;
    }
  });

  if (!isDetected) return null;

  return (
    <Trail
      width={0.8}
      length={5}
      color="#00ffa3"
      attenuation={(t) => t * t}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          color="#00ffa3"
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
    </Trail>
  );
}
