import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useParticleStore } from '../stores/useParticleStore';
import { useHandStore } from '../stores/useHandStore';
import { useDataStore } from '../stores/useDataStore';
import { Gesture } from '../types/index';
import {
  applyRepel,
  applyCollapse,
  applySpringBack,
  dampPositions,
  findNearestParticle,
  computeCentroids,
} from '../lib/particlePhysics';
import { SELECT_DISTANCE, HIGHLIGHT_EMISSIVE, DIM_EMISSIVE } from '../constants/index';

export function useParticleInteraction() {
  const categoryIndicesRef = useRef<Int32Array>(new Int32Array(0));
  const centroidsRef = useRef<Map<number, [number, number, number]>>(new Map());
  const baseColorsRef = useRef<Float32Array>(new Float32Array(0));

  useFrame((_, delta) => {
    const particle = useParticleStore.getState();
    const hand = useHandStore.getState();

    if (particle.count === 0) return;

    const { currentPositions, targetPositions, basePositions, colors, sizes, count } = particle;
    const [hx, hy, hz] = hand.worldPosition;

    // Store base colors on first frame
    if (baseColorsRef.current.length !== colors.length) {
      baseColorsRef.current = new Float32Array(colors);
    }

    // Update category indices when data changes
    const dataStore = useDataStore.getState();
    if (categoryIndicesRef.current.length !== count) {
      categoryIndicesRef.current = new Int32Array(count);
      // Will be set properly when data loads
    }

    switch (hand.currentGesture) {
      case Gesture.OpenHand:
        applyRepel(currentPositions, targetPositions, basePositions, hx, hy, hz, count);
        break;

      case Gesture.Fist:
        if (centroidsRef.current.size === 0 && count > 0) {
          centroidsRef.current = computeCentroids(
            basePositions,
            categoryIndicesRef.current,
            count
          );
        }
        applyCollapse(targetPositions, count, centroidsRef.current, categoryIndicesRef.current);
        break;

      case Gesture.Pinch: {
        applySpringBack(targetPositions, basePositions, count);
        const { index } = findNearestParticle(
          currentPositions, count, hx, hy, hz, SELECT_DISTANCE
        );
        useParticleStore.setState({ selectedIndex: index >= 0 ? index : null });
        break;
      }

      case Gesture.Point: {
        applySpringBack(targetPositions, basePositions, count);
        const { index: nearIdx } = findNearestParticle(
          currentPositions, count, hx, hy, hz, SELECT_DISTANCE * 2
        );
        if (nearIdx >= 0) {
          const catIdx = categoryIndicesRef.current[nearIdx];
          // Highlight matching category, dim others
          for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const isSame = categoryIndicesRef.current[i] === catIdx;
            const mult = isSame ? HIGHLIGHT_EMISSIVE : DIM_EMISSIVE;
            const baseMult = isSame ? 1.2 : 0.3;
            colors[i3] += (baseColorsRef.current[i3] * baseMult - colors[i3]) * 0.1;
            colors[i3 + 1] += (baseColorsRef.current[i3 + 1] * baseMult - colors[i3 + 1]) * 0.1;
            colors[i3 + 2] += (baseColorsRef.current[i3 + 2] * baseMult - colors[i3 + 2]) * 0.1;
          }
        }
        break;
      }

      default:
        // Spring back + restore colors
        applySpringBack(targetPositions, basePositions, count);
        useParticleStore.setState({ selectedIndex: null });
        centroidsRef.current.clear();
        // Restore base colors
        for (let i = 0; i < count * 3; i++) {
          colors[i] += (baseColorsRef.current[i] - colors[i]) * 0.05;
        }
        break;
    }

    // Apply damping for smooth movement
    dampPositions(currentPositions, targetPositions, count, delta);

    // Apply filter visibility (lerp scale toward 0 for hidden items)
    const filters = dataStore.filters;
    const mapping = dataStore.mapping;
    const rows = dataStore.rows;
    if (mapping.colorColumn && Object.keys(filters).length > 0) {
      const { scales } = particle;
      for (let i = 0; i < count; i++) {
        const val = rows[i]?.[mapping.colorColumn];
        const visible = val === undefined || filters[String(val)] !== false;
        const target = visible ? 1 : 0;
        scales[i] += (target - scales[i]) * 0.1;
      }
    }
  });

  return {
    setCategoryIndices: (indices: Int32Array) => {
      categoryIndicesRef.current = indices;
      centroidsRef.current.clear();
    },
    setBaseColors: (c: Float32Array) => {
      baseColorsRef.current = new Float32Array(c);
    },
  };
}
