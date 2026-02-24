import { useRef, useEffect, useState, useCallback } from 'react';
import { useHandStore } from '../../stores/useHandStore';
import { useAppStore } from '../../stores/useAppStore';
import { acquireCameraStream } from '../../lib/cameraStream';
import {
  WEBCAM_PREVIEW_WIDTH,
  WEBCAM_PREVIEW_HEIGHT,
} from '../../constants/index';

interface WebcamPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

function CornerBrackets() {
  const bracketStyle: React.CSSProperties = {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: '#00ffa3',
    borderStyle: 'solid',
    borderWidth: 0,
  };
  return (
    <>
      <div style={{ ...bracketStyle, top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 }} />
      <div style={{ ...bracketStyle, top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 }} />
      <div style={{ ...bracketStyle, bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 }} />
      <div style={{ ...bracketStyle, bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 }} />
    </>
  );
}

export function WebcamPreview({ videoRef }: WebcamPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const isActive = useAppStore((s) => s.isHandTrackingActive);
  const status = useAppStore((s) => s.handTrackingStatus);
  const setHandTrackingActive = useAppStore((s) => s.setHandTrackingActive);
  const [minimized, setMinimized] = useState(false);

  // Draw video frame + landmarks on canvas
  useEffect(() => {
    if (minimized || status !== 'active') {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const draw = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (video.readyState >= 2) {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      const lm = useHandStore.getState().rawLandmarks;
      if (lm && lm.length > 0) {
        ctx.fillStyle = 'rgba(0, 255, 163, 0.7)';
        for (const pt of lm) {
          if (pt.length < 2) continue;
          const x = (1 - pt[0]) * canvas.width;
          const y = pt[1] * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [minimized, status, videoRef]);

  const handleToggleMinimize = useCallback(() => {
    setMinimized((prev) => !prev);
  }, []);

  const [startError, setStartError] = useState<string | null>(null);
  const [permDenied, setPermDenied] = useState(false);

  const handleStartCamera = useCallback(async () => {
    try {
      setStartError(null);
      setPermDenied(false);
      useAppStore.getState().setHandTrackingStatus('initializing');
      // Acquire camera directly in click handler — preserves user-gesture context
      // so the browser will show its Allow/Block prompt
      await acquireCameraStream();
      // Now activate hand tracking — hook will pick up the pre-acquired stream
      setHandTrackingActive(true);
    } catch (err: any) {
      console.error('[NEBULA] Camera permission failed:', err);
      useAppStore.getState().setHandTrackingStatus('error');
      if (err.name === 'NotAllowedError') {
        setPermDenied(true);
      } else {
        setStartError(`Camera error: ${err.message}`);
      }
    }
  }, [setHandTrackingActive]);

  const handleStopCamera = useCallback(() => {
    setHandTrackingActive(false);
    setMinimized(false);
  }, [setHandTrackingActive]);

  const baseStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 900,
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  };

  // ── Off state: show "Start Camera" button ────────────────────────────
  if (!isActive && status !== 'initializing') {
    return (
      <div style={{ ...baseStyle, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <div
          onClick={handleStartCamera}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            background: '#000000',
            border: `1px solid ${permDenied ? 'rgba(255,85,85,0.4)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: 0,
            cursor: 'pointer',
            transition: 'border-color 200ms ease',
          }}
          onMouseEnter={(e) => {
            if (!permDenied) (e.currentTarget as HTMLDivElement).style.borderColor = '#00ffa3';
          }}
          onMouseLeave={(e) => {
            if (!permDenied) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.15)';
          }}
          title="Enable hand tracking camera"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={permDenied ? '#ff5555' : '#00ffa3'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="0" ry="0" />
          </svg>
          <span style={{ fontSize: 10, color: permDenied ? '#ff5555' : '#00ffa3', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {permDenied ? 'Camera Blocked' : 'Start Camera'}
          </span>
        </div>
        {permDenied && (
          <div
            style={{
              padding: '10px 12px',
              background: '#000000',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 10,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 260,
              lineHeight: 1.5,
            }}
          >
            <div style={{ color: '#ff5555', marginBottom: 6, fontWeight: 500 }}>
              Camera permission denied
            </div>
            <div style={{ marginBottom: 6 }}>
              Click the <span style={{ color: '#fff' }}>lock icon</span> (or camera icon) in your browser's address bar, then set Camera to <span style={{ color: '#00ffa3' }}>Allow</span>.
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)' }}>
              Then click Start Camera again.
            </div>
          </div>
        )}
        {startError && !permDenied && (
          <div
            style={{
              padding: '8px 12px',
              background: '#000000',
              border: '1px solid rgba(255,85,85,0.4)',
              fontSize: 9,
              color: '#ff5555',
              maxWidth: 220,
              lineHeight: 1.4,
            }}
          >
            {startError}
          </div>
        )}
      </div>
    );
  }

  // ── Initializing state: show loading ──────────────────────────────────
  if (status === 'initializing') {
    return (
      <div
        style={{
          ...baseStyle,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: '#000000',
          border: '1px solid rgba(0,255,163,0.3)',
          borderRadius: 0,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#00ffa3',
            animation: 'pulse 1s ease-in-out infinite',
          }}
        />
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Initializing...
        </span>
      </div>
    );
  }

  // ── Active + minimized: show small icon ───────────────────────────────
  if (minimized) {
    return (
      <div
        style={{
          ...baseStyle,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <div
          onClick={handleToggleMinimize}
          style={{
            width: 40,
            height: 40,
            borderRadius: 0,
            background: '#000000',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#00ffa3',
          }}
          title="Expand webcam preview"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="0" ry="0" />
          </svg>
        </div>
        <div
          onClick={handleStopCamera}
          style={{
            width: 40,
            height: 40,
            borderRadius: 0,
            background: '#000000',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)',
          }}
          title="Stop camera"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" />
          </svg>
        </div>
      </div>
    );
  }

  // ── Active + expanded: show preview ───────────────────────────────────
  return (
    <div
      style={{
        ...baseStyle,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: WEBCAM_PREVIEW_WIDTH,
          height: WEBCAM_PREVIEW_HEIGHT,
          borderRadius: 0,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
        }}
        onClick={handleToggleMinimize}
      >
        <canvas
          ref={canvasRef}
          width={WEBCAM_PREVIEW_WIDTH}
          height={WEBCAM_PREVIEW_HEIGHT}
          style={{
            width: WEBCAM_PREVIEW_WIDTH,
            height: WEBCAM_PREVIEW_HEIGHT,
            display: 'block',
          }}
        />
        <CornerBrackets />
      </div>
      {/* Stop button below preview */}
      <div
        onClick={handleStopCamera}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: '6px 0',
          background: '#000000',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 0,
          cursor: 'pointer',
          fontSize: 9,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'color 150ms ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.color = '#ff5555';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.4)';
        }}
        title="Stop hand tracking"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" />
        </svg>
        Stop Camera
      </div>
    </div>
  );
}
