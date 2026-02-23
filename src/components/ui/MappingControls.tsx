// ── NEBULA 3D Visualization — Mapping Controls ────────────────────────
import React from 'react';
import { useDataStore } from '../../stores/useDataStore';
import type { DataMapping } from '../../types/index';

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '2px',
  color: 'rgba(255,255,255,0.5)',
  marginBottom: 4,
  display: 'block',
};

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

const fieldWrapStyle: React.CSSProperties = {
  marginBottom: 10,
};

export const MappingControls: React.FC = () => {
  const columns = useDataStore((s) => s.columns);
  const mapping = useDataStore((s) => s.mapping);
  const setMapping = useDataStore((s) => s.setMapping);

  if (columns.length === 0) return null;

  const numericColumns = columns.filter((c) => c.type === 'numeric');
  const allColumns = columns;

  const handleChange = (field: keyof DataMapping, value: string) => {
    if (field === 'positionMode') {
      setMapping({ positionMode: value as 'umap' | 'manual' });
    } else {
      setMapping({ [field]: value || undefined });
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 8,
        }}
      >
        Mapping
      </div>

      {/* Position mode */}
      <div style={fieldWrapStyle}>
        <label style={labelStyle}>Position</label>
        <select
          style={selectStyle}
          value={mapping.positionMode}
          onChange={(e) => handleChange('positionMode', e.target.value)}
        >
          <option value="umap">UMAP (auto)</option>
          <option value="manual">Manual axes</option>
        </select>
      </div>

      {/* Manual axes (only when manual) */}
      {mapping.positionMode === 'manual' && (
        <>
          <div style={fieldWrapStyle}>
            <label style={labelStyle}>X Axis</label>
            <select
              style={selectStyle}
              value={mapping.xColumn ?? ''}
              onChange={(e) => handleChange('xColumn', e.target.value)}
            >
              <option value="">-- select --</option>
              {numericColumns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldWrapStyle}>
            <label style={labelStyle}>Y Axis</label>
            <select
              style={selectStyle}
              value={mapping.yColumn ?? ''}
              onChange={(e) => handleChange('yColumn', e.target.value)}
            >
              <option value="">-- select --</option>
              {numericColumns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldWrapStyle}>
            <label style={labelStyle}>Z Axis</label>
            <select
              style={selectStyle}
              value={mapping.zColumn ?? ''}
              onChange={(e) => handleChange('zColumn', e.target.value)}
            >
              <option value="">-- select --</option>
              {numericColumns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Color column */}
      <div style={fieldWrapStyle}>
        <label style={labelStyle}>Color</label>
        <select
          style={selectStyle}
          value={mapping.colorColumn ?? ''}
          onChange={(e) => handleChange('colorColumn', e.target.value)}
        >
          <option value="">-- none --</option>
          {allColumns.map((col) => (
            <option key={col.name} value={col.name}>
              {col.name} ({col.type})
            </option>
          ))}
        </select>
      </div>

      {/* Size column */}
      <div style={fieldWrapStyle}>
        <label style={labelStyle}>Size</label>
        <select
          style={selectStyle}
          value={mapping.sizeColumn ?? ''}
          onChange={(e) => handleChange('sizeColumn', e.target.value)}
        >
          <option value="">-- none --</option>
          {numericColumns.map((col) => (
            <option key={col.name} value={col.name}>
              {col.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MappingControls;
