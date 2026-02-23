import type { SceneSnapshot, DataMapping, FloatingLabelData } from '../types/index';

export function captureSnapshot(params: {
  name: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  mapping: DataMapping;
  filters: Record<string, boolean>;
  highlightedCluster: string | null;
  labels: FloatingLabelData[];
}): SceneSnapshot {
  return {
    id: crypto.randomUUID(),
    ...params,
  };
}
