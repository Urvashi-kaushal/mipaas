'use client';

import { Cpu, Database, FileImage, ShieldCheck, UserCheck, Lock } from 'lucide-react';

const technology = [
  { name: 'TorchXRayVision', note: 'Chest X-ray models (DenseNet-121)' },
  { name: 'PyTorch', note: 'Deep learning framework' },
  { name: 'DICOM', note: 'Medical imaging standard' },
  { name: 'Grad-CAM', note: 'Visual explanations' },
  { name: 'BraTS', note: 'Brain tumour MRI dataset' },
  { name: 'ACDC', note: 'Cardiac MRI dataset' },
  { name: 'HAM10000', note: 'Skin lesion dataset' },
  { name: 'Next.js', note: 'Web platform' },
];

const principles = [
  {
    icon: UserCheck,
    title: 'Clinician in control',
    text: 'AI output is a draft. A doctor reviews, edits and signs every report.',
  },
  {
    icon: Lock,
    title: 'Role-based access',
    text: 'Patients, doctors, radiologists and admins only see what their role allows.',
  },
  {
    icon: FileImage,
    title: 'DICOM-ready',
    text: 'Imaging studies are ingested in the standard format used by hospitals.',
  },
  {
    icon: ShieldCheck,
    title: 'Explainable results',
    text: 'Probabilities and heatmaps let a clinician check why a finding was flagged.',
  },
];

export default function PartnersSection() {
  return (
    <section
      aria-labelledby="ecosystem-heading"
      className="border-b border-slate-200/80 bg-white py-16 text-slate-900 md:py-20"
    >
      <div className="site-container">
        <div className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-12">
          <div>
            <p className="eyebrow mb-3 text-xs font-bold uppercase tracking-wider !text-blue-600">
              Built on open science
            </p>
            <h2 id="ecosystem-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Technology behind MiPAAS
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
              MiPAAS builds on published models, public research datasets and open standards, so its methods can be
              inspected rather than taken on trust.
            </p>
          </div>

                  <ul
            aria-label="Technology and datasets used"
            className="flex flex-wrap content-center gap-2.5"
          >
            {technology.map((item) => (
              <li
                key={item.name}
                title={item.note}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:bg-white hover:text-blue-600"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {item.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 grid gap-6 border-t border-slate-200/80 pt-10 md:grid-cols-[1fr_2fr] md:gap-12">
          <div>
            <h3 className="text-base font-bold text-slate-900">Safety and trust principles</h3>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-600">
              MiPAAS is clinical decision support software. It assists clinicians and does not replace their judgement.
              Regulatory clearances will be listed here only once they are granted.
            </p>
          </div>

          <ul aria-label="Design principles" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {principles.map((p) => {
              const Icon = p.icon;
              return (
                <li
                  key={p.title}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4 transition-all hover:border-blue-200 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{p.title}</div>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{p.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}