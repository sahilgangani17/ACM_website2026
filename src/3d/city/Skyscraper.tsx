import React, { useMemo } from 'react';
import * as THREE from 'three';

interface SkyscraperProps {
  position: [number, number, number];
  height?: number;
  width?: number;
  color?: string;
  glowColor?: string;
}

export const Skyscraper: React.FC<SkyscraperProps> = ({
  position,
  height = 140,
  width = 28,
  color = '#050a14',
  glowColor = '#3b82f6',
}) => {
  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.2,
        metalness: 0.9,
      }),
    [color]
  );

  const glowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(glowColor),
      }),
    [glowColor]
  );

  return (
    <group position={position}>
      {/* Base Tower Section */}
      <mesh position={[0, height / 2, 0]} receiveShadow>
        <boxGeometry args={[width, height, width]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* Tapered Mid Tower Section */}
      <mesh position={[0, height + 20, 0]}>
        <boxGeometry args={[width * 0.7, 40, width * 0.7]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* Top Needle Spire */}
      <mesh position={[0, height + 50, 0]}>
        <cylinderGeometry args={[0.2, 1.2, 25, 8]} />
        <primitive object={glowMaterial} attach="material" />
      </mesh>

      {/* Vertical Accent Glow Strips */}
      {[-width / 2, width / 2].map((x, idx) => (
        <mesh key={idx} position={[x, height / 2, width / 2 + 0.1]}>
          <boxGeometry args={[0.3, height, 0.1]} />
          <primitive object={glowMaterial} attach="material" />
        </mesh>
      ))}
    </group>
  );
};
