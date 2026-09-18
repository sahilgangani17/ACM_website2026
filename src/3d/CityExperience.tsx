import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CityEnvironment } from './city/CityEnvironment';
import { Road } from './road/Road';
import { CityBlock } from './city/CityBlock';
import { DestinationBuilding } from './city/DestinationBuilding';
import { TrafficSystem } from './vehicles/TrafficSystem';
import { DroneSystem } from './vehicles/DroneSystem';
import { CityParticles } from './atmosphere/CityParticles';
import { DebugCameraVisualizer } from './camera/DebugCameraVisualizer';
import { CityCameraController } from './camera/CityCamera';
import { CameraRouteEngine } from '../data/cityRoute';
import { useCityStore } from '../state/useCityStore';
import { QUALITY_PRESETS } from '../utils/quality';

// Internal component to run camera controller inside R3F render loop
const CameraLoopHandler: React.FC = () => {
  const { camera } = useThree();
  const controllerRef = useRef<CityCameraController | null>(null);

  useEffect(() => {
    controllerRef.current = new CityCameraController();
    return () => {
      controllerRef.current?.dispose();
    };
  }, []);

  useFrame((_, delta) => {
    if (controllerRef.current && camera instanceof THREE.PerspectiveCamera) {
      controllerRef.current.update(camera, delta);
    }
  });

  return null;
};

export const CityExperience: React.FC = () => {
  const qualityTier = useCityStore((s) => s.qualityTier);
  const destinations = useCityStore((s) => s.destinations);
  const preset = QUALITY_PRESETS[qualityTier];

  const routeEngine = useMemo(() => new CameraRouteEngine(), []);

  // Compute 3D world positions for landmark destination buildings
  const destinationPositions = useMemo(() => {
    return destinations.map((dest) => {
      const pos = routeEngine.getSidePosition(
        dest.routeProgress,
        dest.side,
        dest.lateralOffset,
        dest.verticalOffset || 0,
        new THREE.Vector3()
      );
      // Facing rotation toward road center
      const sideRotation: [number, number, number] = dest.side === 'left' ? [0, Math.PI / 2.5, 0] : [0, -Math.PI / 2.5, 0];
      return {
        dest,
        position: [pos.x, pos.y, pos.z] as [number, number, number],
        rotation: sideRotation,
      };
    });
  }, [destinations, routeEngine]);

  return (
    <div className="w-full h-screen fixed inset-0 bg-[#02040a] overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 5.5, 60], fov: 55, near: 0.1, far: 1200 }}
        dpr={preset.dpr}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <CameraLoopHandler />

        {/* Atmosphere & Lighting */}
        <CityEnvironment />
        <CityParticles />

        {/* Boulevard Spine */}
        <Road />

        {/* Procedural City Blocks along the Boulevard */}
        {[-100, -250, -400, -550, -700].map((z, idx) => (
          <React.Fragment key={z}>
            <CityBlock position={[0, 0, z]} side="left" seed={idx * 13 + 7} />
            <CityBlock position={[0, 0, z]} side="right" seed={idx * 17 + 3} />
          </React.Fragment>
        ))}

        {/* Architectural Landmark Destination Buildings */}
        {destinationPositions.map(({ dest, position, rotation }) => (
          <DestinationBuilding
            key={dest.id}
            destination={dest}
            position={position}
            rotation={rotation}
          />
        ))}

        {/* Vehicles & Flying Drones */}
        <TrafficSystem />
        <DroneSystem />

        {/* Development Debug Overlay */}
        <DebugCameraVisualizer />
      </Canvas>
    </div>
  );
};
