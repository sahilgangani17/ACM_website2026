import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { latLongToVector3 } from './coords';

interface NodeDef {
  id: string;
  name: string;
  lat: number;
  lon: number;
  priority?: number;
}

const GLOBAL_NODES: NodeDef[] = [
  { id: 'sf', name: 'SAN FRANCISCO', lat: 37.7749, lon: -122.4194, priority: 1 },
  { id: 'london', name: 'LONDON', lat: 51.5074, lon: -0.1278, priority: 1 },
  { id: 'tokyo', name: 'TOKYO', lat: 35.6762, lon: 139.6503, priority: 1 },
  { id: 'singapore', name: 'SINGAPORE', lat: 1.3521, lon: 103.8198, priority: 0.8 },
  { id: 'zurich', name: 'ZURICH', lat: 47.3769, lon: 8.5417, priority: 0.8 },
  { id: 'sydney', name: 'SYDNEY', lat: -33.8688, lon: 151.2093, priority: 0.7 },
];

const MUMBAI_NODE: NodeDef = {
  id: 'mumbai',
  name: 'MUMBAI',
  lat: 19.076,
  lon: 72.8777,
};

// Generates an elevated 3D CatmullRom arc over the globe between two points
function createGreatCircleArc(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  pointsCount = 50
): THREE.Vector3[] {
  const middle = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const distance = start.distanceTo(end);

  const elevation = radius + distance * 0.20;
  middle.normalize().multiplyScalar(elevation);

  const curve = new THREE.CatmullRomCurve3([start, middle, end], false, 'centripetal');
  return curve.getPoints(pointsCount);
}

interface GlobeNetworkProps {
  radius?: number;
  opacity?: number;
}

export const GlobeNetwork: React.FC<GlobeNetworkProps> = ({
  radius = 15,
  opacity = 1.0,
}) => {
  const mumbaiPos = useMemo(() => latLongToVector3(MUMBAI_NODE.lat, MUMBAI_NODE.lon, radius), [radius]);

  // Generate 3D arc geometries from each global node to Mumbai
  const { arcs, nodePositions } = useMemo(() => {
    const arcList: Array<{ id: string; geometry: THREE.BufferGeometry; curvePoints: THREE.Vector3[]; opacity: number }> = [];
    const positions: Array<{ id: string; pos: THREE.Vector3; name: string }> = [];

    GLOBAL_NODES.forEach((node) => {
      const pos = latLongToVector3(node.lat, node.lon, radius);
      positions.push({ id: node.id, pos, name: node.name });

      const curvePoints = createGreatCircleArc(pos, mumbaiPos, radius, 40);
      const geom = new THREE.BufferGeometry().setFromPoints(curvePoints);
      arcList.push({
        id: `${node.id}-mumbai`,
        geometry: geom,
        curvePoints,
        opacity: (node.priority || 0.8) * 0.65,
      });
    });

    return { arcs: arcList, nodePositions: positions };
  }, [radius, mumbaiPos]);

  // Sparse data packets flowing along arcs
  const packetMeshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!packetMeshRef.current) return;
    const t = clock.getElapsedTime() * 0.28;

    arcs.forEach((arc, idx) => {
      const progress = (t + idx * 0.22) % 1.0;
      const pointIndex = Math.floor(progress * (arc.curvePoints.length - 1));
      const currentPoint = arc.curvePoints[pointIndex] || arc.curvePoints[0];

      dummy.position.copy(currentPoint);
      dummy.scale.set(0.22, 0.22, 0.22);
      dummy.updateMatrix();

      packetMeshRef.current.setMatrixAt(idx, dummy.matrix);
    });

    packetMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="globe-network">
      {/* 1. Global Node Markers */}
      {nodePositions.map((n) => (
        <group key={n.id} position={n.pos}>
          <mesh>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.9 * opacity} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.2, 0.28, 16]} />
            <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} transparent opacity={0.45 * opacity} />
          </mesh>
        </group>
      ))}

      {/* 2. Cybernetic Arcs connecting to Mumbai */}
      {arcs.map((arc) => (
        // @ts-ignore
        <line key={arc.id} geometry={arc.geometry}>
          <lineBasicMaterial
            color="#06b6d4"
            transparent
            opacity={arc.opacity * opacity}
            linewidth={1}
          />
        </line>
      ))}

      {/* 3. Small Pulsing Data Packets */}
      <instancedMesh
        ref={packetMeshRef}
        args={[undefined, undefined, arcs.length]}
      >
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.9 * opacity} />
      </instancedMesh>
    </group>
  );
};
