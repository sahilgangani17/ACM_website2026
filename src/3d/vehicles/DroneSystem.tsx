import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../state/useCityStore';
import { QUALITY_PRESETS } from '../../utils/quality';

export const DroneSystem: React.FC = () => {
  const qualityTier = useCityStore((s) => s.qualityTier);
  const maxDrones = QUALITY_PRESETS[qualityTier].maxDrones;

  const groupRef = useRef<THREE.Group>(null!);

  const drones = useMemo(() => {
    const list = [];
    for (let i = 0; i < maxDrones; i++) {
      list.push({
        id: i,
        baseX: (Math.random() - 0.5) * 120,
        baseY: 25 + Math.random() * 20,
        baseZ: -50 - i * 60,
        radius: 10 + Math.random() * 15,
        speed: 0.5 + Math.random() * 0.8,
        color: i % 2 === 0 ? '#00f0ff' : '#a855f7',
      });
    }
    return list;
  }, [maxDrones]);

  const droneGeom = useMemo(() => new THREE.OctahedronGeometry(1.2, 0), []);
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#00f0ff' }), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    groupRef.current.children.forEach((child, idx) => {
      const d = drones[idx];
      if (!d) return;

      const angle = t * d.speed;
      child.position.x = d.baseX + Math.cos(angle) * d.radius;
      child.position.y = d.baseY + Math.sin(angle * 1.5) * 3;
      child.position.z = d.baseZ + Math.sin(angle) * d.radius;
    });
  });

  return (
    <group ref={groupRef} name="drone-system">
      {drones.map((d) => (
        <group key={d.id} position={[d.baseX, d.baseY, d.baseZ]}>
          <mesh geometry={droneGeom}>
            <primitive object={glowMat} attach="material" />
          </mesh>
          {/* Subtle Downward Searchlight Cone */}
          <mesh position={[0, -4, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[2.5, 8, 16, 1, true]} />
            <meshBasicMaterial
              color={d.color}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
