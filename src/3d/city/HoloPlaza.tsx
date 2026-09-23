import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface HoloPlazaProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  themeColor?: string;
  scale?: number;
  label?: string;
}

export const HoloPlaza: React.FC<HoloPlazaProps> = ({
  position,
  rotation = [0, 0, 0],
  themeColor = '#00f0ff',
  scale = 1.0,
}) => {
  const outerRingRef = useRef<THREE.Mesh>(null!);
  const innerRingRef = useRef<THREE.Mesh>(null!);
  const corePolyRef = useRef<THREE.Mesh>(null!);
  const beamRef = useRef<THREE.Mesh>(null!);

  const holoMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(themeColor),
    wireframe: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [themeColor]);

  const beamMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(themeColor),
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [themeColor]);

  const pedestalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#081224',
    roughness: 0.3,
    metalness: 0.85,
  }), []);

  const accentMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(themeColor),
  }), [themeColor]);

  useFrame((_, delta) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.6;
      outerRingRef.current.rotation.x += delta * 0.3;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= delta * 0.8;
      innerRingRef.current.rotation.y += delta * 0.5;
    }
    if (corePolyRef.current) {
      corePolyRef.current.rotation.y += delta * 1.0;
      corePolyRef.current.rotation.x += delta * 0.7;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale} name="holo-plaza-monument">
      {/* 1. Stepped Octagonal Carbon Pedestal */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[4.2, 4.8, 0.8, 8]} />
        <primitive object={pedestalMaterial} attach="material" />
      </mesh>

      {/* Glowing Pedestal Base Accent Ring */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[3.8, 3.8, 0.08, 16]} />
        <primitive object={accentMaterial} attach="material" />
      </mesh>

      {/* Projector Emitter Aperture Dish */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[2.8, 3.2, 0.5, 16]} />
        <primitive object={pedestalMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 1.36, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 0.06, 16]} />
        <primitive object={accentMaterial} attach="material" />
      </mesh>

      {/* 2. Vertical Holographic Projector Beam Column */}
      <mesh ref={beamRef} position={[0, 7.5, 0]}>
        <cylinderGeometry args={[2.4, 0.8, 12, 16, 1, true]} />
        <primitive object={beamMaterial} attach="material" />
      </mesh>

      {/* 3. Floating Holographic Wireframe Core (Icosahedron) */}
      <group position={[0, 7.2, 0]}>
        <mesh ref={corePolyRef}>
          <icosahedronGeometry args={[1.8, 1]} />
          <primitive object={holoMaterial} attach="material" />
        </mesh>

        {/* Outer Gyroscopic Gimbal Ring */}
        <mesh ref={outerRingRef}>
          <torusGeometry args={[3.2, 0.08, 8, 32]} />
          <primitive object={holoMaterial} attach="material" />
        </mesh>

        {/* Inner Counter-Rotating Gimbal Ring */}
        <mesh ref={innerRingRef}>
          <torusGeometry args={[2.4, 0.06, 8, 28]} />
          <primitive object={holoMaterial} attach="material" />
        </mesh>

        {/* Concentric Floating Data Ring */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.6, 3.8, 32]} />
          <primitive object={holoMaterial} attach="material" />
        </mesh>

        {/* Center Glowing Energy Spark */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 12, 12]} />
          <primitive object={accentMaterial} attach="material" />
        </mesh>
      </group>
    </group>
  );
};
