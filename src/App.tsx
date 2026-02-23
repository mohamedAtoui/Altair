import { useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/scene/Scene';
import { OverlayPanel } from './components/ui/OverlayPanel';
import { GestureIndicator } from './components/ui/GestureIndicator';
import { WebcamPreview } from './components/ui/WebcamPreview';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { OnboardingOverlay } from './components/ui/OnboardingOverlay';
import { StoryControls } from './components/ui/StoryControls';
import { useHandTracking } from './hooks/useHandTracking';
import { useDataLoader } from './hooks/useDataLoader';
import { useAppStore } from './stores/useAppStore';
import { useParticleStore } from './stores/useParticleStore';
import { CAMERA_POSITION, CAMERA_FOV, MAX_DPR } from './constants/index';
import type { DataRow } from './types/index';

function HandTrackingBridge({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) {
  useHandTracking(videoRef);
  return null;
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mode = useAppStore((s) => s.mode);
  const error = useAppStore((s) => s.error);
  const setError = useAppStore((s) => s.setError);
  const initializeRandom = useParticleStore((s) => s.initializeRandom);
  const { loadCsv, loadDemo } = useDataLoader();

  // Initialize with random particles on first load
  useEffect(() => {
    initializeRandom(200);
  }, [initializeRandom]);

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
      {/* 3D Canvas */}
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

      {/* HTML Overlays */}
      <OverlayPanel onFileUpload={handleFileUpload} onDemoLoad={handleDemoLoad} />
      <GestureIndicator />
      <WebcamPreview videoRef={videoRef} />
      <StoryControls />

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
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(239, 83, 80, 0.9)',
            backdropFilter: 'blur(12px)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 13,
            zIndex: 1000,
            cursor: 'pointer',
            maxWidth: 400,
          }}
          onClick={() => setError(null)}
        >
          {error}
        </div>
      )}
    </div>
  );
}

export default App;
