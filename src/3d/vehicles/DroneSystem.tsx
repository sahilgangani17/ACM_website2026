import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../state/useCityStore';
import { QUALITY_PRESETS } from '../../utils/quality';

export const DroneSystem: React.FC = () => {
  const qualityTier = useCityStore((s) => s.qualityTier);
  const maxDrones = QUALITY_PRESETS[qualityTier].maxDrones;

  const groupRef = useRef<THREE.Group>(null!);

  // Navigation light materials for dynamic strobe pulsing
  const cyanLightRef = useRef<THREE.MeshBasicMaterial>(null!);
  const purpleLightRef = useRef<THREE.MeshBasicMaterial>(null!);
  const scannerCyanRef = useRef<THREE.MeshBasicMaterial>(null!);
  const scannerPurpleRef = useRef<THREE.MeshBasicMaterial>(null!);

  // ---------------------------------------------------------------------------
  // Generate 3-Tier Patrol Flight Specifications
  // ---------------------------------------------------------------------------
  const drones = useMemo(() => {
    const list = [];
    for (let i = 0; i < maxDrones; i++) {
      const isCyan = i % 2 === 0;
      // 3 altitude tiers: low-level boulevard, mid-level district, high-level sky
      const tier = i % 3;
      let baseY = 18;
      let radiusX = 14 + (i % 4) * 3;
      let radiusZ = 20 + (i % 3) * 6;

      if (tier === 0) {
        // Low-level boulevard patrol (weaving between lower facades)
        baseY = 16 + (i % 3) * 4;
        radiusX = 16 + (i % 3) * 4;
        radiusZ = 22 + (i % 2) * 8;
      } else if (tier === 1) {
        // Mid-altitude district sweepers
        baseY = 38 + (i % 4) * 5;
        radiusX = 26 + (i % 4) * 5;
        radiusZ = 30 + (i % 3) * 10;
      } else {
        // High-altitude skyscraper surveillance monitors
        baseY = 68 + (i % 3) * 7;
        radiusX = 35 + (i % 3) * 8;
        radiusZ = 45 + (i % 2) * 12;
      }

      // Lateral placement along the boulevard length (z: -50 down to -750)
      const side = (i % 2 === 0 ? 1 : -1);
      const baseX = side * (24 + (i * 11) % 32);
      const baseZ = -60 - (i * 45) % 700;

      list.push({
        id: i,
        baseX,
        baseY,
        baseZ,
        radiusX,
        radiusZ,
        speed: 0.45 + (i % 5) * 0.12,
        phase: (i * Math.PI) / 4,
        isCyan,
      });
    }
    return list;
  }, [maxDrones]);

  // ---------------------------------------------------------------------------
  // Shared Pooled Drone Materials (Zero duplicate shader compiles)
  // ---------------------------------------------------------------------------
  const materials = useMemo(() => {
    return {
      hull: new THREE.MeshStandardMaterial({
        color: '#070d18',
        roughness: 0.2,
        metalness: 0.95,
        flatShading: true,
      }),
      strut: new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.4,
        metalness: 0.85,
      }),
      thruster: new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        side: THREE.DoubleSide,
      }),
      scannerCyan: new THREE.MeshBasicMaterial({
        color: '#00f0ff',
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      scannerPurple: new THREE.MeshBasicMaterial({
        color: '#c084fc',
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      navCyan: new THREE.MeshBasicMaterial({
        color: '#00f0ff',
      }),
      navPurple: new THREE.MeshBasicMaterial({
        color: '#c084fc',
      }),
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Parametric Patrol Flight Simulation & Strobe Pulsing
  // ---------------------------------------------------------------------------
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Pulse navigation beacon intensity smoothly
    const cyanPulse = 0.5 + 0.5 * Math.sin(t * 5.0);
    const purplePulse = 0.5 + 0.5 * Math.cos(t * 5.0);

    if (cyanLightRef.current) {
      cyanLightRef.current.opacity = 0.4 + 0.6 * cyanPulse;
    }
    if (purpleLightRef.current) {
      purpleLightRef.current.opacity = 0.4 + 0.6 * purplePulse;
    }

    // Pulse scanner cone opacities gently
    if (scannerCyanRef.current) {
      scannerCyanRef.current.opacity = 0.05 + 0.05 * cyanPulse;
    }
    if (scannerPurpleRef.current) {
      scannerPurpleRef.current.opacity = 0.05 + 0.05 * purplePulse;
    }

    // Update 3D patrol flight paths
    groupRef.current.children.forEach((child, idx) => {
      const d = drones[idx];
      if (!d) return;

      const angle = t * d.speed + d.phase;
      // Elliptical Lissajous patrol path
      const targetX = d.baseX + Math.cos(angle) * d.radiusX;
      const targetZ = d.baseZ + Math.sin(angle * 1.15) * d.radiusZ;
      const targetY = d.baseY + Math.sin(angle * 2.2) * 2.5;

      // Calculate velocity vector for realistic banking
      const vx = -Math.sin(angle) * d.radiusX * d.speed;
      const vz = Math.cos(angle * 1.15) * d.radiusZ * 1.15 * d.speed;
      const headingYaw = Math.atan2(vx, vz);

      child.position.set(targetX, targetY, targetZ);
      child.rotation.y = headingYaw;
      // Bank into turns (roll) and slight forward pitch
      child.rotation.z = Math.sin(angle) * 0.24;
      child.rotation.x = Math.cos(angle * 1.15) * 0.08;
    });
  });

  return (
    <group ref={groupRef} name="drone-system">
      {drones.map((d) => (
        <group key={d.id} position={[d.baseX, d.baseY, d.baseZ]}>
          {/* 1. Central Faceted Octahedral Stealth Core */}
          <mesh>
            <octahedronGeometry args={[1.2, 0]} />
            <primitive object={materials.hull} attach="material" />
          </mesh>

          {/* 2. Equatorial Kinetic Sensor Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.4, 0.06, 8, 24]} />
            <primitive
              object={d.isCyan ? materials.navCyan : materials.navPurple}
              attach="material"
            />
          </mesh>

          {/* 3. Lateral Geometric Stabilizer Pylons */}
          <mesh position={[-1.3, 0, 0]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[1.2, 0.08, 0.35]} />
            <primitive object={materials.strut} attach="material" />
          </mesh>
          <mesh position={[1.3, 0, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[1.2, 0.08, 0.35]} />
            <primitive object={materials.strut} attach="material" />
          </mesh>

          {/* 4. Pulsing Wingtip Navigation Strobes (Cyan on port, Purple on starboard) */}
          <mesh position={[-2.0, 0.12, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <primitive
              ref={d.isCyan ? cyanLightRef : purpleLightRef}
              object={d.isCyan ? materials.navCyan : materials.navPurple}
              attach="material"
            />
          </mesh>
          <mesh position={[2.0, 0.12, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <primitive
              ref={d.isCyan ? purpleLightRef : cyanLightRef}
              object={d.isCyan ? materials.navPurple : materials.navCyan}
              attach="material"
            />
          </mesh>

          {/* 5. Downward Volumetric Searchlight Scanner Cone */}
          <mesh position={[0, -12, 0]} rotation={[Math.PI, 0, 0]}>
            <cylinderGeometry args={[0.08, 3.8, 24, 16, 1, true]} />
            <primitive
              ref={d.isCyan ? scannerCyanRef : scannerPurpleRef}
              object={d.isCyan ? materials.scannerCyan : materials.scannerPurple}
              attach="material"
            />
          </mesh>

          {/* 6. Ventral Ion Propulsion Thruster Disk */}
          <mesh position={[0, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 0.5, 16]} />
            <primitive object={materials.thruster} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
