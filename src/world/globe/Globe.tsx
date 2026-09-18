import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GlobeNetwork } from './GlobeNetwork';
import { GlobePin } from './GlobePin';
import { latLongToVector3 } from './coords';
import { GlobeAtmosphere } from './GlobeAtmosphere';
import { useWorldStore } from '../state/useWorldStore';

interface GlobeProps {
  radius?: number;
  opacity?: number;
}

// Major continent anchor centers with fine digital dot clusters
const CONTINENT_CENTERS = [
  { lat: 21.0, lon: 78.5, count: 260, spread: 15 }, // India / South Asia
  { lat: 34.0, lon: 105.0, count: 350, spread: 26 }, // East Asia
  { lat: 52.0, lon: 16.0, count: 320, spread: 22 }, // Europe
  { lat: 38.0, lon: -97.0, count: 380, spread: 30 }, // North America
  { lat: -12.0, lon: -54.0, count: 280, spread: 25 }, // South America
  { lat: 1.0, lon: 20.0, count: 300, spread: 26 }, // Africa
  { lat: -24.0, lon: 135.0, count: 180, spread: 18 }, // Australia
  { lat: 60.0, lon: 100.0, count: 260, spread: 35 }, // Northern Asia
];

export const Globe: React.FC<GlobeProps> = ({ radius = 15, opacity = 1.0 }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const worldMode = useWorldStore((s) => s.worldMode);
  const worldProgress = useWorldStore((s) => s.worldProgress);

  // Continent digital dot matrix
  const [dotPositions, dotColors] = useMemo(() => {
    const totalDots = CONTINENT_CENTERS.reduce((acc, c) => acc + c.count, 0);
    const pos = new Float32Array(totalDots * 3);
    const col = new Float32Array(totalDots * 3);

    const cyan = new THREE.Color('#00f0ff');
    const blue = new THREE.Color('#38bdf8');
    const white = new THREE.Color('#f1f5f9');
    const colors = [cyan, blue, white];

    let dotIdx = 0;
    CONTINENT_CENTERS.forEach((center) => {
      for (let i = 0; i < center.count; i++) {
        const lat = center.lat + (Math.random() - 0.5) * center.spread;
        const lon = center.lon + (Math.random() - 0.5) * center.spread * 1.4;

        const p = latLongToVector3(lat, lon, radius + 0.06);

        pos[dotIdx * 3] = p.x;
        pos[dotIdx * 3 + 1] = p.y;
        pos[dotIdx * 3 + 2] = p.z;

        const c = colors[i % colors.length];
        col[dotIdx * 3] = c.r;
        col[dotIdx * 3 + 1] = c.g;
        col[dotIdx * 3 + 2] = c.b;

        dotIdx++;
      }
    });

    return [pos, col];
  }, [radius]);

  // Fine procedural latitude and longitude grid lines
  const gridRings = useMemo(() => {
    const rings: Array<{ geom: THREE.BufferGeometry; opacity: number }> = [];
    
    // Latitudes (-60 to +60 in 20 deg steps)
    for (let lat = -60; lat <= 60; lat += 20) {
      const phi = (90 - lat) * (Math.PI / 180);
      const ringRadius = radius * Math.sin(phi);
      const ringY = radius * Math.cos(phi);

      const points = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(ringRadius * Math.cos(theta), ringY, ringRadius * Math.sin(theta)));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      rings.push({
        geom,
        opacity: lat === 0 ? 0.45 : 0.22, // Equator subtly brighter
      });
    }

    return rings;
  }, [radius]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (worldMode === 'WORLD_INTRO') {
      groupRef.current.rotation.y += delta * 0.08;
    } else if (worldProgress < 0.60) {
      const targetRotationY = -1.2 + worldProgress * 0.5;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, delta * 3.5);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -0.2, delta * 3.5);
    }
  });

  return (
    <group ref={groupRef} name="acm-digital-globe">
      {/* 1. Dark Obsidian Earth Base Sphere */}
      <mesh receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          color="#020612"
          roughness={0.25}
          metalness={0.9}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* 2. Thin Technical Latitude Grid Lines */}
      {gridRings.map((ring, idx) => (
        // @ts-ignore
        <line key={idx} geometry={ring.geom}>
          <lineBasicMaterial color="#334155" transparent opacity={ring.opacity * opacity} />
        </line>
      ))}

      {/* 3. Refined Continent Digital Dot Matrix */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dotPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dotColors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.32} vertexColors transparent opacity={0.85 * opacity} />
      </points>

      {/* 4. Global Computing Network Arcs */}
      <GlobeNetwork radius={radius} opacity={opacity} />

      {/* 5. Mumbai / DJ Sanghvi Chapter Pin */}
      <GlobePin radius={radius} opacity={opacity} />

      {/* 6. Multi-layer Atmosphere & Starfield */}
      <GlobeAtmosphere radius={radius} opacity={opacity} />
    </group>
  );
};
