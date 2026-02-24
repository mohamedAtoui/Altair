// ── Topologies of Thoughts — Onboarding Overlay ─────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import { useHandStore } from '../../stores/useHandStore';
import { useAppStore } from '../../stores/useAppStore';
import { Gesture } from '../../types/index';

const STORAGE_KEY = 'nebula-onboarding-complete';

interface OnboardingStep {
  title: string;
  description: string;
  gesture: Gesture;
  icon: string;
  animationClass: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: 'Wave your hand',
    description: 'Show an open hand to the camera to begin tracking',
    gesture: Gesture.OpenHand,
    icon: '\u270B',
    animationClass: 'wave',
  },
  {
    title: 'Push particles away',
    description: 'Move your open hand near the particle cloud to repel them',
    gesture: Gesture.OpenHand,
    icon: '\u270B',
    animationClass: 'push',
  },
  {
    title: 'Pinch to select',
    description: 'Bring your thumb and index finger together to select a data point',
    gesture: Gesture.Pinch,
    icon: '\uD83E\uDD0F',
    animationClass: 'pinch',
  },
  {
    title: 'Point to highlight',
    description: 'Point your index finger to highlight a cluster of related points',
    gesture: Gesture.Point,
    icon: '\uD83D\uDC46',
    animationClass: 'point',
  },
  {
    title: 'Fist to collapse',
    description: 'Make a fist to pull all particles toward your hand position',
    gesture: Gesture.Fist,
    icon: '\u270A',
    animationClass: 'fist',
  },
];

const KEYFRAMES = `
@keyframes nebula-ghost-wave {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  25% { transform: rotate(15deg) translateY(-8px); }
  75% { transform: rotate(-15deg) translateY(-4px); }
}
@keyframes nebula-ghost-push {
  0%, 100% { transform: translateX(0) scale(1); }
  50% { transform: translateX(30px) scale(1.1); }
}
@keyframes nebula-ghost-pinch {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.85); }
}
@keyframes nebula-ghost-point {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}
@keyframes nebula-ghost-fist {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.8); }
}
`;

const ANIMATION_MAP: Record<string, string> = {
  wave: 'nebula-ghost-wave 1.5s ease-in-out infinite',
  push: 'nebula-ghost-push 2s ease-in-out infinite',
  pinch: 'nebula-ghost-pinch 1.2s ease-in-out infinite',
  point: 'nebula-ghost-point 1.5s ease-in-out infinite',
  fist: 'nebula-ghost-fist 1.2s ease-in-out infinite',
};

export const OnboardingOverlay: React.FC = () => {
  const isOnboardingComplete = useAppStore((s) => s.isOnboardingComplete);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
  const currentGesture = useHandStore((s) => s.currentGesture);

  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setOnboardingComplete(true);
    } else {
      setVisible(true);
    }
  }, [setOnboardingComplete]);

  useEffect(() => {
    if (!visible) return;
    const styleEl = document.createElement('style');
    styleEl.textContent = KEYFRAMES;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || step >= STEPS.length) return;
    const requiredGesture = STEPS[step].gesture;
    if (currentGesture === requiredGesture) {
      const timer = setTimeout(() => {
        if (step < STEPS.length - 1) {
          setStep((s) => s + 1);
        } else {
          handleComplete();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentGesture, step, visible]);

  const handleComplete = useCallback(() => {
    setVisible(false);
    setOnboardingComplete(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, [setOnboardingComplete]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  const handTrackingStatus = useAppStore((s) => s.handTrackingStatus);

  if (!visible || isOnboardingComplete || handTrackingStatus !== 'active') return null;

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;
  const gestureMatches = currentGesture === currentStep.gesture;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      }}
    >
      {/* Skip button */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          background: 'none',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 0,
          color: 'rgba(255,255,255,0.5)',
          padding: '6px 16px',
          fontSize: 10,
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}
      >
        Skip
      </button>

      {/* Step counter */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '3px',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: 32,
        }}
      >
        Step {step + 1} of {STEPS.length}
      </div>

      {/* Ghost hand animation */}
      <div
        style={{
          position: 'relative',
          width: 120,
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontSize: 56,
            lineHeight: 1,
            animation: ANIMATION_MAP[currentStep.animationClass],
            filter: gestureMatches
              ? 'drop-shadow(0 0 20px rgba(0,255,163,0.6))'
              : 'none',
            transition: 'filter 300ms ease',
          }}
        >
          {currentStep.icon}
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 24,
          fontWeight: 300,
          color: 'rgba(255,255,255,0.92)',
          marginBottom: 12,
          textAlign: 'center',
        }}
      >
        {currentStep.title}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.45)',
          textAlign: 'center',
          maxWidth: 360,
          lineHeight: 1.6,
          marginBottom: 40,
        }}
      >
        {currentStep.description}
      </div>

      {/* Gesture match indicator */}
      {gestureMatches && (
        <div
          style={{
            fontSize: 11,
            color: '#00ffa3',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: 24,
          }}
        >
          [Detected]
        </div>
      )}

      {/* Progress bar */}
      <div
        style={{
          width: 200,
          height: 2,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: '#00ffa3',
            transition: 'width 400ms ease',
          }}
        />
      </div>
    </div>
  );
};

export default OnboardingOverlay;
