import { UMAP_N_COMPONENTS, UMAP_N_NEIGHBORS, UMAP_MIN_DIST } from '../constants/index';

export interface UmapResult {
  embedding: number[][];
}

export function runUmap(
  data: number[][],
  onProgress?: (progress: number) => void
): Promise<UmapResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./umapWorker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        onProgress?.(msg.progress);
      } else if (msg.type === 'complete') {
        resolve({ embedding: msg.embedding });
        worker.terminate();
      }
    };

    worker.onerror = (err) => {
      reject(new Error(`UMAP worker error: ${err.message}`));
      worker.terminate();
    };

    worker.postMessage({
      data,
      nComponents: UMAP_N_COMPONENTS,
      nNeighbors: UMAP_N_NEIGHBORS,
      minDist: UMAP_MIN_DIST,
    });
  });
}
