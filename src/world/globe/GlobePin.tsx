import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useWorldStore } from '../state/useWorldStore';
import { latLongToVector3 } from './coords';

interface GlobePinProps {
  radius?: number;
  opacity?: number;
}

export const GlobePin: React.FC<GlobePinProps> = ({ radius = 15, opacity = 1.0 }) => {
  const worldMode = useWorldStore((s) => s.worldMode);
  const worldProgress = useWorldStore((s) => s.worldProgress);

  const ringRef = useRef<THREE.Mesh>(null!);

  // Mumbai Coordinates: 19.0760° N, 72.8777° E
  const mumbaiPos = useMemo(() => latLongToVector3(19.076, 72.8777, radius), [radius]);
  const normal = useMemo(() => mumbaiPos.clone().normalize(), [mumbaiPos]);

  // Orientation quaternion so pin aligns outwards with sphere normal
  const pinQuaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    return q;
  }, [normal]);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const t = (clock.getElapsedTime() * 1.5) % 1;
    ringRef.current.scale.set(1 + t * 1.8, 1 + t * 1.8, 1 + t * 1.8);
    // @ts-ignore
    ringRef.current.material.opacity = (1 - t) * 0.7 * opacity;
  });

  const isFocal = worldProgress >= 0.25;

  return (
    <group position={mumbaiPos}>
      {/* 1. Glowing Beacon Structure */}
      <group quaternion={pinQuaternion}>
        {/* Core Vertical Light Beam */}
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.04, 0.12, 2.0, 8]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.85 * opacity} />
        </mesh>

        {/* Static Base Ring */}
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.4, 24]} />
          <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} transparent opacity={0.8 * opacity} />
        </mesh>

        {/* Expanding Pulse Radar Ring */}
        <mesh ref={ringRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.42, 24]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.6 * opacity} />
        </mesh>

        {/* Top Beacon Spherical Glow */}
        <mesh position={[0, 2.1, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.95 * opacity} />
        </mesh>
      </group>

      {/* 2. Spatial HTML Label Badge */}
      {worldMode !== 'CITY_EXPLORATION' && opacity > 0.3 && (
        <Html
          position={[normal.x * 3.0, normal.y * 3.0, normal.z * 3.0]}
          center
          distanceFactor={36}
          zIndexRange={[100, 0]}
        >
          <div
            className={`pointer-events-none transition-all duration-500 transform ${
              isFocal ? 'scale-100 opacity-100' : 'scale-90 opacity-75'
            }`}
            style={{ opacity }}
          >
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/90 border border-cyan-400/50 backdrop-blur-md shadow-glow-cyan flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-extrabold text-[11px] text-white tracking-wider uppercase">
                    MUMBAI NODE
                  </span>
                  <span className="text-[8px] font-mono px-1 py-0.2 bg-cyan-950/80 text-cyan-300 rounded border border-cyan-500/40">
                    DJ SANGHVI ACM
                  </span>
                </div>
                <span className="text-[8px] font-mono text-cyan-400/70 tracking-wider">
                  19.0760° N, 72.8777° E
                </span>
              </div>
            </div>
            <div className="w-0.5 h-3 mx-auto bg-gradient-to-b from-cyan-400 to-transparent" />
          </div>
        </Html>
      )}
    </group>
  );
};
