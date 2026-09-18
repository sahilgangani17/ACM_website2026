import React, { useMemo } from 'react';
import * as THREE from 'three';

interface RoadSegmentProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
  width?: number;
  hasLights?: boolean;
}

export const RoadSegment: React.FC<RoadSegmentProps> = ({
  position,
  rotation = [0, 0, 0],
  length = 60,
  width = 24,
  hasLights = true,
}) => {
  // Refined wet asphalt material with crisp specular reflection
  const roadMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#040914',
        roughness: 0.12, // Glossy wet reflective look
        metalness: 0.9,
      }),
    []
  );

  const curbMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#091122',
        roughness: 0.35,
        metalness: 0.75,
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

  const purpleEmissive = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#a855f7',
      }),
    []
  );

  const lightGlowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#e2e8f0',
      }),
    []
  );

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Main Asphalt Surface */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[width, 0.4, length]} />
        <primitive object={roadMaterial} attach="material" />
      </mesh>

      {/* 2. Emissive Center Lane Marking Lines */}
      {[-3.2, 3.2].map((xOffset) => (
        <mesh key={xOffset} position={[xOffset, 0.22, 0]}>
          <boxGeometry args={[0.2, 0.02, length]} />
          <primitive object={cyanEmissive} attach="material" />
        </mesh>
      ))}

      {/* 3. Outer Emissive Road Edge Strips */}
      <mesh position={[-width / 2 + 0.3, 0.22, 0]}>
        <boxGeometry args={[0.25, 0.02, length]} />
        <primitive object={cyanEmissive} attach="material" />
      </mesh>
      <mesh position={[width / 2 - 0.3, 0.22, 0]}>
        <boxGeometry args={[0.25, 0.02, length]} />
        <primitive object={purpleEmissive} attach="material" />
      </mesh>

      {/* 4. Left & Right Elevated Sidewalks / Curbs */}
      {/* Left Sidewalk */}
      <group position={[-width / 2 - 4, 0.3, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[8, 0.6, length]} />
          <primitive object={curbMaterial} attach="material" />
        </mesh>
        {/* Step Light Strip */}
        <mesh position={[3.9, 0.32, 0]}>
          <boxGeometry args={[0.12, 0.04, length]} />
          <primitive object={cyanEmissive} attach="material" />
        </mesh>
      </group>

      {/* Right Sidewalk */}
      <group position={[width / 2 + 4, 0.3, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[8, 0.6, length]} />
          <primitive object={curbMaterial} attach="material" />
        </mesh>
        {/* Step Light Strip */}
        <mesh position={[-3.9, 0.32, 0]}>
          <boxGeometry args={[0.12, 0.04, length]} />
          <primitive object={purpleEmissive} attach="material" />
        </mesh>
      </group>

      {/* 5. Futuristic Streetlight Poles */}
      {hasLights && (
        <>
          {[-length / 3, length / 3].map((zPos, idx) => (
            <group key={idx} position={[0, 0, zPos]}>
              {/* Left Streetlight Pole */}
              <group position={[-width / 2 - 7, 0, 0]}>
                <mesh position={[0, 6, 0]}>
                  <cylinderGeometry args={[0.18, 0.28, 12, 8]} />
                  <primitive object={curbMaterial} attach="material" />
                </mesh>
                <mesh position={[2, 11.8, 0]} rotation={[0, 0, -Math.PI / 12]}>
                  <boxGeometry args={[4.5, 0.18, 0.35]} />
                  <primitive object={curbMaterial} attach="material" />
                </mesh>
                <mesh position={[4, 11.3, 0]}>
                  <boxGeometry args={[1.4, 0.12, 0.5]} />
                  <primitive object={lightGlowMaterial} attach="material" />
                </mesh>
              </group>

              {/* Right Streetlight Pole */}
              <group position={[width / 2 + 7, 0, 0]}>
                <mesh position={[0, 6, 0]}>
                  <cylinderGeometry args={[0.18, 0.28, 12, 8]} />
                  <primitive object={curbMaterial} attach="material" />
                </mesh>
                <mesh position={[-2, 11.8, 0]} rotation={[0, 0, Math.PI / 12]}>
                  <boxGeometry args={[4.5, 0.18, 0.35]} />
                  <primitive object={curbMaterial} attach="material" />
                </mesh>
                <mesh position={[-4, 11.3, 0]}>
                  <boxGeometry args={[1.4, 0.12, 0.5]} />
                  <primitive object={lightGlowMaterial} attach="material" />
                </mesh>
              </group>
            </group>
          ))}
        </>
      )}
    </group>
  );
};
