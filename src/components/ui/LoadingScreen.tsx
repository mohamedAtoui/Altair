import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useDataStore } from '../../stores/useDataStore';

export const LoadingScreen: React.FC = () => {
  const mode = useAppStore((s) => s.mode);
  const processingProgress = useDataStore((s) => s.processingProgress);

  if (mode !== 'loading') return null;

  const progressPct = Math.min(Math.max(processingProgress, 0), 100);
  const barWidth = 30;
  const filled = Math.round((progressPct / 100) * barWidth);
  const empty = barWidth - filled;
  const barStr = '='.repeat(filled) + (filled < barWidth ? '>' : '') + ' '.repeat(Math.max(0, empty - 1));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      }}
    >
      <div
        style={{
          width: 400,
          padding: '40px 32px',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 0,
          background: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Terminal-style header */}
        <div
          style={{
            fontSize: 11,
            color: '#00ffa3',
            marginBottom: 24,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          Processing data
        </div>

        {/* Terminal progress bar */}
        <div
          style={{
            fontSize: 13,
            color: '#00ffa3',
            marginBottom: 16,
            whiteSpace: 'pre',
            letterSpacing: 0,
          }}
        >
          [{barStr}] {progressPct.toFixed(0)}%
        </div>

        {/* Thin line progress bar */}
        <div
          style={{
            width: '100%',
            height: 2,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: '#00ffa3',
              transition: 'width 300ms ease',
            }}
          />
        </div>

        {/* Blinking cursor */}
        <div
          style={{
            marginTop: 20,
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          <span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
