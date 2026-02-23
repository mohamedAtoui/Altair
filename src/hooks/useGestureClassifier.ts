import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useHandStore } from '../stores/useHandStore';
import { GestureClassifier, getPalmCenter } from '../lib/gestureDetection';
import { useOneEuroFilter } from './useOneEuroFilter';
import { useScreenToWorld } from './useScreenToWorld';

export function useGestureClassifier() {
  const classifierRef = useRef(new GestureClassifier());
  const { filterPoint } = useOneEuroFilter();
  const handToWorld = useScreenToWorld();

  const setCurrentGesture = useHandStore((s) => s.setCurrentGesture);
  const setSmoothedPosition = useHandStore((s) => s.setSmoothedPosition);
  const setWorldPosition = useHandStore((s) => s.setWorldPosition);

  useFrame(() => {
    const landmarks = useHandStore.getState().rawLandmarks;
    if (!landmarks) return;

    // Classify gesture
    const { gesture, confidence } = classifierRef.current.classify(landmarks);
    setCurrentGesture(gesture, confidence);

    // Smooth palm center
    const [px, py, pz] = getPalmCenter(landmarks);
    const smoothed = filterPoint(px, py, pz, performance.now() / 1000);
    setSmoothedPosition(smoothed);

    // Map to 3D world
    const world = handToWorld(smoothed[0], smoothed[1]);
    setWorldPosition(world);
  });
}
