import { create } from 'zustand';

export type WorldMode =
  | 'WORLD_INTRO'
  | 'GLOBE_EXPLORATION'
  | 'CITY_TRANSITION'
  | 'CITY_EXPLORATION';

interface WorldState {
  worldMode: WorldMode;
  setWorldMode: (mode: WorldMode) => void;

  worldProgress: number; // 0.00 to 1.00 (Globe view to Mumbai focus)
  setWorldProgress: (progress: number) => void;

  // 1-Second Dedicated Warp Engine
  isWarping: boolean;
  warpProgress: number; // 0.0 to 1.0 during active 1s warp
  warpDirection: 'TO_CITY' | 'TO_GLOBE';
  setWarpProgress: (p: number) => void;

  // Discrete Scene Lifecycle Flags
  isSpaceActive: boolean;
  isCityActive: boolean;

  // Mumbai Focal Point Active
  mumbaiFocused: boolean;

  // Action methods
  triggerWarpToCity: () => void;
  triggerWarpToGlobe: () => void;
  glideToTop: () => void;
  enterCityDirectly: () => void;
}

import { useCityStore } from '../../state/useCityStore';

let activeWarpAnim: number | null = null;

export const useWorldStore = create<WorldState>((set, get) => ({
  worldMode: 'WORLD_INTRO',
  setWorldMode: (mode) => set({ worldMode: mode }),

  worldProgress: 0.0,
  setWorldProgress: (progress) => {
    const clamped = Math.max(0, Math.min(1.0, progress));
    
    // In globe mode, progress guides orbital view (0.0) -> Mumbai focus (0.6+)
    let newMode: WorldMode = 'GLOBE_EXPLORATION';
    if (clamped < 0.05) {
      newMode = 'WORLD_INTRO';
    } else if (clamped >= 0.05 && clamped < 0.65) {
      newMode = 'GLOBE_EXPLORATION';
    } else {
      // Reaching the threshold triggers the 1s cinematic warp into the city!
      if (!get().isWarping && get().worldMode !== 'CITY_EXPLORATION') {
        get().triggerWarpToCity();
        return;
      }
    }

    set({
      worldProgress: clamped,
      worldMode: newMode,
      mumbaiFocused: clamped >= 0.25,
      isSpaceActive: true,
      isCityActive: false,
    });
  },

  isWarping: false,
  warpProgress: 0.0,
  warpDirection: 'TO_CITY',
  setWarpProgress: (p) => set({ warpProgress: p }),

  isSpaceActive: true,
  isCityActive: false,
  mumbaiFocused: false,

  // Dedicated 1-Second High-Speed Cinematic Warp into City
  triggerWarpToCity: () => {
    if (get().isWarping || get().worldMode === 'CITY_EXPLORATION') return;

    if (activeWarpAnim) cancelAnimationFrame(activeWarpAnim);

    set({
      isWarping: true,
      warpDirection: 'TO_CITY',
      warpProgress: 0.0,
      worldMode: 'CITY_TRANSITION',
      isSpaceActive: true,
      isCityActive: true,
    });

    const startTime = performance.now();
    const duration = 1250; // Fluid 1.25s cinematic dive into city boulevard
    const startP = get().worldProgress;

    const animateWarp = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      // Smoothly advance worldProgress to 1.0 alongside the dive
      const currentWorldProgress = Math.min(1.0, startP + progress * (1.0 - startP));

      set({
        warpProgress: progress,
        worldProgress: currentWorldProgress,
      });

      if (progress < 1.0) {
        activeWarpAnim = requestAnimationFrame(animateWarp);
      } else {
        // Warp complete -> Full City Ownership
        set({
          isWarping: false,
          warpProgress: 1.0,
          worldMode: 'CITY_EXPLORATION',
          isSpaceActive: false, // Space completely disabled
          isCityActive: true,
          worldProgress: 1.0,
        });
      }
    };

    activeWarpAnim = requestAnimationFrame(animateWarp);
  },

  // Dedicated Cinematic Warp Ascent all the way back to Top Overview
  triggerWarpToGlobe: () => {
    if (get().isWarping) return;

    if (activeWarpAnim) cancelAnimationFrame(activeWarpAnim);

    set({
      isWarping: true,
      warpDirection: 'TO_GLOBE',
      warpProgress: 0.0,
      worldMode: 'CITY_TRANSITION',
      isSpaceActive: true,
      isCityActive: true,
    });

    const startTime = performance.now();
    const duration = 1350; // Fluid 1.35s cinematic ascent to top overview

    const animateWarp = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      // Smoothly bring worldProgress all the way from 0.85 down to 0.0 (top overview)
      const currentWorldProgress = Math.max(0, 0.85 * (1 - progress));

      set({
        warpProgress: progress,
        worldProgress: currentWorldProgress,
      });

      if (progress < 1.0) {
        activeWarpAnim = requestAnimationFrame(animateWarp);
      } else {
        // Return complete -> All the way to top overview!
        set({
          isWarping: false,
          warpProgress: 1.0,
          worldMode: 'WORLD_INTRO',
          worldProgress: 0.0, // Back to very top!
          isSpaceActive: true,
          isCityActive: false,
          mumbaiFocused: false,
        });
        // Reset boulevard progression for fresh exploration on next descent
        useCityStore.getState().setScrollProgress(0);
      }
    };

    activeWarpAnim = requestAnimationFrame(animateWarp);
  },

  // Smoothly glide remaining distance to top overview without getting stuck in between
  glideToTop: () => {
    if (get().isWarping || get().worldMode === 'CITY_EXPLORATION') return;
    const startP = get().worldProgress;
    if (startP <= 0.001) {
      if (get().worldProgress !== 0) get().setWorldProgress(0);
      return;
    }

    if (activeWarpAnim) cancelAnimationFrame(activeWarpAnim);

    const startTime = performance.now();
    const duration = 380; // 380ms gentle magnetic snap to top

    const animateGlide = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1.0, elapsed / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const currentP = Math.max(0, startP * (1 - ease));

      get().setWorldProgress(currentP);

      if (t < 1.0) {
        activeWarpAnim = requestAnimationFrame(animateGlide);
      } else {
        get().setWorldProgress(0);
      }
    };

    activeWarpAnim = requestAnimationFrame(animateGlide);
  },

  enterCityDirectly: () => {
    get().triggerWarpToCity();
  },
}));
