import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../state/useWorldStore';

export const GlobeToCityTransition: React.FC = () => {
  const isWarping = useWorldStore((s) => s.isWarping);
  const warpDirection = useWorldStore((s) => s.warpDirection);

  const linesMeshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const elapsedRef = useRef(0);

  // Procedural hyperspace velocity streak lines for cinematic atmospheric entry
  const STREAK_COUNT = 160;
  const streaks = useMemo(() => {
    const list = [];
    for (let i = 0; i < STREAK_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 6 + Math.random() * 32;
      list.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius + 10,
        z: Math.random() * -180,
        speed: 180 + Math.random() * 220,
        length: 12 + Math.random() * 24,
      });
    }
    return list;
  }, []);

  const streakMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#00f0ff',
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!linesMeshRef.current || !isWarping) {
      elapsedRef.current = 0;
      return;
    }

    elapsedRef.current = Math.min(1.25, elapsedRef.current + delta);
    const progress = elapsedRef.current / 1.25;

    // Smooth sinusoidal intensity curve that peaks in the middle of descent
    const intensity = Math.sin(progress * Math.PI);
    streakMaterial.opacity = intensity * 0.92;

    streaks.forEach((st, idx) => {
      const dirFactor = warpDirection === 'TO_CITY' ? 1 : -1;
      st.z += st.speed * delta * dirFactor;

      // Wrap around seamlessly
      if (st.z > 60) st.z = -180;
      if (st.z < -180) st.z = 60;

      dummy.position.set(st.x, st.y, st.z);
      dummy.scale.set(0.12, 0.12, st.length * (0.6 + intensity * 1.4));
      dummy.updateMatrix();

      linesMeshRef.current.setMatrixAt(idx, dummy.matrix);
    });

    linesMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!isWarping) return null;

  return (
    <group name="warp-transition-effects">
      {/* Instanced High-Speed Hyperspace Velocity Streaks */}
      <instancedMesh
        ref={linesMeshRef}
        args={[undefined, undefined, STREAK_COUNT]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={streakMaterial} attach="material" />
      </instancedMesh>
    </group>
  );
};
