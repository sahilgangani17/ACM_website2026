import React, { useMemo } from 'react';
import * as THREE from 'three';

interface SkybridgeProps {
  startPos: [number, number, number];
  endPos: [number, number, number];
  themeColor?: string;
}

export const Skybridge: React.FC<SkybridgeProps> = ({
  startPos,
  endPos,
  themeColor = '#00f0ff',
}) => {
  const p1 = useMemo(() => new THREE.Vector3(...startPos), [startPos]);
  const p2 = useMemo(() => new THREE.Vector3(...endPos), [endPos]);

  const length = useMemo(() => p1.distanceTo(p2), [p1, p2]);
  const midPoint = useMemo(() => p1.clone().add(p2).multiplyScalar(0.5), [p1, p2]);

  // Compute rotation to align along the vector from p1 to p2
  const orientation = useMemo(() => {
    const dir = p2.clone().sub(p1).normalize();
    const yaw = Math.atan2(dir.x, dir.z);
    const pitch = -Math.asin(dir.y);
    return [pitch, yaw, 0] as [number, number, number];
  }, [p1, p2]);

  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#060d1b', roughness: 0.2, metalness: 0.85 }),
    []
  );
  const glassMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#030814',
        roughness: 0.05,
        metalness: 0.95,
        transparent: true,
        opacity: 0.75,
      }),
    []
  );
  const neonMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color(themeColor) }),
    [themeColor]
  );

  return (
    <group position={[midPoint.x, midPoint.y, midPoint.z]} rotation={orientation}>
      {/* Structural floor and ceiling slabs */}
      <mesh position={[0, -1.8, 0]}>
        <boxGeometry args={[4.2, 0.4, length]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[4.2, 0.4, length]} />
        <primitive object={frameMat} attach="material" />
      </mesh>

      {/* Glass Enclosure Walls */}
      <mesh position={[-2.0, 0, 0]}>
        <boxGeometry args={[0.2, 3.4, length]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      <mesh position={[2.0, 0, 0]}>
        <boxGeometry args={[0.2, 3.4, length]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Exterior Neon Accent Rails */}
      <mesh position={[-2.1, -1.8, 0]}>
        <boxGeometry args={[0.12, 0.12, length]} />
        <primitive object={neonMat} attach="material" />
      </mesh>
      <mesh position={[2.1, -1.8, 0]}>
        <boxGeometry args={[0.12, 0.12, length]} />
        <primitive object={neonMat} attach="material" />
      </mesh>
      <mesh position={[-2.1, 1.8, 0]}>
        <boxGeometry args={[0.12, 0.12, length]} />
        <primitive object={neonMat} attach="material" />
      </mesh>
      <mesh position={[2.1, 1.8, 0]}>
        <boxGeometry args={[0.12, 0.12, length]} />
        <primitive object={neonMat} attach="material" />
      </mesh>

      {/* Interior Ambient Walkway Light */}
      <pointLight position={[0, 0, 0]} color={themeColor} intensity={2} distance={15} />
    </group>
  );
};
