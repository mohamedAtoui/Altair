// ── Topologies of Thoughts — Overlay Panel ──────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useDataStore } from '../../stores/useDataStore';
import { DEMO_DATASETS } from '../../lib/demoDatasets';
import { PANEL_WIDTH, PANEL_COLLAPSED_WIDTH } from '../../constants/index';
import { MappingControls } from './MappingControls';
import { FilterPanel } from './FilterPanel';
import { DataStats } from './DataStats';
import type { DataRow } from '../../types/index';

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

  if (isPanelCollapsed) {
    return (
      <button
        onClick={togglePanel}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 800,
          background: 'rgba(0,0,0,0.85)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 0,
          padding: '8px 14px',
          cursor: 'pointer',
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(12px)',
          transition: 'all 200ms ease',
        }}
        title="Expand data panel"
      >
        DATA
      </button>
    );
  }

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    fontSize: 11,
    color: 'rgba(255,255,255,0.92)',
    background: '#000000',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 0,
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
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
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 0,
        padding: 16,
        backdropFilter: 'blur(12px)',
        animation: mounted
          ? 'nebula-panel-slide-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both'
          : 'none',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.08) transparent',
      }}
    >
      {/* Header */}
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
            color: '#00ffa3',
          }}
        >
          DATA
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

      {/* File upload */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `1.5px dashed ${isDragOver ? '#00ffa3' : 'rgba(255,255,255,0.15)'}`,
          borderRadius: 0,
          padding: '14px 12px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 12,
          transition: 'border-color 200ms ease, background 200ms ease',
          background: isDragOver
            ? 'rgba(0,255,163,0.04)'
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
            fontSize: 10,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 4,
          }}
        >
          Drop .csv or click to upload
        </div>
      </div>

      {/* Load Demo dropdown */}
      <div style={{ marginBottom: 12 }}>
        <label
          style={{
            fontSize: 9,
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

      {/* Divider */}
      {columns.length > 0 && (
        <div
          style={{
            height: 1,
            background: 'rgba(255,255,255,0.1)',
            margin: '8px 0',
          }}
        />
      )}

      <MappingControls />
      <FilterPanel />

      {columns.length > 0 && (
        <div
          style={{
            height: 1,
            background: 'rgba(255,255,255,0.1)',
            margin: '8px 0',
          }}
        />
      )}

      <DataStats />
    </div>
  );
};

export default OverlayPanel;
