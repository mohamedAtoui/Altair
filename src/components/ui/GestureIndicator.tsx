import { useHandStore } from '../../stores/useHandStore';
import { Gesture } from '../../types/index';

const GESTURE_CONFIG: Record<string, { icon: string; bg: string }> = {
  [Gesture.OpenHand]: { icon: '\u270B', bg: '#b388ff' },
  [Gesture.Pinch]: { icon: '\uD83E\uDD0F', bg: '#66bb6a' },
  [Gesture.Fist]: { icon: '\u270A', bg: '#ffa726' },
  [Gesture.Point]: { icon: '\uD83D\uDC46', bg: 'rgba(255,255,255,0.92)' },
};

export function GestureIndicator() {
  const currentGesture = useHandStore((s) => s.currentGesture);
  const isHandDetected = useHandStore((s) => s.isHandDetected);

  const visible = isHandDetected && currentGesture !== Gesture.None;
  const config = GESTURE_CONFIG[currentGesture];
  const isPointGesture = currentGesture === Gesture.Point;

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderRadius: 8,
        background: config ? `${config.bg}22` : 'rgba(8,8,20,0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.06)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease',
        pointerEvents: 'none',
      }}
    >
      {config && (
        <>
          <span style={{ fontSize: 16, lineHeight: 1 }}>{config.icon}</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: isPointGesture ? 'rgba(8,8,20,0.9)' : 'rgba(255,255,255,0.92)',
            }}
          >
            {currentGesture}
          </span>
        </>
      )}
    </div>
  );
}
