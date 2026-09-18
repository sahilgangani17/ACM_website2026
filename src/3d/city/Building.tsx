import React, { useMemo } from 'react';
import * as THREE from 'three';

interface BuildingProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  accentColor?: string;
  hasSpire?: boolean;
}

export const Building: React.FC<BuildingProps> = ({
  position,
  rotation = [0, 0, 0],
  width = 18,
  height = 50,
  depth = 18,
  color = '#081224',
  accentColor = '#00f0ff',
  hasSpire = true,
}) => {
  const buildingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.25,
        metalness: 0.85,
      }),
    [color]
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#020713',
        roughness: 0.08,
        metalness: 0.95,
      }),
    []
  );

  const emissiveMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(accentColor),
      }),
    [accentColor]
  );

  // Instanced window grid geometry on the facade
  const windowRows = Math.floor(height / 3.8);
  const windowCols = Math.floor(width / 3.4);

  const windowInstancedMesh = useMemo(() => {
    if (windowRows <= 0 || windowCols <= 0) return null;

    const count = windowRows * windowCols * 2;
    const geom = new THREE.PlaneGeometry(1.5, 1.8);
    const mesh = new THREE.InstancedMesh(geom, emissiveMaterial, count);

    const dummy = new THREE.Object3D();
    let idx = 0;

    // Front Facade
    for (let r = 0; r < windowRows; r++) {
      for (let c = 0; c < windowCols; c++) {
        const x = -width / 2 + 2 + c * 3.2;
        const y = -height / 2 + 4 + r * 3.8;
        const z = depth / 2 + 0.05;

        if ((r + c) % 3 !== 0) {
          dummy.position.set(x, y, z);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(idx++, dummy.matrix);
        }
      }
    }

    // Back Facade
    for (let r = 0; r < windowRows; r++) {
      for (let c = 0; c < windowCols; c++) {
        const x = -width / 2 + 2 + c * 3.2;
        const y = -height / 2 + 4 + r * 3.8;
        const z = -depth / 2 - 0.05;

        if ((r * 2 + c) % 4 !== 0) {
          dummy.position.set(x, y, z);
          dummy.rotation.set(0, Math.PI, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(idx++, dummy.matrix);
        }
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }, [windowRows, windowCols, width, height, depth, emissiveMaterial]);

  // Stepped tower top tier
  const hasStepTier = height > 55;

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Main Structural Tower Frame */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={buildingMaterial} attach="material" />
      </mesh>

      {/* 2. Recessed Facade Glass Layer */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width - 0.35, height - 0.35, depth - 0.35]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* 3. Stepped Upper Tier for Tall Towers */}
      {hasStepTier && (
        <mesh position={[0, height + 10, 0]} castShadow>
          <boxGeometry args={[width * 0.75, 20, depth * 0.75]} />
          <primitive object={buildingMaterial} attach="material" />
        </mesh>
      )}

      {/* 4. Vertical Corner Accent Strips */}
      {[-width / 2, width / 2].map((x, xIdx) =>
        [-depth / 2, depth / 2].map((z, zIdx) => (
          <mesh key={`${xIdx}-${zIdx}`} position={[x, height / 2, z]}>
            <boxGeometry args={[0.15, height, 0.15]} />
            <primitive object={emissiveMaterial} attach="material" />
          </mesh>
        ))
      )}

      {/* 5. Instanced Glowing Windows */}
      {windowInstancedMesh && (
        <primitive object={windowInstancedMesh} position={[0, height / 2, 0]} />
      )}

      {/* 6. Rooftop Crown & Spire */}
      {hasSpire && (
        <group position={[0, hasStepTier ? height + 20 : height, 0]}>
          <mesh position={[0, 6, 0]}>
            <cylinderGeometry args={[0.08, 0.4, 14, 8]} />
            <primitive object={emissiveMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[width * 0.6, 0.8, depth * 0.6]} />
            <primitive object={buildingMaterial} attach="material" />
          </mesh>
        </group>
      )}
    </group>
  );
};
