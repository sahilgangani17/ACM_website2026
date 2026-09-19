import React, { useMemo } from 'react';
import { Building } from './Building';
import { Skyscraper } from './Skyscraper';
import { CyberSignage } from './CyberSignage';
import { Skybridge } from './Skybridge';

interface CityBlockProps {
  position: [number, number, number];
  side: 'left' | 'right';
  seed?: number;
}

const SIGNAGE_PRESETS = [
  { tag: 'ACM DJSCE', headline: 'CODE THE FUTURE', subtext: 'INNOVATION & AI RESEARCH', color: '#00f0ff' },
  { tag: 'GLOBAL SUMMIT', headline: 'NEXT GEN COMPUTING', subtext: 'TECH // WORKSHOPS // SUMMITS', color: '#a855f7' },
  { tag: 'RESEARCH LAB', headline: 'QUANTUM HORIZONS', subtext: 'DEEP LEARNING & SHADERS', color: '#3b82f6' },
  { tag: 'HACKATHON', headline: 'BUILD. SHIP. WIN.', subtext: 'DJSCE ANNUAL FLAGSHIP EVENT', color: '#10b981' },
];

export const CityBlock: React.FC<CityBlockProps> = ({
  position,
  side,
  seed = 42,
}) => {
  const sideMultiplier = side === 'right' ? 1 : -1;

  // Simple pseudo-random generator based on seed
  const buildings = useMemo(() => {
    const list: Array<{
      id: string;
      offset: [number, number, number];
      width: number;
      height: number;
      depth: number;
      color: string;
      accentColor: string;
      isSkyscraper?: boolean;
      archetype: number;
      rotationY?: number;
    }> = [];

    const colors = ['#081020', '#0a1428', '#0c1830', '#060d1b'];
    const accents = ['#00f0ff', '#3b82f6', '#a855f7', '#06b6d4', '#10b981'];

    // Landmark destination corridors to keep clear of foreground obstructions
    // Left side: ABOUT US (~ -104), RESEARCH (~ -447)
    // Right side: TEAM (~ -249), EVENTS (~ -644)
    const destZonesLeft = [-104, -447];
    const destZonesRight = [-249, -644];
    const activeZones = side === 'left' ? destZonesLeft : destZonesRight;

    // Row 1: Foreground / Midground buildings (set back from road)
    // Distributed among 8 distinct architectural typologies
    for (let i = 0; i < 4; i++) {
      const zOffset = -60 + i * 40;
      const worldZ = position[2] + zOffset;

      // Check if this building lies in front of or adjacent to a landmark destination
      const nearLandmark = activeZones.some(destZ => Math.abs(worldZ - destZ) < 75);

      // If near a landmark, skip foreground placement so the destination has an expansive unobstructed civic plaza
      if (nearLandmark) {
        continue;
      }

      const xOffset = sideMultiplier * (45 + (i % 2) * 12);
      const h = 48 + ((i * 17 + seed) % 42);
      const w = 20 + ((i * 7) % 8);
      // Stagger archetypes so neighboring buildings never share the same form
      const archType = (i * 3 + seed) % 8;
      const rotY = ((i % 2 === 0 ? 0.08 : -0.08) * sideMultiplier);

      list.push({
        id: `b-row1-${i}`,
        offset: [xOffset, 0, zOffset],
        width: w,
        height: h,
        depth: 22,
        color: colors[i % colors.length],
        accentColor: accents[(i + seed) % accents.length],
        archetype: archType,
        rotationY: rotY,
      });
    }

    // Row 2: Deep Background Skyscrapers
    // Distributed among 4 mega-scale architectural types
    for (let i = 0; i < 3; i++) {
      const zOffset = -70 + i * 55;
      const xOffset = sideMultiplier * (90 + (i % 2) * 20);
      const h = 120 + ((i * 29 + seed) % 65);
      const megaArchType = (i * 2 + seed) % 4;

      list.push({
        id: `sky-row2-${i}`,
        offset: [xOffset, 0, zOffset],
        width: 32,
        height: h,
        depth: 32,
        color: '#040812',
        accentColor: accents[(i + 1) % accents.length],
        isSkyscraper: true,
        archetype: megaArchType,
      });
    }

    return list;
  }, [sideMultiplier, seed]);

  // Cyber signage billboard on first building facing boulevard
  const signagePreset = SIGNAGE_PRESETS[seed % SIGNAGE_PRESETS.length];
  const signageY = 22;
  const signageX = sideMultiplier * 33; // Near the front of building facing road
  const signageRotY = side === 'left' ? Math.PI / 2 : -Math.PI / 2;

  // Skybridge connecting building 0 and building 1 in row 1
  const b0 = buildings[0]?.offset;
  const b1 = buildings[1]?.offset;
  const hasBridge = b0 && b1 && seed % 2 === 0;

  return (
    <group position={position}>
      {buildings.map((b) =>
        b.isSkyscraper ? (
          <Skyscraper
            key={b.id}
            position={b.offset}
            height={b.height}
            width={b.width}
            color={b.color}
            glowColor={b.accentColor}
            archetype={b.archetype}
          />
        ) : (
          <Building
            key={b.id}
            position={b.offset}
            rotation={[0, b.rotationY || 0, 0]}
            width={b.width}
            height={b.height}
            depth={b.depth}
            color={b.color}
            accentColor={b.accentColor}
            hasSpire={true}
            archetype={b.archetype}
          />
        )
      )}

      {/* Elevated Cyberpunk Skybridge between adjacent towers */}
      {hasBridge && (
        <Skybridge
          startPos={[b0[0], 28, b0[2]]}
          endPos={[b1[0], 28, b1[2]]}
          themeColor={signagePreset.color}
        />
      )}

      {/* Street-facing Cyber Billboard Signage */}
      <CyberSignage
        position={[signageX, signageY, -40]}
        rotation={[0, signageRotY, 0]}
        tag={signagePreset.tag}
        headline={signagePreset.headline}
        subtext={signagePreset.subtext}
        themeColor={signagePreset.color}
        scale={0.9}
      />
    </group>
  );
};
