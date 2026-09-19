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
        // Position camera back on boulevard curb (44 units out) and upstream along road (26 units)
        // with elevated cinematic vantage (15 units) to reveal building facade, illuminated canopy, and entrance steps
        const camOutDist = 44.0;
        const camZOffset = 26.0;
        const camElevation = 15.0;
        this.focusTargetPosition.copy(landmarkWorldPos)
          .addScaledVector(frontDir, camOutDist)
          .add(new THREE.Vector3(0, 0, camZOffset))
          .setY(camElevation);

        // Look at center of entrance lobby & glowing neon portal
        // Offset slightly toward camera right so the building is framed elegantly in the left-center, clear of right HUD panel
        const camRight = new THREE.Vector3(frontDir.z, 0, -frontDir.x);
        this.focusTargetLookAt.copy(landmarkWorldPos)
          .add(new THREE.Vector3(0, 12.0, 0))
          .addScaledVector(camRight, 5.0);

        // Continuous smooth zoom-in glide (matching the silky feel of zoom-out)
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
