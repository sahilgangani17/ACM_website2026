import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import landGeoJson from '../../data/ne_110m_land.json';
import { useWorldStore } from '../state/useWorldStore';

interface RotatingEarthProps {
  opacity?: number;
  className?: string;
}

interface DotData {
  lng: number;
  lat: number;
}

// Global Hubs connecting to Mumbai
const GLOBAL_HUBS: Array<{ name: string; coords: [number, number] }> = [
  { name: 'San Francisco', coords: [-122.4194, 37.7749] },
  { name: 'London', coords: [-0.1276, 51.5074] },
  { name: 'Tokyo', coords: [139.6917, 35.6895] },
  { name: 'Singapore', coords: [103.8198, 1.3521] },
  { name: 'Sydney', coords: [151.2093, -33.8688] },
  { name: 'Frankfurt', coords: [8.6821, 50.1109] },
];

const MUMBAI_COORDS: [number, number] = [72.8777, 19.0760]; // [lng, lat]

export const RotatingEarth: React.FC<RotatingEarthProps> = ({
  opacity = 1.0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const worldMode = useWorldStore((s) => s.worldMode);
  const worldProgress = useWorldStore((s) => s.worldProgress);
  const isWarping = useWorldStore((s) => s.isWarping);

  // Mumbai badge 2D screen coordinates
  const [mumbaiScreenPos, setMumbaiScreenPos] = useState<{ x: number; y: number; visible: boolean } | null>(null);

  // Point-in-polygon helper
  const pointInPolygon = useCallback((point: [number, number], polygon: number[][]): boolean => {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }, []);

  const pointInFeature = useCallback((point: [number, number], feature: any): boolean => {
    const geometry = feature.geometry;
    if (!geometry) return false;

    if (geometry.type === 'Polygon') {
      const coordinates = geometry.coordinates;
      if (!pointInPolygon(point, coordinates[0])) return false;
      for (let i = 1; i < coordinates.length; i++) {
        if (pointInPolygon(point, coordinates[i])) return false;
      }
      return true;
    } else if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates) {
        if (pointInPolygon(point, polygon[0])) {
          let inHole = false;
          for (let i = 1; i < polygon.length; i++) {
            if (pointInPolygon(point, polygon[i])) {
              inHole = true;
              break;
            }
          }
          if (!inHole) return true;
        }
      }
      return false;
    }
    return false;
  }, [pointInPolygon]);

  // Pre-generate halftone dots from local land GeoJSON
  const allDots = useMemo<DotData[]>(() => {
    const dots: DotData[] = [];
    const dotSpacing = 16;
    const stepSize = dotSpacing * 0.11; // Good balance of density & 60fps performance

    (landGeoJson as any).features.forEach((feature: any) => {
      const bounds = d3.geoBounds(feature);
      const [[minLng, minLat], [maxLng, maxLat]] = bounds;

      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const pt: [number, number] = [lng, lat];
          if (pointInFeature(pt, feature)) {
            dots.push({ lng, lat });
          }
        }
      }
    });

    return dots;
  }, [pointInFeature]);

  // Great-circle connection arc geometries
  const connectionArcs = useMemo(() => {
    return GLOBAL_HUBS.map((hub) => {
      const interpolator = d3.geoInterpolate(hub.coords, MUMBAI_COORDS);
      const points: [number, number][] = [];
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        points.push(interpolator(i / steps));
      }
      return {
        name: hub.name,
        feature: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: points,
          },
        },
      };
    });
  }, []);

  // Active state refs for animation loop
  const baseYawRef = useRef<number>(-35);
  const basePitchRef = useRef<number>(-12);
  const smoothProgressRef = useRef<number>(0);
  const autoRotateRef = useRef<boolean>(true);
  const isDraggingRef = useRef<boolean>(false);
  const pulseAnimRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    let animFrameId: number;

    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.resetTransform();
      context.scale(dpr, dpr);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Graticule generator
    const graticule = d3.geoGraticule().step([20, 20]);
    const graticuleGeom = graticule();

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Position globe on the right on medium/large screens (matching reference screenshot)
      const isDesktop = width >= 1024;
      const isTablet = width >= 768 && width < 1024;
      const defaultCenterX = isDesktop ? width * 0.77 : (isTablet ? width * 0.70 : width / 2);
      const defaultCenterY = height * 0.52;
      const baseRadius = Math.min(width * 0.40, height * 0.47);

      // 1. Smooth bidirectional progress damping (silky cinematic glide)
      const rawProgress = useWorldStore.getState().worldProgress;
      smoothProgressRef.current = d3.interpolateNumber(
        smoothProgressRef.current,
        rawProgress
      )(Math.min(1.0, dt * 3.2));
      const p = smoothProgressRef.current;

      // 2. Fully reversible rotation interpolation
      const targetMumbaiYaw = -MUMBAI_COORDS[0]; // -72.8777
      const targetMumbaiPitch = -MUMBAI_COORDS[1]; // -19.0760

      // Only auto-rotate base orientation when near top and not dragging
      if (!isDraggingRef.current && p < 0.06 && autoRotateRef.current) {
        baseYawRef.current = (baseYawRef.current + dt * 6.0) % 360;
      }

      // Smooth focus factor from 0.0 (full globe view) to 1.0 (Mumbai focus)
      const focusT = Math.min(1.0, Math.max(0, p / 0.55));
      const easeFocus = d3.easeCubicInOut(focusT);

      // Shortest angular path from current baseYaw to targetMumbaiYaw
      let diffYaw = (targetMumbaiYaw - baseYawRef.current) % 360;
      if (diffYaw > 180) diffYaw -= 360;
      if (diffYaw < -180) diffYaw += 360;

      // Active yaw and pitch: 100% reversible when scrolling up or down
      const currentYaw = baseYawRef.current + diffYaw * easeFocus;
      const currentPitch = d3.interpolateNumber(basePitchRef.current, targetMumbaiPitch)(easeFocus);

      // 3. Smooth reversible zoom (1.0 at p=0 -> 2.3 at Mumbai focus)
      const currentRadius = baseRadius * (1.0 + easeFocus * 1.35);

      // 4. Smooth reversible center translation
      const targetX = isDesktop ? width * 0.72 : (isTablet ? width * 0.66 : width / 2);
      const currentCenterX = d3.interpolateNumber(defaultCenterX, targetX)(easeFocus);
      const currentCenterY = defaultCenterY;

      const projection = d3
        .geoOrthographic()
        .scale(currentRadius)
        .translate([currentCenterX, currentCenterY])
        .clipAngle(90)
        .rotate([currentYaw, currentPitch]);

      const path = d3.geoPath().projection(projection).context(context);

      // Clear frame
      context.clearRect(0, 0, width, height);

      const scaleFactor = currentRadius / baseRadius;

      // 2. Draw Outer Atmospheric Corona Rim Glow (Reference Match)
      const glowGradient = context.createRadialGradient(
        currentCenterX,
        currentCenterY,
        currentRadius * 0.94,
        currentCenterX,
        currentCenterY,
        currentRadius * 1.18
      );
      glowGradient.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
      glowGradient.addColorStop(0.3, 'rgba(56, 189, 248, 0.25)');
      glowGradient.addColorStop(0.7, 'rgba(14, 116, 144, 0.10)');
      glowGradient.addColorStop(1, 'rgba(2, 6, 18, 0)');

      context.beginPath();
      context.arc(currentCenterX, currentCenterY, currentRadius * 1.18, 0, 2 * Math.PI);
      context.fillStyle = glowGradient;
      context.fill();

      // Sharp outer neon atmosphere boundary ring
      context.beginPath();
      context.arc(currentCenterX, currentCenterY, currentRadius * 1.008, 0, 2 * Math.PI);
      context.strokeStyle = 'rgba(0, 240, 255, 0.75)';
      context.lineWidth = 2.5 * scaleFactor;
      context.shadowColor = '#00f0ff';
      context.shadowBlur = 15;
      context.stroke();
      context.shadowBlur = 0;

      // 3. Draw Dark Obsidian Ocean Body
      context.beginPath();
      context.arc(currentCenterX, currentCenterY, currentRadius, 0, 2 * Math.PI);
      context.fillStyle = '#020612';
      context.fill();
      context.strokeStyle = 'rgba(0, 240, 255, 0.45)';
      context.lineWidth = 1.5 * Math.max(1, scaleFactor * 0.8);
      context.stroke();

      // 4. Draw Graticule Coordinate Rings
      context.beginPath();
      path(graticuleGeom as any);
      context.strokeStyle = 'rgba(51, 65, 85, 0.35)';
      context.lineWidth = 0.8;
      context.stroke();

      // 5. Draw Landmass Boundaries
      context.beginPath();
      (landGeoJson as any).features.forEach((feature: any) => {
        path(feature);
      });
      context.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      context.lineWidth = 1.1 * scaleFactor;
      context.stroke();

      // 6. Draw Halftone Digital Land Matrix Dots
      allDots.forEach((dot, idx) => {
        const projected = projection([dot.lng, dot.lat]);
        if (
          projected &&
          projected[0] >= -20 &&
          projected[0] <= width + 20 &&
          projected[1] >= -20 &&
          projected[1] <= height + 20
        ) {
          context.beginPath();
          const dotRadius = (idx % 4 === 0 ? 1.4 : 1.0) * scaleFactor;
          context.arc(projected[0], projected[1], dotRadius, 0, 2 * Math.PI);

          // Subtle variation in dot hue (cyan to slate)
          if (idx % 7 === 0) {
            context.fillStyle = '#00f0ff';
          } else if (idx % 3 === 0) {
            context.fillStyle = '#38bdf8';
          } else {
            context.fillStyle = '#94a3b8';
          }
          context.fill();
        }
      });

      // 7. Draw Global Computing Network Arcs to Mumbai
      connectionArcs.forEach((arc) => {
        context.beginPath();
        path(arc.feature as any);
        context.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        context.lineWidth = 1.2 * scaleFactor;
        context.setLineDash([4, 6]);
        context.stroke();
        context.setLineDash([]);
      });

      // 8. Draw Mumbai Beacon & Pulse Animation
      const mumbaiProj = projection(MUMBAI_COORDS);
      const centerCoords: [number, number] = [-currentYaw, -currentPitch];
      const isMumbaiFacing = d3.geoDistance(MUMBAI_COORDS, centerCoords) < Math.PI / 2;

      pulseAnimRef.current = (pulseAnimRef.current + dt * 1.6) % 1;
      const pulse = pulseAnimRef.current;

      if (mumbaiProj && isMumbaiFacing) {
        const [mx, my] = mumbaiProj;

        // Expanding Radar Ring
        const ringRadius = (10 + pulse * 32) * scaleFactor;
        const ringAlpha = (1 - pulse) * 0.8;
        context.beginPath();
        context.arc(mx, my, ringRadius, 0, 2 * Math.PI);
        context.strokeStyle = `rgba(0, 240, 255, ${ringAlpha})`;
        context.lineWidth = 1.5;
        context.stroke();

        // Inner Core Pulse Ring
        context.beginPath();
        context.arc(mx, my, 6 * scaleFactor, 0, 2 * Math.PI);
        context.fillStyle = '#00f0ff';
        context.shadowColor = '#00f0ff';
        context.shadowBlur = 12;
        context.fill();
        context.shadowBlur = 0;

        // Bright Center Dot
        context.beginPath();
        context.arc(mx, my, 2.5 * scaleFactor, 0, 2 * Math.PI);
        context.fillStyle = '#ffffff';
        context.fill();

        setMumbaiScreenPos({ x: mx, y: my, visible: true });
      } else {
        setMumbaiScreenPos((prev) => (prev?.visible ? { ...prev, visible: false } : prev));
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    // Mouse drag interaction
    let startX = 0;
    let startY = 0;
    let startRot: [number, number] = [0, 0];

    const onMouseDown = (e: MouseEvent) => {
      // Only drag with left mouse button
      if (e.button !== 0) return;
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      startX = e.clientX;
      startY = e.clientY;
      startRot = [baseYawRef.current, basePitchRef.current];
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const sensitivity = 0.35;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      baseYawRef.current = (startRot[0] + dx * sensitivity) % 360;
      basePitchRef.current = Math.max(-50, Math.min(50, startRot[1] - dy * sensitivity));
    };

    const onMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setTimeout(() => {
          autoRotateRef.current = true;
        }, 1200);
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', updateDimensions);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [allDots, connectionArcs]);

  // If in pure city mode, do not render canvas
  if (worldMode === 'CITY_EXPLORATION' && !isWarping) {
    return null;
  }

  const isFocal = worldProgress >= 0.25;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-auto transition-opacity duration-700 select-none ${className}`}
      style={{ opacity }}
    >
      {/* 1. High Performance 2D Orthographic D3 Earth Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* 2. Spatial Mumbai Callout Pin & Badge */}
      {mumbaiScreenPos && mumbaiScreenPos.visible && opacity > 0.3 && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-300"
          style={{
            left: `${mumbaiScreenPos.x}px`,
            top: `${mumbaiScreenPos.y - 12}px`,
          }}
        >
          <div
            className={`flex flex-col items-center transition-all duration-500 transform ${
              isFocal ? 'scale-100 opacity-100' : 'scale-90 opacity-80'
            }`}
          >
            {/* Glassmorphic Pill */}
            <div className="px-3.5 py-1.5 rounded-lg bg-slate-950/90 border border-cyan-400/60 backdrop-blur-md shadow-glow-cyan flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-extrabold text-xs text-white tracking-wider uppercase">
                    MUMBAI NODE
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-cyan-950/90 text-cyan-300 rounded border border-cyan-500/40 font-bold">
                    DJ SANGHVI ACM
                  </span>
                </div>
                <span className="text-[9px] font-mono text-cyan-400/80 tracking-wider">
                  19.0760° N, 72.8777° E
                </span>
              </div>
            </div>

            {/* Downward Pointer Line */}
            <div className="w-0.5 h-4 bg-gradient-to-b from-cyan-400 to-transparent" />
          </div>
        </div>
      )}

      {/* 3. Subtle Bottom Hint */}
      <div className="absolute bottom-6 left-6 pointer-events-none hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/70 border border-slate-800/80 px-3 py-1.5 rounded-lg backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>Drag to rotate • Scroll to zoom Mumbai & enter ACM City</span>
      </div>
    </div>
  );
};
