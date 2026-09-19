import React, { useState } from 'react';
import { useWorldStore } from '../state/useWorldStore';
import { useCityStore } from '../../state/useCityStore';
import { ScrambleText } from '../../ui/ScrambleText';
import { ArrowRight, ChevronDown, MapPin, Sparkles } from 'lucide-react';
import acmLogo from '../../assets/acm_logo.png';

interface NavItem {
  id: string;
  label: string;
  destinationId: string;
  subtitle: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'events', label: 'EVENTS', destinationId: 'destination-04', subtitle: 'Global Summits & Workshops' },
  { id: 'team', label: 'TEAM', destinationId: 'destination-02', subtitle: 'Core Committee & Leaders' },
  { id: 'research', label: 'RESEARCH', destinationId: 'destination-03', subtitle: 'AI Labs & Innovation' },
  { id: 'about', label: 'ABOUT US', destinationId: 'destination-01', subtitle: 'Architecture & Mission' },
];

export const GlobeIntroHUD: React.FC = () => {
  const worldMode = useWorldStore((s) => s.worldMode);
  const worldProgress = useWorldStore((s) => s.worldProgress);
  const enterCityDirectly = useWorldStore((s) => s.enterCityDirectly);

  const setScrollProgress = useCityStore((s) => s.setScrollProgress);
  const selectDestination = useCityStore((s) => s.selectDestination);
  const destinations = useCityStore((s) => s.destinations);

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Fade out UI as descent begins (progress > 0.65)
  if (worldMode === 'CITY_EXPLORATION' || worldProgress > 0.65) {
    return null;
  }

  const opacity = Math.max(0, 1 - worldProgress * 1.6);

  const handleNavClick = (destId: string) => {
    const target = destinations.find((d) => d.id === destId);
    if (target) {
      setScrollProgress(target.routeProgress);
      selectDestination(target);
    }
    enterCityDirectly();
  };

  return (
    <div
      className="fixed inset-0 z-30 pointer-events-none transition-opacity duration-500 select-none font-sans"
      style={{ opacity }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR: 3-column balanced layout with centered title           */}
      {/* ========================================================================= */}
      <header className="absolute top-0 left-0 right-0 p-6 md:p-8 flex items-center justify-between z-20">
        {/* Top Left: ACM Student Chapter Brand Badge with Logo */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="border border-cyan-400/50 bg-slate-950/80 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-glow-cyan">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/95 p-0.5 flex items-center justify-center shrink-0 shadow-sm">
              <img
                src={acmLogo}
                alt="ACM DJSCE"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="w-[1px] h-4 bg-cyan-500/30" />
            <span className="font-mono text-[10px] text-slate-200 tracking-[0.2em] uppercase font-bold">
              STUDENT CHAPTER
            </span>
          </div>
        </div>

        {/* Top Center: Absolutely Centered Heading "ACM DIGITAL WORLD" */}
        <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 top-6 md:top-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-[9px] tracking-[0.3em] uppercase mb-0.5">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>GLOBAL COMPUTING ECOSYSTEM</span>
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="font-heading font-black text-xl sm:text-2xl md:text-3xl text-white tracking-[0.24em] uppercase drop-shadow-[0_0_20px_rgba(0,240,255,0.4)] whitespace-nowrap">
            ACM <span className="text-cyan-400">DIGITAL WORLD</span>
          </h1>
          <span className="font-mono text-[9px] text-slate-400 tracking-[0.25em] uppercase mt-0.5">
            D. J. SANGHVI COLLEGE OF ENGINEERING
          </span>
        </div>

        {/* Top Right: Target Coordinates Telemetry Pill */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-2.5 glass-panel px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-300 border border-cyan-500/30 shadow-lg">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-bold">TARGET:</span>
            <span className="text-cyan-300 font-bold">19.0760° N, 72.8777° E</span>
            <span className="text-slate-500">|</span>
            <span className="text-white font-bold tracking-wider">DJSCE</span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. LEFT SIDE SECTION (EVENTS, TEAM, RESEARCH, ABOUT US)                   */}
      {/* Vertically centered on the left half; arrows aligned in a clean column    */}
      {/* ========================================================================= */}
      <nav
        aria-label="Main Navigation"
        className="absolute left-10 sm:left-14 md:left-20 lg:left-28 top-1/2 -translate-y-1/2 z-20 pointer-events-auto"
      >
        <div className="flex flex-col space-y-8 md:space-y-10 lg:space-y-12">
          {NAV_ITEMS.map((item) => {
            const isHovered = hoveredItem === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleNavClick(item.destinationId)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className="group cursor-pointer flex items-center justify-between w-[320px] sm:w-[380px] md:w-[440px] lg:w-[480px] py-1 transition-all duration-300 transform hover:translate-x-3"
              >
                {/* Fixed-width label container: ensures zero wrapping and no button collision */}
                <div className="flex flex-col">
                  <span className="font-heading font-black text-3xl sm:text-4xl md:text-5xl lg:text-5xl tracking-[0.18em] uppercase text-slate-100 group-hover:text-cyan-300 transition-colors whitespace-nowrap drop-shadow-md">
                    <ScrambleText text={item.label} isHovered={isHovered} />
                  </span>
                  {/* Subtle Subtitle */}
                  <span
                    className={`font-mono text-[9px] md:text-[10px] tracking-[0.2em] uppercase transition-all duration-300 mt-0.5 ${
                      isHovered ? 'text-cyan-400 opacity-100' : 'text-slate-500/70 opacity-40'
                    }`}
                  >
                    {item.subtitle}
                  </span>
                </div>

                {/* Circular Arrow Button (Reference Match) */}
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-slate-700/80 bg-slate-950/60 backdrop-blur-md group-hover:border-cyan-400 group-hover:bg-cyan-950/70 group-hover:shadow-glow-cyan flex items-center justify-center text-slate-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all shrink-0 ml-4">
                  <ArrowRight className="w-4 h-4 md:w-4.5 md:h-4.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. BOTTOM PROMPTS: Fixed to viewport bottom to prevent overlap            */}
      {/* ========================================================================= */}
      <footer className="absolute bottom-6 md:bottom-8 left-8 sm:left-12 md:left-20 right-8 md:right-12 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-none">
        {/* Scroll Prompt */}
        <div className="pointer-events-auto flex items-center gap-3 glass-panel px-4 py-2 rounded-full text-xs font-mono text-slate-300 shadow-glow-cyan border border-cyan-500/20">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-300 font-bold">SCROLL DOWN</span>
          <span className="text-slate-400">TO ZOOM MUMBAI & ENTER ACM CITY</span>
          <ChevronDown className="w-4 h-4 text-cyan-400 animate-bounce ml-1" />
        </div>

        {/* Direct CTA */}
        <button
          onClick={enterCityDirectly}
          className="pointer-events-auto group px-4 py-2 rounded-xl font-heading font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500 shadow-glow-cyan transition-all flex items-center gap-2"
        >
          <span>ENTER BOULEVARD DIRECTLY</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </footer>
    </div>
  );
};
