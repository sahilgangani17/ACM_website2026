import React from 'react';
import { useCityStore } from '../state/useCityStore';
import { ArrowRight, RotateCcw, Building2, Tag, ChevronRight, X } from 'lucide-react';

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

  const handleClose = () => {
    if (isFocused) {
      returnToCity();
    } else {
      selectDestination(null);
    }
  };

  return (
    /* Full-screen dark backdrop overlay */
    <div
      className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center transition-all duration-400"
      style={{ backgroundColor: 'rgba(2, 4, 10, 0.75)', backdropFilter: 'blur(6px)' }}
      onClick={handleClose}
    >
      {/* Full-Page Modal Panel with side margins */}
      <div
        className={`relative w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] md:w-[calc(100%-8rem)] lg:w-[calc(100%-12rem)] max-w-4xl h-auto max-h-[85vh] overflow-y-auto glass-panel-glow rounded-2xl p-6 sm:p-8 md:p-10 transition-all duration-500 transform ${
          selectedDestination ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close (X) Button — Top Right */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 rounded-full border border-slate-700/80 bg-slate-950/80 hover:border-cyan-400 hover:bg-cyan-950/60 flex items-center justify-center text-slate-400 hover:text-cyan-300 transition-all z-10 group"
          title="Close"
        >
          <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
        </button>

        {/* Header Badge Row */}
        <div className="flex items-center gap-3 mb-6 pr-12">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-xs sm:text-sm text-cyan-400 uppercase tracking-widest font-bold">
              LANDMARK DESTINATION
            </span>
          </div>
          <span
            className="px-3 py-1 rounded-md text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${selectedDestination.primaryColor}20`,
              color: selectedDestination.primaryColor,
              border: `1px solid ${selectedDestination.primaryColor}50`,
            }}
          >
            {selectedDestination.category}
          </span>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-cyan-500/40 via-purple-500/20 to-transparent mb-6" />

        {/* Destination Title & Subtitle */}
        <h2 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-wide mb-2">
          {selectedDestination.title}
        </h2>
        <h3 className="font-mono text-xs sm:text-sm text-cyan-300/80 tracking-widest uppercase mb-6">
          {selectedDestination.subtitle}
        </h3>

        {/* Description */}
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 font-sans max-w-2xl">
          {selectedDestination.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          {selectedDestination.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900/80 text-slate-300 border border-slate-700/60 flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              {tag}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mb-6" />

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {!isFocused ? (
            <>
              {/* Enter Destination Button */}
              <button
                onClick={() => enterDestination(selectedDestination)}
                className="flex-1 py-3.5 px-6 rounded-xl font-heading font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500 shadow-glow-cyan transition-all flex items-center justify-center gap-2 group"
              >
                <span>ENTER {selectedDestination.title}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Close / Continue */}
              <button
                onClick={() => selectDestination(null)}
                className="flex-1 py-3 px-6 rounded-xl font-mono text-xs text-slate-400 hover:text-white border border-slate-700/60 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all flex items-center justify-center gap-1"
              >
                <span>CONTINUE BOULEVARD</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex-1 p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-mono flex items-center gap-2">
                <ChevronRight className="w-4 h-4 animate-ping text-cyan-400" />
                <span>DESTINATION FOCUS ACTIVE — CAMERA ENGAGED</span>
              </div>

              {/* Return to City Traversal Button */}
              <button
                onClick={returnToCity}
                className="flex-1 py-3.5 px-6 rounded-xl font-heading font-bold text-sm tracking-wider uppercase bg-slate-900 border border-cyan-500/50 text-cyan-300 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
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
