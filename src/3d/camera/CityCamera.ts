import * as THREE from 'three';
import { CameraRouteEngine } from '../../data/cityRoute';
import { useCityStore } from '../../state/useCityStore';

export class CityCameraController {
  public routeEngine: CameraRouteEngine;
  
  // Current interpolated state
  public currentPosition: THREE.Vector3 = new THREE.Vector3(0, 5.5, 60);
  public currentTarget: THREE.Vector3 = new THREE.Vector3(0, 4.5, -20);

  // Targets for lerping
  private targetPosition: THREE.Vector3 = new THREE.Vector3();
  private targetLookAt: THREE.Vector3 = new THREE.Vector3();

  // Focus mode camera parameters
  private focusStartPosition: THREE.Vector3 = new THREE.Vector3();
  private focusStartTarget: THREE.Vector3 = new THREE.Vector3();
  private focusTargetPosition: THREE.Vector3 = new THREE.Vector3();
  private focusTargetLookAt: THREE.Vector3 = new THREE.Vector3();
  private focusProgress: number = 0; // 0 to 1 transition progress
  private activeFocusDestId: string | null = null;

  // Mouse parallax offset (very subtle)
  private mouseOffset: THREE.Vector2 = new THREE.Vector2();
  private targetMouseOffset: THREE.Vector2 = new THREE.Vector2();

  // Internal high-precision camera damping state
  private internalDampedProgress: number = 0.0;
  private lastSyncedProgress: number = 0.0;

  constructor() {
    this.routeEngine = new CameraRouteEngine();
    
    // Bind mouse listener for subtle parallax
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', this.handleMouseMove);
    }
  }

  private handleMouseMove = (e: MouseEvent) => {
    const reducedMotion = useCityStore.getState().reducedMotion;
    if (reducedMotion) return;

    // Normalized mouse (-1 to 1)
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.targetMouseOffset.set(x * 1.5, y * 0.8);
  };

  public update(camera: THREE.PerspectiveCamera, delta: number) {
    const store = useCityStore.getState();
    const mode = store.cityMode;
    const targetScroll = store.scrollProgress;

    // Smooth damp scroll progress with weight (inertia)
    const dampFactor = store.reducedMotion ? 8.0 : 3.5;
    this.internalDampedProgress = THREE.MathUtils.damp(
      this.internalDampedProgress,
      targetScroll,
      dampFactor,
      delta
    );

    // Only sync to Zustand store when change is meaningful to eliminate 120Hz React re-render thrashing
    if (
      Math.abs(this.internalDampedProgress - this.lastSyncedProgress) > 0.002 ||
      (this.internalDampedProgress < 0.002 && this.lastSyncedProgress !== 0) ||
      (this.internalDampedProgress > 0.998 && this.lastSyncedProgress !== 1)
    ) {
      this.lastSyncedProgress = this.internalDampedProgress;
      store.setDampedProgress(this.internalDampedProgress);
    }

    // Damp mouse parallax
    this.mouseOffset.lerp(this.targetMouseOffset, delta * 3);

    if (mode === 'EXPLORATION' || mode === 'DESTINATION_SELECTED') {
      // 1. Exploration Mode: Follow Catmull-Rom spline with look-ahead curve anticipation
      this.routeEngine.getPosition(this.internalDampedProgress, this.targetPosition);
      this.routeEngine.getLookAt(this.internalDampedProgress, 0.05, this.targetLookAt);

      // Add subtle mouse parallax to target
      this.targetLookAt.x += this.mouseOffset.x * 1.2;
      this.targetLookAt.y += this.mouseOffset.y * 0.8;

      // Smoothly move current position & target
      const lerpSpeed = delta * 4.0;
      this.currentPosition.lerp(this.targetPosition, lerpSpeed);
      this.currentTarget.lerp(this.targetLookAt, lerpSpeed);

      this.focusProgress = 0;
      this.activeFocusDestId = null;
    } else if (mode === 'DESTINATION_FOCUS') {
      // 2. Destination Focus Mode: Cinematic 3/4 hero camera glide focusing on building entrance
      const activeDest = store.activeDestination;
      if (activeDest) {
        // Calculate focus landmark entrance position in world coordinates
        const landmarkWorldPos = this.routeEngine.getSidePosition(
          activeDest.routeProgress,
          activeDest.side,
          activeDest.lateralOffset,
          activeDest.verticalOffset || 0,
          new THREE.Vector3()
        );

        // Building orientation angle (PI / 2.5 = 72 deg facing road)
        const facingAngle = activeDest.side === 'left' ? Math.PI / 2.5 : -Math.PI / 2.5;
        const frontDir = new THREE.Vector3(Math.sin(facingAngle), 0, Math.cos(facingAngle));

        // True 3/4 architectural hero perspective:
        // Position camera back on boulevard curb (58 units out) and upstream along road (28 units)
        // with elevated vantage (22 units) to frame the full monumental building facade
        const camOutDist = 58.0;
        const camZOffset = 28.0;
        const camElevation = 22.0;
        this.focusTargetPosition.copy(landmarkWorldPos)
          .addScaledVector(frontDir, camOutDist)
          .add(new THREE.Vector3(0, 0, camZOffset))
          .setY(camElevation);

        // Look at center-mid of building & glowing facade, offset away from the right-side HUD panel
        const camRight = new THREE.Vector3(frontDir.z, 0, -frontDir.x);
        this.focusTargetLookAt.copy(landmarkWorldPos)
          .add(new THREE.Vector3(0, 24.0, 0))
          .addScaledVector(camRight, 4.0);

        // Continuous smooth zoom-in glide
        const zoomLerp = delta * 3.5;
        this.currentPosition.lerp(this.focusTargetPosition, zoomLerp);
        this.currentTarget.lerp(this.focusTargetLookAt, zoomLerp);
      }
    } else if (mode === 'RETURNING_TO_CITY') {
      this.activeFocusDestId = null;
      this.focusProgress = 0;

      // 3. Return to City: Interpolate smoothly back from building framing to saved road progress
      const targetRouteProgress = store.previousScrollProgress;
      this.routeEngine.getPosition(targetRouteProgress, this.targetPosition);
      this.routeEngine.getLookAt(targetRouteProgress, 0.05, this.targetLookAt);

      const returnLerp = delta * 3.5;
      this.currentPosition.lerp(this.targetPosition, returnLerp);
      this.currentTarget.lerp(this.targetLookAt, returnLerp);

      // Check if camera has arrived back near the road
      if (this.currentPosition.distanceTo(this.targetPosition) < 0.8) {
        store.setCityMode('EXPLORATION');
        store.setScrollProgress(targetRouteProgress);
      }
    }

    // Apply camera transformation
    camera.position.copy(this.currentPosition);
    camera.lookAt(this.currentTarget);
  }

  public dispose() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.handleMouseMove);
    }
  }
}
