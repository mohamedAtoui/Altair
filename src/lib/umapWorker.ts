import { UMAP } from 'umap-js';

self.onmessage = (e: MessageEvent) => {
  const { data, nComponents, nNeighbors, minDist } = e.data;

  const nEpochs = 200;

  const umap = new UMAP({
    nComponents: nComponents ?? 3,
    nNeighbors: Math.min(nNeighbors ?? 15, data.length - 1),
    minDist: minDist ?? 0.1,
    nEpochs,
  });

  umap.initializeFit(data);

  for (let i = 0; i < nEpochs; i++) {
    umap.step();
    if (i % 10 === 0) {
      self.postMessage({
        type: 'progress',
        progress: (i + 1) / nEpochs,
        epoch: i + 1,
        totalEpochs: nEpochs,
      });
    }
  }

  const embedding = umap.getEmbedding();

  self.postMessage({
    type: 'complete',
    embedding,
    progress: 1,
  });
};
