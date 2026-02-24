import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments as ThreeLineSegments,
  Color,
} from 'three';
import { useGraphStore } from '../../stores/useGraphStore';
import { useParticleStore } from '../../stores/useParticleStore';

const _cyanColor = new Color('#00e5ff');
const _magentaColor = new Color('#e040fb');
const _whiteColor = new Color('#ffffff');

export function EdgeLines() {
  const linesRef = useRef<ThreeLineSegments>(null);
  const showEdges = useGraphStore((s) => s.showEdges);
  const edges = useGraphStore((s) => s.edges);
  const topologyMode = useGraphStore((s) => s.topologyMode);

  const { material, opacity } = useMemo(() => {
    let color: Color;
    let op: number;

    switch (topologyMode) {
      case 'centralized':
        color = _cyanColor;
        op = 0.25;
        break;
      case 'decentralized':
        color = _whiteColor;
        op = 0.18;
        break;
      case 'distributed':
      default:
        color = _cyanColor;
        op = 0.12;
        break;
    }

    return {
      material: new LineBasicMaterial({
        color,
        transparent: true,
        opacity: op,
        depthWrite: false,
      }),
      opacity: op,
    };
  }, [topologyMode]);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const maxVerts = Math.max(edges.length * 2, 1) * 3;
    const positions = new Float32Array(maxVerts);
    const colors = new Float32Array(maxVerts);
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geo.setDrawRange(0, edges.length * 2);
    return geo;
  }, [edges.length]);

  useFrame(() => {
    if (!linesRef.current || !showEdges || edges.length === 0) return;

    const { currentPositions } = useParticleStore.getState();
    const { hubNodeIndex } = useGraphStore.getState();
    const posAttr = geometry.getAttribute('position') as Float32BufferAttribute;
    const colAttr = geometry.getAttribute('color') as Float32BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const s3 = edge.source * 3;
      const t3 = edge.target * 3;
      const i6 = i * 6;

      posArr[i6] = currentPositions[s3];
      posArr[i6 + 1] = currentPositions[s3 + 1];
      posArr[i6 + 2] = currentPositions[s3 + 2];
      posArr[i6 + 3] = currentPositions[t3];
      posArr[i6 + 4] = currentPositions[t3 + 1];
      posArr[i6 + 5] = currentPositions[t3 + 2];

      // Color edges based on topology
      let r = 0, g = 0.9, b = 1.0; // cyan default
      if (topologyMode === 'centralized') {
        // Bright cyan spokes from hub
        r = 0; g = 0.9; b = 1.0;
      } else if (topologyMode === 'decentralized') {
        // Inter-cluster edges white, intra-cluster use edge weight
        if (edge.weight < 0.5) {
          // Inter-cluster bridge: white
          r = 1.0; g = 1.0; b = 1.0;
        } else {
          // Intra-cluster: magenta-ish
          r = 0.88; g = 0.25; b = 0.98;
        }
      } else {
        // Distributed: similarity gradient
        const w = Math.min(edge.weight, 1);
        r = w * 0; g = w * 0.9; b = w * 1.0;
      }

      colArr[i6] = r;
      colArr[i6 + 1] = g;
      colArr[i6 + 2] = b;
      colArr[i6 + 3] = r;
      colArr[i6 + 4] = g;
      colArr[i6 + 5] = b;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    geometry.setDrawRange(0, edges.length * 2);

    // Update material opacity based on weights
    if (linesRef.current.material instanceof LineBasicMaterial) {
      linesRef.current.material.opacity = opacity;
      linesRef.current.material.vertexColors = true;
    }
  });

  if (!showEdges || edges.length === 0) return null;

  return (
    <lineSegments ref={linesRef} geometry={geometry} material={material} frustumCulled={false} />
  );
}
