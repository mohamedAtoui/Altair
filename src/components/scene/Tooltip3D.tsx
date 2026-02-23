import { Html } from '@react-three/drei';
import { useParticleStore } from '../../stores/useParticleStore';
import { useDataStore } from '../../stores/useDataStore';

export function Tooltip3D() {
  const selectedIndex = useParticleStore((s) => s.selectedIndex);
  const currentPositions = useParticleStore((s) => s.currentPositions);
  const rows = useDataStore((s) => s.rows);
  const columns = useDataStore((s) => s.columns);

  if (selectedIndex === null || selectedIndex < 0) return null;
  if (!rows[selectedIndex]) return null;

  const i3 = selectedIndex * 3;
  const pos: [number, number, number] = [
    currentPositions[i3],
    currentPositions[i3 + 1],
    currentPositions[i3 + 2],
  ];

  const row = rows[selectedIndex];
  const displayColumns = columns.slice(0, 5);

  return (
    <Html position={pos} distanceFactor={8} style={{ pointerEvents: 'none' }}>
      <div
        style={{
          background: 'rgba(8, 8, 20, 0.92)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 12,
          padding: '12px 16px',
          maxWidth: 220,
          animation: 'tooltipIn 150ms ease-out',
          transformOrigin: 'bottom center',
        }}
      >
        {displayColumns.map((col) => (
          <div key={col.name} style={{ marginBottom: 6 }}>
            <div
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 2,
                color: 'rgba(255,255,255,0.5)',
                fontWeight: 500,
              }}
            >
              {col.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.92)',
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              }}
            >
              {typeof row[col.name] === 'number'
                ? (row[col.name] as number).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })
                : String(row[col.name])}
            </div>
          </div>
        ))}
      </div>
    </Html>
  );
}
