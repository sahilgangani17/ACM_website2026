import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// ---------------------------------------------------------------------------
// 1. Procedural High-Tech Cyber Grid Floor Texture
// ---------------------------------------------------------------------------
function createCyberGridTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Dark cyber navy background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, size, size);

    // Major grid lines
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(0, 0, size, size);

    // Minor grid lines
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.25)';
    ctx.lineWidth = 1;
    const step = size / 8;
    for (let i = 1; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(i * step, 0);
      ctx.lineTo(i * step, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * step);
      ctx.lineTo(size, i * step);
      ctx.stroke();
    }

    // High-tech corner bracket accents & circuit crosshairs
    ctx.fillStyle = '#38bdf8';
    const corners = [
      [8, 8],
      [size - 8, 8],
      [8, size - 8],
      [size - 8, size - 8],
      [size / 2, size / 2],
    ];
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(40, 50);
  return texture;
}

// ---------------------------------------------------------------------------
// 2. Volumetric Sky Searchlights / Beacons
// ---------------------------------------------------------------------------
const SkySearchlights: React.FC = () => {
  const beamsGroupRef = useRef<THREE.Group>(null!);

  const beamConfigs = useMemo(() => [
    { x: -75, z: -150, color: '#00f0ff', height: 260, baseRadius: 1.2, topRadius: 18, speed: 0.4, phase: 0 },
    { x: 80, z: -280, color: '#a855f7', height: 280, baseRadius: 1.4, topRadius: 22, speed: 0.35, phase: 1.8 },
    { x: -90, z: -420, color: '#38bdf8', height: 300, baseRadius: 1.5, topRadius: 24, speed: 0.5, phase: 3.2 },
    { x: 85, z: -560, color: '#00f0ff', height: 310, baseRadius: 1.6, topRadius: 26, speed: 0.38, phase: 4.5 },
    { x: -65, z: -680, color: '#c084fc', height: 320, baseRadius: 1.5, topRadius: 25, speed: 0.42, phase: 5.7 },
    { x: 0, z: -850, color: '#00f0ff', height: 360, baseRadius: 2.0, topRadius: 32, speed: 0.25, phase: 2.1 },
    { x: -140, z: -350, color: '#3b82f6', height: 280, baseRadius: 1.3, topRadius: 20, speed: 0.45, phase: 0.9 },
    { x: 130, z: -480, color: '#ec4899', height: 290, baseRadius: 1.4, topRadius: 22, speed: 0.32, phase: 3.8 },
  ], []);

  // Shared beam geometry & materials
  const beamMaterials = useMemo(() => {
    return beamConfigs.map((cfg) => new THREE.MeshBasicMaterial({
      color: new THREE.Color(cfg.color),
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
  }, [beamConfigs]);

  useFrame(({ clock }) => {
    if (!beamsGroupRef.current) return;
    const time = clock.getElapsedTime();

    beamsGroupRef.current.children.forEach((child, i) => {
      const cfg = beamConfigs[i];
      if (!cfg) return;
      // Gentle cinematic swaying motion into the night sky
      child.rotation.x = Math.sin(time * cfg.speed + cfg.phase) * 0.12;
      child.rotation.z = Math.cos(time * cfg.speed * 0.8 + cfg.phase) * 0.14;
    });
  });

  return (
    <group ref={beamsGroupRef} name="volumetric-sky-searchlights">
      {beamConfigs.map((cfg, i) => {
        return (
          <group key={i} position={[cfg.x, 30, cfg.z]}>
            <mesh position={[0, cfg.height / 2, 0]}>
              <cylinderGeometry
                args={[cfg.topRadius, cfg.baseRadius, cfg.height, 16, 1, true]}
              />
              <primitive object={beamMaterials[i]} attach="material" />
            </mesh>
            {/* Bright focal emitter beacon bulb at the base */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[1.6, 12, 12]} />
              <meshBasicMaterial color={cfg.color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------------------
// 3. Celestial Cyber Starfield & Constellation Dome
// ---------------------------------------------------------------------------
const CyberStarfield: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const starCount = 600;
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);

    const cyan = new THREE.Color('#38bdf8');
    const blue = new THREE.Color('#818cf8');
    const purple = new THREE.Color('#c084fc');
    const white = new THREE.Color('#f8fafc');
    const starColors = [cyan, blue, purple, white];

    for (let i = 0; i < starCount; i++) {
      // Hemisphere distribution above the city
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.85 + 0.15); // Above horizon
      const radius = 550 + Math.random() * 200;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.max(50, radius * Math.cos(phi));
      pos[i * 3 + 2] = -450 + radius * Math.sin(phi) * Math.sin(theta);

      const c = starColors[i % starColors.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    // Ultra subtle celestial rotation
    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.003;
  });

  return (
    <points ref={pointsRef} name="cyber-starfield">
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={1.8}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// ---------------------------------------------------------------------------
// 4. Distant Megacity Skyline Silhouette Backdrop
// ---------------------------------------------------------------------------
const DistantSkyline: React.FC = () => {
  const towers = useMemo(() => {
    const list = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const isLeft = i % 2 === 0;
      const x = (isLeft ? -1 : 1) * (140 + (i * 19) % 180);
      const z = -720 - (i * 17) % 320;
      const width = 28 + (i * 7) % 24;
      const height = 140 + (i * 31) % 180;
      const depth = 28 + (i * 11) % 20;
      const beaconColor = i % 3 === 0 ? '#ff0055' : i % 2 === 0 ? '#00f0ff' : '#a855f7';

      list.push({ id: i, x, z, width, height, depth, beaconColor });
    }
    return list;
  }, []);

  const darkTowerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#030816',
    roughness: 0.6,
    metalness: 0.8,
  }), []);

  const cyanRibbonMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00f0ff',
  }), []);

  const purpleRibbonMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#a855f7',
  }), []);

  return (
    <group name="distant-megacity-skyline">
      {towers.map((t, idx) => (
        <group key={t.id} position={[t.x, 0, t.z]}>
          {/* Main Monolith Shaft */}
          <mesh position={[0, t.height / 2, 0]}>
            <boxGeometry args={[t.width, t.height, t.depth]} />
            <primitive object={darkTowerMaterial} attach="material" />
          </mesh>

          {/* Roof Spire Antenna */}
          <mesh position={[0, t.height + 15, 0]}>
            <cylinderGeometry args={[0.2, 0.8, 30, 6]} />
            <primitive object={darkTowerMaterial} attach="material" />
          </mesh>

          {/* Flashing Warning Beacon at Spire Tip */}
          <mesh position={[0, t.height + 30, 0]}>
            <sphereGeometry args={[1.2, 8, 8]} />
            <meshBasicMaterial color={t.beaconColor} />
          </mesh>

          {/* Glowing Vertical Light Ribbons on Monolith Facades */}
          <mesh position={[0, t.height * 0.6, t.depth / 2 + 0.1]}>
            <planeGeometry args={[0.8, t.height * 0.7]} />
            <primitive object={idx % 2 === 0 ? cyanRibbonMaterial : purpleRibbonMaterial} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// Main City Environment
// ---------------------------------------------------------------------------
export const CityEnvironment: React.FC = () => {
  const gridTexture = useMemo(() => createCyberGridTexture(), []);

  return (
    <group name="city-environment">
      {/* Blue-Hour Atmospheric Night Fog - gentle falloff so building silhouettes remain crisp */}
      <fogExp2 attach="fog" args={['#040a18', 0.0016]} />

      {/* Balanced Ambient City Lighting - ensures building facades and geometry are clearly visible */}
      <ambientLight color="#334155" intensity={1.35} />

      {/* Primary Key Light (Atmospheric Moonlight / High Angle) */}
      <directionalLight
        position={[60, 120, 50]}
        color="#7dd3fc"
        intensity={1.5}
      />

      {/* Boulevard Ground Uplight / City Bounce Light */}
      <directionalLight
        position={[0, -30, 0]}
        color="#0284c7"
        intensity={0.85}
      />

      {/* Violet / Magenta Horizon Fill Light */}
      <directionalLight
        position={[-80, 80, -100]}
        color="#c084fc"
        intensity={0.65}
      />

      {/* Luminous Cyber Circuit Ground Matrix Base */}
      <mesh position={[0, -0.2, -400]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1400, 1800]} />
        <meshStandardMaterial
          map={gridTexture}
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Volumetric Sky Searchlights / Beacons */}
      <SkySearchlights />

      {/* Celestial Cyber Starfield & Constellations */}
      <CyberStarfield />

      {/* Distant Megacity Silhouette Backdrop */}
      <DistantSkyline />
    </group>
  );
};
