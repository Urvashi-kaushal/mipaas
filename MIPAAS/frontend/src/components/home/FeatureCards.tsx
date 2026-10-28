'use client';

import React from 'react';
import { ScanLine, FileCheck2, ShieldCheck } from 'lucide-react';

const cards = [
  {
    icon: ScanLine,
    title: 'AI Imaging Analysis',
    description: 'Chest X-ray screening for 14 pathologies with probabilities and Grad-CAM heatmaps.',
  },
  {
    icon: FileCheck2,
    title: 'Clinician-Signed Reports',
    description: 'Doctors review, edit and sign every AI draft before it reaches the patient.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    description: 'Patients, doctors, radiologists and admins only see what their role allows.',
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="relative z-20 mx-auto w-full max-w-6xl scroll-mt-28 px-4 pb-12 sm:px-6">
      <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group flex items-start gap-4 rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_10px_30px_rgba(30,58,138,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_36px_rgba(30,58,138,0.12)]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white">
                <Icon className="h-6 w-6 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold tracking-tight text-slate-900">{card.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500 sm:text-sm">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}