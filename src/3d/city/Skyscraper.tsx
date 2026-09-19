import React, { useMemo } from 'react';
import * as THREE from 'three';

interface SkyscraperProps {
  position: [number, number, number];
  height?: number;
  width?: number;
  depth?: number;
  color?: string;
  glowColor?: string;
  archetype?: number;
}

// Shared singleton materials across all background skyscrapers
const SHARED_SKYSCRAPER_MATERIALS = {
  darkGlass: new THREE.MeshStandardMaterial({
    color: '#060e1c',
    roughness: 0.12,
    metalness: 0.92,
  }),
  warn: new THREE.MeshBasicMaterial({
    color: '#ff0055',
  }),
  blueWindow: new THREE.MeshBasicMaterial({
    color: '#38bdf8',
  }),
  amberWindow: new THREE.MeshBasicMaterial({
    color: '#fde047',
  }),
};

const skyFrameCache = new Map<string, THREE.MeshStandardMaterial>();
function getSkyFrameMaterial(color: string): THREE.MeshStandardMaterial {
  if (!skyFrameCache.has(color)) {
    skyFrameCache.set(
      color,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.8,
      })
    );
  }
  return skyFrameCache.get(color)!;
}

const skyGlowCache = new Map<string, THREE.MeshBasicMaterial>();
function getSkyGlowMaterial(glowColor: string): THREE.MeshBasicMaterial {
  if (!skyGlowCache.has(glowColor)) {
    skyGlowCache.set(
      glowColor,
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(glowColor),
      })
    );
  }
  return skyGlowCache.get(glowColor)!;
}

export const Skyscraper: React.FC<SkyscraperProps> = ({
  position,
  width = 32,
  height = 130,
  depth = 32,
  color = '#050a14',
  glowColor = '#00f0ff',
  archetype = 0,
}) => {
  const typeIndex = Math.abs(archetype) % 4;

  // High-performance pooled materials
  const darkGlassMaterial = SHARED_SKYSCRAPER_MATERIALS.darkGlass;
  const warnMaterial = SHARED_SKYSCRAPER_MATERIALS.warn;
  const windowLitMaterial = typeIndex % 2 === 0 ? SHARED_SKYSCRAPER_MATERIALS.blueWindow : SHARED_SKYSCRAPER_MATERIALS.amberWindow;
  const frameMaterial = getSkyFrameMaterial(color);
  const glowMaterial = getSkyGlowMaterial(glowColor);

  return (
    <group position={position}>
      {/* ------------------------------------------------------------- */}
      {/* MEGASTRUCTURE 0: THE CELESTIAL SHARD                          */}
      {/* ------------------------------------------------------------- */}
      {typeIndex === 0 && (
        <group>
          {/* Base Section */}
          <mesh position={[0, height * 0.25, 0]}>
            <boxGeometry args={[width, height * 0.5, width]} />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>

          {/* Clean Floor Spandrel Lines (Floors every 12m) */}
          {[0.1, 0.2, 0.3, 0.4].map((f, i) => (
            <mesh key={i} position={[0, height * f, 0]}>
              <boxGeometry args={[width * 1.02, 0.8, width * 1.02]} />
              <primitive object={frameMaterial} attach="material" />
            </mesh>
          ))}
          {/* Glowing Office Window Rows */}
          {[0.15, 0.25, 0.35, 0.45].map((f, i) => (
            <mesh key={i} position={[0, height * f, width * 0.505]}>
              <boxGeometry args={[width * 0.85, 2.8, 0.05]} />
              <primitive object={windowLitMaterial} attach="material" />
            </mesh>
          ))}

          {/* Setback Band 1 */}
          <mesh position={[0, height * 0.5 + 0.5, 0]}>
            <boxGeometry args={[width * 1.04, 1.2, width * 1.04]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>

          {/* Mid Section */}
          <mesh position={[0, height * 0.68, 0]}>
            <boxGeometry args={[width * 0.76, height * 0.34, width * 0.76]} />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>
          {[0.58, 0.68, 0.78].map((f, i) => (
            <mesh key={i} position={[0, height * f, width * 0.385]}>
              <boxGeometry args={[width * 0.65, 2.6, 0.05]} />
              <primitive object={windowLitMaterial} attach="material" />
            </mesh>
          ))}

          {/* Setback Band 2 */}
          <mesh position={[0, height * 0.85 + 0.5, 0]}>
            <boxGeometry args={[width * 0.8, 1.2, width * 0.8]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>

          {/* Upper Penthouse Crown */}
          <mesh position={[0, height * 0.94, 0]}>
            <boxGeometry args={[width * 0.54, height * 0.16, width * 0.54]} />
            <primitive object={frameMaterial} attach="material" />
          </mesh>

          {/* Stepped Architectural Crown Spire */}
          <group position={[0, height * 1.02, 0]}>
            <mesh position={[0, 4, 0]}>
              <boxGeometry args={[width * 0.35, 8, width * 0.35]} />
              <primitive object={frameMaterial} attach="material" />
            </mesh>
            <mesh position={[0, 16, 0]}>
              <cylinderGeometry args={[0.2, 1.2, 18, 8]} />
              <primitive object={glowMaterial} attach="material" />
            </mesh>
            <mesh position={[0, 26, 0]}>
              <sphereGeometry args={[0.6, 8, 8]} />
              <primitive object={warnMaterial} attach="material" />
            </mesh>
          </group>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MEGASTRUCTURE 1: TWIN MEGA-TOWER WITH SKYWAYS                 */}
      {/* ------------------------------------------------------------- */}
      {typeIndex === 1 && (
        <group>
          {/* Left Tower Shaft */}
          <mesh position={[-width * 0.38, height * 0.5, 0]}>
            <boxGeometry args={[width * 0.38, height, width * 0.75]} />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>
          {/* Right Tower Shaft */}
          <mesh position={[width * 0.38, height * 0.5, 0]}>
            <boxGeometry args={[width * 0.38, height, width * 0.75]} />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>

          {/* Clean Floor Window Rows on Left & Right Towers */}
          {[0.2, 0.35, 0.5, 0.65, 0.8].map((f, i) => (
            <group key={i} position={[0, height * f, width * 0.38]}>
              <mesh position={[-width * 0.38, 0, 0]}>
                <boxGeometry args={[width * 0.3, 3.2, 0.05]} />
                <primitive object={windowLitMaterial} attach="material" />
              </mesh>
              <mesh position={[width * 0.38, 0, 0]}>
                <boxGeometry args={[width * 0.3, 3.2, 0.05]} />
                <primitive object={windowLitMaterial} attach="material" />
              </mesh>
            </group>
          ))}

          {/* Suspended Skybridge */}
          <mesh position={[0, height * 0.72, 0]}>
            <boxGeometry args={[width * 0.45, 6, width * 0.4]} />
            <primitive object={frameMaterial} attach="material" />
          </mesh>
          <mesh position={[0, height * 0.72, 0]}>
            <boxGeometry args={[width * 0.45, 3.5, width * 0.42]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>

          {/* Summit Skybridge Crown */}
          <mesh position={[0, height - 4, 0]}>
            <boxGeometry args={[width * 1.15, 12, width * 0.8]} />
            <primitive object={frameMaterial} attach="material" />
          </mesh>

          {/* Twin Antennas */}
          <mesh position={[-width * 0.38, height + 8, 0]}>
            <cylinderGeometry args={[0.2, 0.8, 16, 6]} />
            <primitive object={frameMaterial} attach="material" />
          </mesh>
          <mesh position={[width * 0.38, height + 8, 0]}>
            <cylinderGeometry args={[0.2, 0.8, 16, 6]} />
            <primitive object={frameMaterial} attach="material" />
          </mesh>
          <mesh position={[-width * 0.38, height + 16.5, 0]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <primitive object={warnMaterial} attach="material" />
          </mesh>
          <mesh position={[width * 0.38, height + 16.5, 0]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <primitive object={warnMaterial} attach="material" />
          </mesh>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MEGASTRUCTURE 2: CYLINDRICAL HIGH-RISE WITH CONCENTRIC DECKS  */}
      {/* ------------------------------------------------------------- */}
      {typeIndex === 2 && (
        <group>
          <mesh position={[0, height * 0.5, 0]}>
            <cylinderGeometry args={[width * 0.42, width * 0.5, height, 24]} />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>

          {/* 3 Horizontal Observation Belt Rings */}
          <mesh position={[0, height * 0.35, 0]}>
            <cylinderGeometry args={[width * 0.48, width * 0.48, 1.4, 24]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>
          <mesh position={[0, height * 0.65, 0]}>
            <cylinderGeometry args={[width * 0.46, width * 0.46, 1.4, 24]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>
          <mesh position={[0, height * 0.9, 0]}>
            <cylinderGeometry args={[width * 0.44, width * 0.44, 1.4, 24]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>

          {/* Rooftop Observation Rotunda */}
          <mesh position={[0, height + 4, 0]}>
            <cylinderGeometry args={[width * 0.38, width * 0.42, 8, 24]} />
            <primitive object={frameMaterial} attach="material" />
          </mesh>
          <mesh position={[0, height + 14, 0]}>
            <cylinderGeometry args={[0.2, 0.8, 14, 8]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MEGASTRUCTURE 3: STEPPED DIAGRID MEGAPRISM                    */}
      {/* ------------------------------------------------------------- */}
      {typeIndex === 3 && (
        <group>
          <mesh position={[0, height * 0.32, 0]}>
            <cylinderGeometry args={[width * 0.46, width * 0.56, height * 0.64, 6]} />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>
          <mesh position={[0, height * 0.78, 0]}>
            <cylinderGeometry args={[width * 0.32, width * 0.45, height * 0.36, 6]} />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>

          {/* Diagonal Diagrid Braces */}
          {[-width * 0.35, width * 0.35].map((x, i) => (
            <group key={i} position={[x, height * 0.48, width * 0.42]}>
              <mesh rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.8, height * 0.65, 0.4]} />
                <primitive object={frameMaterial} attach="material" />
              </mesh>
              <mesh rotation={[0, 0, -Math.PI / 4]}>
                <boxGeometry args={[0.8, height * 0.65, 0.4]} />
                <primitive object={frameMaterial} attach="material" />
              </mesh>
            </group>
          ))}

          <mesh position={[0, height * 0.64, 0]}>
            <cylinderGeometry args={[width * 0.48, width * 0.48, 1.2, 6]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>

          <mesh position={[0, height + 8, 0]}>
            <cylinderGeometry args={[width * 0.28, width * 0.32, 8, 6]} />
            <primitive object={frameMaterial} attach="material" />
          </mesh>
          <mesh position={[0, height + 18, 0]}>
            <cylinderGeometry args={[0.2, 0.6, 16, 6]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>
        </group>
      )}
    </group>
  );
};
