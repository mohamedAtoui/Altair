// ── Topologies of Thoughts — Story Controls ─────────────────────────────
import React from 'react';
import { usePresentationStore } from '../../stores/usePresentationStore';

export const StoryControls: React.FC = () => {
  const snapshots = usePresentationStore((s) => s.snapshots);
  const activeIndex = usePresentationStore((s) => s.activeIndex);
  const isStoryMode = usePresentationStore((s) => s.isStoryMode);
  const isPlaying = usePresentationStore((s) => s.isPlaying);
  const addSnapshot = usePresentationStore((s) => s.addSnapshot);
  const setActiveIndex = usePresentationStore((s) => s.setActiveIndex);
  const togglePlaying = usePresentationStore((s) => s.togglePlaying);

  if (snapshots.length === 0 && !isStoryMode) return null;

  const handlePrev = () => {
    if (snapshots.length === 0) return;
    const newIndex =
      activeIndex > 0 ? activeIndex - 1 : snapshots.length - 1;
    setActiveIndex(newIndex);
  };

  const handleNext = () => {
    if (snapshots.length === 0) return;
    const newIndex =
      activeIndex < snapshots.length - 1 ? activeIndex + 1 : 0;
    setActiveIndex(newIndex);
  };

  const handleSaveSnapshot = () => {
    const snapshot = {
      id: `snap-${Date.now()}`,
      name: `Snapshot ${snapshots.length + 1}`,
      cameraPosition: [0, 0, 8] as [number, number, number],
      cameraTarget: [0, 0, 0] as [number, number, number],
      mapping: { positionMode: 'umap' as const },
      filters: {},
      highlightedCluster: null,
      labels: [],
    };
    addSnapshot(snapshot);
  };

  const buttonStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 0,
    color: 'rgba(255,255,255,0.92)',
    padding: '6px 12px',
    fontSize: 11,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'JetBrains Mono', monospace",
    transition: 'background 150ms ease',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        borderRadius: 0,
        background: '#000000',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {snapshots.map((snap, i) => (
          <div
            key={snap.id}
            onClick={() => setActiveIndex(i)}
            title={snap.name}
            style={{
              width: 22,
              height: 22,
              borderRadius: 0,
              background:
                i === activeIndex
                  ? '#00ffa3'
                  : 'rgba(255,255,255,0.06)',
              border:
                i === activeIndex
                  ? '1px solid #00ffa3'
                  : '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              color:
                i === activeIndex
                  ? '#000000'
                  : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <button
        onClick={handlePrev}
        style={buttonStyle}
        title="Previous snapshot"
        disabled={snapshots.length === 0}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>

      <button
        onClick={togglePlaying}
        style={{
          ...buttonStyle,
          background: isPlaying
            ? 'rgba(0,255,163,0.15)'
            : 'rgba(255,255,255,0.04)',
          borderColor: isPlaying ? '#00ffa3' : 'rgba(255,255,255,0.15)',
        }}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        <span style={{ fontSize: 12, lineHeight: 1 }}>
          {isPlaying ? '\u23F8' : '\u25B6'}
        </span>
      </button>

      <button
        onClick={handleNext}
        style={buttonStyle}
        title="Next snapshot"
        disabled={snapshots.length === 0}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>

      <div
        style={{
          width: 1,
          height: 20,
          background: 'rgba(255,255,255,0.1)',
        }}
      />

      <button
        onClick={handleSaveSnapshot}
        style={{
          ...buttonStyle,
          fontSize: 9,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          padding: '6px 14px',
          gap: 4,
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Save
      </button>
    </div>
  );
};

export default StoryControls;
