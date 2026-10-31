'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRBAC } from '@/context/RBACContext';
import { UserProfile, ROLE_DEFINITIONS } from '@/types/rbac';
import { clinicalApiService } from '@/services/clinicalApiService';
import { iamAuthService } from '@/services/iamAuthService';
import { DEMO_AUTH_ENABLED } from '@/lib/demoMode';
import { adminLogin } from '@/lib/siteSettings';
import { X, Heart, UserPlus, User, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface MultiRoleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'patient' | 'doctor' | 'admin'; // kept so existing pages still work; the role is now worked out from the sign-in
  initialMode?: 'login' | 'register';
}

const inputCls =
  'w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#071d33] border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#16d9f5] focus:ring-1 focus:ring-[#16d9f5]';

const toName = (value: string) =>
  value
    .split('@')[0]
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function MultiRoleAuthModal({ isOpen, onClose, initialMode = 'login' }: MultiRoleAuthModalProps) {
  const router = useRouter();
  const { switchPersona, loginWithCustomProfile, loginWithIAM } = useRBAC();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reg, setReg] = useState({ fullName: '', email: '', password: '', confirmPassword: '', consent: false });

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError(null);
    setSuccess(null);
  };

  const finish = (message: string, path: string) => {
    setSuccess(message);
    setTimeout(() => {
      setLoading(false);
      onClose();
      router.push(path);
    }, 900);
  };

  /* ---------- LOGIN ---------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const id = identifier.trim();
    const lower = id.toLowerCase();

    try {
      // 1. Site administrators: the admin ID is checked against the MiPAAS database
      try {
        const r = await adminLogin(id, password);
        sessionStorage.setItem('mipaas_admin_token', r.token);
        sessionStorage.setItem('mipaas_admin_id', r.admin_id);
        finish(`Signed in as ${r.admin_id}. Opening the Site Control portal...`, '/admin/portal');
        return;
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        // An ID without "@" can only be an admin ID, so show the admin error. An email carries on as patient or doctor.
        if (/too many/i.test(message) || !id.includes('@')) throw err;
      }

      // 2. Patients and doctors, using the real login server
      if (!DEMO_AUTH_ENABLED) {
        let lastError = 'Incorrect email or password.';
        for (const role of ['doctor', 'patient'] as const) {
          try {
            const res = await iamAuthService.loginRole({ role, identifier: id, password });
            if (res.success && res.data?.user) {
              loginWithIAM(res.data.user);
              const mapped = iamAuthService.mapIamUserToClinicalProfile(res.data.user).role;
              const path = mapped === 'patient' ? '/patient' : mapped === 'doctor' || mapped === 'radiologist' ? '/doctor' : '/admin';
              finish(`Signed in as ${res.data.user.username}. Redirecting...`, path);
              return;
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : '';
            if (/unavailable/i.test(message)) {
              lastError = message;
              break;
            }
          }
        }
        throw new Error(lastError);
      }

      // 3. Demo mode: the role is worked out from the email
      const looksLikeDoctor = /doctor|physician|^dr[.\-_]|[.\-_]dr[.\-_@]/i.test(id);

      if (looksLikeDoctor) {
        const displayName = toName(lower) ? (toName(lower).toLowerCase().startsWith('dr') ? toName(lower) : `Dr. ${toName(lower)}`) : 'Attending Physician';
        const doctorProfile: UserProfile = {
          id: `doc-${Date.now().toString(36)}`,
          name: displayName,
          email: lower,
          role: 'doctor',
          roleTitle: 'Attending Physician',
          department: 'Clinical Medicine',
          organization: 'CareNest Health System',
          permissions: ROLE_DEFINITIONS.doctor.permissions,
        };
        loginWithCustomProfile(doctorProfile);
        finish(`Welcome, ${displayName}! Redirecting to the Doctor Portal...`, '/doctor');
      } else if (lower.includes('alex.taylor')) {
        switchPersona('pat-01');
        finish('Welcome back, Alex Taylor! Redirecting to your Patient Portal...', '/patient');
      } else {
        const pts = await clinicalApiService.getPatients().catch(() => []);
        const matchedPt = pts.find((p) => p.email && p.email.toLowerCase() === lower);
        const displayName = matchedPt ? matchedPt.name : toName(lower) || 'Patient User';
        const userProfile: UserProfile = {
          id: matchedPt?.id || `pat-${Date.now().toString(36)}`,
          name: displayName,
          email: lower,
          role: 'patient',
          roleTitle: 'Registered Patient',
          department: 'Primary Care',
          organization: 'CareNest Health System',
          permissions: ROLE_DEFINITIONS.patient.permissions,
        };
        if (!matchedPt) {
          await clinicalApiService
            .createPatient({ name: displayName, email: lower, primaryDiagnosis: 'General Clinical Intake' })
            .catch(() => null);
        }
        loginWithCustomProfile(userProfile);
        finish(`Welcome back, ${displayName}! Redirecting to your Patient Portal...`, '/patient');
      }
    } catch (err: unknown) {
      setLoading(false);
      setError((err instanceof Error ? err.message : String(err)) || 'Failed to sign in.');
    }
  };

  /* ---------- SIGN UP (patients) ---------- */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = reg.fullName.trim();
    const email = reg.email.trim();
    const phone = '(555) 019-2000';
    const dob = '1992-06-14';

    if (!name) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (reg.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (reg.password !== reg.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!reg.consent) {
      setError('You must agree to the privacy terms to create an account.');
      return;
    }

    setLoading(true);
    try {
      const patientRecord = {
        name,
        email,
        phone,
        dob,
        age: 32,
        gender: 'Not specified',
        bloodType: 'O+',
        primaryDiagnosis: 'Patient Self-Registered · Initial Assessment Scheduled',
      };

      if (!DEMO_AUTH_ENABLED) {
        const res = await iamAuthService.registerPatient({
          fullName: name,
          email,
          phone,
          dob,
          password: reg.password,
          consent: reg.consent,
        });
        if (!res.success || !res.data?.user) throw new Error(res.message || 'Patient registration failed.');
        await clinicalApiService.createPatient(patientRecord).catch(() => null);
        loginWithIAM(res.data.user);
      } else {
        await clinicalApiService.createPatient(patientRecord);
        const newProfile: UserProfile = {
          id: `pat-${Date.now().toString(36)}`,
          name,
          email,
          role: 'patient',
          roleTitle: 'Registered Patient',
          department: 'Primary Care',
          organization: 'CareNest Health System',
          permissions: ROLE_DEFINITIONS.patient.permissions,
        };
        loginWithCustomProfile(newProfile);
      }
      finish(`Account created for ${name}! Redirecting to your health portal...`, '/patient');
    } catch (err: unknown) {
      setLoading(false);
      setError((err instanceof Error ? err.message : String(err)) || 'Failed to create the account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="bg-[#051322] border border-[#16d9f5]/35 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-[0_20px_60px_rgba(2,11,20,0.9)] relative text-white max-h-[90vh] overflow-y-auto"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close sign-in dialog"
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#0b2844] border border-[#16d9f5]/40 text-[#16d9f5] mx-auto flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(22,217,245,0.3)]">
            {mode === 'login' ? <Heart className="w-6 h-6 fill-[#16d9f5]/20" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h2 id="auth-title" className="text-2xl font-black tracking-tight text-[#16d9f5]">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {mode === 'login' ? 'Sign in to your MiPAAS account' : 'Create your personal health portal account'}
          </p>
        </div>

        {DEMO_AUTH_ENABLED && mode === 'login' && (
          <div className="mb-5 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-200">
            Demo mode: patient and doctor credentials are not verified. Do not enter real patient information.
          </div>
        )}

        {error && (
          <div role="alert" className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div role="status" className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {mode === 'login' ? (
          /* ---------- LOGIN FORM ---------- */
          <form onSubmit={handleLogin} className="space-y-4 text-sm">
            <div>
              <label htmlFor="auth-id" className="block text-slate-300 font-medium mb-1.5">
                Email or ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-id"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your email or ID"
                  autoComplete="username"
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-slate-300 font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccess('If an account exists for this email, a password reset link will be sent.');
                  }}
                  className="text-xs text-[#16d9f5] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#16d9f5] to-[#26e6cf] hover:brightness-110 disabled:opacity-60 text-[#020b14] font-black text-sm shadow-[0_0_20px_rgba(22,217,245,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="pt-1 text-center text-xs text-slate-400">
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => switchMode('register')} className="font-bold text-[#16d9f5] hover:underline cursor-pointer">
                Sign Up
              </button>
            </p>
          </form>
        ) : (
          /* ---------- SIGN UP FORM ---------- */
          <form onSubmit={handleRegister} className="space-y-3 text-sm">
            <div>
              <label htmlFor="reg-name" className="block text-slate-300 font-medium mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-name"
                  type="text"
                  value={reg.fullName}
                  onChange={(e) => setReg({ ...reg, fullName: e.target.value })}
                  placeholder="e.g. Alex Taylor"
                  autoComplete="name"
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-slate-300 font-medium mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-email"
                  type="email"
                  value={reg.email}
                  onChange={(e) => setReg({ ...reg, email: e.target.value })}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-password" className="block text-slate-300 font-medium mb-1">
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={reg.password}
                  onChange={(e) => setReg({ ...reg, password: e.target.value })}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#071d33] border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#16d9f5]"
                />
              </div>
              <div>
                <label htmlFor="reg-confirm" className="block text-slate-300 font-medium mb-1">
                  Confirm
                </label>
                <input
                  id="reg-confirm"
                  type="password"
                  value={reg.confirmPassword}
                  onChange={(e) => setReg({ ...reg, confirmPassword: e.target.value })}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#071d33] border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#16d9f5]"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-400 pt-1">
              <input
                type="checkbox"
                checked={reg.consent}
                onChange={(e) => setReg({ ...reg, consent: e.target.checked })}
                className="mt-0.5 rounded text-[#16d9f5] focus:ring-[#16d9f5]"
              />
              <span>I agree to the privacy terms and authorize the creation of my personal health portal.</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#16d9f5] to-[#26e6cf] hover:brightness-110 disabled:opacity-60 text-[#020b14] font-black text-sm shadow-[0_0_20px_rgba(22,217,245,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <span>Creating account...</span> : <span>Create Account</span>}
            </button>

            <p className="pt-1 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <button type="button" onClick={() => switchMode('login')} className="font-bold text-[#16d9f5] hover:underline cursor-pointer">
                Log In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}