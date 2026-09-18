import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ROUTE_WAYPOINTS, CameraRouteEngine } from '../../data/cityRoute';
import { useCityStore } from '../../state/useCityStore';

export const DebugCameraVisualizer: React.FC = () => {
  const debugMode = useCityStore((s) => s.debugMode);
  const destinations = useCityStore((s) => s.destinations);

  const routeEngine = useMemo(() => new CameraRouteEngine(), []);

  // Generate 3D line points for the route spline
  const linePoints = useMemo(() => {
    return routeEngine.positionCurve.getPoints(100);
  }, [routeEngine]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(linePoints);
  }, [linePoints]);

  if (!debugMode) return null;

  return (
    <group name="debug-visualizer">
      {/* 1. Main Boulevard Camera Route Line */}
      {/* @ts-ignore */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial color="#00f0ff" linewidth={3} />
      </line>

      {/* 2. Waypoint Spheres */}
      {ROUTE_WAYPOINTS.map((wp, idx) => (
        <group key={idx} position={wp.position}>
          <mesh>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial color="#3b82f6" wireframe />
          </mesh>
        </group>
      ))}

      {/* 3. Destination World Position & Hitbox Debug Markers */}
      {destinations.map((dest) => {
        const destPos = routeEngine.getSidePosition(
          dest.routeProgress,
          dest.side,
          dest.lateralOffset,
          dest.verticalOffset || 0,
          new THREE.Vector3()
        );

        return (
          <group key={dest.id} position={destPos}>
            {/* Base position sphere */}
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[1.5, 12, 12]} />
              <meshBasicMaterial color={dest.primaryColor} wireframe />
            </mesh>
            {/* Axis bounding indicator */}
            <gridHelper args={[20, 10, dest.primaryColor, '#334155']} />
          </group>
        );
      })}
    </group>
  );
};
