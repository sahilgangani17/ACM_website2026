import React, { useMemo } from 'react';
import * as THREE from 'three';

interface GlobeAtmosphereProps {
  radius?: number;
  opacity?: number;
}

export const GlobeAtmosphere: React.FC<GlobeAtmosphereProps> = ({
  radius = 15,
  opacity = 1.0,
}) => {
  // Sparse, elegant celestial starfield
  const [starPositions, starColors, starSizes] = useMemo(() => {
    const count = 450; // Sparse framing stars
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const cyan = new THREE.Color('#38bdf8');
    const blue = new THREE.Color('#818cf8');
    const white = new THREE.Color('#f8fafc');
    const palette = [cyan, blue, white];

    for (let i = 0; i < count; i++) {
      const r = 240 + Math.random() * 260;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[i % palette.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      sizes[i] = 1.0 + Math.random() * 2.2;
    }

    return [pos, col, sizes];
  }, []);

  return (
    <group name="globe-atmosphere">
      {/* 1. Sparse Celestial Starfield */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[starColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={1.6}
          vertexColors
          transparent
          opacity={0.65 * opacity}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 2. Outer Atmospheric Glow Shell */}
      <mesh scale={[1.14, 1.14, 1.14]}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          color="#06b6d4"
          transparent
          opacity={0.09 * opacity}
          side={THREE.BackSide}
          roughness={0.9}
        />
      </mesh>

      {/* 3. Inner Crisp Atmospheric Rim */}
      <mesh scale={[1.035, 1.035, 1.035]}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          color="#3b82f6"
          transparent
          opacity={0.14 * opacity}
          side={THREE.BackSide}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
};
