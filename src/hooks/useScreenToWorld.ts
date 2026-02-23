import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { handToWorld } from '../lib/handMapping';

export function useScreenToWorld() {
  const { camera } = useThree();

  return useCallback(
    (normalizedX: number, normalizedY: number): [number, number, number] => {
      return handToWorld(normalizedX, normalizedY, camera);
    },
    [camera]
  );
}
