import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../state/useWorldStore';

export const GlobeToCityTransition: React.FC = () => {
  const isWarping = useWorldStore((s) => s.isWarping);
  const warpProgress = useWorldStore((s) => s.warpProgress);
  const warpDirection = useWorldStore((s) => s.warpDirection);

  const linesMeshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Procedural speed streak lines for 1-second hyper-descent
  const STREAK_COUNT = 120;
  const streaks = useMemo(() => {
    const list = [];
    for (let i = 0; i < STREAK_COUNT; i++) {
      list.push({
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 40 + 15,
        z: Math.random() * -120,
        speed: 150 + Math.random() * 150,
        length: 8 + Math.random() * 14,
      });
    }
    return list;
  }, []);

  const streakMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#00f0ff',
        transparent: true,
        opacity: 0.8,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!linesMeshRef.current || !isWarping) return;

    // Intensity curve: peaks in middle of 1s warp (progress 0.2 to 0.8)
    const intensity = Math.sin(warpProgress * Math.PI);
    streakMaterial.opacity = intensity * 0.85;

    streaks.forEach((st, idx) => {
      const dirFactor = warpDirection === 'TO_CITY' ? 1 : -1;
      st.z += st.speed * delta * dirFactor;

      // Wrap around
      if (st.z > 60) st.z = -120;
      if (st.z < -120) st.z = 60;

      dummy.position.set(st.x, st.y, st.z);
      dummy.scale.set(0.08, 0.08, st.length * intensity);
      dummy.updateMatrix();

      linesMeshRef.current.setMatrixAt(idx, dummy.matrix);
    });

    linesMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!isWarping) return null;

  return (
    <group name="warp-transition-effects">
      {/* 1. Instanced High-Speed Warp Streaks */}
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
