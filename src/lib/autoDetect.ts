import type { ColumnMeta, DataMapping } from '../types/index';

export function autoDetectMapping(columns: ColumnMeta[]): DataMapping {
  const numericCols = columns.filter((c) => c.type === 'numeric');
  const categoricalCols = columns.filter((c) => c.type === 'categorical');
  const textCols = columns.filter((c) => c.type === 'text');

  // Position strategy
  let positionMode: 'umap' | 'manual' = 'umap';
  let xColumn: string | undefined;
  let yColumn: string | undefined;
  let zColumn: string | undefined;

  if (numericCols.length >= 3 && numericCols.length <= 4) {
    positionMode = 'manual';
    xColumn = numericCols[0].name;
    yColumn = numericCols[1].name;
    zColumn = numericCols[2].name;
  }

  // Color: first categorical with 2-10 unique values
  let colorColumn: string | undefined;
  const goodCategorical = categoricalCols.find(
    (c) => c.uniqueCount >= 2 && c.uniqueCount <= 10
  );
  if (goodCategorical) {
    colorColumn = goodCategorical.name;
  } else if (numericCols.length > 0) {
    // Fallback: use a numeric column
    const unused = numericCols.find(
      (c) => c.name !== xColumn && c.name !== yColumn && c.name !== zColumn
    );
    colorColumn = unused?.name ?? numericCols[0].name;
  }

  // Size: numeric column with highest coefficient of variation
  let sizeColumn: string | undefined;
  const sizeCandidate = numericCols
    .filter(
      (c) =>
        c.name !== xColumn &&
        c.name !== yColumn &&
        c.name !== zColumn &&
        c.name !== colorColumn
    )
    .sort((a, b) => {
      const cvA = a.mean && a.mean !== 0 ? (a.stddev ?? 0) / Math.abs(a.mean) : 0;
      const cvB = b.mean && b.mean !== 0 ? (b.stddev ?? 0) / Math.abs(b.mean) : 0;
      return cvB - cvA;
    });
  if (sizeCandidate.length > 0) {
    sizeColumn = sizeCandidate[0].name;
  }

  // Label: first text column with high cardinality, or categorical
  let labelColumn: string | undefined;
  const labelCandidate = textCols.find((c) => c.uniqueCount > 10);
  if (labelCandidate) {
    labelColumn = labelCandidate.name;
  } else if (categoricalCols.length > 1) {
    labelColumn = categoricalCols.find((c) => c.name !== colorColumn)?.name;
  }

  return {
    positionMode,
    xColumn,
    yColumn,
    zColumn,
    colorColumn,
    sizeColumn,
    labelColumn,
  };
}
