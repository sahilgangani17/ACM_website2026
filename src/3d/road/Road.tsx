import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CameraRouteEngine } from '../../data/cityRoute';
import { HighwayGantry } from './HighwayGantry';
import { Intersection } from './Intersection';

export const Road: React.FC = () => {
  const routeEngine = useMemo(() => new CameraRouteEngine(), []);

  // ---------------------------------------------------------------------------
  // 1. Procedural Continuous Curved Highway Geometries (Zero gaps or breaks)
  // ---------------------------------------------------------------------------
  const {
    asphaltGeometry,
    leftSidewalkGeometry,
    rightSidewalkGeometry,
    leftNeonRailGeometry,
    rightNeonRailGeometry,
    dashedLinesGeometry,
    gantries,
    intersections,
  } = useMemo(() => {
    const SAMPLES = 200; // High resolution spline cross-sections for buttery curves
    const ROAD_HALF_WIDTH = 12.0; // Total road width = 24
    const SIDEWALK_WIDTH = 5.2;

    const leftRoadPoints: THREE.Vector3[] = [];
    const rightRoadPoints: THREE.Vector3[] = [];
    const leftSidewalkOuter: THREE.Vector3[] = [];
    const rightSidewalkOuter: THREE.Vector3[] = [];
    const leftRailInner: THREE.Vector3[] = [];
    const leftRailOuter: THREE.Vector3[] = [];
    const rightRailInner: THREE.Vector3[] = [];
    const rightRailOuter: THREE.Vector3[] = [];

    // Helper to build a continuous connected quad strip with CCW upward-facing normals
    function createRibbonGeometry(
      ptsLeft: THREE.Vector3[],
      ptsRight: THREE.Vector3[],
      yElevation = 0
    ): THREE.BufferGeometry {
      const count = ptsLeft.length;
      const positions = new Float32Array(count * 2 * 3);
      const uvs = new Float32Array(count * 2 * 2);
      const indices: number[] = [];

      for (let i = 0; i < count; i++) {
        const l = ptsLeft[i];
        const r = ptsRight[i];

        // Ensure Y elevation is firmly at ground level
        positions[i * 6] = l.x;
        positions[i * 6 + 1] = yElevation;
        positions[i * 6 + 2] = l.z;

        positions[i * 6 + 3] = r.x;
        positions[i * 6 + 4] = yElevation;
        positions[i * 6 + 5] = r.z;

        const v = (i / (count - 1)) * 30; // Texture repeat rate
        uvs[i * 4] = 0;
        uvs[i * 4 + 1] = v;
        uvs[i * 4 + 2] = 1;
        uvs[i * 4 + 3] = v;

        if (i < count - 1) {
          const v0 = i * 2;
          const v1 = i * 2 + 1;
          const v2 = (i + 1) * 2;
          const v3 = (i + 1) * 2 + 1;
          // Counter-Clockwise winding order for upward-facing normal
          indices.push(v0, v2, v1);
          indices.push(v1, v2, v3);
        }
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geom.setIndex(indices);
      geom.computeVertexNormals();
      return geom;
    }

    // Sample along the route spline
    const tempCenter = new THREE.Vector3();
    const tempTangent = new THREE.Vector3();
    const tempNormal = new THREE.Vector3();

    // Data for dashed lane divider quad strips
    const dashPositions: number[] = [];
    const dashIndices: number[] = [];
    let dashVertCount = 0;

    function addDashQuad(
      p1: THREE.Vector3,
      p2: THREE.Vector3,
      p3: THREE.Vector3,
      p4: THREE.Vector3,
      yElev = 0.12
    ) {
      dashPositions.push(
        p1.x, yElev, p1.z,
        p2.x, yElev, p2.z,
        p3.x, yElev, p3.z,
        p4.x, yElev, p4.z
      );
      // Counter-clockwise triangle order
      dashIndices.push(
        dashVertCount, dashVertCount + 2, dashVertCount + 1,
        dashVertCount + 1, dashVertCount + 2, dashVertCount + 3
      );
      dashVertCount += 4;
    }

    // Sample positions along spline
    const sampleNodes: Array<{ pos: THREE.Vector3; normal: THREE.Vector3; tangent: THREE.Vector3; yaw: number; t: number }> = [];

    for (let i = 0; i <= SAMPLES; i++) {
      const t = i / SAMPLES;
      routeEngine.getPosition(t, tempCenter);
      routeEngine.getTangent(t, tempTangent);

      // Force center Y to 0 (ground level) instead of camera eye-height (5.5)
      tempCenter.y = 0;

      // Horizontal perpendicular normal pointing to the right shoulder
      tempNormal.set(-tempTangent.z, 0, tempTangent.x).normalize();
      const yaw = Math.atan2(tempTangent.x, tempTangent.z);

      const center = tempCenter.clone();
      const normal = tempNormal.clone();
      const tangent = tempTangent.clone();

      sampleNodes.push({ pos: center, normal, tangent, yaw, t });

      // 1. Asphalt Boulevard Edges
      const leftRoad = center.clone().addScaledVector(normal, -ROAD_HALF_WIDTH);
      const rightRoad = center.clone().addScaledVector(normal, ROAD_HALF_WIDTH);
      leftRoadPoints.push(leftRoad);
      rightRoadPoints.push(rightRoad);

      // 2. Sidewalk Outer Edges
      leftSidewalkOuter.push(center.clone().addScaledVector(normal, -(ROAD_HALF_WIDTH + SIDEWALK_WIDTH)));
      rightSidewalkOuter.push(center.clone().addScaledVector(normal, ROAD_HALF_WIDTH + SIDEWALK_WIDTH));

      // 3. Neon Light Rail Strips along Curbs
      leftRailInner.push(center.clone().addScaledVector(normal, -(ROAD_HALF_WIDTH - 0.05)));
      leftRailOuter.push(center.clone().addScaledVector(normal, -(ROAD_HALF_WIDTH + 0.35)));

      rightRailInner.push(center.clone().addScaledVector(normal, ROAD_HALF_WIDTH - 0.05));
      rightRailOuter.push(center.clone().addScaledVector(normal, ROAD_HALF_WIDTH + 0.35));
    }

    // 4. Generate Dashed Lane Dividers
    for (let i = 0; i < SAMPLES; i++) {
      // Dash pattern: 2 steps active, 2 steps gap
      if (i % 4 < 2) {
        const curr = sampleNodes[i];
        const next = sampleNodes[i + 1];

        // Center line dashed strip
        const c1 = curr.pos.clone().addScaledVector(curr.normal, -0.16);
        const c2 = curr.pos.clone().addScaledVector(curr.normal, 0.16);
        const c3 = next.pos.clone().addScaledVector(next.normal, -0.16);
        const c4 = next.pos.clone().addScaledVector(next.normal, 0.16);
        addDashQuad(c1, c2, c3, c4, 0.12);

        // Left secondary lane divider (between left fast & slow lane)
        const l1 = curr.pos.clone().addScaledVector(curr.normal, -(4.6 + 0.14));
        const l2 = curr.pos.clone().addScaledVector(curr.normal, -(4.6 - 0.14));
        const l3 = next.pos.clone().addScaledVector(next.normal, -(4.6 + 0.14));
        const l4 = next.pos.clone().addScaledVector(next.normal, -(4.6 - 0.14));
        addDashQuad(l1, l2, l3, l4, 0.12);

        // Right secondary lane divider (between right fast & slow lane)
        const r1 = curr.pos.clone().addScaledVector(curr.normal, 4.6 - 0.14);
        const r2 = curr.pos.clone().addScaledVector(curr.normal, 4.6 + 0.14);
        const r3 = next.pos.clone().addScaledVector(next.normal, 4.6 - 0.14);
        const r4 = next.pos.clone().addScaledVector(next.normal, 4.6 + 0.14);
        addDashQuad(r1, r2, r3, r4, 0.12);
      }
    }

    const dashedGeom = new THREE.BufferGeometry();
    dashedGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dashPositions), 3));
    dashedGeom.setIndex(dashIndices);
    dashedGeom.computeVertexNormals();

    // 5. Overhead Highway Gantries placement at strategic transit waypoints
    const gantryConfigs = [
      {
        t: 0.08,
        signText: 'DJSCE ACM // BOULEVARD 01 // WELCOME',
        subText: 'AUTONOMOUS TRANSIT LANE 01-02 ACTIVE // MAX SPEED 80 KPH',
        statusTag: 'GATEWAY',
      },
      {
        t: 0.28,
        signText: 'DISTRICT 02 // CORE TEAM HUB // 250M',
        subText: 'HEAVY AUTOMATED TRAFFIC // MAINTAIN VEHICULAR SPACING',
        statusTag: 'TRANSIT',
      },
      {
        t: 0.48,
        signText: 'DISTRICT 03 // RESEARCH & AI LABS // 200M',
        subText: 'EXPERIMENTAL SHADER & R&D SECTOR // SPEED ADVISORY 60 KPH',
        statusTag: 'ADVISORY',
      },
      {
        t: 0.70,
        signText: 'DISTRICT 04 // FLAGSHIP EVENTS ARENA // 300M',
        subText: 'HACKATHON & GLOBAL SUMMITS CORRIDOR // PREPARE TERMINAL EXIT',
        statusTag: 'FLAGSHIP',
      },
      {
        t: 0.90,
        signText: 'BOULEVARD TERMINUS // ACM CYBER NEXUS',
        subText: 'END OF TRANSIT CORRIDOR // ROTATE TO ORBITAL ELEVATOR',
        statusTag: 'TERMINAL',
      },
    ];

    const gantryList = gantryConfigs.map((cfg) => {
      const pos = routeEngine.getPosition(cfg.t, new THREE.Vector3());
      const tangent = routeEngine.getTangent(cfg.t, new THREE.Vector3());
      const yaw = Math.atan2(tangent.x, tangent.z);
      return {
        id: `gantry-${cfg.t}`,
        position: [pos.x, 0, pos.z] as [number, number, number],
        rotation: [0, yaw, 0] as [number, number, number],
        signText: cfg.signText,
        subText: cfg.subText,
        statusTag: cfg.statusTag,
      };
    });

    // 6. Cross-Street Intersections placement cutting into city blocks
    const intersectionConfigs = [
      { t: 0.24, districtName: 'SOUTH DISTRICT AVENUE' },
      { t: 0.45, districtName: 'CENTRAL LABS CROSSING' },
      { t: 0.65, districtName: 'ARENA SUMMIT CROSSWAY' },
    ];

    const intersectionList = intersectionConfigs.map((cfg) => {
      const pos = routeEngine.getPosition(cfg.t, new THREE.Vector3());
      const tangent = routeEngine.getTangent(cfg.t, new THREE.Vector3());
      const yaw = Math.atan2(tangent.x, tangent.z);
      return {
        id: `intersection-${cfg.t}`,
        position: [pos.x, 0, pos.z] as [number, number, number],
        rotation: [0, yaw, 0] as [number, number, number],
        districtName: cfg.districtName,
      };
    });

    return {
      asphaltGeometry: createRibbonGeometry(leftRoadPoints, rightRoadPoints, 0.05),
      leftSidewalkGeometry: createRibbonGeometry(leftSidewalkOuter, leftRoadPoints, 0.28),
      rightSidewalkGeometry: createRibbonGeometry(rightRoadPoints, rightSidewalkOuter, 0.28),
      leftNeonRailGeometry: createRibbonGeometry(leftRailInner, leftRailOuter, 0.24),
      rightNeonRailGeometry: createRibbonGeometry(rightRailInner, rightRailOuter, 0.24),
      dashedLinesGeometry: dashedGeom,
      gantries: gantryList,
      intersections: intersectionList,
    };
  }, [routeEngine]);

  // ---------------------------------------------------------------------------
  // 2. High-Quality Shared Materials
  // ---------------------------------------------------------------------------
  const materials = useMemo(() => {
    return {
      // Reflective Wet Asphalt Highway
      wetAsphalt: new THREE.MeshStandardMaterial({
        color: '#040814',
        roughness: 0.12, // High specular gloss for reflecting neon lights
        metalness: 0.90,
        side: THREE.DoubleSide,
      }),
      // Solid Sidewalk Curb Stone
      sidewalk: new THREE.MeshStandardMaterial({
        color: '#091122',
        roughness: 0.35,
        metalness: 0.75,
        side: THREE.DoubleSide,
      }),
      // Continuous Glowing Cyan Light Rail
      neonCyan: new THREE.MeshBasicMaterial({
        color: '#00f0ff',
        side: THREE.DoubleSide,
      }),
      // Continuous Glowing Purple Light Rail
      neonPurple: new THREE.MeshBasicMaterial({
        color: '#a855f7',
        side: THREE.DoubleSide,
      }),
      // Illuminated Dashed Lane Dividers
      dashedMarkings: new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        side: THREE.DoubleSide,
      }),
    };
  }, []);

  return (
    <group name="continuous-boulevard-spine">
      {/* 1. Seamless Wet Asphalt Highway Ribbon (100% continuous, zero gaps) */}
      <mesh geometry={asphaltGeometry} material={materials.wetAsphalt} receiveShadow />

      {/* 2. Left Continuous Elevated Sidewalk Curb */}
      <mesh geometry={leftSidewalkGeometry} material={materials.sidewalk} receiveShadow />

      {/* 3. Right Continuous Elevated Sidewalk Curb */}
      <mesh geometry={rightSidewalkGeometry} material={materials.sidewalk} receiveShadow />

      {/* 4. Left Continuous Glowing Cyan Neon Rail */}
      <mesh geometry={leftNeonRailGeometry} material={materials.neonCyan} />

      {/* 5. Right Continuous Glowing Purple Neon Rail */}
      <mesh geometry={rightNeonRailGeometry} material={materials.neonPurple} />

      {/* 6. Center & Secondary Illuminated Dashed Lane Divider Stripes */}
      <mesh geometry={dashedLinesGeometry} material={materials.dashedMarkings} />

      {/* 7. Overhead Highway Gantries with Matrix Signs & Streetlamps */}
      {gantries.map((gantry) => (
        <HighwayGantry
          key={gantry.id}
          position={gantry.position}
          rotation={gantry.rotation}
          signText={gantry.signText}
          subText={gantry.subText}
          statusTag={gantry.statusTag}
        />
      ))}

      {/* 8. Cross-Street Intersections Branching Laterally Into City Blocks */}
      {intersections.map((inter) => (
        <Intersection
          key={inter.id}
          position={inter.position}
          rotation={inter.rotation}
          districtName={inter.districtName}
        />
      ))}
    </group>
  );
};
