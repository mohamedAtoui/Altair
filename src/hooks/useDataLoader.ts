import { useCallback } from 'react';
import Papa from 'papaparse';
import { useDataStore } from '../stores/useDataStore';
import { useParticleStore } from '../stores/useParticleStore';
import { useAppStore } from '../stores/useAppStore';
import { analyzeColumns, computeParticleProperties, computeColumnStats, computeCorrelations } from '../lib/dataProcessing';
import { autoDetectMapping } from '../lib/autoDetect';
import { runUmap } from '../lib/umapWorkerClient';
import type { DataRow, DataMapping } from '../types/index';

export function useDataLoader() {
  const setData = useDataStore((s) => s.setData);
  const setMapping = useDataStore((s) => s.setMapping);
  const setUmapEmbedding = useDataStore((s) => s.setUmapEmbedding);
  const setProcessingProgress = useDataStore((s) => s.setProcessingProgress);
  const setStats = useDataStore((s) => s.setStats);
  const setCorrelations = useDataStore((s) => s.setCorrelations);
  const setFromData = useParticleStore((s) => s.setFromData);
  const setMode = useAppStore((s) => s.setMode);
  const setError = useAppStore((s) => s.setError);

  const processData = useCallback(
    async (rows: DataRow[], mappingOverride?: Partial<DataMapping>) => {
      try {
        setMode('loading');
        setProcessingProgress(0);

        // Analyze columns
        const columns = analyzeColumns(rows);
        const detectedMapping = autoDetectMapping(columns);
        const mapping = { ...detectedMapping, ...mappingOverride };

        setData(rows, columns);
        setMapping(mapping);
        setProcessingProgress(0.2);

        // UMAP if needed
        let umapEmbedding: number[][] | null = null;
        if (mapping.positionMode === 'umap') {
          const numericCols = columns.filter((c) => c.type === 'numeric');
          const matrix = rows.map((row) =>
            numericCols.map((col) => {
              const v = Number(row[col.name]);
              // Normalize to 0-1
              const min = col.min ?? 0;
              const max = col.max ?? 1;
              const range = max - min || 1;
              return (v - min) / range;
            })
          );

          umapEmbedding = (
            await runUmap(matrix, (p) => {
              setProcessingProgress(0.2 + p * 0.6);
            })
          ).embedding;

          setUmapEmbedding(umapEmbedding);
        }

        setProcessingProgress(0.85);

        // Compute particle properties
        const { positions, colors, sizes, categoryIndices } = computeParticleProperties(
          rows,
          columns,
          mapping,
          umapEmbedding
        );

        setFromData(positions, colors, sizes);

        // Compute stats
        const stats = computeColumnStats(rows, columns);
        setStats(stats);

        const correlations = computeCorrelations(rows, columns, mapping);
        setCorrelations(correlations);

        setProcessingProgress(1);
        setMode('exploring');

        return { categoryIndices };
      } catch (err: any) {
        setError(`Data processing failed: ${err.message}`);
        setMode('idle');
        return null;
      }
    },
    [setData, setMapping, setUmapEmbedding, setProcessingProgress, setStats, setCorrelations, setFromData, setMode, setError]
  );

  const loadCsv = useCallback(
    async (file: File) => {
      return new Promise<void>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: async (result) => {
            if (result.errors.length > 0) {
              setError(`CSV parse errors: ${result.errors[0].message}`);
              reject(result.errors[0]);
              return;
            }
            await processData(result.data as DataRow[]);
            resolve();
          },
          error: (err) => {
            setError(`CSV parse failed: ${err.message}`);
            reject(err);
          },
        });
      });
    },
    [processData, setError]
  );

  const loadDemo = useCallback(
    async (rows: DataRow[]) => {
      await processData(rows);
    },
    [processData]
  );

  return { loadCsv, loadDemo, processData };
}
