import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RotatingEarth } from './globe/RotatingEarth';
import { GlobeToCityTransition } from './transition/GlobeToCityTransition';
import { CityEnvironment } from '../3d/city/CityEnvironment';
import { Road } from '../3d/road/Road';
import { CityBlock } from '../3d/city/CityBlock';
import { DestinationBuilding } from '../3d/city/DestinationBuilding';
import { TrafficSystem } from '../3d/vehicles/TrafficSystem';
import { DroneSystem } from '../3d/vehicles/DroneSystem';
import { CityParticles } from '../3d/atmosphere/CityParticles';
import { DebugCameraVisualizer } from '../3d/camera/DebugCameraVisualizer';
import { CityCameraController } from '../3d/camera/CityCamera';
import { CameraRouteEngine } from '../data/cityRoute';
import { useWorldStore } from './state/useWorldStore';
import { useCityStore } from '../state/useCityStore';
import { QUALITY_PRESETS } from '../utils/quality';

// Master Camera Loop Handler managing ownership between World (Globe/Descent) and City Exploration
const MasterCameraLoop: React.FC = () => {
  const { camera } = useThree();
  const cityControllerRef = useRef<CityCameraController | null>(null);

  // World camera targets
  const worldPos = useRef(new THREE.Vector3(0, 8, 48));
  const worldTarget = useRef(new THREE.Vector3(0, 0, 0));

  // Seamless warp origin cache to prevent positional jumps
  const warpOriginPos = useRef(new THREE.Vector3());
  const warpOriginTarget = useRef(new THREE.Vector3());
  const wasWarpingRef = useRef(false);

  useEffect(() => {
    cityControllerRef.current = new CityCameraController();
    return () => {
      cityControllerRef.current?.dispose();
    };
  }, []);

  useFrame((_, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const worldStore = useWorldStore.getState();
    const worldMode = worldStore.worldMode;
    const isWarping = worldStore.isWarping;
    const warpProgress = worldStore.warpProgress;
    const warpDirection = worldStore.warpDirection;
    const worldProgress = worldStore.worldProgress;

    // Cache origin camera position the exact frame a warp initiates
    if (!wasWarpingRef.current && isWarping) {
      warpOriginPos.current.copy(camera.position);
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      warpOriginTarget.current.copy(camera.position).addScaledVector(forward, 40);
    }
    wasWarpingRef.current = isWarping;

    if (worldMode === 'CITY_EXPLORATION' && !isWarping) {
      // 1. Handover: Existing City Engine owns the camera completely!
      camera.fov = 55;
      camera.updateProjectionMatrix();
      cityControllerRef.current?.update(camera, delta);
    } else if (isWarping) {
      // 2. Dedicated Cinematic Warp Descent / Ascent
      const easeCubic = warpProgress < 0.5
        ? 4 * warpProgress * warpProgress * warpProgress
        : 1 - Math.pow(-2 * warpProgress + 2, 3) / 2;

      // Dynamic FOV pulse for hyper-speed sensation (peaks at 70 deg)
      const fovPulse = Math.sin(warpProgress * Math.PI) * 15;
      camera.fov = 55 + fovPulse;
      camera.updateProjectionMatrix();

      // Start: Mumbai Focal Framing | End: Boulevard Start [0, 5.5, 60], lookAt [0, 4.5, -20]
      const startPos = new THREE.Vector3(8.0, 11.0, 26.0);
      const startTarget = new THREE.Vector3(4.5, 3.0, 12.0);

      const endPos = new THREE.Vector3(0, 5.5, 60.0);
      const endTarget = new THREE.Vector3(0, 4.5, -20.0);

      // If a destination was selected from globe navigation, dive directly to that destination
      const activeDest = useCityStore.getState().activeDestination;
      if (activeDest && warpDirection === 'TO_CITY') {
        const routeEngine = cityControllerRef.current?.routeEngine || new CameraRouteEngine();
        routeEngine.getPosition(activeDest.routeProgress, endPos);
        routeEngine.getLookAt(activeDest.routeProgress, 0.05, endTarget);
      }

      // Top Overview Framing (worldProgress = 0.0)
      const topPos = new THREE.Vector3(0, 8.0, 48.0);
      const topTarget = new THREE.Vector3(0, 0, 0);

      if (warpDirection === 'TO_CITY') {
        // Smoothly dive from current camera location down to the boulevard
        const fromPos = warpOriginPos.current.lengthSq() > 0 ? warpOriginPos.current : startPos;
        const fromTarget = warpOriginTarget.current.lengthSq() > 0 ? warpOriginTarget.current : startTarget;
        worldPos.current.lerpVectors(fromPos, endPos, easeCubic);
        worldTarget.current.lerpVectors(fromTarget, endTarget, easeCubic);
      } else {
        // Reverse ascent: smoothly elevate from current camera pose all the way to Top Overview
        const fromPos = warpOriginPos.current.lengthSq() > 0 ? warpOriginPos.current : endPos;
        const fromTarget = warpOriginTarget.current.lengthSq() > 0 ? warpOriginTarget.current : endTarget;
        worldPos.current.lerpVectors(fromPos, topPos, easeCubic);
        worldTarget.current.lerpVectors(fromTarget, topTarget, easeCubic);
      }

      camera.position.copy(worldPos.current);
      camera.lookAt(worldTarget.current);
    } else {
      // 3. Globe Interactive Exploration (Orbital -> Mumbai Focus)
      camera.fov = 55;
      camera.updateProjectionMatrix();

      if (worldProgress < 0.35) {
        // Stage A: Full Globe Orbital Framing
        const orbitT = worldProgress / 0.35;
        worldPos.current.set(
          Math.sin(orbitT * 0.4) * 10,
          8 + orbitT * 2,
          48 - orbitT * 8
        );
        worldTarget.current.set(0, 0, 0);
      } else {
        // Stage B: Focus on Mumbai / DJ Sanghvi Node
        const focusT = (worldProgress - 0.35) / 0.30;
        const easeFocus = THREE.MathUtils.smoothstep(focusT, 0, 1);
        worldPos.current.set(
          THREE.MathUtils.lerp(3.5, 8.0, easeFocus),
          THREE.MathUtils.lerp(10.0, 11.0, easeFocus),
          THREE.MathUtils.lerp(40.0, 26.0, easeFocus)
        );
        worldTarget.current.set(
          THREE.MathUtils.lerp(0, 4.5, easeFocus),
          THREE.MathUtils.lerp(0, 3.0, easeFocus),
          THREE.MathUtils.lerp(0, 12.0, easeFocus)
        );
      }

      camera.position.lerp(worldPos.current, delta * 4.5);
      camera.lookAt(worldTarget.current);
    }
  });

  return null;
};

export const WorldExperience: React.FC = () => {
  const qualityTier = useCityStore((s) => s.qualityTier);
  const destinations = useCityStore((s) => s.destinations);
  const isSpaceActive = useWorldStore((s) => s.isSpaceActive);
  const isWarping = useWorldStore((s) => s.isWarping);
  const warpProgress = useWorldStore((s) => s.warpProgress);
  const warpDirection = useWorldStore((s) => s.warpDirection);
  const worldMode = useWorldStore((s) => s.worldMode);
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
      const sideRotation: [number, number, number] =
        dest.side === 'left' ? [0, Math.PI / 2.5, 0] : [0, -Math.PI / 2.5, 0];
      return {
        dest,
        position: [pos.x, pos.y, pos.z] as [number, number, number],
        rotation: sideRotation,
      };
    });
  }, [destinations, routeEngine]);

  // Compute clean globe opacity during warp
  const globeOpacity = useMemo(() => {
    if (!isWarping) return isSpaceActive ? 1.0 : 0.0;
    if (warpDirection === 'TO_CITY') {
      // Fades out smoothly as camera penetrates atmosphere
      return Math.max(0, 1.0 - warpProgress * 1.7);
    } else {
      // Ascending back to globe: fades in smoothly as camera pulls away
      return Math.min(1.0, Math.max(0, (warpProgress - 0.15) / 0.55));
    }
  }, [isWarping, warpProgress, warpDirection, isSpaceActive]);

  // City stays active smoothly during warp descent & ascent (pre-warmed in WebGL, zero stutter)
  const showCity = worldMode === 'CITY_EXPLORATION' || isWarping;

  return (
    <div className="w-full h-screen fixed inset-0 bg-[#02040a] overflow-hidden select-none">
      {/* 1. SCENE A: D3 Halftone Dot Earth (always mounted, zero restart lag) */}
      <RotatingEarth opacity={globeOpacity} />

      {/* 2. 3D WebGL Canvas: Warp streaks & City Boulevard */}
      <Canvas
        camera={{ position: [0, 8, 48], fov: 55, near: 0.1, far: 1200 }}
        dpr={preset.dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <MasterCameraLoop />

        {/* 1-Second Cinematic Warp Streaks */}
        {isSpaceActive && isWarping && (
          <GlobeToCityTransition />
        )}

        {/* 2. SCENE B: Digital City Subsystem (Active in city mode & warp entry) */}
        {showCity && (
          <group name="digital-city-scene">
            <CityEnvironment />
            <CityParticles />
            <Road />

            {/* City Blocks along Boulevard */}
            {[-100, -250, -400, -550, -700].map((z, idx) => (
              <React.Fragment key={z}>
                <CityBlock position={[0, 0, z]} side="left" seed={idx * 13 + 7} />
                <CityBlock position={[0, 0, z]} side="right" seed={idx * 17 + 3} />
              </React.Fragment>
            ))}

            {/* Landmark Destination Buildings */}
            {destinationPositions.map(({ dest, position, rotation }) => (
              <DestinationBuilding
                key={dest.id}
                destination={dest}
                position={position}
                rotation={rotation}
              />
            ))}

            {/* Traffic and Flying Drones */}
            <TrafficSystem />
            <DroneSystem />

            {/* Debug Route Gizmos */}
            <DebugCameraVisualizer />
          </group>
        )}
      </Canvas>
    </div>
  );
};
