import React from 'react';

export const CityEnvironment: React.FC = () => {
  return (
    <group name="city-environment">
      {/* Deep Blue-Hour Atmospheric Night Fog */}
      <fogExp2 attach="fog" args={['#030814', 0.0032]} />

      {/* Balanced Ambient City Lighting */}
      <ambientLight color="#162032" intensity={0.65} />

      {/* Primary Key Light (Atmospheric Moonlight / Distant Megastructure) */}
      <directionalLight
        position={[50, 90, 30]}
        color="#38bdf8"
        intensity={1.1}
        castShadow
      />

      {/* Subtle Violet Accent Fill Light */}
      <directionalLight position={[-50, 70, -90]} color="#a855f7" intensity={0.4} />

      {/* Deep Ground Horizon Infinite Base */}
      <mesh position={[0, -0.2, -400]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1400, 1800]} />
        <meshStandardMaterial color="#02040a" roughness={0.95} metalness={0.05} />
      </mesh>
    </group>
  );
};
