import React from 'react';
import { useCityStore, QualityTier } from '../state/useCityStore';
import { useWorldStore } from '../world/state/useWorldStore';
import { Compass, Monitor, Eye, Globe as GlobeIcon } from 'lucide-react';
import acmLogo from '../assets/acm_logo.png';

export const NavbarHeader: React.FC = () => {
  const cityMode = useCityStore((s) => s.cityMode);
  const qualityTier = useCityStore((s) => s.qualityTier);
  const setQualityTier = useCityStore((s) => s.setQualityTier);
  const debugMode = useCityStore((s) => s.debugMode);
  const toggleDebugMode = useCityStore((s) => s.toggleDebugMode);
  const reducedMotion = useCityStore((s) => s.reducedMotion);
  const triggerWarpToGlobe = useWorldStore((s) => s.triggerWarpToGlobe);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none p-4 md:p-6 flex items-center justify-between">
      {/* Brand Identity & Breadcrumb */}
      <div className="pointer-events-auto flex items-center gap-3 glass-panel px-3.5 py-1.5 rounded-xl">
        <div className="w-6 h-6 rounded-md overflow-hidden bg-white/95 p-0.5 flex items-center justify-center shrink-0 shadow-sm">
          <img src={acmLogo} alt="ACM DJSCE" className="w-full h-full object-contain" />
        </div>
        <span className="font-heading font-black text-base tracking-wider text-white">
          ACM <span className="text-cyan-400 font-mono font-medium text-xs ml-1">BOULEVARD v1.0</span>
        </span>
        {/* Return to Globe Button */}
        <button
          onClick={triggerWarpToGlobe}
          className="ml-2 pl-3 border-l border-cyan-500/30 text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1.5 transition-colors"
          title="Return to Space / Globe View"
        >
          <GlobeIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">GLOBE VIEW</span>
        </button>
      </div>

      {/* Traversal Telemetry & Settings Controls */}
      <div className="pointer-events-auto flex items-center gap-3">
        {/* State Indicator */}
        <div className="hidden sm:flex items-center gap-2 glass-panel px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-cyan-400 font-bold">{cityMode}</span>
        </div>

        {/* Quality Tier Selector */}
        <div className="flex items-center gap-1 glass-panel p-1 rounded-lg text-xs font-mono">
          {(['HIGH', 'MEDIUM', 'LOW'] as QualityTier[]).map((tier) => (
            <button
              key={tier}
              onClick={() => setQualityTier(tier)}
              className={`px-2.5 py-1 rounded transition-colors ${
                qualityTier === tier
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Debug Toggle Button */}
        <button
          onClick={toggleDebugMode}
          className={`glass-panel p-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
            debugMode ? 'bg-purple-950/80 border-purple-500 text-purple-300' : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Debug Telemetry (Shift + D)"
        >
          <Monitor className="w-4 h-4" />
          <span className="hidden md:inline font-mono">DEBUG</span>
        </button>

        {reducedMotion && (
          <div className="glass-panel p-2 rounded-lg text-xs text-amber-400 flex items-center gap-1" title="Reduced Motion Active">
            <Eye className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </header>
  );
};
