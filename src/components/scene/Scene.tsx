import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ParticleCloud } from './ParticleCloud';
import { HandCursor } from './HandCursor';
import { Tooltip3D } from './Tooltip3D';
import { FloatingLabels } from './FloatingLabel';
import { EdgeLines } from './EdgeLines';
import { EdgeLabels } from './EdgeLabels';
import { NodeLabels } from './NodeLabels';
import { useGestureClassifier } from '../../hooks/useGestureClassifier';
import { useParticleInteraction } from '../../hooks/useParticleInteraction';
import { BLOOM_INTENSITY, BLOOM_THRESHOLD, BLOOM_SMOOTHING } from '../../constants/index';

function SceneLogic() {
  useGestureClassifier();
  useParticleInteraction();
  return null;
}

export function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 8, 10]} intensity={0.4} color="#4488ff" />
      <pointLight position={[-8, -5, -10]} intensity={0.3} color="#ff8844" />

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={20}
      />

      <EdgeLines />
      <ParticleCloud />
      <EdgeLabels />
      <NodeLabels />
      <HandCursor />
      <Tooltip3D />
      <FloatingLabels />
      <SceneLogic />

      <EffectComposer>
        <Bloom
          mipmapBlur
          intensity={BLOOM_INTENSITY}
          luminanceThreshold={BLOOM_THRESHOLD}
          luminanceSmoothing={BLOOM_SMOOTHING}
        />
      </EffectComposer>
    </>
  );
}
