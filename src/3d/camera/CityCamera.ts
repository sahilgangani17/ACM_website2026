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

  // Mouse parallax offset (very subtle)
  private mouseOffset: THREE.Vector2 = new THREE.Vector2();
  private targetMouseOffset: THREE.Vector2 = new THREE.Vector2();

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
    const currentDamped = store.dampedProgress;

    // Smooth damp scroll progress with weight (inertia)
    const dampFactor = store.reducedMotion ? 8.0 : 3.5;
    const newDampedProgress = THREE.MathUtils.damp(currentDamped, targetScroll, dampFactor, delta);
    store.setDampedProgress(newDampedProgress);

    // Damp mouse parallax
    this.mouseOffset.lerp(this.targetMouseOffset, delta * 3);

    if (mode === 'EXPLORATION' || mode === 'DESTINATION_SELECTED') {
      // 1. Exploration Mode: Follow Catmull-Rom spline with look-ahead curve anticipation
      this.routeEngine.getPosition(newDampedProgress, this.targetPosition);
      this.routeEngine.getLookAt(newDampedProgress, 0.05, this.targetLookAt);

      // Add subtle mouse parallax to target
      this.targetLookAt.x += this.mouseOffset.x * 1.2;
      this.targetLookAt.y += this.mouseOffset.y * 0.8;

      // Smoothly move current position & target
      const lerpSpeed = delta * 4.0;
      this.currentPosition.lerp(this.targetPosition, lerpSpeed);
      this.currentTarget.lerp(this.targetLookAt, lerpSpeed);

      this.focusProgress = 0;
    } else if (mode === 'DESTINATION_FOCUS') {
      // 2. Destination Focus Mode: Transition camera from road to focused building framing
      const activeDest = store.activeDestination;
      if (activeDest) {
        if (this.focusProgress === 0) {
          // Initialize focus trajectory from current road position
          this.focusStartPosition.copy(this.currentPosition);
          this.focusStartTarget.copy(this.currentTarget);

          // Calculate focus landmark entrance position
          const landmarkWorldPos = this.routeEngine.getSidePosition(
            activeDest.routeProgress,
            activeDest.side,
            activeDest.lateralOffset,
            activeDest.verticalOffset || 0,
            new THREE.Vector3()
          );

          // Framing camera position slightly back and angled towards building entrance
          const sideFactor = activeDest.side === 'left' ? -1 : 1;
          this.focusTargetLookAt.copy(landmarkWorldPos).add(new THREE.Vector3(0, 10, 0));
          this.focusTargetPosition.copy(landmarkWorldPos).add(
            new THREE.Vector3(18 * sideFactor, 14, 25)
          );
        }

        // Advance focus progress smoothly
        this.focusProgress = Math.min(1.0, this.focusProgress + delta * 1.2);
        const easeT = THREE.MathUtils.smoothstep(this.focusProgress, 0, 1);

        this.currentPosition.lerpVectors(this.focusStartPosition, this.focusTargetPosition, easeT);
        this.currentTarget.lerpVectors(this.focusStartTarget, this.focusTargetLookAt, easeT);
      }
    } else if (mode === 'RETURNING_TO_CITY') {
      // 3. Return to City: Interpolate smoothly back from building framing to saved road progress
      const targetRouteProgress = store.previousScrollProgress;
      this.routeEngine.getPosition(targetRouteProgress, this.targetPosition);
      this.routeEngine.getLookAt(targetRouteProgress, 0.05, this.targetLookAt);

      const returnLerp = delta * 3.0;
      this.currentPosition.lerp(this.targetPosition, returnLerp);
      this.currentTarget.lerp(this.targetLookAt, returnLerp);

      // Check if camera has arrived back near the road
      if (this.currentPosition.distanceTo(this.targetPosition) < 0.5) {
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
