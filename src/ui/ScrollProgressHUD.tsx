import React from 'react';
import { useCityStore } from '../state/useCityStore';
import { ChevronDown, Navigation } from 'lucide-react';

export const ScrollProgressHUD: React.FC = () => {
  const dampedProgress = useCityStore((s) => s.dampedProgress);
  const setScrollProgress = useCityStore((s) => s.setScrollProgress);
  const destinations = useCityStore((s) => s.destinations);
  const selectedDestination = useCityStore((s) => s.selectedDestination);
  const selectDestination = useCityStore((s) => s.selectDestination);

  const percent = Math.round(dampedProgress * 100);

  return (
    <>
      {/* 1. Left Vertical Boulevard Traversal HUD */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-30 pointer-events-none hidden md:flex flex-col items-center gap-4">
        <span className="font-mono text-[10px] text-cyan-400 tracking-widest uppercase [writing-mode:vertical-lr] rotate-180 font-bold">
          BOULEVARD TRAVERSAL — {percent}%
        </span>

        {/* Vertical Rail */}
        <div className="w-1 h-64 bg-slate-900/80 rounded-full relative overflow-visible border border-slate-800">
          {/* Active Fill Level */}
          <div
            className="w-full bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full transition-all duration-150"
            style={{ height: `${percent}%` }}
          />

          {/* Landmark Waypoint Markers */}
          <div className="pointer-events-auto absolute inset-0">
            {destinations.map((dest) => {
              const markerTop = `${dest.routeProgress * 100}%`;
              const isSelected = selectedDestination?.id === dest.id;

              return (
                <button
                  key={dest.id}
                  onClick={() => {
                    setScrollProgress(dest.routeProgress);
                    selectDestination(dest);
                  }}
                  className={`group absolute -left-2.5 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'scale-125 border-2 border-cyan-400 bg-cyan-950 shadow-glow-cyan'
                      : 'hover:scale-110 border border-slate-700 bg-slate-950'
                  }`}
                  style={{ top: markerTop }}
                  title={`${dest.title} (${Math.round(dest.routeProgress * 100)}%)`}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: dest.primaryColor }}
                  />

                  {/* Tooltip on Hover */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-8 bg-slate-950 border border-cyan-500/40 px-2.5 py-1 rounded text-[10px] font-mono text-cyan-300 whitespace-nowrap">
                    {dest.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Navigation className="w-4 h-4 text-cyan-400" />
      </div>

      {/* 2. Bottom Scroll Traversal Hint */}
      {dampedProgress < 0.95 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-1">
          <div className="glass-panel px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="text-cyan-400 font-bold">SCROLL</span>
            <span>FORWARD TO EXPLORE CITY</span>
          </div>
          <ChevronDown className="w-4 h-4 text-cyan-400 animate-bounce" />
        </div>
      )}
    </>
  );
};
