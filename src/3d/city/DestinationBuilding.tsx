import React, { useMemo, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { DestinationData } from '../../data/destinations';
import { useCityStore } from '../../state/useCityStore';
import { useWorldStore } from '../../world/state/useWorldStore';

interface DestinationBuildingProps {
  destination: DestinationData;
  position: [number, number, number];
  rotation?: [number, number, number];
}

// ---------------------------------------------------------------------------
// 1. Shared Building Materials (High Performance & Premium Obsidian Glass)
// ---------------------------------------------------------------------------
const SHARED_DEST_MATERIALS = {
  // Deep obsidian reflective architectural glass (NO diffuse emissive glow)
  obsidianGlass: new THREE.MeshStandardMaterial({
    color: '#060d1b',
    roughness: 0.12,
    metalness: 0.92,
  }),
  // Dark carbon-titanium structural framework
  darkTitanium: new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.38,
    metalness: 0.82,
  }),
  // Warm golden amber interior office lights (gives life to occupied office suites)
  warmOfficeLight: new THREE.MeshBasicMaterial({
    color: '#fde047',
  }),
  // Crisp cool cyan interior lab lights
  cyanOfficeLight: new THREE.MeshBasicMaterial({
    color: '#67e8f9',
  }),
  // Soft pale blue ambient window glow
  softWindowLight: new THREE.MeshBasicMaterial({
    color: '#bae6fd',
  }),
  // Red aviation warning beacon
  beaconRed: new THREE.MeshBasicMaterial({
    color: '#ff0055',
  }),
};

// ---------------------------------------------------------------------------
// 2. Interactive Entrance Monument Sign Board
// ---------------------------------------------------------------------------
interface EntranceSignBoardProps {
  destination: DestinationData;
  side: 'left' | 'right';
  onClick: () => void;
  hovered: boolean;
}

const EntranceSignBoard: React.FC<EntranceSignBoardProps> = ({
  destination,
  side,
  onClick,
  hovered,
}) => {
  const worldMode = useWorldStore((s) => s.worldMode);
  const isCityActive = worldMode === 'CITY_EXPLORATION';

  const isLeft = side === 'left';
  const posX = isLeft ? 11.5 : -11.5;
  const posZ = 16.5;
  const rotY = isLeft ? -Math.PI / 10 : Math.PI / 10;

  const stepTagNumber = destination.id.replace('destination-', '');
  const mainColor = destination.primaryColor;

  return (
    <group position={[posX, 0, posZ]} rotation={[0, rotY, 0]}>
      {/* Heavy alloy plinth base */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[7.5, 0.8, 2.4]} />
        <meshStandardMaterial color="#060c18" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Neon base accent strip */}
      <mesh position={[0, 0.85, 1.22]}>
        <boxGeometry args={[7.2, 0.1, 0.08]} />
        <meshBasicMaterial color={mainColor} />
      </mesh>

      {/* Vertical twin support pillars */}
      <mesh position={[-3.2, 3.2, 0]}>
        <boxGeometry args={[0.5, 5.0, 0.5]} />
        <meshStandardMaterial color="#081426" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[3.2, 3.2, 0]}>
        <boxGeometry args={[0.5, 5.0, 0.5]} />
        <meshStandardMaterial color="#081426" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Main glass monument sign body */}
      <mesh position={[0, 3.6, 0.15]}>
        <boxGeometry args={[6.4, 3.8, 0.35]} />
        <meshStandardMaterial
          color="#030814"
          roughness={0.1}
          metalness={0.95}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Outer illuminated neon border frame */}
      <mesh position={[0, 5.55, 0.2]}>
        <boxGeometry args={[6.6, 0.12, 0.12]} />
        <meshBasicMaterial color={mainColor} />
      </mesh>
      <mesh position={[0, 1.65, 0.2]}>
        <boxGeometry args={[6.6, 0.12, 0.12]} />
        <meshBasicMaterial color={mainColor} />
      </mesh>
      <mesh position={[-3.3, 3.6, 0.2]}>
        <boxGeometry args={[0.12, 3.9, 0.12]} />
        <meshBasicMaterial color={mainColor} />
      </mesh>
      <mesh position={[3.3, 3.6, 0.2]}>
        <boxGeometry args={[0.12, 3.9, 0.12]} />
        <meshBasicMaterial color={mainColor} />
      </mesh>

      {/* Ground spotlight illuminating the sign */}
      <pointLight position={[0, 1.2, 1.8]} color={mainColor} intensity={3} distance={12} />

      {/* Fast Spatial HTML Monument Signboard (Only rendered in Digital City to prevent globe bleeding) */}
      {isCityActive && (
        <Html
          position={[0, 3.6, 0.4]}
          center
          distanceFactor={42}
          transform
          occlude={false}
          zIndexRange={[50, 0]}
        >
          <div
            onClick={onClick}
            className={`cursor-pointer w-[280px] p-4 rounded-xl border transition-all duration-200 select-none shadow-2xl ${
              hovered
                ? 'bg-slate-950/95 border-cyan-400 scale-105'
                : 'bg-slate-950/90 border-slate-700/80 hover:border-cyan-500'
            }`}
            style={{
              borderColor: hovered ? mainColor : undefined,
              boxShadow: hovered ? `0 0 20px ${mainColor}40` : undefined,
            }}
          >
            {/* Top header badge with district index */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest text-slate-400">
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                  style={{
                    backgroundColor: `${mainColor}30`,
                    color: mainColor,
                  }}
                >
                  0{stepTagNumber}
                </span>
                <span className="text-slate-300">DJSCE ACM</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: mainColor }}
                />
                <span className="font-mono text-[8px] text-cyan-300 tracking-wider font-bold uppercase">
                  {destination.category}
                </span>
              </div>
            </div>

            {/* Large Destination Name */}
            <h3
              className="font-heading font-black text-xl tracking-wider uppercase text-white mb-0.5"
              style={{ color: hovered ? mainColor : '#ffffff' }}
            >
              {destination.title}
            </h3>

            {/* Subtitle */}
            <div className="font-mono text-[9px] text-cyan-300/90 tracking-widest uppercase mb-2">
              {destination.subtitle}
            </div>

            {/* Bottom Action Hint */}
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
              <span className="text-slate-500">PORTAL ACCESS</span>
              <span
                className="font-bold flex items-center gap-1"
                style={{ color: mainColor }}
              >
                CLICK TO ENTER →
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// ---------------------------------------------------------------------------
// 3. Typology A: Tri-Blade Corporate Sovereign Spire (ABOUT US)
// ---------------------------------------------------------------------------
const TowerArchitecture: React.FC<{
  frameMat: THREE.Material;
  glassMat: THREE.Material;
  mainEmissive: THREE.Material;
  accentEmissive: THREE.Material;
}> = ({ frameMat, glassMat, mainEmissive, accentEmissive }) => {
  return (
    <group>
      {/* Central Hexagonal Tower Core in Deep Obsidian Glass */}
      <mesh position={[0, 36, 0]}>
        <cylinderGeometry args={[12, 14, 72, 6]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* 6 Structural Titanium Corner Columns on Central Spine */}
      {[0, 1, 2, 3, 4, 5].map((corner) => {
        const angle = (corner * Math.PI) / 3;
        const r = 13.2;
        return (
          <mesh
            key={corner}
            position={[Math.cos(angle) * r, 36, Math.sin(angle) * r]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[0.6, 72, 0.6]} />
            <primitive object={frameMat} attach="material" />
          </mesh>
        );
      })}

      {/* Horizontal Titanium Floor Spandrel Rings & Glowing Neon Edge Ribbons */}
      {[12, 18, 24, 30, 36, 42, 48, 54, 60, 66].map((y, idx) => (
        <group key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[13.3, 13.3, 0.65, 6]} />
          <primitive object={frameMat} attach="material" />
          {/* Glowing Floor Edge Ribbon on Front Face */}
          <mesh position={[0, 0, 11.6]}>
            <boxGeometry args={[11.5, 0.22, 0.2]} />
            <primitive object={idx % 2 === 0 ? mainEmissive : accentEmissive} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Realistic Occupied Office Window Arrays on Central Spine */}
      {[15, 21, 27, 33, 39, 45, 51, 57, 63].map((y, idx) => (
        <group key={`spine-win-${y}`} position={[0, y, 11.6]}>
          {/* Subdivided 3 window bays per floor with warm and cyan office lights */}
          <mesh position={[-3.6, 0, 0]}>
            <boxGeometry args={[2.8, 2.6, 0.05]} />
            <primitive object={idx % 2 === 0 ? SHARED_DEST_MATERIALS.cyanOfficeLight : SHARED_DEST_MATERIALS.warmOfficeLight} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.8, 2.6, 0.05]} />
            <primitive object={idx % 3 === 0 ? SHARED_DEST_MATERIALS.warmOfficeLight : SHARED_DEST_MATERIALS.softWindowLight} attach="material" />
          </mesh>
          <mesh position={[3.6, 0, 0]}>
            <boxGeometry args={[2.8, 2.6, 0.05]} />
            <primitive object={idx % 2 === 1 ? SHARED_DEST_MATERIALS.cyanOfficeLight : SHARED_DEST_MATERIALS.warmOfficeLight} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Left Aerodynamic Blade Wing Tower */}
      <mesh position={[-16, 30, 2]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[9, 60, 20]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Left Blade Floor Spandrel Slabs */}
      {[14, 24, 34, 44, 54].map((y) => (
        <mesh key={`lblade-spand-${y}`} position={[-16, y, 2]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[9.4, 0.8, 20.4]} />
          <primitive object={frameMat} attach="material" />
        </mesh>
      ))}
      {/* Left Blade Window Bays */}
      {[19, 29, 39, 49].map((y, idx) => (
        <mesh key={`lblade-win-${y}`} position={[-16, y, 12.1]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[6.8, 2.8, 0.05]} />
          <primitive object={idx % 2 === 0 ? SHARED_DEST_MATERIALS.cyanOfficeLight : SHARED_DEST_MATERIALS.warmOfficeLight} attach="material" />
        </mesh>
      ))}
      {/* Left Blade Neon Leading Edge Fin */}
      <mesh position={[-20.6, 30, 2]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.35, 60.5, 0.5]} />
        <primitive object={mainEmissive} attach="material" />
      </mesh>

      {/* Right Aerodynamic Blade Wing Tower */}
      <mesh position={[16, 30, 2]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[9, 60, 20]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Right Blade Floor Spandrel Slabs */}
      {[14, 24, 34, 44, 54].map((y) => (
        <mesh key={`rblade-spand-${y}`} position={[16, y, 2]} rotation={[0, 0, -0.08]}>
          <boxGeometry args={[9.4, 0.8, 20.4]} />
          <primitive object={frameMat} attach="material" />
        </mesh>
      ))}
      {/* Right Blade Window Bays */}
      {[19, 29, 39, 49].map((y, idx) => (
        <mesh key={`rblade-win-${y}`} position={[16, y, 12.1]} rotation={[0, 0, -0.08]}>
          <boxGeometry args={[6.8, 2.8, 0.05]} />
          <primitive object={idx % 2 === 1 ? SHARED_DEST_MATERIALS.cyanOfficeLight : SHARED_DEST_MATERIALS.warmOfficeLight} attach="material" />
        </mesh>
      ))}
      {/* Right Blade Neon Leading Edge Fin */}
      <mesh position={[20.6, 30, 2]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.35, 60.5, 0.5]} />
        <primitive object={mainEmissive} attach="material" />
      </mesh>

      {/* High-Altitude Skybridge Observation Deck (Altitude 48) */}
      <mesh position={[0, 48, 3]}>
        <boxGeometry args={[32, 6.5, 14]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      <mesh position={[0, 48, 10.2]}>
        <boxGeometry args={[28, 4.2, 0.1]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      <mesh position={[0, 51.4, 10.3]}>
        <boxGeometry args={[28, 0.2, 0.1]} />
        <primitive object={accentEmissive} attach="material" />
      </mesh>
      <mesh position={[0, 46.2, 10.3]}>
        <boxGeometry args={[28, 0.15, 0.1]} />
        <primitive object={mainEmissive} attach="material" />
      </mesh>

      {/* Triple Rooftop Spire Array */}
      <mesh position={[0, 78, 0]}>
        <cylinderGeometry args={[0.2, 1.0, 22, 6]} />
        <primitive object={accentEmissive} attach="material" />
      </mesh>
      <mesh position={[-10, 68, 2]}>
        <cylinderGeometry args={[0.15, 0.6, 16, 6]} />
        <primitive object={mainEmissive} attach="material" />
      </mesh>
      <mesh position={[10, 68, 2]}>
        <cylinderGeometry args={[0.15, 0.6, 16, 6]} />
        <primitive object={mainEmissive} attach="material" />
      </mesh>

      {/* Red Warning Aviation Hazard Lights */}
      <mesh position={[0, 89.5, 0]}>
        <sphereGeometry args={[0.45, 8, 8]} />
        <primitive object={SHARED_DEST_MATERIALS.beaconRed} attach="material" />
      </mesh>
      <mesh position={[-10, 76.5, 2]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <primitive object={SHARED_DEST_MATERIALS.beaconRed} attach="material" />
      </mesh>
      <mesh position={[10, 76.5, 2]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <primitive object={SHARED_DEST_MATERIALS.beaconRed} attach="material" />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 4. Typology B: Cantilevered Innovation Pavilion & Sky Terrace (TEAM)
// ---------------------------------------------------------------------------
const LabArchitecture: React.FC<{
  frameMat: THREE.Material;
  glassMat: THREE.Material;
  mainEmissive: THREE.Material;
  accentEmissive: THREE.Material;
}> = ({ frameMat, glassMat, mainEmissive, accentEmissive }) => {
  return (
    <group>
      {/* Tier 1: Ground Exhibition Rotunda (Floors 1-3) */}
      <mesh position={[-2, 8, 0]}>
        <cylinderGeometry args={[14, 16, 16, 20]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Rotunda Titanium Frame Slabs */}
      <mesh position={[-2, 8, 0]}>
        <cylinderGeometry args={[14.3, 16.3, 0.8, 20]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      <mesh position={[-2, 15.6, 0]}>
        <cylinderGeometry args={[14.4, 14.4, 0.8, 20]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      <mesh position={[-2, 15.8, 14.1]}>
        <boxGeometry args={[14, 0.25, 0.1]} />
        <primitive object={mainEmissive} attach="material" />
      </mesh>

      {/* Tier 2: Dramatic Cantilevered Tech Floor (Obsidian glass body, NOT flat purple!) */}
      <mesh position={[6, 25, 3]}>
        <boxGeometry args={[28, 16, 24]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Titanium Floor Dividing Spandrels on Cantilever */}
      <mesh position={[6, 17.2, 3]}>
        <boxGeometry args={[28.4, 0.8, 24.4]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      <mesh position={[6, 25, 3]}>
        <boxGeometry args={[28.4, 0.8, 24.4]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      <mesh position={[6, 32.8, 3]}>
        <boxGeometry args={[28.4, 0.8, 24.4]} />
        <primitive object={frameMat} attach="material" />
      </mesh>

      {/* Diagonal Structural Space-Frame Truss Columns Holding Overhang */}
      <mesh position={[18, 12.5, 13]} rotation={[0, 0, -Math.PI / 7]}>
        <cylinderGeometry args={[0.7, 0.7, 25, 8]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      <mesh position={[18, 12.5, -5]} rotation={[0, 0, -Math.PI / 7]}>
        <cylinderGeometry args={[0.7, 0.7, 25, 8]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      {/* Neon Cross-Brace Highlight */}
      <mesh position={[18, 12.5, 4]} rotation={[Math.PI / 6, 0, -Math.PI / 7]}>
        <cylinderGeometry args={[0.3, 0.3, 21, 8]} />
        <primitive object={mainEmissive} attach="material" />
      </mesh>

      {/* Realistic Horizontal Multi-Window Bays on Cantilever Facade */}
      {/* Floor 4 Window Array */}
      {[-6, 0, 6, 12, 18].map((x, i) => (
        <mesh key={`cant-w4-${x}`} position={[x, 21, 15.05]}>
          <boxGeometry args={[4.4, 2.6, 0.05]} />
          <primitive object={i % 2 === 0 ? mainEmissive : SHARED_DEST_MATERIALS.warmOfficeLight} attach="material" />
        </mesh>
      ))}
      {/* Floor 5 Window Array */}
      {[-6, 0, 6, 12, 18].map((x, i) => (
        <mesh key={`cant-w5-${x}`} position={[x, 29, 15.05]}>
          <boxGeometry args={[4.4, 2.6, 0.05]} />
          <primitive object={i % 2 === 1 ? accentEmissive : SHARED_DEST_MATERIALS.cyanOfficeLight} attach="material" />
        </mesh>
      ))}

      {/* Open Sky-Terrace Lounge Deck atop Cantilever */}
      <mesh position={[6, 33.3, 3]}>
        <boxGeometry args={[26, 0.4, 22]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      {/* Glowing Purple Glass Balustrade */}
      <mesh position={[6, 34.3, 14.1]}>
        <boxGeometry args={[26, 1.5, 0.15]} />
        <primitive object={mainEmissive} attach="material" />
      </mesh>
      <mesh position={[19.1, 34.3, 3]}>
        <boxGeometry args={[0.15, 1.5, 22]} />
        <primitive object={mainEmissive} attach="material" />
      </mesh>

      {/* Tier 3: Upper Penthouse Tower (Floors 7-11) */}
      <mesh position={[-4, 42, -2]}>
        <boxGeometry args={[18, 18, 18]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      <mesh position={[-4, 42, 7.05]}>
        <boxGeometry args={[14, 3.2, 0.05]} />
        <primitive object={accentEmissive} attach="material" />
      </mesh>
      <mesh position={[-4, 51, -2]}>
        <boxGeometry args={[18.4, 0.8, 18.4]} />
        <primitive object={frameMat} attach="material" />
      </mesh>

      {/* Rooftop Pergola Canopy & Communications Mast */}
      <mesh position={[-4, 52.5, -2]}>
        <boxGeometry args={[12, 1.4, 12]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      <mesh position={[-4, 58, -2]}>
        <cylinderGeometry args={[0.15, 0.5, 11, 6]} />
        <primitive object={mainEmissive} attach="material" />
      </mesh>
      <mesh position={[-4, 64, -2]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <primitive object={SHARED_DEST_MATERIALS.beaconRed} attach="material" />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 5. Typology C: Quantum Crystalline Megatower & Gyro Core (RESEARCH)
// ---------------------------------------------------------------------------
const NexusArchitecture: React.FC<{
  frameMat: THREE.Material;
  glassMat: THREE.Material;
  mainEmissive: THREE.Material;
  accentEmissive: THREE.Material;
}> = ({ frameMat, glassMat, mainEmissive, accentEmissive }) => {
  const gyroRingRef1 = useRef<THREE.Group>(null!);
  const gyroRingRef2 = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (gyroRingRef1.current) gyroRingRef1.current.rotation.y += delta * 1.4;
    if (gyroRingRef2.current) gyroRingRef2.current.rotation.x += delta * 1.8;
    if (coreRef.current) coreRef.current.rotation.y += delta * 1.0;
  });

  return (
    <group>
      {/* Central Hexagonal Crystalline Tower Body in Obsidian Glass */}
      <mesh position={[0, 30, 0]}>
        <cylinderGeometry args={[14, 18, 60, 6]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Horizontal Laboratory Floor Spandrels */}
      {[10, 20, 30, 40, 50, 58].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[16.2, 16.2, 0.7, 6]} />
          <primitive object={frameMat} attach="material" />
        </mesh>
      ))}

      {/* Illuminated Laboratory Window Bays */}
      {[14, 34, 44, 54].map((y, idx) => (
        <group key={`nexus-w-${y}`} position={[0, y, 14.2]}>
          <mesh position={[-5, 0, 0]}>
            <boxGeometry args={[4.2, 2.6, 0.05]} />
            <primitive object={idx % 2 === 0 ? mainEmissive : SHARED_DEST_MATERIALS.cyanOfficeLight} attach="material" />
          </mesh>
          <mesh position={[5, 0, 0]}>
            <boxGeometry args={[4.2, 2.6, 0.05]} />
            <primitive object={idx % 2 === 1 ? accentEmissive : SHARED_DEST_MATERIALS.warmOfficeLight} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Recessed Central Quantum Chamber Atrium */}
      <mesh position={[0, 25, 8.5]}>
        <boxGeometry args={[16, 18, 5.5]} />
        <primitive object={frameMat} attach="material" />
      </mesh>

      {/* Floating Animated Quantum Energy Core */}
      <group position={[0, 25, 8.5]}>
        {/* Luminous Pulsing Octahedron Core */}
        <mesh ref={coreRef}>
          <octahedronGeometry args={[2.8, 0]} />
          <primitive object={mainEmissive} attach="material" />
        </mesh>
        <pointLight color="#3b82f6" intensity={8} distance={30} />

        {/* Counter-Rotating Orbital Gyro Rings */}
        <group ref={gyroRingRef1}>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[4.6, 0.2, 8, 28]} />
            <primitive object={accentEmissive} attach="material" />
          </mesh>
        </group>
        <group ref={gyroRingRef2}>
          <mesh rotation={[0, Math.PI / 4, Math.PI / 4]}>
            <torusGeometry args={[5.2, 0.2, 8, 28]} />
            <primitive object={mainEmissive} attach="material" />
          </mesh>
        </group>
      </group>

      {/* Structural Diamond Diagrid Exoskeleton Bracing */}
      {[-10, 10].map((x) => (
        <group key={x}>
          <mesh position={[x, 30, 10.5]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[1.2, 40, 0.5]} />
            <primitive object={frameMat} attach="material" />
          </mesh>
          <mesh position={[x, 30, 10.5]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[1.2, 40, 0.5]} />
            <primitive object={frameMat} attach="material" />
          </mesh>
        </group>
      ))}

      {/* 6 Vertical Blue Laser Conduits along Hexagonal Vertices */}
      {[0, 1, 2, 3, 4, 5].map((v) => {
        const angle = (v * Math.PI) / 3;
        const r = 16.4;
        return (
          <mesh
            key={v}
            position={[Math.cos(angle) * r, 30, Math.sin(angle) * r]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[0.25, 60, 0.25]} />
            <primitive object={mainEmissive} attach="material" />
          </mesh>
        );
      })}

      {/* Rooftop Observatory Base & 8-Meter Parabolic Satellite Dish */}
      <mesh position={[0, 61, 0]}>
        <cylinderGeometry args={[11, 14, 3, 6]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      {/* Deep-Space Parabolic Dish Antenna */}
      <mesh position={[0, 67, 0]} rotation={[-Math.PI / 6, Math.PI / 4, 0]}>
        <cylinderGeometry args={[6.5, 1.2, 2.4, 20, 1, true]} />
        <primitive object={accentEmissive} attach="material" />
      </mesh>
      <mesh position={[0, 66, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 8, 8]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      <mesh position={[0, 75, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <primitive object={SHARED_DEST_MATERIALS.beaconRed} attach="material" />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 6. Typology D: Grand Summit & Hackathon Arena Dome (EVENTS)
// ---------------------------------------------------------------------------
const HubArchitecture: React.FC<{
  frameMat: THREE.Material;
  glassMat: THREE.Material;
  mainEmissive: THREE.Material;
  accentEmissive: THREE.Material;
}> = ({ frameMat, glassMat, mainEmissive, accentEmissive }) => {
  return (
    <group>
      {/* Grand Elliptical Arena Stadium Body in Titanium & Glass */}
      <mesh position={[0, 14, 0]} scale={[1.45, 1, 1]}>
        <cylinderGeometry args={[16, 20, 28, 28]} />
        <primitive object={frameMat} attach="material" />
      </mesh>

      {/* 4 Illuminated Emerald Horizon Ribbons wrapping the Arena */}
      {[5, 11, 17, 23].map((y) => (
        <mesh key={`hub-ribbon-${y}`} position={[0, y, 0]} scale={[1.46, 1, 1.01]}>
          <cylinderGeometry args={[16.2 + (28 - y) * 0.12, 16.2 + (28 - y) * 0.12, 0.6, 28]} />
          <primitive object={mainEmissive} attach="material" />
        </mesh>
      ))}

      {/* Translucent Geodesic Glass Roof Dome */}
      <mesh position={[0, 28, 0]} scale={[1.45, 0.55, 1]}>
        <sphereGeometry args={[17, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Sweeping Emerald Arch Ribs curving dramatically over the roof */}
      {[-10, -5, 0, 5, 10].map((x) => (
        <mesh key={x} position={[x, 31, 0]}>
          <torusGeometry args={[15, 0.45, 8, 32, Math.PI]} />
          <primitive object={mainEmissive} attach="material" />
        </mesh>
      ))}

      {/* Grand 2-Story Promenade Glass Ribbon Frontage */}
      <mesh position={[0, 11, 11]}>
        <boxGeometry args={[30, 16, 4]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Illuminated Promenade Window Bays */}
      {[7, 14].map((y) => (
        <mesh key={`prom-win-${y}`} position={[0, y, 13.05]}>
          <boxGeometry args={[26, 2.6, 0.05]} />
          <primitive object={accentEmissive} attach="material" />
        </mesh>
      ))}

      {/* 6 Majestic Illuminated Colonnade Pillars */}
      {[-13, -7.8, -2.6, 2.6, 7.8, 13].map((x) => (
        <group key={x} position={[x, 10, 13.8]}>
          <mesh>
            <cylinderGeometry args={[0.55, 0.65, 20, 10]} />
            <primitive object={frameMat} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.62]}>
            <boxGeometry args={[0.2, 19.6, 0.08]} />
            <primitive object={mainEmissive} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Dynamic Digital Event Marquee Screen above entrance */}
      <mesh position={[0, 22, 14.5]}>
        <boxGeometry args={[32, 4.0, 1.0]} />
        <meshStandardMaterial color="#020814" roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[0, 22, 15.05]}>
        <boxGeometry args={[31.2, 3.2, 0.05]} />
        <primitive object={accentEmissive} attach="material" />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 7. Master Destination Building Component
// ---------------------------------------------------------------------------
export const DestinationBuilding: React.FC<DestinationBuildingProps> = ({
  destination,
  position,
  rotation = [0, 0, 0],
}) => {
  const [hovered, setHovered] = useState(false);
  const worldMode = useWorldStore((s) => s.worldMode);
  const isCityActive = worldMode === 'CITY_EXPLORATION';

  const enterDestination = useCityStore((s) => s.enterDestination);
  const setScrollProgress = useCityStore((s) => s.setScrollProgress);
  const selectedDestination = useCityStore((s) => s.selectedDestination);
  const setHoveredDestinationId = useCityStore((s) => s.setHoveredDestinationId);

  const isSelected = selectedDestination?.id === destination.id;

  // Primary & accent materials
  const mainColor = useMemo(
    () => new THREE.Color(destination.primaryColor),
    [destination.primaryColor]
  );
  const accentColor = useMemo(
    () => new THREE.Color(destination.accentColor),
    [destination.accentColor]
  );

  const frameMaterial = SHARED_DEST_MATERIALS.darkTitanium;
  const glassMaterial = SHARED_DEST_MATERIALS.obsidianGlass;

  const emissiveMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: mainColor,
      }),
    [mainColor]
  );

  const highlightMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: accentColor,
      }),
    [accentColor]
  );

  const stepTagNumber = destination.id.replace('destination-', '');

  const handleTriggerEnter = () => {
    setScrollProgress(destination.routeProgress);
    enterDestination(destination);
  };

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Interactive Raycast Hitbox Envelope */}
      <mesh
        position={[0, 20, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setHoveredDestinationId(destination.id);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          setHoveredDestinationId(null);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleTriggerEnter();
        }}
      >
        <boxGeometry args={[36, 48, 30]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* 2. Specialized Architectural Geometry by Typology */}
      {destination.buildingType === 'tower' && (
        <TowerArchitecture
          frameMat={frameMaterial}
          glassMat={glassMaterial}
          mainEmissive={emissiveMaterial}
          accentEmissive={highlightMaterial}
        />
      )}
      {destination.buildingType === 'lab' && (
        <LabArchitecture
          frameMat={frameMaterial}
          glassMat={glassMaterial}
          mainEmissive={emissiveMaterial}
          accentEmissive={highlightMaterial}
        />
      )}
      {destination.buildingType === 'nexus' && (
        <NexusArchitecture
          frameMat={frameMaterial}
          glassMat={glassMaterial}
          mainEmissive={emissiveMaterial}
          accentEmissive={highlightMaterial}
        />
      )}
      {destination.buildingType === 'hub' && (
        <HubArchitecture
          frameMat={frameMaterial}
          glassMat={glassMaterial}
          mainEmissive={emissiveMaterial}
          accentEmissive={highlightMaterial}
        />
      )}

      {/* 3. Grand Architectural Entrance Vestibule & Canopy */}
      <group position={[0, 0, 11]}>
        {/* Entrance Atrium Glass Wall behind canopy */}
        <mesh position={[0, 7, -0.5]}>
          <boxGeometry args={[22, 14, 2]} />
          <primitive object={glassMaterial} attach="material" />
        </mesh>

        {/* Solid Architectural Entrance Canopy */}
        <mesh position={[0, 12, 1.5]}>
          <boxGeometry args={[23, 0.8, 5.5]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 12, 4.3]}>
          <boxGeometry args={[22.6, 0.2, 0.1]} />
          <primitive
            object={hovered || isSelected ? highlightMaterial : emissiveMaterial}
            attach="material"
          />
        </mesh>

        {/* Dual Solid Titanium Columns */}
        {[-10.5, 10.5].map((x) => (
          <mesh key={x} position={[x, 6, 3.8]}>
            <cylinderGeometry args={[0.4, 0.45, 12, 8]} />
            <primitive object={frameMaterial} attach="material" />
          </mesh>
        ))}

        {/* Interior Entrance Glow Light */}
        <pointLight
          position={[0, 6, 0]}
          color={destination.primaryColor}
          intensity={hovered || isSelected ? 6 : 3.5}
          distance={25}
        />
      </group>

      {/* 4. Tiered Pedestrian Steps & Illuminated Pavement Risers */}
      <group position={[0, 0, 12]}>
        {[0, 1, 2, 3].map((step) => (
          <mesh key={step} position={[0, step * 0.4 + 0.2, step * 1.2]}>
            <boxGeometry args={[22 - step * 1.4, 0.4, 2.5]} />
            <primitive object={frameMaterial} attach="material" />
          </mesh>
        ))}

        {/* Illuminated Step Marker Edge Strips */}
        <mesh position={[-9.5, 0.45, 1.2]}>
          <boxGeometry args={[1.5, 0.1, 1.8]} />
          <primitive object={emissiveMaterial} attach="material" />
        </mesh>
        <mesh position={[9.5, 0.45, 1.2]}>
          <boxGeometry args={[1.5, 0.1, 1.8]} />
          <primitive object={emissiveMaterial} attach="material" />
        </mesh>
      </group>

      {/* 5. Entrance Monument Sign Board */}
      <EntranceSignBoard
        destination={destination}
        side={destination.side}
        onClick={handleTriggerEnter}
        hovered={hovered}
      />

      {/* 6. Fast Spatial 3D Sky Marker Tag (Only rendered in Digital City to prevent globe bleeding) */}
      {isCityActive && (
        <Html
          position={[0, destination.buildingType === 'tower' ? 70 : 44, 0]}
          center
          distanceFactor={65}
          zIndexRange={[100, 0]}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleTriggerEnter();
            }}
            className={`cursor-pointer transition-transform duration-200 ${
              hovered || isSelected ? 'scale-105 -translate-y-1' : 'scale-100'
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg border flex items-center gap-3 shadow-2xl ${
                isSelected
                  ? 'bg-slate-950/95 border-cyan-400 text-cyan-300'
                  : hovered
                  ? 'bg-slate-900/95 border-cyan-500/80 text-white'
                  : 'bg-slate-950/90 border-slate-700/80 text-slate-300'
              }`}
              style={{
                borderColor: hovered || isSelected ? destination.primaryColor : undefined,
                boxShadow: hovered || isSelected ? `0 0 15px ${destination.primaryColor}50` : undefined,
              }}
            >
              {/* Step/District Number Tag */}
              <span
                className="font-mono font-bold text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${destination.primaryColor}25`,
                  color: destination.primaryColor,
                }}
              >
                0{stepTagNumber}
              </span>

              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-sm tracking-wider uppercase">
                  {destination.title}
                </span>
                <span className="text-[10px] tracking-widest text-slate-400 uppercase font-mono">
                  {destination.category}
                </span>
              </div>

              {/* Selection Pulse Dot */}
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isSelected ? 'bg-cyan-400' : 'bg-slate-600'
                }`}
                style={{ backgroundColor: destination.primaryColor }}
              />
            </div>

            {/* Marker Pointer Pin */}
            <div className="w-0.5 h-6 mx-auto bg-gradient-to-b from-cyan-400 to-transparent" />
          </div>
        </Html>
      )}
    </group>
  );
};
