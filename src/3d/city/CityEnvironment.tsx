import React from 'react';

export const CityEnvironment: React.FC = () => {
  return (
    <group name="city-environment">
      {/* Blue-Hour Atmospheric Night Fog - gentle falloff so building silhouettes remain crisp */}
      <fogExp2 attach="fog" args={['#040a18', 0.0018]} />

      {/* Balanced Ambient City Lighting - ensures building facades and geometry are clearly visible */}
      <ambientLight color="#334155" intensity={1.35} />

      {/* Primary Key Light (Atmospheric Moonlight / High Angle) */}
      <directionalLight
        position={[60, 120, 50]}
        color="#7dd3fc"
        intensity={1.5}
      />

      {/* Boulevard Ground Uplight / City Bounce Light */}
      <directionalLight
        position={[0, -30, 0]}
        color="#0284c7"
        intensity={0.85}
      />

      {/* Violet / Magenta Horizon Fill Light */}
      <directionalLight
        position={[-80, 80, -100]}
        color="#c084fc"
        intensity={0.65}
      />

      {/* Deep Ground Horizon Infinite Base */}
      <mesh position={[0, -0.2, -400]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1400, 1800]} />
        <meshStandardMaterial color="#040814" roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  );
};
