import { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/scene/Scene';
import { OverlayPanel } from './components/ui/OverlayPanel';
import { GestureIndicator } from './components/ui/GestureIndicator';
import { WebcamPreview } from './components/ui/WebcamPreview';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { OnboardingOverlay } from './components/ui/OnboardingOverlay';
import { TopologyPanel } from './components/ui/TopologyPanel';
import { useHandTracking } from './hooks/useHandTracking';
import { useDataLoader } from './hooks/useDataLoader';
import { useAppStore } from './stores/useAppStore';
import { useGraphStore } from './stores/useGraphStore';
import { CAMERA_POSITION, CAMERA_FOV, MAX_DPR } from './constants/index';
import { DEMO_DATASETS } from './lib/demoDatasets';
import type { DataRow } from './types/index';

function HandTrackingBridge({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) {
  useHandTracking(videoRef);
  return null;
}

/** Gesture hint overlay — shows once on first visit. */
function GestureHints() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const shown = localStorage.getItem('gesture-hints-shown');
    if (!shown) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setDismissed(true);
      localStorage.setItem('gesture-hints-shown', '1');
    }, 6000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible || dismissed) return null;

  const hints = [
    { gesture: 'Open Palm', action: 'Push particles', icon: '✋' },
    { gesture: 'Pinch', action: 'Select node', icon: '🤏' },
    { gesture: 'Fist', action: 'Collapse clusters', icon: '✊' },
    { gesture: 'Point', action: 'Highlight neighbors', icon: '👆' },
    { gesture: 'Swipe', action: 'Cycle topology', icon: '👉' },
  ];

  return (
    <div
      onClick={() => {
        setDismissed(true);
        localStorage.setItem('gesture-hints-shown', '1');
      }}
      style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 900,
        display: 'flex',
        gap: 16,
        padding: '12px 20px',
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        animation: 'fadeInUp 400ms ease-out',
        cursor: 'pointer',
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      }}
    >
      {hints.map((h) => (
        <div key={h.gesture} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>{h.icon}</div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
            {h.action}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Topology mode transition indicator. */
function TopologyIndicator() {
  const topologyMode = useGraphStore((s) => s.topologyMode);

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 700,
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: 'rgba(0,255,163,0.5)',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      // {topologyMode}
    </div>
  );
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mode = useAppStore((s) => s.mode);
  const error = useAppStore((s) => s.error);
  const setError = useAppStore((s) => s.setError);
  const { loadCsv, loadDemo } = useDataLoader();
  const autoLoadedRef = useRef(false);

  // Auto-load Knowledge Concepts demo on first mount
  useEffect(() => {
    if (autoLoadedRef.current) return;
    autoLoadedRef.current = true;

    const defaultDataset = DEMO_DATASETS[0];
    if (defaultDataset) {
      loadDemo(defaultDataset.generate());
    }
  }, [loadDemo]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      await loadCsv(file);
    },
    [loadCsv]
  );

  const handleDemoLoad = useCallback(
    async (rows: DataRow[]) => {
      await loadDemo(rows);
    },
    [loadDemo]
  );

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{
          position: [CAMERA_POSITION[0], CAMERA_POSITION[1], CAMERA_POSITION[2]],
          fov: CAMERA_FOV,
        }}
        dpr={[1, MAX_DPR]}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Scene />
      </Canvas>

      {/* Title */}
      <div
        style={{
          position: 'fixed',
          top: 48,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 700,
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '6px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.15)',
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        TOPOLOGIES OF THOUGHTS
      </div>

      {/* Topology mode indicator */}
      <TopologyIndicator />

      {/* HTML Overlays */}
      <OverlayPanel onFileUpload={handleFileUpload} onDemoLoad={handleDemoLoad} />
      <TopologyPanel />
      <GestureIndicator />
      <WebcamPreview videoRef={videoRef} />

      {/* Gesture hints */}
      <GestureHints />

      {/* Modals */}
      {mode === 'loading' && <LoadingScreen />}
      <OnboardingOverlay />

      {/* Hidden video for MediaPipe hand tracking */}
      <video
        ref={videoRef}
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
        autoPlay
        playsInline
        muted
      />
      <HandTrackingBridge videoRef={videoRef} />

      {/* Error toast */}
      {error && (
        <div
          onClick={() => setError(null)}
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#000000',
            border: '1px solid #00ffa3',
            color: '#00ffa3',
            padding: '10px 20px',
            borderRadius: 0,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
            zIndex: 1000,
            cursor: 'pointer',
            maxWidth: 400,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

export default App;
