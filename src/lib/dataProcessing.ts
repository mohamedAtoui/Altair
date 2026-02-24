import { scaleLinear, scaleOrdinal, scaleSequential } from 'd3-scale';
import { schemeTableau10, interpolateViridis } from 'd3-scale-chromatic';
import {
  SCENE_SCALE,
  PARTICLE_EMISSIVE_MULTIPLIER,
} from '../constants/index';
import type { ColumnMeta, ColumnStats, CorrelationResult, DataRow, DataMapping } from '../types/index';

export function analyzeColumns(rows: DataRow[]): ColumnMeta[] {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);

  return keys.map((name) => {
    const values = rows.map((r) => r[name]);
    const numericValues = values
      .map((v) => (typeof v === 'number' ? v : parseFloat(String(v))))
      .filter((v) => !isNaN(v));

    const uniqueValues = new Set(values.map(String));
    const uniqueCount = uniqueValues.size;

    if (numericValues.length > rows.length * 0.7) {
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      const variance =
        numericValues.reduce((a, b) => a + (b - mean) ** 2, 0) / numericValues.length;
      const stddev = Math.sqrt(variance);

      return { name, type: 'numeric' as const, min, max, mean, stddev, uniqueCount };
    }

    if (uniqueCount <= 30) {
      return {
        name,
        type: 'categorical' as const,
        categories: [...uniqueValues],
        uniqueCount,
      };
    }

    return { name, type: 'text' as const, uniqueCount };
  });
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

function cssColorToRgb(color: string): [number, number, number] {
  if (color.startsWith('#')) return hexToRgb(color);
  if (color.startsWith('rgb')) {
    const m = color.match(/[\d.]+/g);
    if (m && m.length >= 3) {
      return [parseFloat(m[0]) / 255, parseFloat(m[1]) / 255, parseFloat(m[2]) / 255];
    }
  }
  return [1.0, 1.0, 1.0]; // fallback white
}

export function computeParticleProperties(
  rows: DataRow[],
  columns: ColumnMeta[],
  mapping: DataMapping,
  umapEmbedding: number[][] | null
): { positions: Float32Array; colors: Float32Array; sizes: Float32Array; categoryIndices: Int32Array } {
  const count = rows.length;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const categoryIndices = new Int32Array(count);

  // Position
  if (mapping.positionMode === 'umap' && umapEmbedding) {
    // Normalize UMAP output to [-SCENE_SCALE, SCENE_SCALE]
    const dims = [0, 1, 2];
    const mins = dims.map((d) =>
      Math.min(...umapEmbedding.map((e) => e[d]))
    );
    const maxs = dims.map((d) =>
      Math.max(...umapEmbedding.map((e) => e[d]))
    );
    const scales = dims.map((d) =>
      scaleLinear()
        .domain([mins[d], maxs[d]])
        .range([-SCENE_SCALE, SCENE_SCALE])
    );

    for (let i = 0; i < count; i++) {
      positions[i * 3] = scales[0](umapEmbedding[i][0]);
      positions[i * 3 + 1] = scales[1](umapEmbedding[i][1]);
      positions[i * 3 + 2] = scales[2](umapEmbedding[i]?.[2] ?? 0);
    }
  } else {
    // Manual axis mapping
    const axisColumns = [mapping.xColumn, mapping.yColumn, mapping.zColumn];
    for (let axis = 0; axis < 3; axis++) {
      const colName = axisColumns[axis];
      const col = columns.find((c) => c.name === colName);
      if (col && col.type === 'numeric' && col.min !== undefined && col.max !== undefined) {
        const s = scaleLinear()
          .domain([col.min, col.max])
          .range([-SCENE_SCALE, SCENE_SCALE]);
        for (let i = 0; i < count; i++) {
          positions[i * 3 + axis] = s(Number(rows[i][colName!])) || 0;
        }
      } else {
        for (let i = 0; i < count; i++) {
          positions[i * 3 + axis] = (Math.random() - 0.5) * SCENE_SCALE * 0.5;
        }
      }
    }
  }

  // Color
  const colorCol = columns.find((c) => c.name === mapping.colorColumn);
  if (colorCol) {
    if (colorCol.type === 'categorical' && colorCol.categories) {
      const cats = colorCol.categories;
      const colorScale = scaleOrdinal<string, string>()
        .domain(cats)
        .range(schemeTableau10 as string[]);
      const catMap = new Map(cats.map((c, i) => [c, i]));

      for (let i = 0; i < count; i++) {
        const val = String(rows[i][colorCol.name]);
        const rgb = cssColorToRgb(colorScale(val));
        colors[i * 3] = rgb[0] * PARTICLE_EMISSIVE_MULTIPLIER;
        colors[i * 3 + 1] = rgb[1] * PARTICLE_EMISSIVE_MULTIPLIER;
        colors[i * 3 + 2] = rgb[2] * PARTICLE_EMISSIVE_MULTIPLIER;
        categoryIndices[i] = catMap.get(val) ?? 0;
      }
    } else if (colorCol.type === 'numeric') {
      const colorScale = scaleSequential(interpolateViridis)
        .domain([colorCol.min ?? 0, colorCol.max ?? 1]);

      for (let i = 0; i < count; i++) {
        const val = Number(rows[i][colorCol.name]);
        const rgb = cssColorToRgb(colorScale(val));
        colors[i * 3] = rgb[0] * PARTICLE_EMISSIVE_MULTIPLIER;
        colors[i * 3 + 1] = rgb[1] * PARTICLE_EMISSIVE_MULTIPLIER;
        colors[i * 3 + 2] = rgb[2] * PARTICLE_EMISSIVE_MULTIPLIER;
        categoryIndices[i] = 0;
      }
    }
  } else {
    // Default white
    for (let i = 0; i < count; i++) {
      colors[i * 3] = 1.0 * PARTICLE_EMISSIVE_MULTIPLIER;
      colors[i * 3 + 1] = 1.0 * PARTICLE_EMISSIVE_MULTIPLIER;
      colors[i * 3 + 2] = 1.0 * PARTICLE_EMISSIVE_MULTIPLIER;
    }
  }

  // Size
  const sizeCol = columns.find((c) => c.name === mapping.sizeColumn);
  if (sizeCol && sizeCol.type === 'numeric') {
    const sizeScale = scaleLinear()
      .domain([sizeCol.min ?? 0, sizeCol.max ?? 1])
      .range([0.02, 0.08]);
    for (let i = 0; i < count; i++) {
      sizes[i] = sizeScale(Number(rows[i][sizeCol.name])) || 0.04;
    }
  } else {
    sizes.fill(0.04);
  }

  return { positions, colors, sizes, categoryIndices };
}

export function computeColumnStats(
  rows: DataRow[],
  columns: ColumnMeta[]
): ColumnStats[] {
  return columns.map((col) => {
    const base: ColumnStats = {
      column: col.name,
      type: col.type,
      count: rows.length,
    };

    if (col.type === 'numeric') {
      return {
        ...base,
        min: col.min,
        max: col.max,
        mean: col.mean,
        stddev: col.stddev,
      };
    }

    if (col.type === 'categorical') {
      const counts: Record<string, number> = {};
      for (const row of rows) {
        const v = String(row[col.name]);
        counts[v] = (counts[v] || 0) + 1;
      }
      return { ...base, valueCounts: counts };
    }

    return base;
  });
}

/**
 * Compute topology-specific colors that override default data colors.
 */
export function computeTopologyColors(
  count: number,
  topology: 'centralized' | 'decentralized' | 'distributed',
  hubIndex?: number | null,
  categoryIndices?: Int32Array,
): Float32Array {
  const colors = new Float32Array(count * 3);

  if (topology === 'centralized') {
    // Hub = bright gold/white, spokes = gradient from white to blue
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      if (i === hubIndex) {
        colors[i3] = 2.0;     // gold-white hub
        colors[i3 + 1] = 1.8;
        colors[i3 + 2] = 1.0;
      } else {
        // Blue-white gradient
        const t = i / count;
        colors[i3] = 0.6 + t * 0.4;
        colors[i3 + 1] = 0.8 + t * 0.2;
        colors[i3 + 2] = 2.0;
      }
    }
  } else if (topology === 'decentralized') {
    // Each cluster gets a distinct vibrant color
    const palette = [
      [0.0, 1.6, 1.2],   // cyan
      [1.6, 0.5, 1.8],   // magenta
      [1.2, 1.8, 0.2],   // lime
      [1.8, 0.8, 0.2],   // orange
      [0.4, 0.6, 2.0],   // blue
      [2.0, 1.6, 0.2],   // gold
      [0.2, 1.8, 0.8],   // green
      [1.8, 0.3, 0.5],   // red
    ];
    if (categoryIndices) {
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const cat = categoryIndices[i];
        const c = palette[cat % palette.length];
        colors[i3] = c[0];
        colors[i3 + 1] = c[1];
        colors[i3 + 2] = c[2];
      }
    } else {
      // Fallback: all white/cyan
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        colors[i3] = 1.0;
        colors[i3 + 1] = 1.5;
        colors[i3 + 2] = 1.5;
      }
    }
  } else {
    // Distributed: all white/cyan uniform
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      colors[i3] = 1.0;
      colors[i3 + 1] = 1.5;
      colors[i3 + 2] = 1.5;
    }
  }

  return colors;
}

export function computeCorrelations(
  rows: DataRow[],
  columns: ColumnMeta[],
  mapping: DataMapping
): CorrelationResult[] {
  const numericCols = columns.filter((c) => c.type === 'numeric');
  const mappedCols = [
    mapping.xColumn,
    mapping.yColumn,
    mapping.zColumn,
    mapping.colorColumn,
    mapping.sizeColumn,
  ].filter(Boolean);

  const relevantCols = numericCols.filter((c) => mappedCols.includes(c.name));
  const results: CorrelationResult[] = [];

  for (let a = 0; a < relevantCols.length; a++) {
    for (let b = a + 1; b < relevantCols.length; b++) {
      const colA = relevantCols[a];
      const colB = relevantCols[b];
      const valsA = rows.map((r) => Number(r[colA.name]));
      const valsB = rows.map((r) => Number(r[colB.name]));

      const n = valsA.length;
      const meanA = valsA.reduce((s, v) => s + v, 0) / n;
      const meanB = valsB.reduce((s, v) => s + v, 0) / n;

      let sumAB = 0, sumA2 = 0, sumB2 = 0;
      for (let i = 0; i < n; i++) {
        const da = valsA[i] - meanA;
        const db = valsB[i] - meanB;
        sumAB += da * db;
        sumA2 += da * da;
        sumB2 += db * db;
      }

      const denom = Math.sqrt(sumA2 * sumB2);
      const r = denom > 0 ? sumAB / denom : 0;
      const absR = Math.abs(r);

      results.push({
        col1: colA.name,
        col2: colB.name,
        r,
        strength: absR > 0.7 ? 'strong' : absR > 0.4 ? 'moderate' : 'weak',
      });
    }
  }

  return results;
}
