import { create } from 'zustand';
import { DESTINATIONS, DestinationData } from '../data/destinations';

export type CityMode = 'EXPLORATION' | 'DESTINATION_SELECTED' | 'DESTINATION_FOCUS' | 'RETURNING_TO_CITY';
export type QualityTier = 'HIGH' | 'MEDIUM' | 'LOW';

interface CityState {
  // Mode & State Machine
  cityMode: CityMode;
  setCityMode: (mode: CityMode) => void;

  // Scroll Progression
  scrollProgress: number; // 0.0 to 1.0
  setScrollProgress: (progress: number) => void;
  
  dampedProgress: number; // Inertia-smoothed progress
  setDampedProgress: (progress: number) => void;

  previousScrollProgress: number; // Progress memory before focus transition

  // Destination Selection & Interaction
  destinations: DestinationData[];
  selectedDestination: DestinationData | null;
  activeDestination: DestinationData | null;
  hoveredDestinationId: string | null;

  setHoveredDestinationId: (id: string | null) => void;
  selectDestination: (destination: DestinationData | null) => void;
  enterDestination: (destination: DestinationData) => void;
  returnToCity: () => void;

  // Settings & Accessibility
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;
  toggleDebugMode: () => void;

  qualityTier: QualityTier;
  setQualityTier: (tier: QualityTier) => void;

  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;

  // Global Callbacks (Architected for routing integration)
  onDestinationSelectCallback?: (dest: DestinationData) => void;
  onDestinationEnterCallback?: (dest: DestinationData) => void;
  onReturnToCityCallback?: () => void;
  
  registerCallbacks: (hooks: {
    onSelect?: (dest: DestinationData) => void;
    onEnter?: (dest: DestinationData) => void;
    onReturn?: () => void;
  }) => void;
}

export const useCityStore = create<CityState>((set, get) => ({
  cityMode: 'EXPLORATION',
  setCityMode: (mode) => set({ cityMode: mode }),

  scrollProgress: 0.0,
  setScrollProgress: (progress) => {
    const currentMode = get().cityMode;
    // Only update scroll target if we are in exploration mode or returning
    if (currentMode === 'EXPLORATION' || currentMode === 'DESTINATION_SELECTED' || currentMode === 'RETURNING_TO_CITY') {
      const clamped = Math.max(0, Math.min(1, progress));
      set({ scrollProgress: clamped });
    }
  },

  dampedProgress: 0.0,
  setDampedProgress: (progress) => set({ dampedProgress: progress }),

  previousScrollProgress: 0.0,

  destinations: DESTINATIONS,
  selectedDestination: null,
  activeDestination: null,
  hoveredDestinationId: null,

  setHoveredDestinationId: (id) => set({ hoveredDestinationId: id }),

  // Step 1: User clicks landmark or marker -> Destination Selected (overlay appears, camera stays on road)
  selectDestination: (destination) => {
    if (!destination) {
      set({ selectedDestination: null, cityMode: 'EXPLORATION' });
      return;
    }
    set({
      selectedDestination: destination,
      cityMode: 'DESTINATION_SELECTED'
    });
    get().onDestinationSelectCallback?.(destination);
  },

  // Step 2: User clicks [ ENTER ] on overlay -> Transition to Focus Camera Mode
  enterDestination: (destination) => {
    const anchorProgress = destination.routeProgress;
    set({
      selectedDestination: destination,
      activeDestination: destination,
      previousScrollProgress: anchorProgress,
      scrollProgress: anchorProgress,
      dampedProgress: anchorProgress,
      cityMode: 'DESTINATION_FOCUS'
    });
    get().onDestinationEnterCallback?.(destination);
  },

  // Step 3: User clicks [ BACK TO CITY ] -> Return smoothly to previous scroll location on road
  returnToCity: () => {
    set({
      cityMode: 'RETURNING_TO_CITY',
      activeDestination: null,
      selectedDestination: null,
    });
    get().onReturnToCityCallback?.();
  },

  // Debug & Performance
  debugMode: typeof window !== 'undefined' && window.location.search.includes('debug=true'),
  setDebugMode: (debug) => set({ debugMode: debug }),
  toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),

  qualityTier: 'HIGH',
  setQualityTier: (tier) => set({ qualityTier: tier }),

  reducedMotion: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),

  registerCallbacks: ({ onSelect, onEnter, onReturn }) => {
    set({
      onDestinationSelectCallback: onSelect,
      onDestinationEnterCallback: onEnter,
      onReturnToCityCallback: onReturn,
    });
  }
}));
