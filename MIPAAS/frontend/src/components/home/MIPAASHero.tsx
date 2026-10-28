'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import InteractiveEarth from './InteractiveEarth';
import FeatureCards from './FeatureCards';
import CareviaDashboardPreview from './CareviaDashboardPreview';
import MultiRoleAuthModal from '@/components/auth/MultiRoleAuthModal';
import { useRBAC } from '@/context/RBACContext';
import { useIndicLanguage } from '@/context/IndicLanguageContext';

export default function MIPAASHero() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isAuthenticated } = useRBAC();
  const { t } = useIndicLanguage();

  return (
    <>
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#bfe3f4] via-[#cfeaf7] to-[#e4f3fb] pt-10 sm:pt-16 pb-20 text-slate-800">
        {/* Clouds / soft light */}
        <div className="pointer-events-none absolute -left-24 top-40 h-[420px] w-[620px] rounded-full bg-white/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[700px] rounded-full bg-white/60 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-[500px] w-[500px] rounded-full bg-cyan-100/60 blur-3xl" />

        {/* DNA helix top */}
        <svg className="pointer-events-none absolute -top-10 left-[8%] h-[420px] w-[520px] opacity-40" viewBox="0 0 520 420" fill="none">
          <path d="M0 380 C120 330 160 120 300 90 S470 40 520 0" stroke="white" strokeWidth="10" strokeLinecap="round" />
          <path d="M0 330 C140 330 150 160 290 150 S450 70 520 40" stroke="white" strokeWidth="10" strokeLinecap="round" />
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={i} x1={20 + i * 36} y1={360 - i * 26} x2={50 + i * 36} y2={320 - i * 26} stroke="white" strokeWidth="3" opacity="0.7" />
          ))}
        </svg>
        {/* DNA helix bottom-left */}
        <svg className="pointer-events-none absolute -bottom-10 -left-10 h-[420px] w-[420px] opacity-35" viewBox="0 0 420 420" fill="none">
          <path d="M0 420 C80 300 200 340 260 200 S380 60 420 0" stroke="white" strokeWidth="10" strokeLinecap="round" />
          <path d="M40 420 C130 340 230 380 290 240 S400 110 420 60" stroke="white" strokeWidth="10" strokeLinecap="round" />
        </svg>
        {/* ECG line */}
        <svg className="pointer-events-none absolute right-[8%] top-16 hidden h-24 w-[620px] opacity-50 lg:block" viewBox="0 0 620 100" fill="none">
          <path d="M0 55 H120 L135 55 L150 20 L165 85 L180 40 L195 55 H300 L315 55 L330 15 L345 90 L360 35 L375 55 H500 L515 30 L530 70 L545 55 H620" stroke="white" strokeWidth="2" />
        </svg>
        {/* Network dots */}
        <svg className="pointer-events-none absolute right-0 top-0 hidden h-[420px] w-[520px] opacity-60 lg:block" viewBox="0 0 520 420" fill="none">
          {[[120, 90], [260, 40], [380, 130], [470, 60], [330, 250], [450, 220], [200, 190]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6" fill="#bfe8f7" stroke="white" strokeWidth="2" />
          ))}
          <path d="M120 90 L260 40 L380 130 L470 60 M380 130 L330 250 M380 130 L450 220 M260 40 L200 190 L330 250" stroke="white" strokeWidth="1.2" opacity="0.8" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center min-h-[540px]">
            {/* LEFT */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2.5 py-1.5 pl-1.5 pr-4 rounded-full bg-slate-400/30 backdrop-blur-md text-slate-700">
                <div className="flex -space-x-2">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 ring-2 ring-white/80" />
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 ring-2 ring-white/80" />
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 ring-2 ring-white/80" />
                </div>
                <span className="text-xs sm:text-sm font-semibold tracking-tight">{t('hero_eyebrow')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-extrabold text-[#0f1f3d] tracking-tight leading-[1.1]">
                {t('hero_headline')}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-700 max-w-xl leading-relaxed">
                {t('hero_subtext')}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="px-7 py-3.5 rounded-full bg-[#0f1f3d] hover:bg-[#16294f] text-white font-semibold text-sm sm:text-base shadow-lg transition-all cursor-pointer flex items-center gap-2 group"
                >
                  <span>{t('hero_get_started')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#features"
                  className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-[#0f1f3d] font-bold text-sm sm:text-base shadow-md transition-all flex items-center gap-2 group"
                >
                  <span>{t('hero_explore_pathways')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-400" />
                </a>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <InteractiveEarth />
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <div id="dashboard-preview" className="mt-8 sm:mt-12 animate-in fade-in duration-300">
            <CareviaDashboardPreview />
          </div>
        )}

        <div className="mt-8 sm:mt-12 relative z-10">
          <FeatureCards />
          
        </div>
      </section>

      <MultiRoleAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole="patient"
      />
    </>
  );
}