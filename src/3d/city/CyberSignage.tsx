import React, { useMemo } from 'react';
import * as THREE from 'three';

interface CyberSignageProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  tag: string;
  headline: string;
  subtext: string;
  themeColor?: string;
  scale?: number;
}

// Global texture cache to prevent creating redundant textures for identical signs
const textureCache = new Map<string, THREE.CanvasTexture>();

function createSignTexture(tag: string, headline: string, subtext: string, color: string): THREE.CanvasTexture {
  const cacheKey = `${tag}_${headline}_${subtext}_${color}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. High-Tech Dark Cyber Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#020612');
    bgGrad.addColorStop(1, '#071326');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Horizontal Matrix Scanlines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }

    // 3. Neon Cyber Inset Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    // Corner Accents
    ctx.fillStyle = color;
    const cornerSize = 14;
    ctx.fillRect(8, 8, cornerSize, 4);
    ctx.fillRect(8, 8, 4, cornerSize);
    ctx.fillRect(width - 8 - cornerSize, 8, cornerSize, 4);
    ctx.fillRect(width - 12, 8, 4, cornerSize);
    ctx.fillRect(8, height - 12, cornerSize, 4);
    ctx.fillRect(8, height - 8 - cornerSize, 4, cornerSize);
    ctx.fillRect(width - 8 - cornerSize, height - 12, cornerSize, 4);
    ctx.fillRect(width - 12, height - 8 - cornerSize, 4, cornerSize);

    // 4. Header Badge Pill (Tag)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(24, 24, 150, 32);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(24, 24, 150, 32);

    ctx.fillStyle = color;
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag.toUpperCase(), 34, 40);

    // System Status indicator
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(width - 90, 40, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('ONLINE', width - 78, 40);

    // 5. Bold Architectural Headline Slogan
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px "Space Grotesk", "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(headline.toUpperCase(), 26, 115);

    // Reset shadow for crisp subtext
    ctx.shadowBlur = 0;

    // 6. Subtext / Mission Line
    ctx.fillStyle = color;
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.letterSpacing = '3px';
    ctx.fillText(subtext.toUpperCase(), 26, 165);

    // 7. Footer Divider & Digital Barcode Telemetry
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(24, 205);
    ctx.lineTo(width - 24, 205);
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('DJSCE ACM CHAPTER // NODE #6021', 26, 228);

    // Digital Barcode
    ctx.textAlign = 'right';
    ctx.font = '14px monospace';
    ctx.fillText('|||||| | || ||||| | |||', width - 26, 228);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  textureCache.set(cacheKey, texture);
  return texture;
}

export const CyberSignage: React.FC<CyberSignageProps> = ({
  position,
  rotation = [0, 0, 0],
  tag = 'ACM DJSCE',
  headline = 'CODE THE FUTURE',
  subtext = 'COMPUTING FOR HUMANITY',
  themeColor = '#00f0ff',
  scale = 1.0,
}) => {
  const colorObj = useMemo(() => new THREE.Color(themeColor), [themeColor]);

  // High-performance canvas texture (100% native WebGL, zero DOM overhead)
  const signTexture = useMemo(
    () => createSignTexture(tag, headline, subtext, themeColor),
    [tag, headline, subtext, themeColor]
  );

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Structural Support Truss */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[14.4, 6.4, 0.4]} />
        <meshStandardMaterial color="#050b16" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Outer Neon Border */}
      <mesh position={[0, 3.25, 0]}>
        <boxGeometry args={[14.6, 0.15, 0.15]} />
        <meshBasicMaterial color={colorObj} />
      </mesh>
      <mesh position={[0, -3.25, 0]}>
        <boxGeometry args={[14.6, 0.15, 0.15]} />
        <meshBasicMaterial color={colorObj} />
      </mesh>
      <mesh position={[-7.25, 0, 0]}>
        <boxGeometry args={[0.15, 6.4, 0.15]} />
        <meshBasicMaterial color={colorObj} />
      </mesh>
      <mesh position={[7.25, 0, 0]}>
        <boxGeometry args={[0.15, 6.4, 0.15]} />
        <meshBasicMaterial color={colorObj} />
      </mesh>

      {/* Screen Backdrop with Emissive Native Texture */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[14.2, 6.2]} />
        <meshBasicMaterial map={signTexture} />
      </mesh>

      {/* Ambient Billboard Glow Light */}
      <pointLight position={[0, 0, 1.8]} color={themeColor} intensity={2.5} distance={15} />
    </group>
  );
};
