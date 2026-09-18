import React from 'react';
import { useCityStore } from '../state/useCityStore';
import { ArrowRight, RotateCcw, Building2, Tag, ChevronRight } from 'lucide-react';

export const DestinationOverlay: React.FC = () => {
  const cityMode = useCityStore((s) => s.cityMode);
  const selectedDestination = useCityStore((s) => s.selectedDestination);
  const selectDestination = useCityStore((s) => s.selectDestination);
  const enterDestination = useCityStore((s) => s.enterDestination);
  const returnToCity = useCityStore((s) => s.returnToCity);

  if (!selectedDestination || cityMode === 'EXPLORATION') {
    return null;
  }

  const isFocused = cityMode === 'DESTINATION_FOCUS';

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex items-center justify-end p-6 md:p-12">
      {/* Sleek Futuristic Glassmorphism HUD Panel */}
      <div
        className={`pointer-events-auto w-full max-w-md glass-panel-glow rounded-2xl p-6 md:p-8 transition-all duration-500 transform ${
          selectedDestination ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
        }`}
      >
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-bold">
              LANDMARK DESTINATION
            </span>
          </div>
          <span
            className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${selectedDestination.primaryColor}20`,
              color: selectedDestination.primaryColor,
              border: `1px solid ${selectedDestination.primaryColor}50`,
            }}
          >
            {selectedDestination.category}
          </span>
        </div>

        {/* Destination Title & Subtitle */}
        <h2 className="font-heading font-black text-2xl md:text-3xl text-white tracking-wide mb-1">
          {selectedDestination.title}
        </h2>
        <h3 className="font-mono text-xs text-cyan-300/80 tracking-widest uppercase mb-4">
          {selectedDestination.subtitle}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-6 font-sans">
          {selectedDestination.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {selectedDestination.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900/80 text-slate-300 border border-slate-700/60 flex items-center gap-1"
            >
              <Tag className="w-3 h-3 text-cyan-400" />
              {tag}
            </span>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-3">
          {!isFocused ? (
            <>
              {/* Enter Destination Button */}
              <button
                onClick={() => enterDestination(selectedDestination)}
                className="w-full py-3.5 px-6 rounded-xl font-heading font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500 shadow-glow-cyan transition-all flex items-center justify-center gap-2 group"
              >
                <span>ENTER {selectedDestination.title}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Close / Deselect */}
              <button
                onClick={() => selectDestination(null)}
                className="w-full py-2.5 px-4 rounded-xl font-mono text-xs text-slate-400 hover:text-white hover:bg-slate-900/60 transition-colors flex items-center justify-center gap-1"
              >
                <span>CONTINUE BOULEVARD TRAVERSAL</span>
              </button>
            </>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-2 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 animate-ping text-cyan-400" />
                <span>DESTINATION FOCUS ACTIVE — CAMERA ENGAGED</span>
              </div>

              {/* Return to City Traversal Button */}
              <button
                onClick={returnToCity}
                className="w-full py-3 px-6 rounded-xl font-heading font-bold text-sm tracking-wider uppercase bg-slate-900 border border-cyan-500/50 text-cyan-300 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>RETURN TO CITY BOULEVARD</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
