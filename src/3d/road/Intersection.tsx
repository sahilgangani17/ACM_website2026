import React, { useMemo } from 'react';
import * as THREE from 'three';

interface IntersectionProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  title?: string;
}

export const Intersection: React.FC<IntersectionProps> = ({
  position,
  rotation = [0, 0, 0],
  title = 'DISTRICT JUNCTION',
}) => {
  const roadMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#060c18',
        roughness: 0.15,
        metalness: 0.85,
      }),
    []
  );

  const metalMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.3,
        metalness: 0.8,
      }),
    []
  );

  const cyanEmissive = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#00f0ff',
      }),
    []
  );

  const blueEmissive = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#3b82f6',
      }),
    []
  );

  return (
    <group position={position} rotation={rotation}>
      {/* Main Junction Plate */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[48, 0.4, 30]} />
        <primitive object={roadMaterial} attach="material" />
      </mesh>

      {/* Grid Pattern Lane Markings */}
      {[-12, 0, 12].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]}>
          <boxGeometry args={[0.3, 0.02, 30]} />
          <primitive object={cyanEmissive} attach="material" />
        </mesh>
      ))}

      {/* Overhead Portal Gantry Frame */}
      <group position={[0, 0, 0]}>
        {/* Left Vertical Pillar */}
        <mesh position={[-23, 10, 0]}>
          <boxGeometry args={[1.5, 20, 1.5]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>

        {/* Right Vertical Pillar */}
        <mesh position={[23, 10, 0]}>
          <boxGeometry args={[1.5, 20, 1.5]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>

        {/* Crossbar Frame */}
        <mesh position={[0, 19, 0]}>
          <boxGeometry args={[47.5, 1.5, 1.5]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>

        {/* Emissive Under-Light Strip */}
        <mesh position={[0, 18.2, 0]}>
          <boxGeometry args={[45, 0.15, 0.8]} />
          <primitive object={cyanEmissive} attach="material" />
        </mesh>

        {/* Side Portal Accent Ring */}
        <mesh position={[-23, 10, 0]}>
          <boxGeometry args={[1.6, 20.2, 0.15]} />
          <primitive object={blueEmissive} attach="material" />
        </mesh>
        <mesh position={[23, 10, 0]}>
          <boxGeometry args={[1.6, 20.2, 0.15]} />
          <primitive object={blueEmissive} attach="material" />
        </mesh>
      </group>
    </group>
  );
};
