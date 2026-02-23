// ── NEBULA 3D Visualization — Filter Panel ────────────────────────────
import React from 'react';
import { useDataStore } from '../../stores/useDataStore';

const CATEGORY_COLORS = [
  '#b388ff',
  '#66bb6a',
  '#ffa726',
  '#42a5f5',
  '#ef5350',
  '#ab47bc',
  '#26c6da',
  '#ffca28',
];

export const FilterPanel: React.FC = () => {
  const columns = useDataStore((s) => s.columns);
  const mapping = useDataStore((s) => s.mapping);
  const filters = useDataStore((s) => s.filters);
  const setFilter = useDataStore((s) => s.setFilter);
  const resetFilters = useDataStore((s) => s.resetFilters);

  // Find the color column metadata
  const colorCol = columns.find((c) => c.name === mapping.colorColumn);

  // Only show for categorical columns with categories
  if (!colorCol || colorCol.type !== 'categorical' || !colorCol.categories) {
    return null;
  }

  const categories = colorCol.categories;

  const allChecked = categories.every(
    (cat) => filters[cat] === undefined || filters[cat] === true,
  );
  const noneChecked = categories.every((cat) => filters[cat] === false);

  const handleToggleAll = () => {
    if (allChecked) {
      // Set all to false
      for (const cat of categories) {
        setFilter(cat, false);
      }
    } else {
      // Reset (all visible)
      resetFilters();
    }
  };

  const handleShowAll = () => {
    resetFilters();
  };

  const handleShowNone = () => {
    for (const cat of categories) {
      setFilter(cat, false);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          Filters
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleShowAll}
            style={{
              fontSize: 9,
              color: allChecked ? '#b388ff' : 'rgba(255,255,255,0.4)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            All
          </button>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 9 }}>/</span>
          <button
            onClick={handleShowNone}
            style={{
              fontSize: 9,
              color: noneChecked ? '#b388ff' : 'rgba(255,255,255,0.4)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            None
          </button>
        </div>
      </div>

      {/* Category checkboxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {categories.map((cat, i) => {
          const isVisible =
            filters[cat] === undefined || filters[cat] === true;
          const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];

          return (
            <label
              key={cat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: '3px 0',
                fontSize: 11,
                color: isVisible
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(255,255,255,0.3)',
                transition: 'color 150ms ease',
              }}
            >
              {/* Custom checkbox */}
              <div
                onClick={(e) => {
                  e.preventDefault();
                  setFilter(cat, !isVisible);
                }}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  border: `1.5px solid ${isVisible ? color : 'rgba(255,255,255,0.15)'}`,
                  background: isVisible ? color : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 150ms ease',
                  flexShrink: 0,
                }}
              >
                {isVisible && (
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="rgba(0,0,0,0.7)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                )}
              </div>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default FilterPanel;
