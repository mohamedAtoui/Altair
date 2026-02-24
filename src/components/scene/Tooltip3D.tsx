import { Html } from '@react-three/drei';
import { useParticleStore } from '../../stores/useParticleStore';
import { useDataStore } from '../../stores/useDataStore';
import { useGraphStore } from '../../stores/useGraphStore';

export function Tooltip3D() {
  const selectedIndex = useParticleStore((s) => s.selectedIndex);
  const currentPositions = useParticleStore((s) => s.currentPositions);
  const rows = useDataStore((s) => s.rows);
  const columns = useDataStore((s) => s.columns);
  const mapping = useDataStore((s) => s.mapping);
  const edges = useGraphStore((s) => s.edges);
  const topologyMode = useGraphStore((s) => s.topologyMode);

  if (selectedIndex === null || selectedIndex < 0) return null;
  if (!rows[selectedIndex]) return null;

  const i3 = selectedIndex * 3;
  const pos: [number, number, number] = [
    currentPositions[i3],
    currentPositions[i3 + 1] + 0.3,
    currentPositions[i3 + 2],
  ];

  const row = rows[selectedIndex];

  // Count connections in current topology
  const connectionCount = edges.filter(
    (e) => e.source === selectedIndex || e.target === selectedIndex
  ).length;

  // Get label and color column values
  const labelVal = mapping.labelColumn ? row[mapping.labelColumn] : null;
  const colorVal = mapping.colorColumn ? row[mapping.colorColumn] : null;

  // Other columns to display
  const displayColumns = columns
    .filter((c) => c.name !== mapping.labelColumn && c.name !== mapping.colorColumn)
    .slice(0, 4);

  return (
    <Html position={pos} distanceFactor={8} style={{ pointerEvents: 'none' }}>
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.92)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          borderRadius: 0,
          padding: '12px 16px',
          maxWidth: 260,
          animation: 'tooltipIn 200ms ease-out',
          transformOrigin: 'bottom center',
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Label value (large, green) */}
        {labelVal && (
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#00ffa3',
              marginBottom: 4,
              textShadow: '0 0 10px rgba(0,255,163,0.4)',
            }}
          >
            {String(labelVal)}
          </div>
        )}

        {/* Category in brackets */}
        {colorVal && (
          <div
            style={{
              fontSize: 10,
              color: '#00e5ff',
              marginBottom: 8,
              opacity: 0.8,
            }}
          >
            [{String(colorVal)}]
          </div>
        )}

        {/* Other columns */}
        {displayColumns.map((col) => (
          <div key={col.name} style={{ marginBottom: 4 }}>
            <div
              style={{
                fontSize: 8,
                textTransform: 'uppercase',
                letterSpacing: 2,
                color: 'rgba(255,255,255,0.35)',
                fontWeight: 500,
              }}
            >
              {col.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              {typeof row[col.name] === 'number'
                ? (row[col.name] as number).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })
                : String(row[col.name] ?? '')}
            </div>
          </div>
        ))}

        {/* Connection count */}
        <div
          style={{
            marginTop: 8,
            paddingTop: 6,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            fontSize: 9,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          {connectionCount} connections · {topologyMode}
        </div>
      </div>
    </Html>
  );
}
