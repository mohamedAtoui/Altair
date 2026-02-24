import { useEffect, useRef } from 'react';
import { useHandStore } from '../stores/useHandStore';
import { useAppStore } from '../stores/useAppStore';
import { getCameraStream, releaseCameraStream } from '../lib/cameraStream';
import { HAND_TRACKING_FPS } from '../constants/index';

let HandLandmarkerClass: any = null;
let FilesetResolverClass: any = null;
let mediaPipeLoading: Promise<void> | null = null;

function loadMediaPipe(): Promise<void> {
  if (HandLandmarkerClass) return Promise.resolve();
  if (mediaPipeLoading) return mediaPipeLoading;

  mediaPipeLoading = import('@mediapipe/tasks-vision').then((vision) => {
    FilesetResolverClass = vision.FilesetResolver;
    HandLandmarkerClass = vision.HandLandmarker;
  });

  return mediaPipeLoading;
}

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const cancelledRef = useRef(false);

  const isActive = useAppStore((s) => s.isHandTrackingActive);

  useEffect(() => {
    if (!isActive) {
      cancelledRef.current = true;
      cancelAnimationFrame(rafRef.current);
      releaseCameraStream();
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      useHandStore.getState().setHandDetected(false);
      useHandStore.getState().setRawLandmarks(null);
      useAppStore.getState().setHandTrackingStatus('off');
      return;
    }

    cancelledRef.current = false;
    const frameInterval = 1000 / HAND_TRACKING_FPS;

    const detect = (timestamp: number) => {
      if (cancelledRef.current) return;

      if (!landmarkerRef.current || !videoRef.current) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      if (timestamp - lastTimeRef.current < frameInterval) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }
      lastTimeRef.current = timestamp;

      const video = videoRef.current;
      if (video.readyState < 2) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      try {
        const result = landmarkerRef.current.detectForVideo(video, timestamp);
        if (result.landmarks && result.landmarks.length > 0) {
          const lm = result.landmarks[0].map((p: any) => [p.x, p.y, p.z]);
          useHandStore.getState().setRawLandmarks(lm);
          useHandStore.getState().setHandDetected(true);
        } else {
          useHandStore.getState().setRawLandmarks(null);
          useHandStore.getState().setHandDetected(false);
        }
      } catch (e) {
        console.warn('[NEBULA] Detection frame error:', e);
      }

      rafRef.current = requestAnimationFrame(detect);
    };

    (async () => {
      try {
        // The camera stream was already acquired in the click handler
        // (preserving user-gesture context). Pick it up here.
        const stream = getCameraStream();
        if (!stream || !stream.active) {
          throw new Error('Camera stream not available — was it acquired before activation?');
        }

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          console.log('[NEBULA] Camera attached to video element');
        }

        // Load MediaPipe
        console.log('[NEBULA] Loading MediaPipe...');
        await loadMediaPipe();
        if (cancelledRef.current) return;

        // Create hand landmarker
        console.log('[NEBULA] Creating hand landmarker...');
        const fileset = await FilesetResolverClass.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        if (cancelledRef.current) return;

        const landmarker = await HandLandmarkerClass.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          numHands: 1,
          runningMode: 'VIDEO',
        });
        if (cancelledRef.current) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;

        // Start detection loop
        if (!cancelledRef.current) {
          useAppStore.getState().setHandTrackingStatus('active');
          console.log('[NEBULA] Detection loop starting');
          rafRef.current = requestAnimationFrame(detect);
        }
      } catch (err: any) {
        if (!cancelledRef.current) {
          console.error('[NEBULA] Hand tracking init failed:', err);
          releaseCameraStream();
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
          useAppStore.getState().setHandTrackingStatus('error');
          useAppStore.getState().setHandTrackingActive(false);
          useAppStore.getState().setError(`Hand tracking failed: ${err.message}`);
        }
      }
    })();

    return () => {
      cancelledRef.current = true;
      cancelAnimationFrame(rafRef.current);
      releaseCameraStream();
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, [isActive, videoRef]);
}
