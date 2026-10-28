'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, X, CheckCircle2 } from 'lucide-react';

type Detail = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  points: string[];
  note: string;
};

const DETAILS: Record<string, Detail> = {
  stroke: {
    id: 'stroke',
    eyebrow: 'Clinical pathway · qStroke',
    title: 'Faster stroke triage with CT head review support',
    intro:
      'In acute stroke, every minute matters. qStroke analyses a head CT and highlights studies that may need urgent attention, so the radiologist can review the most time-critical cases first.',
    points: [
      'Flags possible large vessel occlusion (LVO) on CT',
      'Scores early ischemic change using ASPECTS',
      'Shows results next to the scan so the clinician can verify them',
      'Output is a draft that a doctor reviews and signs',
    ],
    note: 'qStroke is decision support. It does not diagnose, and it does not replace clinical judgement.',
  },
  review: {
    id: 'review',
    eyebrow: 'Clinical workflow',
    title: 'Explainable AI with clinician sign-off',
    intro:
      'AI results are only useful if a clinician can check them. MiPAAS shows why the model flagged a finding, and keeps a doctor in control of the final report.',
    points: [
      'Grad-CAM heatmaps highlight the image region behind a finding',
      'Every finding comes with a probability, not just a label',
      'Doctors and radiologists can edit the draft report',
      'Signed reports are released to the patient portal',
    ],
    note: 'Heatmaps show what influenced the model. They are an aid to review, not proof that a finding is correct.',
  },
  platform: {
    id: 'platform',
    eyebrow: 'Platform overview',
    title: 'What is included in MiPAAS',
    intro:
      'MiPAAS puts imaging AI, reporting and patient communication in one place, so clinics do not have to move between separate tools.',
    points: [
      '7 AI pathways: chest X-ray, lung CT, stroke, brain MRI, cardiac MRI, skin lesions and plantar thermography',
      'Chest X-ray screening across 14 pathologies',
      'Role-based access for patients, doctors, radiologists and admins',
      'Appointments, diagnostic reports, vitals and secure messaging',
      'DICOM study ingestion',
    ],
    note: 'Availability of individual pathways depends on your deployment.',
  },
  qxr: {
    id: 'qxr',
    eyebrow: 'Clinical pathway · qXR',
    title: 'Chest X-ray screening for primary care',
    intro:
      'Many clinics have an X-ray machine but no radiologist on site. qXR reads a chest X-ray within moments and gives the clinician a structured first look.',
    points: [
      'Screens for 14 pathologies, including effusion, pneumonia, atelectasis and consolidation',
      'Uses the TorchXRayVision DenseNet-121 model',
      'Returns a probability for each finding with a Grad-CAM heatmap',
      'Produces a plain-language summary that patients can read',
    ],
    note: 'qXR supports screening and triage. Findings need confirmation by a qualified clinician.',
  },
};

function DetailModal({ detail, onClose }: { detail: Detail | null; onClose: () => void }) {
  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [detail, onClose]);

  if (!detail) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{detail.eyebrow}</p>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{detail.title}</h3>
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

        <div className="space-y-4 overflow-y-auto p-6">
          <p className="text-sm leading-relaxed text-slate-600">{detail.intro}</p>
          <ul className="space-y-2.5">
            {detail.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
            {detail.note}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 p-5">
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
  );
}

export default function DevelopmentsSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const close = () => setActiveId(null);
  const activeDetail = activeId ? DETAILS[activeId] : null;

  const linkBtn =
    'inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-blue-600 transition-colors hover:text-blue-700';

  return (
    <>
      <section
        id="pricing"
        aria-labelledby="developments-heading"
        className="scroll-mt-28 border-b border-slate-200/80 bg-slate-50/70 py-20 text-slate-900"
      >
        <div className="site-container">
          <header className="mb-12 max-w-3xl">
            <p className="eyebrow mb-2 text-xs font-bold uppercase tracking-wider !text-blue-600">
              Capabilities & workflow
            </p>
            <h2 id="developments-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Explore Our Latest Developments
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              A closer look at the clinical pathways and workflow features available in MiPAAS today.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Card 1: qStroke */}
            <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:shadow-md lg:col-span-2">
              <div className="grid h-full sm:grid-cols-[1.15fr_1fr]">
                <div className="flex flex-col p-6 sm:p-8">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600">Clinical pathway · Stroke</p>
                  <h3 className="text-2xl font-bold leading-snug tracking-tight text-slate-900">
                    Faster stroke triage with AI-assisted CT head review
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    qStroke flags possible large vessel occlusion and scores early ischemic change, helping urgent
                    cases reach a radiologist sooner.
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    Decision support only. A clinician reviews every result.
                  </p>
                  <div className="mt-auto pt-6">
                    <button
                      type="button"
                      onClick={() => setActiveId('stroke')}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700"
                    >
                      <span>Explore qStroke</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
                <div className="relative min-h-64 bg-slate-100">
                  <Image
                    src="/images/mipaas_stroke_care.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 45vw, 30vw"
                    loading="lazy"
                    className="object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              </div>
            </article>

            {/* Card 2: Explainable AI */}
            <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:shadow-md">
              <div className="relative h-48 bg-slate-100">
                <Image
                  src="/images/img.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 1023px) 100vw, 33vw"
                  loading="lazy"
                  className="object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-600">Clinical workflow</p>
                <h3 className="text-lg font-bold leading-snug text-slate-900">
                  Explainable AI results with clinician sign-off
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  Heatmaps show what drove each finding, and a doctor edits and signs the report before it is released.
                </p>
                <div className="mt-auto pt-5">
                  <button type="button" onClick={() => setActiveId('review')} className={linkBtn}>
                    <span>See how review works</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </article>

            {/* Card 3: Platform overview */}
            <article className="flex flex-col rounded-2xl border border-blue-100 bg-blue-50/60 p-6 transition-all hover:shadow-md sm:p-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-600">Platform overview</p>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">One platform, seven pathways</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Imaging AI, reports, appointments and secure messaging for patients, doctors, radiologists and admins,
                all in one workflow.
              </p>
              <div className="mt-auto border-t border-blue-100 pt-6">
                <button type="button" onClick={() => setActiveId('platform')} className={linkBtn}>
                  <span>See what&apos;s included</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </article>

            {/* Card 4: qXR */}
            <article className="grid overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:shadow-md sm:grid-cols-2 lg:col-span-2">
              <div className="relative min-h-64 bg-slate-100">
                <Image
                  src="/images/mipaas_radiology_future.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  loading="lazy"
                  className="object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-600">Clinical pathway · Chest X-ray</p>
                <h3 className="text-2xl font-bold leading-snug tracking-tight text-slate-900">
                  Chest X-ray screening for clinics without an on-site radiologist
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-500">
                  Upload a chest X-ray and get probabilities for 14 pathologies with a heatmap, ready for a clinician to
                  review.
                </p>
                <div className="mt-auto pt-6">
                  <button type="button" onClick={() => setActiveId('qxr')} className={linkBtn}>
                    <span>Explore qXR</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <DetailModal detail={activeDetail} onClose={close} />
    </>
  );
}