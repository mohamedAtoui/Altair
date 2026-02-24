// ── Topologies of Thoughts — Filter Panel ───────────────────────────────
import React from 'react';
import { useDataStore } from '../../stores/useDataStore';

export const FilterPanel: React.FC = () => {
  const columns = useDataStore((s) => s.columns);
  const mapping = useDataStore((s) => s.mapping);
  const filters = useDataStore((s) => s.filters);
  const setFilter = useDataStore((s) => s.setFilter);
  const resetFilters = useDataStore((s) => s.resetFilters);

  const colorCol = columns.find((c) => c.name === mapping.colorColumn);

  if (!colorCol || colorCol.type !== 'categorical' || !colorCol.categories) {
    return null;
  }

  const categories = colorCol.categories;

  const allChecked = categories.every(
    (cat) => filters[cat] === undefined || filters[cat] === true,
  );
  const noneChecked = categories.every((cat) => filters[cat] === false);

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
            fontSize: 9,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#00ffa3',
          }}
        >
          Filters
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleShowAll}
            style={{
              fontSize: 9,
              color: allChecked ? '#00ffa3' : 'rgba(255,255,255,0.4)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            All
          </button>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 9 }}>/</span>
          <button
            onClick={handleShowNone}
            style={{
              fontSize: 9,
              color: noneChecked ? '#00ffa3' : 'rgba(255,255,255,0.4)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            None
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {categories.map((cat) => {
          const isVisible =
            filters[cat] === undefined || filters[cat] === true;

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
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <div
                onClick={(e) => {
                  e.preventDefault();
                  setFilter(cat, !isVisible);
                }}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 0,
                  border: `1.5px solid ${isVisible ? '#00ffa3' : 'rgba(255,255,255,0.15)'}`,
                  background: isVisible ? 'rgba(0,255,163,0.15)' : 'transparent',
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
                    stroke="#00ffa3"
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
                [{cat}]
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default FilterPanel;
