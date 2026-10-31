
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRBAC } from '@/context/RBACContext';
import {
  Menu,
  X,
  ArrowRight,
  Activity,
  Heart,
  Stethoscope,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

import MultiRoleAuthModal from '@/components/auth/MultiRoleAuthModal';
import { useIndicLanguage } from '@/context/IndicLanguageContext';
import IndicLanguageSelector from '@/components/common/IndicLanguageSelector';
import AdminPortalButton from '@/components/common/AdminPortalButton';

export default function MIPAASNavbar() {
  const { currentUser, isAuthenticated, logout } = useRBAC();
  const { t } = useIndicLanguage();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDoctor =
    isAuthenticated &&
    (currentUser?.role === 'doctor' || currentUser?.role === 'radiologist');

  const isPatient = isAuthenticated && currentUser?.role === 'patient';
  const isAdmin = isAuthenticated && currentUser?.role === 'admin';

  const roleBtn =
    'px-4 py-2 rounded-full text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all';

  const logoutBtn =
    'p-2 text-slate-600 hover:text-slate-900 rounded-full text-xs cursor-pointer';

  const plainNavBtn =
    'text-black hover:text-blue-700 text-md px-3 py-2 cursor-pointer transition-colors whitespace-nowrap';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#cfeaf7]/80 backdrop-blur-md border-b border-white/60 transition-all">

        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>

            <span className="text-xl sm:text-2xl font-black text-[#0f3a6b] tracking-tight">
              MiPAAS
            </span>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center gap-8 px-8 py-3 rounded-full bg-slate-400/25 backdrop-blur-md text-sm font-semibold text-[#0f1f3d]">
            <Link href="#solutions" className="hover:text-blue-600 transition-colors">
              {t('nav_solutions')}
            </Link>

            <Link href="#features" className="hover:text-blue-600 transition-colors">
              {t('nav_features')}
            </Link>

            <Link href="#product" className="hover:text-blue-600 transition-colors">
              {t('nav_product')}
            </Link>

            <Link href="#pricing" className="hover:text-blue-600 transition-colors">
              {t('nav_updates')}
            </Link>
          </nav>

          {/* Right Navigation */}
          <div className="flex items-center justify-end gap-3 ml-auto">

            {/* Language Selector */}
            <div className="flex items-center shrink-0">
              <IndicLanguageSelector />
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center justify-end gap-2 lg:gap-3">

              {/* Role-based Login / Portal */}
              {isDoctor ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/doctor"
                    className={`${roleBtn} bg-blue-600 hover:bg-blue-700`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>{t('nav_doctor_workstation')}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={logout}
                    className={logoutBtn}
                    title={t('nav_sign_out')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : isPatient ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/patient"
                    className={`${roleBtn} bg-blue-600 hover:bg-blue-700`}
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    <span>{t('nav_patient_portal')}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={logout}
                    className={logoutBtn}
                    title={t('nav_sign_out')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : isAdmin ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/admin"
                    className={`${roleBtn} bg-purple-600 hover:bg-purple-700`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('nav_admin_console')}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={logout}
                    className={logoutBtn}
                    title={t('nav_sign_out')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className={plainNavBtn}
                >
                  {t('nav_login')}
                </button>
              )}

              {/* Admin Portal - Same appearance as Login */}
              <AdminPortalButton className={plainNavBtn} />

              {/* Request Demo */}
              {!isDoctor && !isPatient && !isAdmin && (
                <a
                  href="#contact"
                  className="px-5 py-3 rounded-full bg-[#0f1f3d] hover:bg-[#16294f] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>{t('nav_request_demo')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}

            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#0f1f3d] hover:bg-white/40 rounded-xl border border-slate-400/40"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/90 backdrop-blur-xl border-b border-white/60 p-5 space-y-4 animate-in fade-in text-[#0f1f3d]">

            <nav className="flex flex-col space-y-3 text-sm font-medium">
              <Link
                href="#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-600"
              >
                {t('nav_solutions')}
              </Link>

              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-600"
              >
                {t('nav_features')}
              </Link>

              <Link
                href="#product"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-600"
              >
                {t('nav_product')}
              </Link>

              <Link
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-600"
              >
                {t('nav_updates')}
              </Link>
            </nav>

            <div className="pt-3 border-t border-slate-200 space-y-2">

              {isDoctor && (
                <Link
                  href="/doctor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#0F9D9A] text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>{t('nav_doctor_workstation')}</span>
                </Link>
              )}

              {isPatient && (
                <Link
                  href="/patient"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#0F9D9A] text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{t('nav_patient_portal')}</span>
                </Link>
              )}

              {!isDoctor && !isPatient && !isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0f1f3d] text-white font-bold text-sm cursor-pointer"
                >
                  {t('nav_login')}
                </button>
              )}

              {/* Mobile Admin Portal */}
              <AdminPortalButton className="block w-full text-center py-2.5 rounded-xl text-[#0f1f3d] hover:bg-slate-100 font-bold text-sm transition-colors" />

              {!isDoctor && !isPatient && !isAdmin && (
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 rounded-xl bg-[#0f1f3d] text-white font-bold text-sm text-center"
                >
                  {t('nav_request_demo')}
                </a>
              )}

            </div>
          </div>
        )}

      </header>

      <MultiRoleAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole="patient"
      />
    </>
  );
}
