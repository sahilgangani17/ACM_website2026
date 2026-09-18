import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { DestinationData } from '../../data/destinations';
import { useCityStore } from '../../state/useCityStore';

interface DestinationBuildingProps {
  destination: DestinationData;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export const DestinationBuilding: React.FC<DestinationBuildingProps> = ({
  destination,
  position,
  rotation = [0, 0, 0],
}) => {
  const [hovered, setHovered] = useState(false);
  
  const selectDestination = useCityStore((s) => s.selectDestination);
  const enterDestination = useCityStore((s) => s.enterDestination);
  const selectedDestination = useCityStore((s) => s.selectedDestination);
  const setHoveredDestinationId = useCityStore((s) => s.setHoveredDestinationId);

  const isSelected = selectedDestination?.id === destination.id;

  // Primary & accent materials
  const mainColor = useMemo(() => new THREE.Color(destination.primaryColor), [destination.primaryColor]);
  const accentColor = useMemo(() => new THREE.Color(destination.accentColor), [destination.accentColor]);

  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#081224',
        roughness: 0.15,
        metalness: 0.85,
      }),
    []
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#040b18',
        roughness: 0.05,
        metalness: 0.95,
        transparent: true,
        opacity: 0.9,
      }),
    []
  );

  const emissiveMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: mainColor,
      }),
    [mainColor]
  );

  const highlightMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: accentColor,
      }),
    [accentColor]
  );

  const stepTagNumber = destination.id.replace('destination-', '');

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Interactive Raycast Hitbox Envelope */}
      <mesh
        position={[0, 18, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setHoveredDestinationId(destination.id);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          setHoveredDestinationId(null);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          selectDestination(destination);
        }}
      >
        <boxGeometry args={[32, 36, 24]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* 2. Main Landmark Building Massing */}
      {/* Primary Structural Shell Frame */}
      <mesh position={[0, 16, 0]} castShadow receiveShadow>
        <boxGeometry args={[28, 32, 20]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Illuminated Glass Lobby Frontage */}
      <mesh position={[0, 12, 8.5]}>
        <boxGeometry args={[25, 22, 4]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Interior Ambient Glow Light */}
      <pointLight
        position={[0, 10, 6]}
        color={destination.primaryColor}
        intensity={hovered || isSelected ? 8 : 4}
        distance={35}
      />

      {/* 3. Angular Futuristic Canopy & Neon Edge Frame */}
      {/* Outer Angular Arch Trim */}
      <mesh position={[0, 31.5, 9.8]}>
        <boxGeometry args={[27.5, 1.2, 0.8]} />
        <primitive object={hovered || isSelected ? highlightMaterial : emissiveMaterial} attach="material" />
      </mesh>
      <mesh position={[-13.5, 16, 9.8]}>
        <boxGeometry args={[1.0, 32, 0.8]} />
        <primitive object={hovered || isSelected ? highlightMaterial : emissiveMaterial} attach="material" />
      </mesh>
      <mesh position={[13.5, 16, 9.8]}>
        <boxGeometry args={[1.0, 32, 0.8]} />
        <primitive object={hovered || isSelected ? highlightMaterial : emissiveMaterial} attach="material" />
      </mesh>

      {/* 4. Entrance Steps & Ground Pavement (Reference Match) */}
      <group position={[0, 0, 12]}>
        {[0, 1, 2, 3].map((step) => (
          <mesh key={step} position={[0, step * 0.4 + 0.2, step * 1.2]}>
            <boxGeometry args={[22 - step * 1.5, 0.4, 2.5]} />
            <primitive object={frameMaterial} attach="material" />
          </mesh>
        ))}

        {/* Illuminated Step Marker Strip */}
        <mesh position={[-10, 0.5, 1.0]}>
          <boxGeometry args={[1.5, 0.4, 1.5]} />
          <primitive object={emissiveMaterial} attach="material" />
        </mesh>
      </group>

      {/* 5. Spatial 3D HUD Marker Tag above Building */}
      <Html
        position={[0, 37, 0]}
        center
        distanceFactor={60}
        zIndexRange={[100, 0]}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            selectDestination(destination);
          }}
          className={`cursor-pointer transition-all duration-300 transform ${
            hovered || isSelected ? 'scale-110 -translate-y-2' : 'scale-100'
          }`}
        >
          <div
            className={`px-4 py-2 rounded-lg backdrop-blur-md border flex items-center gap-3 shadow-xl transition-colors ${
              isSelected
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-glow-cyan'
                : hovered
                ? 'bg-slate-900/90 border-cyan-500/80 text-white shadow-lg'
                : 'bg-slate-950/75 border-slate-700/60 text-slate-300'
            }`}
            style={{
              borderColor: hovered || isSelected ? destination.primaryColor : undefined,
            }}
          >
            {/* Step/District Number Tag */}
            <span
              className="font-mono font-bold text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${destination.primaryColor}25`,
                color: destination.primaryColor,
              }}
            >
              {stepTagNumber}
            </span>

            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-sm tracking-wider uppercase">
                {destination.title}
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 uppercase font-mono">
                {destination.category}
              </span>
            </div>

            {/* Selection Pulse Dot */}
            <div
              className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                isSelected ? 'bg-cyan-400' : 'bg-slate-600'
              }`}
              style={{ backgroundColor: destination.primaryColor }}
            />
          </div>

          {/* Marker Pointer Pin */}
          <div className="w-0.5 h-6 mx-auto bg-gradient-to-b from-cyan-400 to-transparent" />
        </div>
      </Html>
    </group>
  );
};
