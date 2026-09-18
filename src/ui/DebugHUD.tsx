import React, { useEffect, useState } from 'react';
import { useCityStore } from '../state/useCityStore';
import { Terminal, Crosshair, MapPin } from 'lucide-react';

export const DebugHUD: React.FC = () => {
  const debugMode = useCityStore((s) => s.debugMode);
  const cityMode = useCityStore((s) => s.cityMode);
  const scrollProgress = useCityStore((s) => s.scrollProgress);
  const dampedProgress = useCityStore((s) => s.dampedProgress);
  const setScrollProgress = useCityStore((s) => s.setScrollProgress);
  const destinations = useCityStore((s) => s.destinations);
  const selectedDestination = useCityStore((s) => s.selectedDestination);
  const selectDestination = useCityStore((s) => s.selectDestination);

  const [fps, setFps] = useState(60);

  // Keyboard shortcut listener (Shift + D) to toggle debug mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        useCityStore.getState().toggleDebugMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simple FPS counter loop
  useEffect(() => {
    if (!debugMode) return;
    let frames = 0;
    let prevTime = performance.now();

    const interval = setInterval(() => {
      const now = performance.now();
      const delta = (now - prevTime) / 1000;
      setFps(Math.round(frames / delta));
      frames = 0;
      prevTime = now;
    }, 1000);

    const handleFrame = () => {
      frames++;
      requestAnimationFrame(handleFrame);
    };
    const req = requestAnimationFrame(handleFrame);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(req);
    };
  }, [debugMode]);

  if (!debugMode) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 glass-panel border border-purple-500/40 rounded-xl p-4 font-mono text-xs text-slate-200 pointer-events-auto shadow-2xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-500/30">
        <div className="flex items-center gap-2 text-purple-400 font-bold">
          <Terminal className="w-4 h-4" />
          <span>DEBUG TELEMETRY</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold">
          {fps} FPS
        </span>
      </div>

      <div className="space-y-2 mb-4 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-400">CITY MODE:</span>
          <span className="text-cyan-400 font-bold">{cityMode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">RAW PROGRESS:</span>
          <span className="text-white">{(scrollProgress * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">DAMPED PROGRESS:</span>
          <span className="text-cyan-300">{(dampedProgress * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">SELECTED LANDMARK:</span>
          <span className="text-amber-400 font-bold">
            {selectedDestination ? selectedDestination.title : 'NONE'}
          </span>
        </div>
      </div>

      {/* Fast Teleport Buttons */}
      <div className="pt-2 border-t border-purple-500/20">
        <div className="text-[10px] text-purple-300 font-bold mb-2 flex items-center gap-1">
          <Crosshair className="w-3 h-3" />
          <span>FAST TELEPORT TO LANDMARKS</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {destinations.map((dest) => (
            <button
              key={dest.id}
              onClick={() => {
                setScrollProgress(dest.routeProgress);
                selectDestination(dest);
              }}
              className="px-2 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-[10px] truncate text-left flex items-center gap-1"
            >
              <MapPin className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
              <span className="truncate">{dest.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
