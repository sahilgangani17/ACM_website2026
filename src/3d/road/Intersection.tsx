import React, { useMemo } from 'react';
import * as THREE from 'three';

interface IntersectionProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  districtName?: string;
}

export const Intersection: React.FC<IntersectionProps> = ({
  position,
  rotation = [0, 0, 0],
  districtName = 'DISTRICT JUNCTION',
}) => {
  const materials = useMemo(() => {
    return {
      crossRoad: new THREE.MeshStandardMaterial({
        color: '#050a16',
        roughness: 0.16,
        metalness: 0.88,
      }),
      sidewalk: new THREE.MeshStandardMaterial({
        color: '#091222',
        roughness: 0.35,
        metalness: 0.75,
      }),
      signalMetal: new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.3,
        metalness: 0.85,
      }),
      seamCyan: new THREE.MeshBasicMaterial({
        color: '#00f0ff',
      }),
      seamPurple: new THREE.MeshBasicMaterial({
        color: '#a855f7',
      }),
      zebraWhite: new THREE.MeshBasicMaterial({
        color: '#e2e8f0',
        transparent: true,
        opacity: 0.85,
      }),
      trafficSignalRed: new THREE.MeshBasicMaterial({
        color: '#ff0055',
      }),
      trafficSignalCyan: new THREE.MeshBasicMaterial({
        color: '#00f0ff',
      }),
      trafficSignalAmber: new THREE.MeshBasicMaterial({
        color: '#f59e0b',
      }),
    };
  }, []);

  return (
    <group position={position} rotation={rotation} name="street-intersection">
      {/* 1. Left Lateral Cross-Street Avenue (Cutting into Left City Block) */}
      <group position={[-32, 0.02, 0]}>
        {/* Asphalt surface */}
        <mesh>
          <boxGeometry args={[36, 0.38, 20]} />
          <primitive object={materials.crossRoad} attach="material" />
        </mesh>
        {/* Left Avenue Curbs & Sidewalks */}
        {[-10.8, 10.8].map((z) => (
          <group key={`lcurb-${z}`} position={[0, 0.28, z]}>
            <mesh>
              <boxGeometry args={[36, 0.55, 3.2]} />
              <primitive object={materials.sidewalk} attach="material" />
            </mesh>
            {/* Curb Neon Runner */}
            <mesh position={[0, 0.3, z < 0 ? 1.5 : -1.5]}>
              <boxGeometry args={[35.8, 0.08, 0.12]} />
              <primitive object={materials.seamCyan} attach="material" />
            </mesh>
          </group>
        ))}
        {/* Center Line for cross street */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[34, 0.02, 0.2]} />
          <primitive object={materials.seamCyan} attach="material" />
        </mesh>
      </group>

      {/* 2. Right Lateral Cross-Street Avenue (Cutting into Right City Block) */}
      <group position={[32, 0.02, 0]}>
        {/* Asphalt surface */}
        <mesh>
          <boxGeometry args={[36, 0.38, 20]} />
          <primitive object={materials.crossRoad} attach="material" />
        </mesh>
        {/* Right Avenue Curbs & Sidewalks */}
        {[-10.8, 10.8].map((z) => (
          <group key={`rcurb-${z}`} position={[0, 0.28, z]}>
            <mesh>
              <boxGeometry args={[36, 0.55, 3.2]} />
              <primitive object={materials.sidewalk} attach="material" />
            </mesh>
            {/* Curb Neon Runner */}
            <mesh position={[0, 0.3, z < 0 ? 1.5 : -1.5]}>
              <boxGeometry args={[35.8, 0.08, 0.12]} />
              <primitive object={materials.seamPurple} attach="material" />
            </mesh>
          </group>
        ))}
        {/* Center Line for cross street */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[34, 0.02, 0.2]} />
          <primitive object={materials.seamPurple} attach="material" />
        </mesh>
      </group>

      {/* 3. Glowing Cross-Street Pavement Expansion Seams */}
      {[-10, 10].map((z) => (
        <group key={`seam-${z}`} position={[0, 0.23, z]}>
          {/* Main seam line spanning across junction */}
          <mesh position={[-25, 0, 0]}>
            <boxGeometry args={[26, 0.02, 0.18]} />
            <primitive object={materials.seamCyan} attach="material" />
          </mesh>
          <mesh position={[25, 0, 0]}>
            <boxGeometry args={[26, 0.02, 0.18]} />
            <primitive object={materials.seamPurple} attach="material" />
          </mesh>
        </group>
      ))}

      {/* 4. Neon Pedestrian Zebra Crosswalks on Lateral Avenues */}
      {/* Left crosswalk */}
      {[-7, -3.5, 0, 3.5, 7].map((z) => (
        <mesh key={`zebra-l-${z}`} position={[-16, 0.23, z]}>
          <boxGeometry args={[2.5, 0.02, 1.4]} />
          <primitive object={materials.zebraWhite} attach="material" />
        </mesh>
      ))}
      {/* Right crosswalk */}
      {[-7, -3.5, 0, 3.5, 7].map((z) => (
        <mesh key={`zebra-r-${z}`} position={[16, 0.23, z]}>
          <boxGeometry args={[2.5, 0.02, 1.4]} />
          <primitive object={materials.zebraWhite} attach="material" />
        </mesh>
      ))}

      {/* 5. Four Cybernetic Corner Traffic Signal Monoliths */}
      {[-14.5, 14.5].map((cx) =>
        [-11.5, 11.5].map((cz) => (
          <group key={`monolith-${cx}-${cz}`} position={[cx, 0.4, cz]}>
            {/* Base plinth */}
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[1.2, 0.8, 1.2]} />
              <primitive object={materials.signalMetal} attach="material" />
            </mesh>
            {/* Vertical signal spire */}
            <mesh position={[0, 4.0, 0]}>
              <boxGeometry args={[0.5, 7.2, 0.5]} />
              <primitive object={materials.signalMetal} attach="material" />
            </mesh>
            {/* Top angled sensor visor */}
            <mesh position={[cx < 0 ? 0.4 : -0.4, 7.2, 0]} rotation={[0, 0, cx < 0 ? -0.3 : 0.3]}>
              <boxGeometry args={[1.2, 0.25, 0.6]} />
              <primitive object={materials.signalMetal} attach="material" />
            </mesh>
            {/* Luminous LED Status Bars */}
            <mesh position={[cx < 0 ? 0.28 : -0.28, 6.2, 0]}>
              <boxGeometry args={[0.1, 1.2, 0.3]} />
              <primitive object={materials.trafficSignalCyan} attach="material" />
            </mesh>
            <mesh position={[cx < 0 ? 0.28 : -0.28, 4.5, 0]}>
              <boxGeometry args={[0.1, 1.2, 0.3]} />
              <primitive object={materials.trafficSignalAmber} attach="material" />
            </mesh>
            <mesh position={[cx < 0 ? 0.28 : -0.28, 2.8, 0]}>
              <boxGeometry args={[0.1, 1.2, 0.3]} />
              <primitive object={materials.trafficSignalRed} attach="material" />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
};
