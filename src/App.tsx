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
    let idleSnapTimer: any = null;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const currentWorldMode = useWorldStore.getState().worldMode;
      const currentWorldProgress = useWorldStore.getState().worldProgress;
      const currentCityProgress = useCityStore.getState().scrollProgress;
      const isWarping = useWorldStore.getState().isWarping;

      if (isWarping) return; // Prevent input interruption during active warp

      if (currentWorldMode !== 'CITY_EXPLORATION') {
        if (idleSnapTimer) clearTimeout(idleSnapTimer);

        if (e.deltaY < 0) {
          // Scrolling UP: bring smoothly and decisively back to top overview
          const sensitivity = 0.00085;
          const nextProgress = Math.max(0, currentWorldProgress + e.deltaY * sensitivity);
          if (nextProgress < 0.06) {
            setWorldProgress(0);
          } else {
            setWorldProgress(nextProgress);
            // Magnetic snap to top if user stops scrolling near top
            idleSnapTimer = setTimeout(() => {
              const wp = useWorldStore.getState().worldProgress;
              if (wp > 0 && wp < 0.22) {
                useWorldStore.getState().glideToTop();
              }
            }, 180);
          }
        } else {
          // Scrolling DOWN towards Mumbai focus & city
          const sensitivity = 0.00055;
          const delta = e.deltaY * sensitivity;
          setWorldProgress(currentWorldProgress + delta);
        }
      } else {
        // City Phase
        const cityMode = useCityStore.getState().cityMode;
        if (cityMode === 'DESTINATION_FOCUS') {
          // Scrolling while in destination focus returns smoothly to boulevard traversal
          if (Math.abs(e.deltaY) > 20) {
            useCityStore.getState().returnToCity();
          }
          return;
        }

        if (cityMode === 'RETURNING_TO_CITY') {
          return; // Let camera complete return glide to boulevard road
        }

        // Smooth boulevard traversal: scroll down advances forward, scroll up reverses backward
        const sensitivity = 0.00065;
        const delta = e.deltaY * sensitivity;
        setCityScrollProgress(Math.max(0, Math.min(1.0, currentCityProgress + delta)));
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      if (idleSnapTimer) clearTimeout(idleSnapTimer);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [setWorldProgress, setCityScrollProgress]);

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
          if (deltaY < 0) {
            const next = Math.max(0, currentWorldProgress + deltaY * 0.0022);
            if (next < 0.06) setWorldProgress(0);
            else setWorldProgress(next);
          } else {
            setWorldProgress(currentWorldProgress + deltaY * 0.0016);
          }
        } else {
          const sensitivity = 0.0016;
          setCityScrollProgress(Math.max(0, Math.min(1.0, currentCityProgress + deltaY * sensitivity)));
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [setWorldProgress, setCityScrollProgress]);

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
        if (isUp) {
          const next = Math.max(0, currentWorldProgress - 0.08);
          if (next < 0.06) setWorldProgress(0);
          else setWorldProgress(next);
        } else {
          setWorldProgress(currentWorldProgress + 0.06);
        }
      } else {
        const step = 0.04;
        setCityScrollProgress(Math.max(0, Math.min(1.0, currentCityProgress + (isDown ? step : -step))));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setWorldProgress, setCityScrollProgress]);

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
