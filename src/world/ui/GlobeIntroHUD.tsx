import React from 'react';
import { useWorldStore } from '../state/useWorldStore';
import { Globe as GlobeIcon, ChevronDown, ArrowRight, Radio } from 'lucide-react';

export const GlobeIntroHUD: React.FC = () => {
  const worldMode = useWorldStore((s) => s.worldMode);
  const worldProgress = useWorldStore((s) => s.worldProgress);
  const enterCityDirectly = useWorldStore((s) => s.enterCityDirectly);

  // Fade out UI as descent begins (progress > 0.60)
  if (worldMode === 'CITY_EXPLORATION' || worldProgress > 0.65) {
    return null;
  }

  const opacity = Math.max(0, 1 - worldProgress * 1.6);

  return (
    <div
      className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 md:p-12 transition-opacity duration-500"
      style={{ opacity }}
    >
      {/* 1. Top Brand Identity */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-widest uppercase">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>GLOBAL COMPUTING ECOSYSTEM</span>
          </div>
          <h1 className="font-heading font-black text-3xl md:text-5xl text-white tracking-wider">
            ACM <span className="text-cyan-400">DIGITAL WORLD</span>
          </h1>
          <p className="font-mono text-xs text-slate-400 tracking-wider uppercase mt-0.5">
            D. J. SANGHVI COLLEGE OF ENGINEERING
          </p>
        </div>

        {/* Global Node Telemetry Pill */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-3 glass-panel px-4 py-2 rounded-xl text-xs font-mono">
          <GlobeIcon className="w-4 h-4 text-cyan-400 animate-spin [animation-duration:12s]" />
          <div className="flex flex-col">
            <span className="text-white font-bold">MUMBAI NODE 01</span>
            <span className="text-[10px] text-cyan-400">19.0760° N, 72.8777° E</span>
          </div>
        </div>
      </div>

      {/* 2. Bottom Entrance Prompt & Direct CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Scroll down prompt */}
        <div className="flex items-center gap-3 glass-panel px-5 py-2.5 rounded-full text-xs font-mono text-slate-300 shadow-glow-cyan">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-300 font-bold">SCROLL DOWN</span>
          <span className="text-slate-400">TO ENTER ACM CITY</span>
          <ChevronDown className="w-4 h-4 text-cyan-400 animate-bounce ml-1" />
        </div>

        {/* Quick Skip Button */}
        <button
          onClick={enterCityDirectly}
          className="pointer-events-auto group px-5 py-2.5 rounded-xl font-heading font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500 shadow-glow-cyan transition-all flex items-center gap-2"
        >
          <span>ENTER BOULEVARD DIRECTLY</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
