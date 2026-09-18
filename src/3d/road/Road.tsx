import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RoadSegment } from './RoadSegment';
import { Intersection } from './Intersection';
import { CameraRouteEngine } from '../../data/cityRoute';

export const Road: React.FC = () => {
  const routeEngine = useMemo(() => new CameraRouteEngine(), []);

  // Generate road segments aligned precisely along the boulevard route spline
  const segments = useMemo(() => {
    const items: Array<{
      id: string;
      position: [number, number, number];
      rotation: [number, number, number];
      isIntersection: boolean;
    }> = [];

    const numSamples = 20;
    for (let i = 0; i <= numSamples; i++) {
      const t = i / numSamples;
      const pos = routeEngine.getPosition(t, new THREE.Vector3());
      const tangent = routeEngine.getTangent(t, new THREE.Vector3());

      // Calculate yaw angle from tangent vector
      const yaw = Math.atan2(tangent.x, tangent.z);

      // Place an intersection every 6th segment
      const isIntersection = i > 0 && i < numSamples && i % 5 === 0;

      items.push({
        id: `road-seg-${i}`,
        position: [pos.x, 0, pos.z],
        rotation: [0, yaw, 0],
        isIntersection,
      });
    }

    return items;
  }, [routeEngine]);

  return (
    <group name="road-spine">
      {segments.map((seg) => (
        <React.Fragment key={seg.id}>
          {seg.isIntersection ? (
            <Intersection position={seg.position} rotation={seg.rotation} />
          ) : (
            <RoadSegment
              position={seg.position}
              rotation={seg.rotation}
              length={55}
              width={26}
              hasLights={true}
            />
          )}
        </React.Fragment>
      ))}
    </group>
  );
};
