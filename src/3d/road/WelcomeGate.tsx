import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface WelcomeGateProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const WelcomeGate: React.FC<WelcomeGateProps> = ({
  position = [0, 0, 15],
  rotation = [0, 0, 0],
}) => {
  const pulseRef = useRef<THREE.Group>(null);
  const beaconLeftRef = useRef<THREE.Mesh>(null);
  const beaconRightRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // ----- Materials -----
  const materials = useMemo(() => {
    return {
      // Monolithic dark alloy pillars
      pillarBody: new THREE.MeshStandardMaterial({
        color: '#060e1e',
        roughness: 0.2,
        metalness: 0.92,
      }),
      // Lighter metallic truss accents
      steelAccent: new THREE.MeshStandardMaterial({
        color: '#0c1a30',
        roughness: 0.3,
        metalness: 0.85,
      }),
      // Neon cyan glow strips
      neonCyan: new THREE.MeshBasicMaterial({
        color: '#00f0ff',
      }),
      // Neon purple glow strips
      neonPurple: new THREE.MeshBasicMaterial({
        color: '#a855f7',
      }),
      // Warm white signboard glow
      signGlow: new THREE.MeshBasicMaterial({
        color: '#f0f9ff',
      }),
      // Volumetric gate ambient
      volumetricCyan: new THREE.MeshBasicMaterial({
        color: '#00e5ff',
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      // Base ground glow pool
      groundGlow: new THREE.MeshBasicMaterial({
        color: '#00f0ff',
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      // Beacon pulsing light
      beaconGlow: new THREE.MeshBasicMaterial({
        color: '#00f0ff',
        transparent: true,
        opacity: 0.9,
      }),
    };
  }, []);

  // ----- "WELCOME TO ACM CITY" Canvas Texture -----
  const mainSignTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background: deep dark with subtle gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#020816');
    grad.addColorStop(0.5, '#061228');
    grad.addColorStop(1, '#020816');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Matrix dot background pattern
    ctx.fillStyle = '#0a1832';
    for (let x = 0; x < canvas.width; x += 16) {
      for (let y = 0; y < canvas.height; y += 16) {
        ctx.fillRect(x + 6, y + 6, 2, 2);
      }
    }

    // Outer glowing border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    // Inner accent border
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // Decorative corner brackets (top-left)
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(24, 50); ctx.lineTo(24, 24); ctx.lineTo(50, 24);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 50, 24); ctx.lineTo(canvas.width - 24, 24); ctx.lineTo(canvas.width - 24, 50);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(24, canvas.height - 50); ctx.lineTo(24, canvas.height - 24); ctx.lineTo(50, canvas.height - 24);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 50, canvas.height - 24); ctx.lineTo(canvas.width - 24, canvas.height - 24); ctx.lineTo(canvas.width - 24, canvas.height - 50);
    ctx.stroke();

    // Status tag badge
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(40, 42, 120, 28);
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillStyle = '#020617';
    ctx.textAlign = 'left';
    ctx.fillText('ACM DJSCE', 48, 62);

    // Main Title: "WELCOME TO ACM CITY"
    ctx.font = 'bold 52px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    // Glow effect
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('WELCOME TO ACM CITY', canvas.width / 2, 130);

    // Reset shadow for subtitle
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#a855f7';
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillStyle = '#c084fc';
    ctx.fillText('// ENTER THE DIGITAL FRONTIER //', canvas.width / 2, 170);

    // Bottom status line
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('SYSTEM ONLINE ■ NEURAL LINK ACTIVE ■ SECURE GATEWAY', canvas.width / 2, 216);

    // Status indicator dots
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(canvas.width - 55, 56, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(canvas.width - 55, 56, 4, 0, Math.PI * 2); ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, []);

  // ----- Side pillar detail texture -----
  const pillarSignTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#030a16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vertical scan lines
    ctx.strokeStyle = '#0a1832';
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 8) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // "ACM" vertical text
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.font = 'bold 80px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('A', 0, -120);
    ctx.fillText('C', 0, -30);
    ctx.fillText('M', 0, 60);
    ctx.shadowBlur = 0;

    // Decorative line below
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-60, 100); ctx.lineTo(60, 100); ctx.stroke();

    ctx.font = '18px "Courier New", monospace';
    ctx.fillStyle = '#a855f7';
    ctx.fillText('DJSCE', 0, 135);
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, []);

  // ----- Animation: pulsing beacons and glow -----
  useFrame((_, delta) => {
    const t = performance.now() * 0.001;

    // Pulse beacons
    if (beaconLeftRef.current) {
      const scale = 1 + Math.sin(t * 3) * 0.3;
      beaconLeftRef.current.scale.setScalar(scale);
      (beaconLeftRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(t * 3) * 0.35;
    }
    if (beaconRightRef.current) {
      const scale = 1 + Math.sin(t * 3 + Math.PI) * 0.3;
      beaconRightRef.current.scale.setScalar(scale);
      (beaconRightRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(t * 3 + Math.PI) * 0.35;
    }

    // Subtle glow pulse on the overhead sign
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + Math.sin(t * 2) * 0.02;
    }
  });

  const PILLAR_X = 16; // Half-width between pillars (matching road width)
  const PILLAR_HEIGHT = 22;
  const ARCH_Y = PILLAR_HEIGHT;

  return (
    <group position={position} rotation={rotation} name="welcome-gate">
      {/* ============================================ */}
      {/* LEFT PILLAR ASSEMBLY                         */}
      {/* ============================================ */}
      <group position={[-PILLAR_X, 0, 0]}>
        {/* Foundation base */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[4, 1, 4]} />
          <primitive object={materials.pillarBody} attach="material" />
        </mesh>
        {/* Base neon trim */}
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[4.1, 0.06, 4.1]} />
          <primitive object={materials.neonCyan} attach="material" />
        </mesh>

        {/* Main pillar body */}
        <mesh position={[0, PILLAR_HEIGHT / 2 + 1, 0]}>
          <boxGeometry args={[3, PILLAR_HEIGHT, 3]} />
          <primitive object={materials.pillarBody} attach="material" />
        </mesh>

        {/* Pillar inset panel with ACM text */}
        {pillarSignTexture && (
          <mesh position={[0, PILLAR_HEIGHT / 2 + 1, 1.52]}>
            <planeGeometry args={[2.4, 10]} />
            <meshBasicMaterial map={pillarSignTexture} toneMapped={false} />
          </mesh>
        )}

        {/* Vertical neon accent strips on pillar edges */}
        {[-1.52, 1.52].map((x) => (
          <mesh key={`lv-${x}`} position={[x, PILLAR_HEIGHT / 2 + 1, 0]}>
            <boxGeometry args={[0.06, PILLAR_HEIGHT, 0.06]} />
            <primitive object={materials.neonCyan} attach="material" />
          </mesh>
        ))}

        {/* Horizontal neon accent bands */}
        {[4, 8, 12, 16, 20].map((y) => (
          <mesh key={`lh-${y}`} position={[0, y, 1.52]}>
            <boxGeometry args={[2.6, 0.06, 0.06]} />
            <primitive object={materials.neonCyan} attach="material" />
          </mesh>
        ))}

        {/* Top beacon sphere */}
        <mesh ref={beaconLeftRef} position={[0, ARCH_Y + 2.5, 0]}>
          <sphereGeometry args={[0.5, 12, 12]} />
          <primitive object={materials.beaconGlow} attach="material" />
        </mesh>

        {/* Beacon downward volumetric cone */}
        <mesh position={[0, ARCH_Y / 2 + 1, 0]}>
          <cylinderGeometry args={[0.2, 1.8, PILLAR_HEIGHT, 12, 1, true]} />
          <primitive object={materials.volumetricCyan} attach="material" />
        </mesh>

        {/* Ground glow pool */}
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3.5, 24]} />
          <primitive object={materials.groundGlow} attach="material" />
        </mesh>
      </group>

      {/* ============================================ */}
      {/* RIGHT PILLAR ASSEMBLY (mirrored)             */}
      {/* ============================================ */}
      <group position={[PILLAR_X, 0, 0]}>
        {/* Foundation base */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[4, 1, 4]} />
          <primitive object={materials.pillarBody} attach="material" />
        </mesh>
        {/* Base neon trim */}
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[4.1, 0.06, 4.1]} />
          <primitive object={materials.neonPurple} attach="material" />
        </mesh>

        {/* Main pillar body */}
        <mesh position={[0, PILLAR_HEIGHT / 2 + 1, 0]}>
          <boxGeometry args={[3, PILLAR_HEIGHT, 3]} />
          <primitive object={materials.pillarBody} attach="material" />
        </mesh>

        {/* Pillar inset panel with ACM text */}
        {pillarSignTexture && (
          <mesh position={[0, PILLAR_HEIGHT / 2 + 1, 1.52]}>
            <planeGeometry args={[2.4, 10]} />
            <meshBasicMaterial map={pillarSignTexture} toneMapped={false} />
          </mesh>
        )}

        {/* Vertical neon accent strips on pillar edges */}
        {[-1.52, 1.52].map((x) => (
          <mesh key={`rv-${x}`} position={[x, PILLAR_HEIGHT / 2 + 1, 0]}>
            <boxGeometry args={[0.06, PILLAR_HEIGHT, 0.06]} />
            <primitive object={materials.neonPurple} attach="material" />
          </mesh>
        ))}

        {/* Horizontal neon accent bands */}
        {[4, 8, 12, 16, 20].map((y) => (
          <mesh key={`rh-${y}`} position={[0, y, 1.52]}>
            <boxGeometry args={[2.6, 0.06, 0.06]} />
            <primitive object={materials.neonPurple} attach="material" />
          </mesh>
        ))}

        {/* Top beacon sphere */}
        <mesh ref={beaconRightRef} position={[0, ARCH_Y + 2.5, 0]}>
          <sphereGeometry args={[0.5, 12, 12]} />
          <primitive object={materials.beaconGlow} attach="material" />
        </mesh>

        {/* Beacon downward volumetric cone */}
        <mesh position={[0, ARCH_Y / 2 + 1, 0]}>
          <cylinderGeometry args={[0.2, 1.8, PILLAR_HEIGHT, 12, 1, true]} />
          <primitive object={materials.volumetricCyan} attach="material" />
        </mesh>

        {/* Ground glow pool */}
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3.5, 24]} />
          <primitive object={materials.groundGlow} attach="material" />
        </mesh>
      </group>

      {/* ============================================ */}
      {/* OVERHEAD ARCH / CROSSBEAM                    */}
      {/* ============================================ */}
      <group position={[0, ARCH_Y + 1, 0]}>
        {/* Main horizontal crossbeam */}
        <mesh>
          <boxGeometry args={[PILLAR_X * 2 + 3, 1.8, 2.5]} />
          <primitive object={materials.pillarBody} attach="material" />
        </mesh>

        {/* Top trim neon line */}
        <mesh position={[0, 0.92, 0]}>
          <boxGeometry args={[PILLAR_X * 2 + 3.2, 0.06, 2.6]} />
          <primitive object={materials.neonCyan} attach="material" />
        </mesh>

        {/* Bottom trim neon line */}
        <mesh position={[0, -0.92, 0]}>
          <boxGeometry args={[PILLAR_X * 2 + 3.2, 0.06, 2.6]} />
          <primitive object={materials.neonPurple} attach="material" />
        </mesh>

        {/* Front face: "WELCOME TO ACM CITY" sign */}
        {mainSignTexture && (
          <mesh position={[0, 0, 1.27]}>
            <planeGeometry args={[PILLAR_X * 2 - 3, 4.5]} />
            <meshBasicMaterial map={mainSignTexture} toneMapped={false} />
          </mesh>
        )}

        {/* Back face sign (same text, for departing view) */}
        {mainSignTexture && (
          <mesh position={[0, 0, -1.27]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[PILLAR_X * 2 - 3, 4.5]} />
            <meshBasicMaterial map={mainSignTexture} toneMapped={false} />
          </mesh>
        )}

        {/* Overhead volumetric glow */}
        <mesh ref={glowRef} position={[0, -4, 0]}>
          <boxGeometry args={[PILLAR_X * 2 - 2, 8, 6]} />
          <primitive object={materials.volumetricCyan} attach="material" />
        </mesh>
      </group>

      {/* ============================================ */}
      {/* SECONDARY UPPER ARCH FRAME                   */}
      {/* ============================================ */}
      <group position={[0, ARCH_Y + 3.5, 0]}>
        {/* Thinner secondary truss */}
        <mesh>
          <boxGeometry args={[PILLAR_X * 2 + 1, 0.8, 1.5]} />
          <primitive object={materials.steelAccent} attach="material" />
        </mesh>

        {/* Decorative antenna spires */}
        {[-8, 0, 8].map((x) => (
          <mesh key={`spire-${x}`} position={[x, 1.5, 0]}>
            <cylinderGeometry args={[0.04, 0.12, 3, 6]} />
            <primitive object={materials.steelAccent} attach="material" />
          </mesh>
        ))}

        {/* Spire tip lights */}
        {[-8, 0, 8].map((x) => (
          <mesh key={`tip-${x}`} position={[x, 3.1, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <primitive object={materials.neonCyan} attach="material" />
          </mesh>
        ))}
      </group>

      {/* ============================================ */}
      {/* GROUND-LEVEL NEON THRESHOLD LINE             */}
      {/* ============================================ */}
      {/* Cyan line across the road at the gate */}
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[PILLAR_X * 2, 0.3]} />
        <primitive object={materials.neonCyan} attach="material" />
      </mesh>

      {/* Second accent line slightly behind */}
      <mesh position={[0, 0.13, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[PILLAR_X * 2, 0.15]} />
        <primitive object={materials.neonPurple} attach="material" />
      </mesh>
    </group>
  );
};
