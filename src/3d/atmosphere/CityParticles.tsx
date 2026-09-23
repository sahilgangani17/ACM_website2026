import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../state/useCityStore';
import { QUALITY_PRESETS } from '../../utils/quality';

export const CityParticles: React.FC = () => {
  const qualityTier = useCityStore((s) => s.qualityTier);
  const particleCount = QUALITY_PRESETS[qualityTier].particleCount;

  const atmosphericPointsRef = useRef<THREE.Points>(null!);
  const roadSparksRef = useRef<THREE.Points>(null!);

  // 1. High-Altitude Atmospheric Cyber Motes
  const [atmPositions, atmColors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    const cyan = new THREE.Color('#38bdf8');
    const blue = new THREE.Color('#818cf8');
    const purple = new THREE.Color('#c084fc');
    const magenta = new THREE.Color('#f472b6');
    const palette = [cyan, blue, purple, magenta];

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 180;
      pos[i * 3 + 1] = Math.random() * 65 + 4;
      pos[i * 3 + 2] = 50 - Math.random() * 950;

      const c = palette[i % palette.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, [particleCount]);

  // 2. Low-Altitude Highway Energy Embers (Rising from asphalt)
  const sparkCount = Math.floor(particleCount * 0.7);
  const [sparkPositions, sparkColors, sparkSpeeds] = useMemo(() => {
    const pos = new Float32Array(sparkCount * 3);
    const col = new Float32Array(sparkCount * 3);
    const speeds = new Float32Array(sparkCount);

    const cyan = new THREE.Color('#00f0ff');
    const amber = new THREE.Color('#38bdf8');
    const neonPurple = new THREE.Color('#a855f7');
    const sparkPalette = [cyan, amber, neonPurple];

    for (let i = 0; i < sparkCount; i++) {
      // Concentrated along the boulevard corridor
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = Math.random() * 6 + 0.2;
      pos[i * 3 + 2] = 50 - Math.random() * 920;

      const c = sparkPalette[i % sparkPalette.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      speeds[i] = 1.2 + Math.random() * 2.5;
    }

    return [pos, col, speeds];
  }, [sparkCount]);

  useFrame((_, delta) => {
    // Animate atmospheric floating motes
    if (atmosphericPointsRef.current) {
      const geom = atmosphericPointsRef.current.geometry;
      const posAttr = geom.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        array[i * 3 + 1] += Math.sin(Date.now() * 0.0012 + i) * 0.03 * delta * 60;
        array[i * 3] += Math.cos(Date.now() * 0.0008 + i * 2) * 0.015 * delta * 60;
      }
      posAttr.needsUpdate = true;
    }

    // Animate rising road energy embers
    if (roadSparksRef.current) {
      const geom = roadSparksRef.current.geometry;
      const posAttr = geom.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < sparkCount; i++) {
        array[i * 3 + 1] += sparkSpeeds[i] * delta * 2.2;
        // Reset when rising above 6 meters
        if (array[i * 3 + 1] > 6.5) {
          array[i * 3 + 1] = 0.2 + Math.random() * 0.4;
          array[i * 3] = (Math.random() - 0.5) * 26;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group name="city-particle-systems">
      {/* High-Altitude Ambient Cyber Motes */}
      <points ref={atmosphericPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[atmPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[atmColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.75}
          vertexColors
          transparent
          opacity={0.65}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Low-Altitude Highway Energy Embers */}
      <points ref={roadSparksRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[sparkColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.9}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
