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

  // Instanced mesh refs for the 7 coordinated cyber-vehicle visual layers
  const chassisRef = useRef<THREE.InstancedMesh>(null!);
  const canopyRef = useRef<THREE.InstancedMesh>(null!);
  const headlightsRef = useRef<THREE.InstancedMesh>(null!);
  const beamsRef = useRef<THREE.InstancedMesh>(null!);
  const taillightsRef = useRef<THREE.InstancedMesh>(null!);
  const trailsRef = useRef<THREE.InstancedMesh>(null!);
  const underglowRef = useRef<THREE.InstancedMesh>(null!);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize two-way vehicle fleet
  const vehicles = useMemo(() => {
    const list: Array<{
      progress: number;
      speed: number;
      isRightLane: boolean;
      laneOffset: number;
    }> = [];

    for (let i = 0; i < maxVehicles; i++) {
      const isRightLane = i % 2 === 0;
      list.push({
        progress: (i / maxVehicles) + (Math.random() * 0.04),
        speed: 0.028 + (i % 5) * 0.007,
        isRightLane,
        // Lateral lane offsets from center road divider
        laneOffset: isRightLane ? 4.6 : -4.6,
      });
    }

    return list;
  }, [maxVehicles]);

  // ---------------------------------------------------------------------------
  // Pre-Baked Offset Geometries (Single transform matrix per vehicle for max FPS)
  // ---------------------------------------------------------------------------
  const geometries = useMemo(() => {
    // 1. Sleek Aerodynamic Cyber-Chassis
    const chassis = new THREE.BoxGeometry(1.5, 0.42, 3.4);
    chassis.translate(0, 0.32, 0);

    // 2. Tapered Cockpit Canopy
    const canopy = new THREE.BoxGeometry(1.12, 0.34, 1.75);
    canopy.translate(0, 0.62, -0.2);

    // 3. Twin Forward Cyber Headlight Visor
    const headlights = new THREE.BoxGeometry(1.3, 0.09, 0.14);
    headlights.translate(0, 0.38, 1.71);

    // 4. Volumetric Forward Light Beams (Atmospheric headlight projection ahead of vehicle)
    // Tapered cylinder: radius 0.35 at bumper expanding to 1.7 at distance 13.5
    const beams = new THREE.CylinderGeometry(0.35, 1.7, 13.5, 12, 1, true);
    beams.rotateX(Math.PI / 2);
    beams.translate(0, 0.18, 8.4);

    // 5. Full-Width Rear Neon Taillight Bar
    const taillights = new THREE.BoxGeometry(1.35, 0.09, 0.14);
    taillights.translate(0, 0.42, -1.71);

    // 6. Elongated Rear Tail Light Trail (Long-exposure highway streak)
    const trails = new THREE.BoxGeometry(1.15, 0.10, 18.0);
    trails.translate(0, 0.38, -10.7);

    // 7. Ground Neon Underglow
    const underglow = new THREE.PlaneGeometry(1.4, 3.2);
    underglow.rotateX(-Math.PI / 2);
    underglow.translate(0, 0.08, 0);

    return { chassis, canopy, headlights, beams, taillights, trails, underglow };
  }, []);

  // ---------------------------------------------------------------------------
  // Materials (Single shared allocations with high-performance additive blending)
  // ---------------------------------------------------------------------------
  const materials = useMemo(() => {
    return {
      chassis: new THREE.MeshStandardMaterial({
        color: '#060b18',
        roughness: 0.18,
        metalness: 0.92,
      }),
      canopy: new THREE.MeshStandardMaterial({
        color: '#0284c7',
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.85,
      }),
      headlights: new THREE.MeshBasicMaterial({
        color: '#f8fafc',
      }),
      beams: new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        transparent: true,
        opacity: 0.10,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      taillights: new THREE.MeshBasicMaterial({
        color: '#ff0055',
      }),
      trails: new THREE.MeshBasicMaterial({
        color: '#ff0055',
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      underglow: new THREE.MeshBasicMaterial({
        color: '#00f0ff',
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    };
  }, []);

  // ---------------------------------------------------------------------------
  // High-Speed Simulation Loop (Single matrix calculation per car)
  // ---------------------------------------------------------------------------
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempTangent = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!chassisRef.current) return;

    for (let idx = 0; idx < maxVehicles; idx++) {
      const veh = vehicles[idx];
      if (!veh) continue;

      // Advance two-way traffic:
      // Right lane moves with boulevard traversal; left lane flows in opposite direction
      if (veh.isRightLane) {
        veh.progress = (veh.progress + delta * veh.speed) % 1.0;
      } else {
        veh.progress = (veh.progress - delta * veh.speed + 1.0) % 1.0;
      }

      // Sample lane position
      routeEngine.getSidePosition(
        veh.progress,
        veh.isRightLane ? 'right' : 'left',
        Math.abs(veh.laneOffset),
        0.3,
        tempPos
      );

      // Sample route curve tangent
      routeEngine.getTangent(veh.progress, tempTangent);
      const yaw = Math.atan2(tempTangent.x, tempTangent.z);

      // Facing orientation: right lane faces forward along spline; left lane faces reverse
      const directionYaw = veh.isRightLane ? yaw : yaw + Math.PI;

      dummy.position.copy(tempPos);
      dummy.rotation.set(0, directionYaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();

      // Apply shared matrix to all 7 instanced layers simultaneously
      chassisRef.current.setMatrixAt(idx, dummy.matrix);
      canopyRef.current.setMatrixAt(idx, dummy.matrix);
      headlightsRef.current.setMatrixAt(idx, dummy.matrix);
      beamsRef.current.setMatrixAt(idx, dummy.matrix);
      taillightsRef.current.setMatrixAt(idx, dummy.matrix);
      trailsRef.current.setMatrixAt(idx, dummy.matrix);
      underglowRef.current.setMatrixAt(idx, dummy.matrix);
    }

    chassisRef.current.instanceMatrix.needsUpdate = true;
    canopyRef.current.instanceMatrix.needsUpdate = true;
    headlightsRef.current.instanceMatrix.needsUpdate = true;
    beamsRef.current.instanceMatrix.needsUpdate = true;
    taillightsRef.current.instanceMatrix.needsUpdate = true;
    trailsRef.current.instanceMatrix.needsUpdate = true;
    underglowRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="traffic-system">
      {/* 1. Cyber Chassis Bodies */}
      <instancedMesh
        ref={chassisRef}
        args={[geometries.chassis, materials.chassis, maxVehicles]}
        frustumCulled={false}
      />
      {/* 2. Cockpit Canopies */}
      <instancedMesh
        ref={canopyRef}
        args={[geometries.canopy, materials.canopy, maxVehicles]}
        frustumCulled={false}
      />
      {/* 3. Glowing Front LED Headlights */}
      <instancedMesh
        ref={headlightsRef}
        args={[geometries.headlights, materials.headlights, maxVehicles]}
        frustumCulled={false}
      />
      {/* 4. Volumetric Forward Light Beams */}
      <instancedMesh
        ref={beamsRef}
        args={[geometries.beams, materials.beams, maxVehicles]}
        frustumCulled={false}
      />
      {/* 5. Cyber Rear Taillight Strips */}
      <instancedMesh
        ref={taillightsRef}
        args={[geometries.taillights, materials.taillights, maxVehicles]}
        frustumCulled={false}
      />
      {/* 6. Long-Exposure Rear Light Trails */}
      <instancedMesh
        ref={trailsRef}
        args={[geometries.trails, materials.trails, maxVehicles]}
        frustumCulled={false}
      />
      {/* 7. Neon Ground Underglow */}
      <instancedMesh
        ref={underglowRef}
        args={[geometries.underglow, materials.underglow, maxVehicles]}
        frustumCulled={false}
      />
    </group>
  );
};
