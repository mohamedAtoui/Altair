import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ParticleCloud } from './ParticleCloud';
import { HandCursor } from './HandCursor';
import { Tooltip3D } from './Tooltip3D';
import { FloatingLabels } from './FloatingLabel';
import { useGestureClassifier } from '../../hooks/useGestureClassifier';
import { useParticleInteraction } from '../../hooks/useParticleInteraction';
import { BLOOM_INTENSITY, BLOOM_THRESHOLD } from '../../constants/index';

function SceneLogic() {
  useGestureClassifier();
  useParticleInteraction();
  return null;
}

export function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#b388ff" />

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={20}
      />

      <ParticleCloud />
      <HandCursor />
      <Tooltip3D />
      <FloatingLabels />
      <SceneLogic />

      <EffectComposer>
        <Bloom
          mipmapBlur
          intensity={BLOOM_INTENSITY}
          luminanceThreshold={BLOOM_THRESHOLD}
          luminanceSmoothing={0.9}
        />
      </EffectComposer>
    </>
  );
}
