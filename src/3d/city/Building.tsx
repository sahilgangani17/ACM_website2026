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
  archetype?: number; // 0 to 7
}

// Static singleton materials shared across all buildings to eliminate WebGL state churn
const SHARED_BUILDING_MATERIALS = {
  darkGlass: new THREE.MeshStandardMaterial({
    color: '#07101f',
    roughness: 0.12,
    metalness: 0.92,
  }),
  softWindow: new THREE.MeshBasicMaterial({
    color: '#bae6fd',
  }),
  lobbyGlass: new THREE.MeshStandardMaterial({
    color: '#e0f2fe',
    emissive: new THREE.Color('#38bdf8'),
    emissiveIntensity: 0.65,
    roughness: 0.08,
    metalness: 0.95,
  }),
  warnLight: new THREE.MeshBasicMaterial({
    color: '#ff0055',
  }),
  cyanLit: new THREE.MeshBasicMaterial({
    color: '#67e8f9',
  }),
  amberLit: new THREE.MeshBasicMaterial({
    color: '#fde047',
  }),
};

const frameMaterialCache = new Map<string, THREE.MeshStandardMaterial>();
function getFrameMaterial(color: string): THREE.MeshStandardMaterial {
  if (!frameMaterialCache.has(color)) {
    frameMaterialCache.set(
      color,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.4,
        metalness: 0.75,
      })
    );
  }
  return frameMaterialCache.get(color)!;
}

const accentMaterialCache = new Map<string, THREE.MeshBasicMaterial>();
function getAccentMaterial(accentColor: string): THREE.MeshBasicMaterial {
  if (!accentMaterialCache.has(accentColor)) {
    accentMaterialCache.set(
      accentColor,
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(accentColor),
      })
    );
  }
  return accentMaterialCache.get(accentColor)!;
}

export const Building: React.FC<BuildingProps> = ({
  position,
  rotation = [0, 0, 0],
  width = 20,
  height = 52,
  depth = 20,
  color = '#0e1728',
  accentColor = '#00f0ff',
  hasSpire = true,
  archetype,
}) => {
  // Deterministic archetype selection
  const typeIndex = useMemo(() => {
    if (archetype !== undefined) return Math.abs(archetype) % 8;
    return Math.abs(Math.floor(position[0] * 7 + position[2] * 13)) % 8;
  }, [archetype, position]);

  // High-performance pooled materials
  const darkGlassMaterial = SHARED_BUILDING_MATERIALS.darkGlass;
  const softWindowMaterial = SHARED_BUILDING_MATERIALS.softWindow;
  const lobbyGlassMaterial = SHARED_BUILDING_MATERIALS.lobbyGlass;
  const warnLightMaterial = SHARED_BUILDING_MATERIALS.warnLight;
  const litWindowMaterial = typeIndex % 2 === 0 ? SHARED_BUILDING_MATERIALS.cyanLit : SHARED_BUILDING_MATERIALS.amberLit;
  const frameMaterial = getFrameMaterial(color);
  const accentMaterial = getAccentMaterial(accentColor);

  // Generate clean, architectural floor levels and window bays
  const floorHeight = 4.2;
  const numFloors = Math.max(4, Math.floor((height - 12) / floorHeight));

  const floorData = useMemo(() => {
    const list = [];
    for (let f = 0; f < numFloors; f++) {
      const y = 9 + f * floorHeight;
      // Pattern of which window bays are lit on this floor
      const litLeft = (f * 7 + typeIndex) % 3 !== 0;
      const litCenter = (f * 13 + typeIndex) % 2 === 0;
      const litRight = (f * 11 + typeIndex) % 4 !== 0;
      list.push({ y, litLeft, litCenter, litRight });
    }
    return list;
  }, [numFloors, floorHeight, typeIndex]);

  return (
    <group position={position} rotation={rotation}>
      {/* ------------------------------------------------------------- */}
      {/* 1. SOLID GROUND LOBBY & REVOLVING ENTRANCE                    */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, 0]}>
        {/* Foundation Plinth */}
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <boxGeometry args={[width * 1.06, 0.8, depth * 1.06]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>

        {/* 2-Story Floor-to-Ceiling Illuminated Lobby Glass */}
        <mesh position={[0, 4.5, 0]}>
          <boxGeometry args={[width * 0.94, 7.4, depth * 0.94]} />
          <primitive object={lobbyGlassMaterial} attach="material" />
        </mesh>

        {/* Lobby Perimeter Structural Columns */}
        {[-width * 0.45, width * 0.45].map((x, xi) =>
          [-depth * 0.45, depth * 0.45].map((z, zi) => (
            <mesh key={`${xi}-${zi}`} position={[x, 4.5, z]} castShadow>
              <boxGeometry args={[width * 0.08, 7.4, depth * 0.08]} />
              <primitive object={frameMaterial} attach="material" />
            </mesh>
          ))
        )}

        {/* Lobby Floor 3 Spandrel Band */}
        <mesh position={[0, 8.4, 0]} castShadow>
          <boxGeometry args={[width * 1.04, 0.8, depth * 1.04]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 8.4, depth * 0.525]}>
          <boxGeometry args={[width * 1.02, 0.15, 0.1]} />
          <primitive object={accentMaterial} attach="material" />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* ARCHETYPE 0: SLANTED BLADE HIGH-RISE                          */}
      {/* ------------------------------------------------------------- */}
      {typeIndex === 0 && (
        <group position={[0, 8.8, 0]}>
          {/* Main Dark Glass Curtain Core */}
          <mesh position={[0, (height - 8.8) * 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.92, (height - 8.8) * 0.9, depth * 0.92]} />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>

          {/* Clean Floor Spandrels & Crisp Rectangular Window Bays */}
          {floorData.map((floor, idx) => (
            <group key={idx} position={[0, floor.y - 8.8, 0]}>
              {/* Horizontal Floor Spandrel Slab */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[width * 0.94, 0.6, depth * 0.94]} />
                <primitive object={frameMaterial} attach="material" />
              </mesh>

              {/* Front Facade Clean Window Panels (Not noisy dots!) */}
              {floor.litLeft && (
                <mesh position={[-width * 0.28, 1.8, depth * 0.465]}>
                  <boxGeometry args={[width * 0.24, 2.4, 0.05]} />
                  <primitive object={litWindowMaterial} attach="material" />
                </mesh>
              )}
              {floor.litCenter && (
                <mesh position={[0, 1.8, depth * 0.465]}>
                  <boxGeometry args={[width * 0.24, 2.4, 0.05]} />
                  <primitive object={softWindowMaterial} attach="material" />
                </mesh>
              )}
              {floor.litRight && (
                <mesh position={[width * 0.28, 1.8, depth * 0.465]}>
                  <boxGeometry args={[width * 0.24, 2.4, 0.05]} />
                  <primitive object={litWindowMaterial} attach="material" />
                </mesh>
              )}
            </group>
          ))}

          {/* Corner Vertical Structural Columns */}
          {[-width * 0.45, width * 0.45].map((x, xi) => (
            <mesh key={xi} position={[x, (height - 8.8) * 0.45, depth * 0.45]}>
              <boxGeometry args={[width * 0.04, (height - 8.8) * 0.9, depth * 0.04]} />
              <primitive object={frameMaterial} attach="material" />
            </mesh>
          ))}

          {/* Slanted Blade Penthouse Crown */}
          <group position={[0, (height - 8.8) * 0.9 + 4, 0]}>
            <mesh position={[0, 0, 0]} rotation={[0.22, 0, 0]} castShadow>
              <boxGeometry args={[width * 0.86, 7.5, depth * 0.82]} />
              <primitive object={frameMaterial} attach="material" />
            </mesh>
            <mesh position={[0, 2, depth * 0.38]} rotation={[0.22, 0, 0]}>
              <boxGeometry args={[width * 0.84, 0.4, 0.3]} />
              <primitive object={accentMaterial} attach="material" />
            </mesh>
          </group>

          {/* Antenna Mast */}
          {hasSpire && (
            <group position={[0, height - 8.8 + 8, 0]}>
              <mesh position={[0, 6, 0]}>
                <cylinderGeometry args={[0.15, 0.6, 12, 6]} />
                <primitive object={frameMaterial} attach="material" />
              </mesh>
              <mesh position={[0, 12.5, 0]}>
                <sphereGeometry args={[0.35, 8, 8]} />
                <primitive object={warnLightMaterial} attach="material" />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ARCHETYPE 1: ART-DECO STEPPED SETBACK HIGH-RISE               */}
      {/* ------------------------------------------------------------- */}
      {typeIndex === 1 && (
        <group position={[0, 8.8, 0]}>
          {/* Tier 1: Main Base Tower (Floors 3-12) */}
          <mesh position={[0, (height - 8.8) * 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.94, (height - 8.8) * 0.5, depth * 0.94]} />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>
          <mesh position={[0, (height - 8.8) * 0.5 + 0.3, 0]}>
            <boxGeometry args={[width * 0.98, 0.6, depth * 0.98]} />
            <primitive object={accentMaterial} attach="material" />
          </mesh>

          {/* Tier 2: Mid Tower (Floors 13-22) */}
          <mesh position={[0, (height - 8.8) * 0.68, 0]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.74, (height - 8.8) * 0.35, depth * 0.74]} />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>
          <mesh position={[0, (height - 8.8) * 0.85 + 0.3, 0]}>
            <boxGeometry args={[width * 0.78, 0.6, depth * 0.78]} />
            <primitive object={accentMaterial} attach="material" />
          </mesh>

          {/* Tier 3: Penthouse Tower Crown */}
          <mesh position={[0, (height - 8.8) * 0.94, 0]} castShadow>
            <boxGeometry args={[width * 0.54, (height - 8.8) * 0.18, depth * 0.54]} />
            <primitive object={frameMaterial} attach="material" />
          </mesh>

          {/* Clean Horizontal Floor Window Bands on Tiers */}
          {floorData.slice(0, 6).map((floor, idx) => (
            <mesh
              key={idx}
              position={[0, floor.y - 8.8 + 1.8, depth * 0.475]}
            >
              <boxGeometry args={[width * 0.8, 2.2, 0.05]} />
              <primitive object={idx % 2 === 0 ? litWindowMaterial : softWindowMaterial} attach="material" />
            </mesh>
          ))}

          {/* Art-Deco Fluted Needle Spire */}
          {hasSpire && (
            <group position={[0, (height - 8.8) * 1.03, 0]}>
              <mesh position={[0, 4, 0]}>
                <cylinderGeometry args={[0.3, width * 0.2, 8, 8]} />
                <primitive object={frameMaterial} attach="material" />
              </mesh>
              <mesh position={[0, 10, 0]}>
                <cylinderGeometry args={[0.1, 0.3, 6, 8]} />
                <primitive object={accentMaterial} attach="material" />
              </mesh>
              <mesh position={[0, 13.5, 0]}>
                <sphereGeometry args={[0.35, 8, 8]} />
                <primitive object={warnLightMaterial} attach="material" />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ARCHETYPE 2: AERODYNAMIC CURVED TOWER WITH ATRIUM             */}
      {/* ------------------------------------------------------------- */}
      {typeIndex === 2 && (
        <group position={[0, 8.8, 0]}>
          {/* Main Curved Tower Shaft */}
          <mesh position={[0, (height - 8.8) * 0.48, 0]} castShadow receiveShadow>
            <cylinderGeometry
              args={[width * 0.44, width * 0.48, (height - 8.8) * 0.96, 24]}
            />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>

          {/* Vertical Recessed Atrium Spine (Glowing Cyan Glass) */}
          <mesh position={[0, (height - 8.8) * 0.48, width * 0.44]}>
            <boxGeometry args={[width * 0.22, (height - 8.8) * 0.94, 0.4]} />
            <primitive object={lobbyGlassMaterial} attach="material" />
          </mesh>

          {/* Clean Floor Slab Rings */}
          {floorData.map((floor, idx) => (
            <mesh key={idx} position={[0, floor.y - 8.8, 0]}>
              <cylinderGeometry args={[width * 0.485, width * 0.485, 0.5, 24]} />
              <primitive object={frameMaterial} attach="material" />
            </mesh>
          ))}

          {/* Observation Gallery Rotunda Crown */}
          <group position={[0, height - 8.8, 0]}>
            <mesh position={[0, 2, 0]} castShadow>
              <cylinderGeometry args={[width * 0.46, width * 0.44, 4, 24]} />
              <primitive object={lobbyGlassMaterial} attach="material" />
            </mesh>
            <mesh position={[0, 4.2, 0]}>
              <cylinderGeometry args={[width * 0.4, width * 0.46, 0.6, 24]} />
              <primitive object={frameMaterial} attach="material" />
            </mesh>
          </group>

          {/* Spire */}
          {hasSpire && (
            <group position={[0, height - 8.8 + 4.5, 0]}>
              <mesh position={[0, 5, 0]}>
                <cylinderGeometry args={[0.15, 0.5, 10, 6]} />
                <primitive object={frameMaterial} attach="material" />
              </mesh>
              <mesh position={[0, 10.5, 0]}>
                <sphereGeometry args={[0.35, 8, 8]} />
                <primitive object={warnLightMaterial} attach="material" />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ARCHETYPE 3: CANTILEVERED SKY-TERRACE HIGH-RISE               */}
      {/* ------------------------------------------------------------- */}
      {typeIndex === 3 && (
        <group position={[0, 8.8, 0]}>
          {/* Lower Block */}
          <mesh position={[0, (height - 8.8) * 0.22, 0]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.94, (height - 8.8) * 0.44, depth * 0.94]} />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>

          {/* Mid Cantilevered Block (shifted forward toward boulevard) */}
          <mesh position={[0, (height - 8.8) * 0.58, depth * 0.08]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.9, (height - 8.8) * 0.32, depth * 0.9]} />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>
          <mesh position={[0, (height - 8.8) * 0.42, depth * 0.25]}>
            <boxGeometry args={[width * 0.9, 0.2, depth * 0.4]} />
            <primitive object={accentMaterial} attach="material" />
          </mesh>

          {/* Clean Floor Spandrels & Windows */}
          {floorData.map((floor, idx) => (
            <group key={idx} position={[0, floor.y - 8.8, 0]}>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[width * 0.95, 0.5, depth * 0.95]} />
                <primitive object={frameMaterial} attach="material" />
              </mesh>
              {idx % 2 === 0 && (
                <mesh position={[0, 1.8, depth * 0.47]}>
                  <boxGeometry args={[width * 0.75, 2.2, 0.05]} />
                  <primitive object={litWindowMaterial} attach="material" />
                </mesh>
              )}
            </group>
          ))}

          {/* Upper Penthouse Block */}
          <mesh position={[0, (height - 8.8) * 0.86, -depth * 0.05]} castShadow>
            <boxGeometry args={[width * 0.78, (height - 8.8) * 0.26, depth * 0.78]} />
            <primitive object={frameMaterial} attach="material" />
          </mesh>
          {hasSpire && (
            <mesh position={[0, height - 8.8 + 6, -depth * 0.05]}>
              <cylinderGeometry args={[0.15, 0.4, 8, 6]} />
              <primitive object={accentMaterial} attach="material" />
            </mesh>
          )}
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ARCHETYPE 4: TWIN PYLON TOWER WITH SKYBRIDGES                 */}
      {/* ------------------------------------------------------------- */}
      {typeIndex === 4 && (
        <group position={[0, 8.8, 0]}>
          {/* Left Tower Shaft */}
          <mesh position={[-width * 0.28, (height - 8.8) * 0.48, 0]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.38, (height - 8.8) * 0.96, depth * 0.85]} />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>
          {/* Right Tower Shaft */}
          <mesh position={[width * 0.28, (height - 8.8) * 0.48, 0]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.38, (height - 8.8) * 0.96, depth * 0.85]} />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>

          {/* Clean Window Strips on both towers */}
          {floorData.map((floor, idx) => (
            <group key={idx} position={[0, floor.y - 8.8, depth * 0.43]}>
              <mesh position={[-width * 0.28, 1.8, 0]}>
                <boxGeometry args={[width * 0.26, 2.2, 0.05]} />
                <primitive object={idx % 2 === 0 ? litWindowMaterial : softWindowMaterial} attach="material" />
              </mesh>
              <mesh position={[width * 0.28, 1.8, 0]}>
                <boxGeometry args={[width * 0.26, 2.2, 0.05]} />
                <primitive object={idx % 2 === 0 ? softWindowMaterial : litWindowMaterial} attach="material" />
              </mesh>
            </group>
          ))}

          {/* Mid-Level Enclosed Glass Skybridge */}
          <mesh position={[0, (height - 8.8) * 0.45, 0]}>
            <boxGeometry args={[width * 0.45, 4.2, depth * 0.4]} />
            <primitive object={lobbyGlassMaterial} attach="material" />
          </mesh>
          <mesh position={[0, (height - 8.8) * 0.45 + 2.2, 0]}>
            <boxGeometry args={[width * 0.45, 0.3, depth * 0.42]} />
            <primitive object={accentMaterial} attach="material" />
          </mesh>

          {/* Upper-Level Enclosed Glass Skybridge */}
          <mesh position={[0, (height - 8.8) * 0.78, 0]}>
            <boxGeometry args={[width * 0.45, 4.2, depth * 0.4]} />
            <primitive object={lobbyGlassMaterial} attach="material" />
          </mesh>

          {/* Twin Antennas */}
          {hasSpire && (
            <>
              <mesh position={[-width * 0.28, height - 8.8 + 6, 0]}>
                <cylinderGeometry args={[0.15, 0.4, 8, 6]} />
                <primitive object={frameMaterial} attach="material" />
              </mesh>
              <mesh position={[width * 0.28, height - 8.8 + 6, 0]}>
                <cylinderGeometry args={[0.15, 0.4, 8, 6]} />
                <primitive object={frameMaterial} attach="material" />
              </mesh>
            </>
          )}
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ARCHETYPE 5: OCTAGONAL DIAGRID CORPORATE TOWER                */}
      {/* ------------------------------------------------------------- */}
      {typeIndex === 5 && (
        <group position={[0, 8.8, 0]}>
          {/* Main Octagonal Tower Shaft */}
          <mesh position={[0, (height - 8.8) * 0.48, 0]} castShadow receiveShadow>
            <cylinderGeometry
              args={[width * 0.46, width * 0.52, (height - 8.8) * 0.96, 8]}
            />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>

          {/* Bold Structural Diamond Diagrid Bracing */}
          {[-width * 0.36, width * 0.36].map((x, xi) => (
            <group key={xi} position={[x, (height - 8.8) * 0.48, width * 0.44]}>
              <mesh rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.55, (height - 8.8) * 0.92, 0.4]} />
                <primitive object={frameMaterial} attach="material" />
              </mesh>
              <mesh rotation={[0, 0, -Math.PI / 4]}>
                <boxGeometry args={[0.55, (height - 8.8) * 0.92, 0.4]} />
                <primitive object={frameMaterial} attach="material" />
              </mesh>
            </group>
          ))}

          {/* Setback Rings */}
          {[0.33, 0.66].map((f, i) => (
            <mesh key={i} position={[0, (height - 8.8) * f, 0]}>
              <cylinderGeometry args={[width * 0.52, width * 0.52, 0.5, 8]} />
              <primitive object={accentMaterial} attach="material" />
            </mesh>
          ))}

          {/* Faceted Crown & Spire */}
          <group position={[0, height - 8.8, 0]}>
            <mesh position={[0, 3, 0]} castShadow>
              <cylinderGeometry args={[0.2, width * 0.42, 6, 8]} />
              <primitive object={frameMaterial} attach="material" />
            </mesh>
            {hasSpire && (
              <mesh position={[0, 8, 0]}>
                <cylinderGeometry args={[0.1, 0.35, 8, 6]} />
                <primitive object={accentMaterial} attach="material" />
              </mesh>
            )}
          </group>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ARCHETYPE 6: CYLINDRICAL TOWER WITH REAL ROOFTOP HELIPAD      */}
      {/* ------------------------------------------------------------- */}
      {typeIndex === 6 && (
        <group position={[0, 8.8, 0]}>
          {/* Main Cylindrical Shaft */}
          <mesh position={[0, (height - 8.8) * 0.48, 0]} castShadow receiveShadow>
            <cylinderGeometry
              args={[width * 0.45, width * 0.5, (height - 8.8) * 0.96, 24]}
            />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>

          {/* 6 Vertical Structural Mullions */}
          {[0, 1, 2, 3, 4, 5].map((fin) => {
            const angle = (fin * Math.PI) / 3;
            const r = width * 0.48;
            return (
              <mesh
                key={fin}
                position={[Math.cos(angle) * r, (height - 8.8) * 0.48, Math.sin(angle) * r]}
                rotation={[0, angle, 0]}
              >
                <boxGeometry args={[0.35, (height - 8.8) * 0.94, 0.5]} />
                <primitive object={frameMaterial} attach="material" />
              </mesh>
            );
          })}

          {/* Clean Horizontal Floor Rings */}
          {floorData.map((floor, idx) => (
            <mesh key={idx} position={[0, floor.y - 8.8, 0]}>
              <cylinderGeometry args={[width * 0.49, width * 0.49, 0.4, 24]} />
              <primitive object={idx % 2 === 0 ? accentMaterial : frameMaterial} attach="material" />
            </mesh>
          ))}

          {/* Rooftop Helipad */}
          <group position={[0, height - 8.8 + 1.5, 0]}>
            <mesh position={[0, 0.1, 0]} receiveShadow>
              <cylinderGeometry args={[width * 0.48, width * 0.48, 0.4, 24]} />
              <primitive object={frameMaterial} attach="material" />
            </mesh>
            <mesh position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[width * 0.3, width * 0.36, 24]} />
              <primitive object={accentMaterial} attach="material" />
            </mesh>
            {/* 'H' Marking */}
            <mesh position={[-width * 0.08, 0.33, 0]}>
              <boxGeometry args={[0.25, 0.02, width * 0.24]} />
              <primitive object={accentMaterial} attach="material" />
            </mesh>
            <mesh position={[width * 0.08, 0.33, 0]}>
              <boxGeometry args={[0.25, 0.02, width * 0.24]} />
              <primitive object={accentMaterial} attach="material" />
            </mesh>
            <mesh position={[0, 0.33, 0]}>
              <boxGeometry args={[width * 0.16, 0.02, 0.25]} />
              <primitive object={accentMaterial} attach="material" />
            </mesh>
            {/* Perimeter Hazard Beacons */}
            {[0, 1, 2, 3].map((b) => {
              const bAngle = (b * Math.PI) / 2;
              const br = width * 0.45;
              return (
                <mesh key={b} position={[Math.cos(bAngle) * br, 0.6, Math.sin(bAngle) * br]}>
                  <sphereGeometry args={[0.25, 8, 8]} />
                  <primitive object={warnLightMaterial} attach="material" />
                </mesh>
              );
            })}
          </group>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ARCHETYPE 7: PRISMATIC CRYSTALLINE SHARD                      */}
      {/* ------------------------------------------------------------- */}
      {typeIndex === 7 && (
        <group position={[0, 8.8, 0]}>
          <mesh
            position={[0, (height - 8.8) * 0.48, 0]}
            rotation={[0, Math.PI / 4, 0]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry
              args={[width * 0.18, width * 0.48, (height - 8.8) * 0.96, 4]}
            />
            <primitive object={darkGlassMaterial} attach="material" />
          </mesh>

          {/* Corner Chimes */}
          {[0, 1, 2, 3].map((corner) => {
            const cAngle = (corner * Math.PI) / 2 + Math.PI / 4;
            const rBase = width * 0.48;
            return (
              <mesh
                key={corner}
                position={[
                  Math.cos(cAngle) * rBase * 0.72,
                  (height - 8.8) * 0.48,
                  Math.sin(cAngle) * rBase * 0.72,
                ]}
              >
                <boxGeometry args={[0.3, (height - 8.8) * 0.94, 0.3]} />
                <primitive object={accentMaterial} attach="material" />
              </mesh>
            );
          })}

          {/* Clean Floor Bands */}
          {floorData.map((floor, idx) => (
            <mesh
              key={idx}
              position={[0, floor.y - 8.8, 0]}
              rotation={[0, Math.PI / 4, 0]}
            >
              <cylinderGeometry
                args={[
                  (width * 0.18 + (width * 0.3 * (height - floor.y)) / height) * 1.02,
                  (width * 0.18 + (width * 0.3 * (height - floor.y)) / height) * 1.02,
                  0.4,
                  4,
                ]}
              />
              <primitive object={idx % 2 === 0 ? litWindowMaterial : frameMaterial} attach="material" />
            </mesh>
          ))}

          {/* Spire */}
          {hasSpire && (
            <group position={[0, height - 8.8, 0]}>
              <mesh position={[0, 6, 0]} rotation={[0, Math.PI / 4, 0]}>
                <cylinderGeometry args={[0.1, 0.5, 12, 4]} />
                <primitive object={frameMaterial} attach="material" />
              </mesh>
              <mesh position={[0, 12.5, 0]}>
                <sphereGeometry args={[0.35, 8, 8]} />
                <primitive object={warnLightMaterial} attach="material" />
              </mesh>
            </group>
          )}
        </group>
      )}
    </group>
  );
};
