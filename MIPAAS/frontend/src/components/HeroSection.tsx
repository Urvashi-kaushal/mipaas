'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRBAC } from '@/context/RBACContext';

const LOGIN_URL = '/login?redirect=/doctor';

export default function HeroSection() {
  const { isIamAuthenticated } = useRBAC();

  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-gradient-to-br from-[#dceeff] via-[#edf7ff] to-[#d6ecfd] pt-12 pb-20 text-slate-800" aria-labelledby="hero-heading">
      
      {/* Background DNA & Medical Grid Decorative Overlays */}
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Light Blue Subtle Medical Pulse Lines */}
      <div className="pointer-events-none absolute top-10 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-[600px] w-[600px] rounded-full bg-blue-300/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Hero Text & Actions */}
          <div className="lg:col-span-6 z-10">
            
            {/* 6k+ Users Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md border border-white/80 mb-6">
              <div className="flex -space-x-1.5">
                <span className="inline-block h-5 w-5 rounded-full bg-sky-400 ring-2 ring-white" />
                <span className="inline-block h-5 w-5 rounded-full bg-emerald-400 ring-2 ring-white" />
                <span className="inline-block h-5 w-5 rounded-full bg-amber-400 ring-2 ring-white" />
              </div>
              <span>6k+ happy users</span>
            </div>

            <h1 id="hero-heading" className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.15]">
              Better way to support <br />
              <span className="text-sky-600">patients digitally</span> and efficiently
            </h1>

            <p className="mt-6 text-base text-slate-600 sm:text-lg leading-relaxed max-w-xl">
              MiPAAS helps clinics deliver a calm, modern health experience with clear reports, appointments, and real-time updates all in one platform.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {isIamAuthenticated ? (
                <>
                  <Link href="/doctor" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all">
                    Open workstation <ArrowRight size={17} />
                  </Link>
                  <a href="#products" className="inline-flex items-center gap-2 rounded-full bg-white/90 px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-white transition-all">
                    Explore Pathways <ArrowRight size={17} />
                  </a>
                </>
              ) : (
                <>
                  <a href="#products" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all">
                    Get Started <ArrowRight size={17} />
                  </a>
                  <Link href={LOGIN_URL} className="inline-flex items-center gap-2 rounded-full bg-white/90 px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-white transition-all">
                    Explore Pathways <ArrowRight size={17} />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Rotating Earth & Medical Visual Elements */}
          <div className="relative lg:col-span-6 flex items-center justify-center">
            
            <div className="relative w-full max-w-[540px] aspect-square flex items-center justify-center">
              
              {/* Rotating Earth Sphere Container */}
              <div className="absolute inset-4 rounded-full border border-sky-300/40 shadow-2xl bg-gradient-to-b from-sky-400/10 to-blue-600/20 overflow-hidden backdrop-blur-sm animate-[spin_60s_linear_infinite]">
                <div 
                  className="w-full h-full bg-cover bg-center opacity-85 scale-110"
                  style={{
                    backgroundImage: `url('/images/earth-texture.jpg')`
                  }}
                />
              </div>

              {/* Central Glowing 3D Heart AI Processing Card Overlay */}
              <div className="absolute z-20 top-1/4 right-[10%] w-52 rounded-2xl bg-slate-900/80 p-3 text-white backdrop-blur-md border border-cyan-400/40 shadow-2xl">
                <div className="flex items-center justify-between text-[11px] font-medium text-cyan-300 mb-1">
                  <span>AI Processing Active</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="h-28 w-full rounded-lg bg-slate-950/60 flex items-center justify-center relative overflow-hidden border border-slate-700/50">
                  <div className="text-center text-xs text-cyan-200">
                    <span className="block font-semibold">3D Heart Reconstruction</span>
                    <span className="text-[10px] text-slate-400">Active segmentation</span>
                  </div>
                </div>
              </div>

              {/* Floating DICOM Scanning Cards Around Earth */}
              <div className="absolute z-20 bottom-8 left-2 w-36 h-44 rounded-xl bg-slate-900/80 p-1.5 backdrop-blur-md border border-sky-400/30 shadow-xl">
                <div className="h-full w-full rounded-lg bg-slate-950/90 flex flex-col justify-end p-2 text-[10px] text-sky-200 border border-slate-800">
                  <span className="font-medium text-white">X-Ray DICOM</span>
                  <span className="text-slate-400">Multi-Modal</span>
                </div>
              </div>

              <div className="absolute z-20 top-4 right-4 w-40 h-48 rounded-xl bg-slate-900/80 p-1.5 backdrop-blur-md border border-sky-400/30 shadow-xl">
                <div className="h-full w-full rounded-lg bg-slate-950/90 flex flex-col justify-end p-2 text-[10px] text-sky-200 border border-slate-800">
                  <span className="font-medium text-white">Chest Scan</span>
                  <span className="text-slate-400">Analysis complete</span>
                </div>
              </div>

              <div className="absolute z-20 bottom-12 right-6 w-36 h-36 rounded-xl bg-slate-900/80 p-1.5 backdrop-blur-md border border-sky-400/30 shadow-xl">
                <div className="h-full w-full rounded-lg bg-slate-950/90 flex flex-col justify-end p-2 text-[10px] text-sky-200 border border-slate-800">
                  <span className="font-medium text-white">MRI Slice</span>
                  <span className="text-slate-400">3D Volume</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
} 
