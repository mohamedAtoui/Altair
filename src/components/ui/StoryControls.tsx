// ── NEBULA 3D Visualization — Story Controls ──────────────────────────
import React from 'react';
import { usePresentationStore } from '../../stores/usePresentationStore';

const SNAPSHOT_COLORS = [
  '#b388ff',
  '#66bb6a',
  '#ffa726',
  '#42a5f5',
  '#ef5350',
  '#ab47bc',
  '#26c6da',
  '#ffca28',
];

export const StoryControls: React.FC = () => {
  const snapshots = usePresentationStore((s) => s.snapshots);
  const activeIndex = usePresentationStore((s) => s.activeIndex);
  const isStoryMode = usePresentationStore((s) => s.isStoryMode);
  const isPlaying = usePresentationStore((s) => s.isPlaying);
  const addSnapshot = usePresentationStore((s) => s.addSnapshot);
  const setActiveIndex = usePresentationStore((s) => s.setActiveIndex);
  const togglePlaying = usePresentationStore((s) => s.togglePlaying);

  // Only visible when snapshots exist or in presentation mode
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
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8,
    color: 'rgba(255,255,255,0.92)',
    padding: '6px 12px',
    fontSize: 12,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
        gap: 10,
        padding: '10px 16px',
        borderRadius: 12,
        background: 'rgba(8,8,20,0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Snapshot thumbnails */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {snapshots.map((snap, i) => (
          <div
            key={snap.id}
            onClick={() => setActiveIndex(i)}
            title={snap.name}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background:
                i === activeIndex
                  ? SNAPSHOT_COLORS[i % SNAPSHOT_COLORS.length]
                  : `${SNAPSHOT_COLORS[i % SNAPSHOT_COLORS.length]}44`,
              border:
                i === activeIndex
                  ? '2px solid rgba(255,255,255,0.6)'
                  : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 600,
              color:
                i === activeIndex
                  ? 'rgba(0,0,0,0.8)'
                  : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Prev button */}
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

      {/* Play / Pause button */}
      <button
        onClick={togglePlaying}
        style={{
          ...buttonStyle,
          background: isPlaying
            ? 'rgba(179,136,255,0.25)'
            : 'rgba(255,255,255,0.06)',
        }}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        <span style={{ fontSize: 14, lineHeight: 1 }}>
          {isPlaying ? '\u23F8' : '\u25B6'}
        </span>
      </button>

      {/* Next button */}
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

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 20,
          background: 'rgba(255,255,255,0.08)',
        }}
      />

      {/* Save Snapshot button */}
      <button
        onClick={handleSaveSnapshot}
        style={{
          ...buttonStyle,
          fontSize: 10,
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
