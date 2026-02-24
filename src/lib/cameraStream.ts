import { WEBCAM_WIDTH, WEBCAM_HEIGHT } from '../constants/index';

let _stream: MediaStream | null = null;

export type CameraPermission = 'prompt' | 'granted' | 'denied' | 'unknown';

/** Check current camera permission state without triggering a prompt. */
export async function checkCameraPermission(): Promise<CameraPermission> {
  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return result.state as CameraPermission;
  } catch {
    return 'unknown';
  }
}

/** Request camera — call this directly from a click handler for gesture-context. */
export async function acquireCameraStream(): Promise<MediaStream> {
  if (_stream && _stream.active) return _stream;
  _stream = await navigator.mediaDevices.getUserMedia({
    video: { width: WEBCAM_WIDTH, height: WEBCAM_HEIGHT, facingMode: 'user' },
  });
  return _stream;
}

/** Return the previously acquired stream (or null). */
export function getCameraStream(): MediaStream | null {
  return _stream && _stream.active ? _stream : null;
}

/** Stop and release the camera stream. */
export function releaseCameraStream(): void {
  if (_stream) {
    _stream.getTracks().forEach((t) => t.stop());
    _stream = null;
  }
}
