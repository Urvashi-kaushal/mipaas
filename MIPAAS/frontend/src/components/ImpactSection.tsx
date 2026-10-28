'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, X, Activity, Brain, Heart, Wind, ScanLine, Footprints, Zap,
  Database, ShieldCheck, UserCheck, FileText,
} from 'lucide-react';

type Item = { name: string; sub: string; description: string; icon: React.ElementType };

const PATHWAYS: Item[] = [
  { name: 'qXR · Chest X-ray', sub: 'Chest radiograph (CXR)', icon: ScanLine,
    description: 'Screens a chest X-ray for 14 pathologies, including effusion, pneumonia, atelectasis and consolidation. Each finding gets a probability, and Grad-CAM heatmaps show which region drove the result.' },
  { name: 'qCT Lung', sub: 'Low-dose CT (LDCT)', icon: Wind,
    description: 'Supports lung nodule follow-up and screening, with nodule volume tracking and a 6-year lung cancer risk estimate.' },
  { name: 'qStroke', sub: 'CT head', icon: Zap,
    description: 'Helps flag large vessel occlusion and scores early ischemic change (ASPECTS) so urgent cases get reviewed sooner.' },
  { name: 'qBrain', sub: 'Multi-sequence MRI', icon: Brain,
    description: 'Segments brain tumour regions from 4-sequence MRI to help radiologists with measurement and follow-up comparison.' },
  { name: 'qCardiac', sub: 'Cine MRI', icon: Heart,
    description: 'Segments the ventricles and reports 17-segment AHA wall analysis and ejection fraction for cardiac review.' },
  { name: 'qDerm', sub: 'Skin lesion images', icon: Activity,
    description: 'Classifies pigmented skin lesions into 7 classes to help prioritise which ones need a dermatologist.' },
  { name: 'qThermo', sub: 'Plantar thermogram', icon: Footprints,
    description: 'Reviews foot thermograms for temperature asymmetry, supporting early diabetic foot screening.' },
];

const EVIDENCE: Item[] = [
  { name: 'Models used', sub: 'Open, published architectures', icon: Database,
    description: 'Chest X-ray analysis uses TorchXRayVision DenseNet-121. Other pathways build on public research models for lung CT, brain MRI, cardiac MRI and skin lesion classification.' },
  { name: 'Training datasets', sub: 'Public research datasets', icon: FileText,
    description: 'Pathways reference datasets such as BraTS (brain MRI), ACDC (cardiac MRI) and HAM10000 (skin lesions). Dataset details are available for each pathway.' },
  { name: 'Explainability', sub: 'Grad-CAM heatmaps', icon: ScanLine,
    description: 'For image findings, heatmaps highlight the regions that influenced the AI result, so a clinician can check the finding against the scan.' },
  { name: 'Clinician review', sub: 'Human in the loop', icon: UserCheck,
    description: 'AI output is a draft. Doctors and radiologists review, edit and sign each report before it reaches a patient.' },
  { name: 'Access and privacy', sub: 'Role-based access', icon: ShieldCheck,
    description: 'Patients, doctors, radiologists and admins each see only what their role allows.' },
];

function Modal({
  open, onClose, eyebrow, title, subtitle, items, footerNote,
}: {
  open: boolean; onClose: () => void; eyebrow: string; title: string;
  subtitle: string; items: Item[]; footerNote: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{eyebrow}</p>
            <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 cursor-pointer rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-3 overflow-y-auto p-6 sm:grid-cols-2">
          {items.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.name} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:border-blue-200 hover:bg-white hover:shadow-md">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{p.name}</div>
                    <div className="text-[11px] font-medium text-slate-400">{p.sub}</div>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">{p.description}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-relaxed text-slate-500 sm:max-w-md">{footerNote}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-white"
            >
              Close
            </button>
            <Link
              href="/login?redirect=/doctor"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-black"
            >
              <span>Open workstation</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImpactSection() {
  const [openModal, setOpenModal] = useState<'pathways' | 'evidence' | null>(null);
  const close = () => setOpenModal(null);

  const impactCards = [
    {
      tag: 'Clinical AI',
      title: 'From scan to insight:',
      subtitle: 'AI-assisted imaging, reviewed by clinicians',
      description:
        'Upload a chest X-ray or DICOM study and get pathology probabilities with Grad-CAM heatmaps, packaged into a structured report that a doctor can review, edit and sign off.',
      buttonText: 'Explore clinical pathways',
      modal: 'pathways' as const,
      image: '/images/mipaas_global_impact.jpg',
    },
    {
      tag: 'Care coordination',
      title: 'One workspace:',
      subtitle: 'Patients, doctors and radiologists connected',
      description:
        'Hospital-style DICOM ingestion, role-based access for patients, doctors, radiologists and admins, plus appointments, reports and secure messaging in one platform.',
      buttonText: 'View clinical evidence',
      modal: 'evidence' as const,
      image: '/images/mipaas_clinical_achievement.jpg',
    },
  ];

  return (
    <>
      <section
        id="product"
        aria-labelledby="impact-heading"
        className="scroll-mt-28 border-b border-slate-200/80 bg-white py-20 text-slate-900"
      >
        <div className="site-container">
          <header className="mb-12 grid gap-6 border-b border-slate-200 pb-8 md:grid-cols-2 md:gap-12">
            <div>
              <p className="eyebrow mb-2 text-xs font-bold uppercase tracking-wider !text-blue-600">Platform in practice</p>
              <h2 id="impact-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                From pathways to practice
              </h2>
            </div>
            <p className="max-w-lg self-end text-sm leading-relaxed text-slate-600 md:text-base">
              MiPAAS brings imaging AI, reporting and patient communication into one clinical workflow. AI results are
              decision support and are always meant to be reviewed by a qualified clinician.
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-2 lg:gap-10">
            {impactCards.map((card) => (
              <article
                key={card.title}
                className="flex flex-col rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 transition-all hover:border-blue-200 hover:shadow-lg sm:p-8"
              >
                <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 100vw, 50vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-600">{card.tag}</p>
                <h3 className="mb-2 text-2xl font-bold leading-snug tracking-tight text-slate-900">
                  <span>{card.title} </span>
                  <span className="font-semibold text-slate-600">{card.subtitle}</span>
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-slate-500">{card.description}</p>
                <div className="mt-auto pt-2">
                  <button
                    type="button"
                    onClick={() => setOpenModal(card.modal)}
                    className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-black sm:text-sm"
                  >
                    <span>{card.buttonText}</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Modal
        open={openModal === 'pathways'}
        onClose={close}
        eyebrow="Clinical pathways"
        title="AI pathways available in MiPAAS"
        subtitle="Each pathway is built for a specific imaging type and produces a result a clinician reviews."
        items={PATHWAYS}
        footerNote="AI outputs support, and do not replace, clinical judgement. Every result should be reviewed by a qualified clinician before any decision is made."
      />

      <Modal
        open={openModal === 'evidence'}
        onClose={close}
        eyebrow="Clinical evidence"
        title="How MiPAAS results are produced"
        subtitle="The models, data and review steps behind every report."
        items={EVIDENCE}
        footerNote="This describes the methods behind the platform. It is not a clinical trial result or a performance claim."
      />
    </>
  );
}