import { useRef, useCallback } from 'react';
import { OneEuroFilter3D } from '../lib/oneEuroFilter';
import {
  ONE_EURO_MIN_CUTOFF,
  ONE_EURO_BETA,
  ONE_EURO_D_CUTOFF,
  HAND_TRACKING_FPS,
} from '../constants/index';

export function useOneEuroFilter() {
  const filterRef = useRef(
    new OneEuroFilter3D(HAND_TRACKING_FPS, ONE_EURO_MIN_CUTOFF, ONE_EURO_BETA, ONE_EURO_D_CUTOFF)
  );

  const filterPoint = useCallback(
    (x: number, y: number, z: number, timestamp?: number): [number, number, number] => {
      return filterRef.current.filter(x, y, z, timestamp);
    },
    []
  );

  const reset = useCallback(() => {
    filterRef.current.reset();
  }, []);

  return { filterPoint, reset };
}
