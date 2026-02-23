import { useRef, useEffect, useState, useCallback } from 'react';
import { useHandStore } from '../../stores/useHandStore';
import { useAppStore } from '../../stores/useAppStore';
import {
  WEBCAM_PREVIEW_WIDTH,
  WEBCAM_PREVIEW_HEIGHT,
} from '../../constants/index';

interface WebcamPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function WebcamPreview({ videoRef }: WebcamPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const rawLandmarks = useHandStore((s) => s.rawLandmarks);
  const isActive = useAppStore((s) => s.isHandTrackingActive);
  const [minimized, setMinimized] = useState(false);

  // Draw video frame + landmarks on canvas
  useEffect(() => {
    if (minimized || !isActive) {
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

      // Mirror and draw video frame
      if (video.readyState >= 2) {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Draw landmarks
      const lm = useHandStore.getState().rawLandmarks;
      if (lm && lm.length > 0) {
        ctx.fillStyle = 'rgba(179, 136, 255, 0.6)';
        for (const pt of lm) {
          if (pt.length < 2) continue;
          // Mirror X to match video flip
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
  }, [minimized, isActive, videoRef]);

  const handleClick = useCallback(() => {
    setMinimized((prev) => !prev);
  }, []);

  if (!isActive) return null;

  if (minimized) {
    return (
      <div
        onClick={handleClick}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 900,
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'rgba(8,8,20,0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.92)',
        }}
        title="Expand webcam preview"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 900,
        width: WEBCAM_PREVIEW_WIDTH,
        height: WEBCAM_PREVIEW_HEIGHT,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        opacity: 0.8,
        cursor: 'pointer',
      }}
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
    </div>
  );
}
