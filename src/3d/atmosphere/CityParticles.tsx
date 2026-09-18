import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../state/useCityStore';
import { QUALITY_PRESETS } from '../../utils/quality';

export const CityParticles: React.FC = () => {
  const qualityTier = useCityStore((s) => s.qualityTier);
  const particleCount = QUALITY_PRESETS[qualityTier].particleCount;

  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    const cyan = new THREE.Color('#00f0ff');
    const blue = new THREE.Color('#3b82f6');
    const purple = new THREE.Color('#a855f7');
    const palette = [cyan, blue, purple];

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 160;
      pos[i * 3 + 1] = Math.random() * 40 + 2;
      pos[i * 3 + 2] = 40 - Math.random() * 900;

      const c = palette[i % palette.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      // Gentle floating motion
      array[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.02 * delta * 60;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} name="city-particles">
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.6}
        vertexColors
        transparent
        opacity={0.65}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
