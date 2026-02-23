// ── NEBULA 3D Visualization — Data Stats Panel ────────────────────────
import React, { useState } from 'react';
import { useDataStore } from '../../stores/useDataStore';
import type { ColumnStats, CorrelationResult } from '../../types/index';

export const DataStats: React.FC = () => {
  const rows = useDataStore((s) => s.rows);
  const stats = useDataStore((s) => s.stats);
  const correlations = useDataStore((s) => s.correlations);
  const [collapsed, setCollapsed] = useState(false);

  if (rows.length === 0) return null;

  return (
    <div style={{ marginTop: 12 }}>
      {/* Section header */}
      <div
        onClick={() => setCollapsed((c) => !c)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
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
          Statistics
        </span>
        <span
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.3)',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
            display: 'inline-block',
          }}
        >
          ▼
        </span>
      </div>

      {!collapsed && (
        <>
          {/* Row count */}
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 300,
                fontFamily: 'monospace',
                color: 'rgba(255,255,255,0.92)',
              }}
            >
              {rows.length.toLocaleString()}
            </span>
            <span
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.4)',
                marginLeft: 6,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              data points
            </span>
          </div>

          {/* Per-column stats */}
          {stats.map((col) => (
            <ColumnStatRow key={col.column} stat={col} />
          ))}

          {/* Correlations */}
          {correlations.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: 6,
                }}
              >
                Correlations
              </div>
              {correlations.map((corr) => (
                <CorrelationBadge key={`${corr.col1}-${corr.col2}`} corr={corr} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ── Per-column stat row ──────────────────────────────────────────────── */

const ColumnStatRow: React.FC<{ stat: ColumnStats }> = ({ stat }) => {
  if (stat.type === 'numeric') {
    return <NumericStatRow stat={stat} />;
  }
  if (stat.type === 'categorical' && stat.valueCounts) {
    return <CategoricalStatRow stat={stat} />;
  }
  return null;
};

const NumericStatRow: React.FC<{ stat: ColumnStats }> = ({ stat }) => {
  const min = stat.min ?? 0;
  const max = stat.max ?? 1;
  const mean = stat.mean ?? 0;
  const range = max - min || 1;

  const minPct = 0;
  const maxPct = 100;
  const meanPct = ((mean - min) / range) * 100;

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 3,
        }}
      >
        {stat.column}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 9,
          color: 'rgba(255,255,255,0.35)',
          fontFamily: 'monospace',
        }}
      >
        <span>{min.toFixed(1)}</span>
        <div
          style={{
            flex: 1,
            height: 4,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Min-to-max bar */}
          <div
            style={{
              position: 'absolute',
              left: `${minPct}%`,
              width: `${maxPct - minPct}%`,
              height: '100%',
              background: 'rgba(179,136,255,0.35)',
              borderRadius: 2,
            }}
          />
          {/* Mean marker */}
          <div
            style={{
              position: 'absolute',
              left: `${meanPct}%`,
              top: 0,
              width: 2,
              height: '100%',
              background: '#b388ff',
              borderRadius: 1,
            }}
          />
        </div>
        <span>{max.toFixed(1)}</span>
      </div>
      <div
        style={{
          fontSize: 9,
          color: 'rgba(255,255,255,0.35)',
          fontFamily: 'monospace',
          marginTop: 1,
        }}
      >
        mean {mean.toFixed(2)}
      </div>
    </div>
  );
};

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

const CategoricalStatRow: React.FC<{ stat: ColumnStats }> = ({ stat }) => {
  const valueCounts = stat.valueCounts!;
  const entries = Object.entries(valueCounts).sort(
    ([, a], [, b]) => b - a,
  );
  const total = entries.reduce((sum, [, c]) => sum + c, 0) || 1;

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 3,
        }}
      >
        {stat.column}
      </div>
      <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden' }}>
        {entries.map(([cat, count], i) => (
          <div
            key={cat}
            title={`${cat}: ${count}`}
            style={{
              width: `${(count / total) * 100}%`,
              height: '100%',
              background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
              opacity: 0.7,
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontSize: 9,
          color: 'rgba(255,255,255,0.35)',
          marginTop: 2,
        }}
      >
        {entries.length} categories
      </div>
    </div>
  );
};

/* ── Correlation badge ────────────────────────────────────────────────── */

const CorrelationBadge: React.FC<{ corr: CorrelationResult }> = ({ corr }) => {
  const isStrong = Math.abs(corr.r) > 0.7;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 4,
        background: isStrong
          ? 'rgba(102,187,106,0.15)'
          : 'rgba(255,255,255,0.04)',
        marginRight: 4,
        marginBottom: 4,
        fontSize: 9,
        fontFamily: 'monospace',
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.5)' }}>
        {corr.col1} / {corr.col2}
      </span>
      <span
        style={{
          color: isStrong ? '#66bb6a' : 'rgba(255,255,255,0.28)',
          fontWeight: 600,
        }}
      >
        {isStrong ? '\u2191 strong' : '\u2194 weak'}
      </span>
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>
        {corr.r.toFixed(2)}
      </span>
    </div>
  );
};

export default DataStats;
