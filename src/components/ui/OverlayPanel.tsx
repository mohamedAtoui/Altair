// ── NEBULA 3D Visualization — Overlay Panel ───────────────────────────
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useDataStore } from '../../stores/useDataStore';
import { DEMO_DATASETS } from '../../lib/demoDatasets';
import { PANEL_WIDTH, PANEL_COLLAPSED_WIDTH } from '../../constants/index';
import { MappingControls } from './MappingControls';
import { FilterPanel } from './FilterPanel';
import { DataStats } from './DataStats';
import type { DataRow } from '../../types/index';

/* ── CSS Keyframes ─────────────────────────────────────────────────── */

const KEYFRAMES = `
@keyframes nebula-panel-slide-in {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(0); }
}
`;

interface OverlayPanelProps {
  onFileUpload: (file: File) => void;
  onDemoLoad: (rows: DataRow[]) => void;
}

export const OverlayPanel: React.FC<OverlayPanelProps> = ({
  onFileUpload,
  onDemoLoad,
}) => {
  const isPanelCollapsed = useAppStore((s) => s.isPanelCollapsed);
  const togglePanel = useAppStore((s) => s.togglePanel);
  const columns = useDataStore((s) => s.columns);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Inject keyframes
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = KEYFRAMES;
    document.head.appendChild(styleEl);
    setMounted(true);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileUpload(file);
    },
    [onFileUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.name.endsWith('.csv')) {
        onFileUpload(file);
      }
    },
    [onFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDemoSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      if (!id) return;
      const dataset = DEMO_DATASETS.find((d) => d.id === id);
      if (dataset) {
        onDemoLoad(dataset.generate());
      }
      e.target.value = '';
    },
    [onDemoLoad],
  );

  /* ── Collapsed state ─────────────────────────────────────────────── */

  if (isPanelCollapsed) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 800,
          width: PANEL_COLLAPSED_WIDTH,
          background: 'rgba(8,8,20,0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          gap: 12,
        }}
      >
        {/* Expand button */}
        <button
          onClick={togglePanel}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Expand panel"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Nebula icon */}
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#b388ff',
            boxShadow: '0 0 8px rgba(179,136,255,0.5)',
          }}
        />
      </div>
    );
  }

  /* ── Expanded state ──────────────────────────────────────────────── */

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    fontSize: 12,
    color: 'rgba(255,255,255,0.92)',
    background: 'rgba(8,8,20,0.82)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8,
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
    backgroundImage:
      'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'rgba(255,255,255,0.3)\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    paddingRight: 24,
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: 20,
        zIndex: 800,
        width: PANEL_WIDTH,
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'rgba(8,8,20,0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: 16,
        animation: mounted
          ? 'nebula-panel-slide-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both'
          : 'none',
        /* Scrollbar styling (webkit) */
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.08) transparent',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '3px',
            color: 'rgba(255,255,255,0.92)',
          }}
        >
          NEBULA
        </span>
        <button
          onClick={togglePanel}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Collapse panel"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
      </div>

      {/* ── File upload ─────────────────────────────────────────────────── */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `1.5px dashed ${isDragOver ? '#b388ff' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 8,
          padding: '14px 12px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 12,
          transition: 'border-color 200ms ease, background 200ms ease',
          background: isDragOver
            ? 'rgba(179,136,255,0.06)'
            : 'transparent',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginBottom: 4 }}
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 4,
          }}
        >
          Drop .csv or click to upload
        </div>
      </div>

      {/* ── Load Demo dropdown ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 12 }}>
        <label
          style={{
            fontSize: 10,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 4,
            display: 'block',
          }}
        >
          Load Demo
        </label>
        <select
          style={selectStyle}
          onChange={handleDemoSelect}
          defaultValue=""
        >
          <option value="" disabled>
            -- choose a dataset --
          </option>
          {DEMO_DATASETS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.rowCount} rows)
            </option>
          ))}
        </select>
      </div>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      {columns.length > 0 && (
        <div
          style={{
            height: 1,
            background: 'rgba(255,255,255,0.06)',
            margin: '8px 0',
          }}
        />
      )}

      {/* ── Mapping Controls ───────────────────────────────────────────── */}
      <MappingControls />

      {/* ── Filter Panel ───────────────────────────────────────────────── */}
      <FilterPanel />

      {/* ── Divider ────────────────────────────────────────────────────── */}
      {columns.length > 0 && (
        <div
          style={{
            height: 1,
            background: 'rgba(255,255,255,0.06)',
            margin: '8px 0',
          }}
        />
      )}

      {/* ── Data Stats ─────────────────────────────────────────────────── */}
      <DataStats />
    </div>
  );
};

export default OverlayPanel;
