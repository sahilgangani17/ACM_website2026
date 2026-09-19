import React, { useMemo } from 'react';
import * as THREE from 'three';

interface HighwayGantryProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  signText?: string;
  subText?: string;
  statusTag?: string;
}

export const HighwayGantry: React.FC<HighwayGantryProps> = ({
  position,
  rotation = [0, 0, 0],
  signText = 'DJSCE ACM BOULEVARD // SYSTEM OPTIMAL',
  subText = 'AUTOMATED TRANSIT CORRIDOR // LANE 01-02 ACTIVE',
  statusTag = 'DISTRICT 01',
}) => {
  // Shared materials for gantry
  const materials = useMemo(() => {
    return {
      steelTruss: new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.35,
        metalness: 0.85,
      }),
      darkAlloy: new THREE.MeshStandardMaterial({
        color: '#050a14',
        roughness: 0.2,
        metalness: 0.9,
      }),
      neonCyan: new THREE.MeshBasicMaterial({
        color: '#00f0ff',
      }),
      neonPurple: new THREE.MeshBasicMaterial({
        color: '#a855f7',
      }),
      lampGlow: new THREE.MeshBasicMaterial({
        color: '#f0f9ff',
      }),
      volumetricLight: new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    };
  }, []);

  // Procedural Digital Matrix Canvas Texture
  const matrixTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Dark cyber backing
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Matrix dot grid background
    ctx.fillStyle = '#061328';
    for (let x = 0; x < canvas.width; x += 12) {
      for (let y = 0; y < canvas.height; y += 12) {
        ctx.fillRect(x + 4, y + 4, 2, 2);
      }
    }

    // Outer cyber border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    // Tag badge on left
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(24, 20, 140, 32);
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillStyle = '#020617';
    ctx.fillText(statusTag, 32, 43);

    // Main traffic advisory text
    ctx.font = 'bold 36px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(signText, 185, 48);

    // Subtitle text
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(subText, 28, 96);

    // Right status indicator
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(canvas.width - 45, 64, 14, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, [signText, subText, statusTag]);

  return (
    <group position={position} rotation={rotation} name="highway-gantry">
      {/* 1. Heavy Foundation Base Pedestals on Sidewalks */}
      {[-17.5, 17.5].map((x) => (
        <group key={`base-${x}`} position={[x, 0.4, 0]}>
          <mesh>
            <boxGeometry args={[2.4, 0.8, 2.8]} />
            <primitive object={materials.darkAlloy} attach="material" />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[2.5, 0.1, 2.9]} />
            <primitive object={x < 0 ? materials.neonCyan : materials.neonPurple} attach="material" />
          </mesh>
        </group>
      ))}

      {/* 2. Vertical Steel Lattice Tower Columns */}
      {[-17.5, 17.5].map((x) => (
        <group key={`tower-${x}`} position={[x, 7.5, 0]}>
          {/* Main 4 corner tubes */}
          {[-0.8, 0.8].map((cx) =>
            [-0.8, 0.8].map((cz) => (
              <mesh key={`tube-${cx}-${cz}`} position={[cx, 0, cz]}>
                <cylinderGeometry args={[0.12, 0.14, 14, 8]} />
                <primitive object={materials.steelTruss} attach="material" />
              </mesh>
            ))
          )}
          {/* Horizontal cross-ties */}
          {[-5, -2, 1, 4, 6.5].map((y) => (
            <mesh key={`tie-${y}`} position={[0, y, 0]}>
              <boxGeometry args={[1.7, 0.12, 1.7]} />
              <primitive object={materials.steelTruss} attach="material" />
            </mesh>
          ))}
          {/* Vertical neon accent line */}
          <mesh position={[x < 0 ? 0.9 : -0.9, 0, 0]}>
            <boxGeometry args={[0.08, 13.8, 0.08]} />
            <primitive object={x < 0 ? materials.neonCyan : materials.neonPurple} attach="material" />
          </mesh>
        </group>
      ))}

      {/* 3. Overhead Horizontal Space-Frame Truss */}
      <group position={[0, 14.5, 0]}>
        {/* Top and Bottom longitudinal truss chords */}
        {[-0.8, 0.8].map((y) =>
          [-0.7, 0.7].map((z) => (
            <mesh key={`chord-${y}-${z}`} position={[0, y, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.12, 36.5, 8]} />
              <primitive object={materials.steelTruss} attach="material" />
            </mesh>
          ))
        )}
        {/* Truss internal web braces */}
        {[-14, -10, -6, -2, 2, 6, 10, 14].map((x) => (
          <group key={`web-${x}`} position={[x, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.15, 1.6, 1.4]} />
              <primitive object={materials.steelTruss} attach="material" />
            </mesh>
            {/* Diagonal cross struts */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <cylinderGeometry args={[0.06, 0.06, 2.2, 6]} />
              <primitive object={materials.steelTruss} attach="material" />
            </mesh>
          </group>
        ))}
        {/* Lower Neon Under-Strip */}
        <mesh position={[0, -0.92, 0]}>
          <boxGeometry args={[35.5, 0.08, 0.1]} />
          <primitive object={materials.neonCyan} attach="material" />
        </mesh>
      </group>

      {/* 4. Giant Digital Matrix Signboard (Facing oncoming boulevard traffic) */}
      <group position={[0, 14.5, 0.95]}>
        {/* Signboard Backing Frame */}
        <mesh>
          <boxGeometry args={[26.5, 3.4, 0.4]} />
          <primitive object={materials.darkAlloy} attach="material" />
        </mesh>
        {/* Digital Matrix Display Screen */}
        {matrixTexture && (
          <mesh position={[0, 0, 0.22]}>
            <planeGeometry args={[26.0, 3.1]} />
            <meshBasicMaterial map={matrixTexture} toneMapped={false} />
          </mesh>
        )}
        {/* Ambient Display Glow Border */}
        <mesh position={[0, 1.72, 0.22]}>
          <boxGeometry args={[26.2, 0.06, 0.06]} />
          <primitive object={materials.neonCyan} attach="material" />
        </mesh>
        <mesh position={[0, -1.72, 0.22]}>
          <boxGeometry args={[26.2, 0.06, 0.06]} />
          <primitive object={materials.neonCyan} attach="material" />
        </mesh>
      </group>

      {/* 5. Overhead Streetlamps & Downward Volumetric Light Pools */}
      {[-9.5, -3.2, 3.2, 9.5].map((lx) => (
        <group key={`lamp-${lx}`} position={[lx, 13.5, 0]}>
          {/* Lamp housing fixture */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 0.35, 1.6]} />
            <primitive object={materials.darkAlloy} attach="material" />
          </mesh>
          {/* Luminous downward emitter lens */}
          <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.0, 1.4]} />
            <primitive object={materials.lampGlow} attach="material" />
          </mesh>
          {/* Downward Volumetric Light Cone projecting onto asphalt */}
          <mesh position={[0, -6.6, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.3, 2.4, 13.0, 12, 1, true]} />
            <primitive object={materials.volumetricLight} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
