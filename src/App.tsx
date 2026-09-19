import React, { useEffect } from 'react';
import { WorldExperience } from './world/WorldExperience';
import { GlobeIntroHUD } from './world/ui/GlobeIntroHUD';
import { NavbarHeader } from './ui/NavbarHeader';
import { DestinationOverlay } from './ui/DestinationOverlay';
import { ScrollProgressHUD } from './ui/ScrollProgressHUD';
import { DebugHUD } from './ui/DebugHUD';
import { useWorldStore } from './world/state/useWorldStore';
import { useCityStore } from './state/useCityStore';

export const App: React.FC = () => {
  const worldMode = useWorldStore((s) => s.worldMode);
  const setWorldProgress = useWorldStore((s) => s.setWorldProgress);
  const triggerWarpToCity = useWorldStore((s) => s.triggerWarpToCity);
  const triggerWarpToGlobe = useWorldStore((s) => s.triggerWarpToGlobe);
  const setCityScrollProgress = useCityStore((s) => s.setScrollProgress);

  // Register public callback hooks (Architected for future page routing)
  useEffect(() => {
    useCityStore.getState().registerCallbacks({
      onSelect: (dest) => {
        console.log('[ACM World Hook] Destination Selected:', dest.id, dest.title);
      },
      onEnter: (dest) => {
        console.log('[ACM World Hook] Destination Focus Entered:', dest.id, dest.title);
      },
      onReturn: () => {
        console.log('[ACM World Hook] Returned to Boulevard Exploration');
      },
    });
  }, []);

  // 1. Two-Way Unified Wheel Scroll Listener
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const currentWorldMode = useWorldStore.getState().worldMode;
      const currentWorldProgress = useWorldStore.getState().worldProgress;
      const currentCityProgress = useCityStore.getState().scrollProgress;
      const isWarping = useWorldStore.getState().isWarping;

      if (isWarping) return; // Prevent input interruption during active 1s warp

      if (currentWorldMode !== 'CITY_EXPLORATION') {
        // Globe Phase (0.0 to 0.65 -> triggers 1s warp)
        const sensitivity = 0.00055;
        const delta = e.deltaY * sensitivity;
        setWorldProgress(currentWorldProgress + delta);
      } else {
        // City Phase
        if (e.deltaY < -15 && currentCityProgress <= 0.002) {
          // Scrolling UP at beginning of boulevard triggers 1s warp ascent back to globe!
          triggerWarpToGlobe();
        } else {
          const sensitivity = 0.0007;
          const delta = e.deltaY * sensitivity;
          setCityScrollProgress(currentCityProgress + delta);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [setWorldProgress, setCityScrollProgress, triggerWarpToGlobe]);

  // 2. Two-Way Unified Touch Drag Listener (Mobile Traversal)
  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const isWarping = useWorldStore.getState().isWarping;
        if (isWarping) return;

        const currentY = e.touches[0].clientY;
        const deltaY = touchStartY - currentY;
        touchStartY = currentY;

        const currentWorldMode = useWorldStore.getState().worldMode;
        const currentWorldProgress = useWorldStore.getState().worldProgress;
        const currentCityProgress = useCityStore.getState().scrollProgress;

        if (currentWorldMode !== 'CITY_EXPLORATION') {
          const sensitivity = 0.0016;
          setWorldProgress(currentWorldProgress + deltaY * sensitivity);
        } else {
          if (deltaY < -25 && currentCityProgress <= 0.002) {
            triggerWarpToGlobe();
          } else {
            const sensitivity = 0.0018;
            setCityScrollProgress(currentCityProgress + deltaY * sensitivity);
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [setWorldProgress, setCityScrollProgress, triggerWarpToGlobe]);

  // 3. Two-Way Unified Keyboard Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isWarping = useWorldStore.getState().isWarping;
      if (isWarping) return;

      const currentWorldMode = useWorldStore.getState().worldMode;
      const currentWorldProgress = useWorldStore.getState().worldProgress;
      const currentCityProgress = useCityStore.getState().scrollProgress;

      const isDown = e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ';
      const isUp = e.key === 'ArrowUp' || e.key === 'PageUp';

      if (!isDown && !isUp) return;

      if (currentWorldMode !== 'CITY_EXPLORATION') {
        const step = 0.06;
        setWorldProgress(currentWorldProgress + (isDown ? step : -step));
      } else {
        if (isUp && currentCityProgress <= 0.002) {
          triggerWarpToGlobe();
        } else {
          const step = 0.04;
          setCityScrollProgress(currentCityProgress + (isDown ? step : -step));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setWorldProgress, setCityScrollProgress, triggerWarpToGlobe]);

  return (
    <div className="relative w-full h-screen bg-[#02040a] text-slate-100 overflow-hidden font-sans select-none">
      {/* Unified 3D Master Scene: Globe -> 1s Warp -> City */}
      <WorldExperience />

      {/* Opening Globe HUD */}
      <GlobeIntroHUD />

      {/* City Overlays (Active during City Exploration) */}
      {worldMode === 'CITY_EXPLORATION' && (
        <>
          <NavbarHeader />
          <DestinationOverlay />
          <ScrollProgressHUD />
        </>
      )}

      {/* Developer Debug Panel */}
      <DebugHUD />
    </div>
  );
};
