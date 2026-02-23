// ── NEBULA 3D Visualization — Loading Screen ──────────────────────────
import React, { useEffect } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useDataStore } from '../../stores/useDataStore';

/* ── CSS Keyframes ─────────────────────────────────────────────────── */

const KEYFRAMES = `
@keyframes nebula-float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
  25% { transform: translate(30px, -20px) scale(1.2); opacity: 1; }
  50% { transform: translate(-10px, -40px) scale(0.8); opacity: 0.4; }
  75% { transform: translate(-30px, -15px) scale(1.1); opacity: 0.8; }
}
@keyframes nebula-float-2 {
  0%, 100% { transform: translate(0, 0) scale(0.8); opacity: 0.4; }
  33% { transform: translate(-25px, -30px) scale(1); opacity: 0.7; }
  66% { transform: translate(20px, -50px) scale(1.3); opacity: 1; }
}
@keyframes nebula-float-3 {
  0%, 100% { transform: translate(0, 0) scale(1.1); opacity: 0.8; }
  20% { transform: translate(40px, -10px) scale(0.9); opacity: 0.5; }
  60% { transform: translate(-20px, -45px) scale(1.2); opacity: 1; }
  80% { transform: translate(10px, -25px) scale(0.7); opacity: 0.3; }
}
@keyframes nebula-float-4 {
  0%, 100% { transform: translate(0, 0) scale(0.9); opacity: 0.5; }
  50% { transform: translate(-35px, -35px) scale(1.1); opacity: 0.9; }
}
@keyframes nebula-float-5 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
  40% { transform: translate(15px, -50px) scale(0.8); opacity: 0.3; }
  80% { transform: translate(-25px, -20px) scale(1.3); opacity: 1; }
}
@keyframes nebula-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const FLOAT_ANIMATIONS = [
  'nebula-float-1 3s ease-in-out infinite',
  'nebula-float-2 3.5s ease-in-out infinite 0.2s',
  'nebula-float-3 4s ease-in-out infinite 0.5s',
  'nebula-float-4 2.8s ease-in-out infinite 0.8s',
  'nebula-float-5 3.2s ease-in-out infinite 1s',
  'nebula-float-1 3.7s ease-in-out infinite 0.3s',
  'nebula-float-2 4.2s ease-in-out infinite 0.7s',
  'nebula-float-3 3.3s ease-in-out infinite 1.2s',
];

const DOT_COLORS = [
  '#b388ff',
  '#7c4dff',
  '#66bb6a',
  '#42a5f5',
  '#ffa726',
  '#b388ff',
  '#ef5350',
  '#26c6da',
];

export const LoadingScreen: React.FC = () => {
  const mode = useAppStore((s) => s.mode);
  const processingProgress = useDataStore((s) => s.processingProgress);

  // Inject keyframes
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = KEYFRAMES;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  if (mode !== 'loading') return null;

  const progressPct = Math.min(Math.max(processingProgress, 0), 100);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        background: 'rgba(4,4,12,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Central glass panel */}
      <div
        style={{
          position: 'relative',
          width: 320,
          padding: '40px 32px',
          borderRadius: 16,
          background: 'rgba(8,8,20,0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'visible',
        }}
      >
        {/* Particle swirl */}
        <div
          style={{
            position: 'relative',
            width: 80,
            height: 80,
            marginBottom: 28,
          }}
        >
          {/* Spinning ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1px solid rgba(179,136,255,0.15)',
              animation: 'nebula-spin 4s linear infinite',
            }}
          />
          {/* Floating dots */}
          {DOT_COLORS.map((color, i) => {
            const angle = (i / DOT_COLORS.length) * 360;
            const radius = 28 + (i % 3) * 6;
            const x = Math.cos((angle * Math.PI) / 180) * radius + 40;
            const y = Math.sin((angle * Math.PI) / 180) * radius + 40;
            const size = 3 + (i % 3) * 2;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x - size / 2,
                  top: y - size / 2,
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  background: color,
                  animation: FLOAT_ANIMATIONS[i % FLOAT_ANIMATIONS.length],
                  boxShadow: `0 0 8px ${color}88`,
                }}
              />
            );
          })}
        </div>

        {/* Text */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.92)',
            marginBottom: 8,
            letterSpacing: '0.5px',
          }}
        >
          Processing data...
        </div>

        {/* Percentage */}
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'monospace',
            marginBottom: 16,
          }}
        >
          {progressPct.toFixed(0)}%
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: 3,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #7c4dff, #b388ff)',
              borderRadius: 2,
              transition: 'width 300ms ease',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
