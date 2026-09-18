import * as THREE from 'three';

export interface RouteWaypoint {
  progress: number;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov?: number;
}

// 3D Control Waypoints for the Main Boulevard Exploration Route
// The road extends from z = 50 down to z = -900 with elegant architectural curves.
export const ROUTE_WAYPOINTS: RouteWaypoint[] = [
  {
    progress: 0.00,
    position: new THREE.Vector3(0, 5.5, 60),
    lookAt: new THREE.Vector3(0, 4.5, -20),
    fov: 55,
  },
  {
    progress: 0.15,
    position: new THREE.Vector3(-2.5, 5.2, -80),
    lookAt: new THREE.Vector3(-4, 4.8, -160),
    fov: 55,
  },
  {
    progress: 0.35,
    position: new THREE.Vector3(3.0, 5.8, -240),
    lookAt: new THREE.Vector3(5, 5.0, -320),
    fov: 55,
  },
  {
    progress: 0.55,
    position: new THREE.Vector3(-3.5, 5.4, -420),
    lookAt: new THREE.Vector3(-5, 4.6, -500),
    fov: 55,
  },
  {
    progress: 0.75,
    position: new THREE.Vector3(2.0, 6.0, -600),
    lookAt: new THREE.Vector3(3, 5.2, -680),
    fov: 55,
  },
  {
    progress: 1.00,
    position: new THREE.Vector3(0, 6.5, -820),
    lookAt: new THREE.Vector3(0, 5.5, -920),
    fov: 50,
  }
];

// Helper to evaluate 3D spline curves from the waypoints
export class CameraRouteEngine {
  public positionCurve: THREE.CatmullRomCurve3;
  public lookAtCurve: THREE.CatmullRomCurve3;

  constructor(waypoints: RouteWaypoint[] = ROUTE_WAYPOINTS) {
    const posPoints = waypoints.map(w => w.position);
    const targetPoints = waypoints.map(w => w.lookAt);

    this.positionCurve = new THREE.CatmullRomCurve3(posPoints, false, 'centripetal', 0.5);
    this.lookAtCurve = new THREE.CatmullRomCurve3(targetPoints, false, 'centripetal', 0.5);
  }

  /**
   * Sample camera position along the route at progress t (0.0 to 1.0)
   */
  public getPosition(t: number, target: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
    const clampedT = THREE.MathUtils.clamp(t, 0, 1);
    this.positionCurve.getPoint(clampedT, target);
    return target;
  }

  /**
   * Sample camera target along the route at progress t (0.0 to 1.0) with look-ahead anticipation
   */
  public getLookAt(t: number, lookAheadAmount = 0.04, target: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
    const clampedT = THREE.MathUtils.clamp(t + lookAheadAmount, 0, 1);
    this.lookAtCurve.getPoint(clampedT, target);
    return target;
  }

  /**
   * Calculate tangent vector of the road at progress t to align vehicles or camera rotation
   */
  public getTangent(t: number, target: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
    const clampedT = THREE.MathUtils.clamp(t, 0, 1);
    this.positionCurve.getTangent(clampedT, target);
    return target;
  }

  /**
   * Given route progress t, calculate world position of a landmark placed on the side of the road
   */
  public getSidePosition(
    t: number,
    side: 'left' | 'right',
    offset: number,
    elevation = 0,
    target: THREE.Vector3 = new THREE.Vector3()
  ): THREE.Vector3 {
    this.getPosition(t, target);
    const tangent = this.getTangent(t, new THREE.Vector3());
    
    // Perpendicular vector to road (pointing right)
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const directionMultiplier = side === 'right' ? 1 : -1;

    target.x += normal.x * offset * directionMultiplier;
    target.z += normal.z * offset * directionMultiplier;
    target.y += elevation;

    return target;
  }
}
