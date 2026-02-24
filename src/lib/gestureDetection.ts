import {
  PINCH_DISTANCE,
  FIST_CURL_THRESHOLD,
  POINT_EXTEND_THRESHOLD,
  GESTURE_DEBOUNCE_FRAMES,
  SWIPE_VELOCITY_THRESHOLD,
} from '../constants/index';
import { Gesture } from '../types/index';

function distance(a: number[], b: number[]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = (a[2] ?? 0) - (b[2] ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function fingerCurl(landmarks: number[][], tipIdx: number, mcpIdx: number): number {
  return distance(landmarks[tipIdx], landmarks[mcpIdx]);
}

function isFingerExtended(landmarks: number[][], tipIdx: number, mcpIdx: number): boolean {
  return fingerCurl(landmarks, tipIdx, mcpIdx) > POINT_EXTEND_THRESHOLD;
}

function isFingerCurled(landmarks: number[][], tipIdx: number, mcpIdx: number): boolean {
  return fingerCurl(landmarks, tipIdx, mcpIdx) < FIST_CURL_THRESHOLD;
}

function classifyRaw(landmarks: number[][]): Gesture {
  if (!landmarks || landmarks.length < 21) return Gesture.None;

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const pinchDist = distance(thumbTip, indexTip);

  if (pinchDist < PINCH_DISTANCE) return Gesture.Pinch;

  const indexExtended = isFingerExtended(landmarks, 8, 5);
  const middleExtended = isFingerExtended(landmarks, 12, 9);
  const ringExtended = isFingerExtended(landmarks, 16, 13);
  const pinkyExtended = isFingerExtended(landmarks, 20, 17);

  const indexCurled = isFingerCurled(landmarks, 8, 5);
  const middleCurled = isFingerCurled(landmarks, 12, 9);
  const ringCurled = isFingerCurled(landmarks, 16, 13);
  const pinkyCurled = isFingerCurled(landmarks, 20, 17);

  if (indexCurled && middleCurled && ringCurled && pinkyCurled) {
    return Gesture.Fist;
  }

  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return Gesture.Point;
  }

  if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return Gesture.OpenHand;
  }

  return Gesture.None;
}

export class GestureClassifier {
  private buffer: Gesture[] = [];
  private currentGesture: Gesture = Gesture.None;

  // Swipe detection state
  private palmHistory: { x: number; y: number; t: number }[] = [];
  private lastSwipeTime: number = 0;

  classify(landmarks: number[][]): { gesture: Gesture; confidence: number } {
    const raw = classifyRaw(landmarks);

    // Track palm center for swipe detection
    const [px, py] = getPalmCenter(landmarks);
    const now = performance.now();
    this.palmHistory.push({ x: px, y: py, t: now });

    // Keep only last 10 frames (~300ms at 30fps)
    if (this.palmHistory.length > 10) {
      this.palmHistory.shift();
    }

    // Check for swipe: only when hand is open
    if (raw === Gesture.OpenHand && this.palmHistory.length >= 5) {
      const swipe = this.detectSwipe(now);
      if (swipe) {
        return { gesture: swipe, confidence: 0.9 };
      }
    }

    this.buffer.push(raw);
    if (this.buffer.length > GESTURE_DEBOUNCE_FRAMES) {
      this.buffer.shift();
    }

    if (this.buffer.length >= GESTURE_DEBOUNCE_FRAMES) {
      const allSame = this.buffer.every((g) => g === raw);
      if (allSame) {
        this.currentGesture = raw;
      }
    }

    const matchCount = this.buffer.filter((g) => g === this.currentGesture).length;
    const confidence = matchCount / Math.max(this.buffer.length, 1);

    return { gesture: this.currentGesture, confidence };
  }

  private detectSwipe(now: number): Gesture | null {
    // Cooldown
    if (now - this.lastSwipeTime < 1500) return null;

    const history = this.palmHistory;
    if (history.length < 5) return null;

    // Compute velocity over the last 5 samples
    const start = history[history.length - 5];
    const end = history[history.length - 1];
    const dt = (end.t - start.t) / 1000; // seconds
    if (dt <= 0) return null;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const vx = dx / dt;
    const vy = dy / dt;

    // Must be primarily horizontal
    if (Math.abs(vx) < SWIPE_VELOCITY_THRESHOLD) return null;
    if (Math.abs(vy) > Math.abs(vx) * 0.7) return null;

    this.lastSwipeTime = now;
    this.palmHistory = [];

    // Note: camera is mirrored, so negative vx = visual swipe right
    if (vx < -SWIPE_VELOCITY_THRESHOLD) {
      return Gesture.SwipeRight;
    } else if (vx > SWIPE_VELOCITY_THRESHOLD) {
      return Gesture.SwipeLeft;
    }

    return null;
  }

  reset() {
    this.buffer = [];
    this.currentGesture = Gesture.None;
    this.palmHistory = [];
  }
}

export function getPalmCenter(landmarks: number[][]): [number, number, number] {
  if (!landmarks || landmarks.length < 21) return [0, 0, 0];
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  return [
    (wrist[0] + middleMcp[0]) / 2,
    (wrist[1] + middleMcp[1]) / 2,
    ((wrist[2] ?? 0) + (middleMcp[2] ?? 0)) / 2,
  ];
}
