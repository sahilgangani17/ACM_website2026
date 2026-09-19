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
  completeWarpToCity: () => void;
  triggerWarpToGlobe: () => void;
  completeWarpToGlobe: () => void;
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
      mumbaiFocused: clamped >= 0.55,
      isSpaceActive: true,
    });
  },

  isWarping: false,
  warpProgress: 0.0,
  warpDirection: 'TO_CITY',
  setWarpProgress: (p) => set({ warpProgress: p }),

  isSpaceActive: true,
  isCityActive: true, // City pre-warmed for zero-hitch transition
  mumbaiFocused: false,

  // Dedicated High-Speed Cinematic Warp into City (Driven smoothly by Three.js useFrame)
  triggerWarpToCity: () => {
    if (get().isWarping || get().worldMode === 'CITY_EXPLORATION') return;

    set({
      isWarping: true,
      warpDirection: 'TO_CITY',
      warpProgress: 0.0,
      worldMode: 'CITY_TRANSITION',
      isSpaceActive: true,
      isCityActive: true,
    });
  },

  completeWarpToCity: () => {
    set({
      isWarping: false,
      warpProgress: 1.0,
      worldMode: 'CITY_EXPLORATION',
      isSpaceActive: false, // Space disabled
      isCityActive: true,
      worldProgress: 1.0,
    });
  },

  // Dedicated Cinematic Warp Ascent back to Top Overview
  triggerWarpToGlobe: () => {
    if (get().isWarping) return;

    set({
      isWarping: true,
      warpDirection: 'TO_GLOBE',
      warpProgress: 0.0,
      worldMode: 'CITY_TRANSITION',
      isSpaceActive: true,
      isCityActive: true,
    });
  },

  completeWarpToGlobe: () => {
    set({
      isWarping: false,
      warpProgress: 1.0,
      worldMode: 'WORLD_INTRO',
      worldProgress: 0.0, // Back to very top!
      isSpaceActive: true,
      isCityActive: true,
      mumbaiFocused: false,
    });
    // Reset boulevard progression for fresh exploration on next descent
    useCityStore.getState().setScrollProgress(0);
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
