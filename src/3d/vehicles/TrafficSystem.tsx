import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CameraRouteEngine } from '../../data/cityRoute';
import { useCityStore } from '../../state/useCityStore';
import { QUALITY_PRESETS } from '../../utils/quality';

export const TrafficSystem: React.FC = () => {
  const qualityTier = useCityStore((s) => s.qualityTier);
  const maxVehicles = QUALITY_PRESETS[qualityTier].maxVehicles;

  const routeEngine = useMemo(() => new CameraRouteEngine(), []);

  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize vehicle state pool
  const vehicles = useMemo(() => {
    const list: Array<{
      progress: number;
      speed: number;
      laneOffset: number; // Left vs Right lane
    }> = [];

    for (let i = 0; i < maxVehicles; i++) {
      list.push({
        progress: (i / maxVehicles) + Math.random() * 0.05,
        speed: 0.02 + Math.random() * 0.03,
        laneOffset: i % 2 === 0 ? -4.5 : 4.5, // Left lane vs Right lane
      });
    }

    return list;
  }, [maxVehicles]);

  const carMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.2,
        metalness: 0.8,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    vehicles.forEach((veh, idx) => {
      // Advance vehicle along route spline
      veh.progress = (veh.progress + delta * veh.speed) % 1.0;

      // Sample position & direction from route engine
      const pos = routeEngine.getSidePosition(
        veh.progress,
        veh.laneOffset > 0 ? 'right' : 'left',
        Math.abs(veh.laneOffset),
        0.6,
        new THREE.Vector3()
      );

      const tangent = routeEngine.getTangent(veh.progress, new THREE.Vector3());
      const yaw = Math.atan2(tangent.x, tangent.z);

      // Vehicles on right lane move in same direction, left lane moves opposite
      const directionYaw = veh.laneOffset > 0 ? yaw : yaw + Math.PI;

      dummy.position.copy(pos);
      dummy.rotation.set(0, directionYaw, 0);
      dummy.scale.set(1.4, 0.8, 3.2); // Sleek futuristic vehicle pod dimensions
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(idx, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="traffic-system">
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, maxVehicles]}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={carMaterial} attach="material" />
      </instancedMesh>
    </group>
  );
};
