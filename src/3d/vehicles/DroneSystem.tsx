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
        // Keep drones up high and to the sides so they don't block building views
        baseX: (i % 2 === 0 ? 1 : -1) * (25 + (i * 12) % 35),
        baseY: 35 + (i * 7) % 25,
        baseZ: -80 - i * 65,
        radius: 12 + (i % 5) * 3,
        speed: 0.6 + (i % 4) * 0.2,
        color: i % 2 === 0 ? '#00f0ff' : '#a855f7',
      });
    }
    return list;
  }, [maxDrones]);

  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3, metalness: 0.8 }),
    []
  );
  const ledCyanMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#00f0ff' }), []);
  const ledRedMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ff0055' }), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    groupRef.current.children.forEach((child, idx) => {
      const d = drones[idx];
      if (!d) return;

      const angle = t * d.speed;
      child.position.x = d.baseX + Math.cos(angle) * d.radius;
      child.position.y = d.baseY + Math.sin(angle * 1.8) * 2;
      child.position.z = d.baseZ + Math.sin(angle) * d.radius;
      child.rotation.y = -angle;
      child.rotation.z = Math.sin(angle) * 0.15; // Bank into turn
    });
  });

  return (
    <group ref={groupRef} name="drone-system">
      {drones.map((d) => (
        <group key={d.id} position={[d.baseX, d.baseY, d.baseZ]}>
          {/* Sleek Aerodynamic Drone Fuselage */}
          <mesh castShadow>
            <boxGeometry args={[1.6, 0.35, 1.2]} />
            <primitive object={bodyMat} attach="material" />
          </mesh>

          {/* 4 Rotor Arms */}
          {[-0.9, 0.9].map((x) =>
            [-0.7, 0.7].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, 0.1, z]}>
                <cylinderGeometry args={[0.06, 0.06, 0.4, 6]} />
                <primitive object={bodyMat} attach="material" />
              </mesh>
            ))
          )}

          {/* 4 Rotor Discs (Thin glowing discs) */}
          {[-0.9, 0.9].map((x) =>
            [-0.7, 0.7].map((z) => (
              <mesh key={`prop-${x}-${z}`} position={[x, 0.28, z]}>
                <cylinderGeometry args={[0.45, 0.45, 0.02, 12]} />
                <primitive object={ledCyanMat} attach="material" />
              </mesh>
            ))
          )}

          {/* Nav Warning Beacon LED (Port / Starboard) */}
          <mesh position={[-0.8, 0, 0]}>
            <sphereGeometry args={[0.12, 6, 6]} />
            <primitive object={ledRedMat} attach="material" />
          </mesh>
          <mesh position={[0.8, 0, 0]}>
            <sphereGeometry args={[0.12, 6, 6]} />
            <primitive object={ledCyanMat} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
