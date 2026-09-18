import React, { useMemo } from 'react';
import { Building } from './Building';
import { Skyscraper } from './Skyscraper';

interface CityBlockProps {
  position: [number, number, number];
  side: 'left' | 'right';
  seed?: number;
}

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
    }> = [];

    const colors = ['#081020', '#0a1428', '#0c1830', '#060d1b'];
    const accents = ['#00f0ff', '#3b82f6', '#a855f7', '#06b6d4'];

    // Row 1: Foreground / Midground buildings (set back from road)
    for (let i = 0; i < 4; i++) {
      const zOffset = -60 + i * 40;
      const xOffset = sideMultiplier * (45 + (i % 2) * 12);
      const h = 45 + ((i * 17 + seed) % 40);
      const w = 18 + ((i * 7) % 8);

      list.push({
        id: `b-row1-${i}`,
        offset: [xOffset, 0, zOffset],
        width: w,
        height: h,
        depth: 20,
        color: colors[i % colors.length],
        accentColor: accents[(i + seed) % accents.length],
      });
    }

    // Row 2: Deep Background Skyscrapers
    for (let i = 0; i < 3; i++) {
      const zOffset = -70 + i * 55;
      const xOffset = sideMultiplier * (90 + (i % 2) * 20);
      const h = 110 + ((i * 29 + seed) % 60);

      list.push({
        id: `sky-row2-${i}`,
        offset: [xOffset, 0, zOffset],
        width: 30,
        height: h,
        depth: 30,
        color: '#040812',
        accentColor: accents[i % accents.length],
        isSkyscraper: true,
      });
    }

    return list;
  }, [sideMultiplier, seed]);

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
          />
        ) : (
          <Building
            key={b.id}
            position={b.offset}
            width={b.width}
            height={b.height}
            depth={b.depth}
            color={b.color}
            accentColor={b.accentColor}
            hasSpire={true}
          />
        )
      )}
    </group>
  );
};
