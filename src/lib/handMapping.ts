import type { Camera } from 'three';
import { Vector3 } from 'three';

const _ndc = new Vector3();
const _rayOrigin = new Vector3();
const _rayDir = new Vector3();
const _planeNormal = new Vector3(0, 0, 1);
const _result = new Vector3();

/**
 * Convert MediaPipe normalized coords (0-1) to 3D world position
 * via camera unprojection + ray-plane intersection at z=0.
 */
export function handToWorld(
  normalizedX: number,
  normalizedY: number,
  camera: Camera
): [number, number, number] {
  // MediaPipe: (0,0) = top-left, (1,1) = bottom-right
  // NDC: (-1,-1) = bottom-left, (1,1) = top-right
  // Also mirror X since webcam is mirrored
  _ndc.set(
    -(normalizedX * 2 - 1), // mirror X
    -(normalizedY * 2 - 1), // flip Y
    0.5
  );

  // Unproject to get a point on the ray
  _ndc.unproject(camera);

  // Ray from camera
  _rayOrigin.copy(camera.position);
  _rayDir.subVectors(_ndc, _rayOrigin).normalize();

  // Intersect with z=0 plane
  const denom = _rayDir.dot(_planeNormal);
  if (Math.abs(denom) < 1e-6) {
    return [0, 0, 0];
  }

  const t = -_rayOrigin.dot(_planeNormal) / denom;
  _result.copy(_rayOrigin).addScaledVector(_rayDir, t);

  return [_result.x, _result.y, _result.z];
}
