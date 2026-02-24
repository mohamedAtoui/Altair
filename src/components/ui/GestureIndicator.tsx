import { useHandStore } from '../../stores/useHandStore';
import { useAppStore } from '../../stores/useAppStore';
import { Gesture } from '../../types/index';

const GESTURE_CONFIG: Record<string, { label: string; color: string }> = {
  [Gesture.OpenHand]: { label: 'OPEN', color: '#00ffa3' },
  [Gesture.Pinch]: { label: 'PINCH', color: '#00ffa3' },
  [Gesture.Fist]: { label: 'FIST', color: '#ffa726' },
  [Gesture.Point]: { label: 'POINT', color: '#ffffff' },
};

export function GestureIndicator() {
  const currentGesture = useHandStore((s) => s.currentGesture);
  const isHandDetected = useHandStore((s) => s.isHandDetected);
  const status = useAppStore((s) => s.handTrackingStatus);

  const visible = status === 'active' && isHandDetected && currentGesture !== Gesture.None;
  const config = GESTURE_CONFIG[currentGesture];

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 0,
        background: '#000000',
        border: '1px solid rgba(255,255,255,0.15)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease',
        pointerEvents: 'none',
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      }}
    >
      {config && (
        <>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: config.color,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: config.color,
            }}
          >
            {config.label}
          </span>
        </>
      )}
    </div>
  );
}
