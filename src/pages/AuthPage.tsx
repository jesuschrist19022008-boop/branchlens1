import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
} from 'lucide-react';
import { authService } from '../services/authService';
import { AppView, User } from '../types';

interface AuthPageProps {
  currentUser: User | null;
  onAuthSuccess: (user: User) => void;
  onNavigate: (view: AppView) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  currentUser,
  onAuthSuccess,
  onNavigate,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (tab === 'signin') {
        const res = await authService.signIn(email, password);
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          onAuthSuccess(res.user);
          onNavigate('workspace');
        }
      } else if (tab === 'signup') {
        const res = await authService.signUp(name, email, password);
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          onAuthSuccess(res.user);
          onNavigate('workspace');
        }
      } else {
        const res = await authService.resetPassword(email);
        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          setSuccessMessage(res.message);
        }
      }
    } catch {
      setErrorMessage('An unexpected authentication error occurred. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoUser = async (demoName: string, demoEmail: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await authService.signUp(demoName, demoEmail);
    setIsLoading(false);
    if (res.user) {
      onAuthSuccess(res.user);
      onNavigate('workspace');
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        {/* Brand header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-amber-50 shadow-sm mb-3">
            <div className="h-5 w-5 rounded-full border-2 border-amber-300" />
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-zinc-900">
            {tab === 'signin' && 'Welcome back'}
            {tab === 'signup' && 'Create your thinker profile'}
            {tab === 'forgot' && 'Reset your password'}
          </h2>
          <p className="mt-2 text-xs text-zinc-600">
            {tab === 'signin' && 'Access your saved problems, disciplinary analyses, and profiles.'}
            {tab === 'signup' && 'Join BranchLens to explore problems through multi-disciplinary lenses.'}
            {tab === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Supabase-Ready Notice */}
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Supabase Auth Architecture Ready
          </div>
          <p className="mt-1 text-[11px] text-emerald-700 leading-relaxed">
            This frontend implements clean authentication service interfaces. Local mock auth is active
            now, ready to swap to Supabase Auth & PostgreSQL Row Level Security without UI changes.
          </p>
        </div>

        {/* Auth Card */}
        <div className="mt-6 rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xs">
          {/* Tabs */}
          <div className="flex rounded-lg bg-zinc-100 p-1 mb-6">
            <button
              onClick={() => {
                setTab('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                tab === 'signin' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                tab === 'signup' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setTab('forgot');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                tab === 'forgot' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Forgot
            </button>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Maya Lin"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.edu"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {tab !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-zinc-700">Password</label>
                  {tab === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      className="text-[11px] text-zinc-500 hover:text-zinc-800 underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-zinc-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? 'Processing...' : tab === 'signin' ? 'Sign In' : tab === 'signup' ? 'Create Account' : 'Send Instructions'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Quick Demo Logins for instant testing */}
          <div className="mt-6 pt-5 border-t border-zinc-100">
            <span className="text-[11px] font-mono text-zinc-600 uppercase tracking-wider block mb-2">
              Instant Demo Access:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoUser('Elena Rostova', 'elena.rostova@research.org')}
                className="rounded-lg border border-zinc-200 p-2 text-left hover:bg-zinc-50 transition-colors"
              >
                <p className="text-xs font-semibold text-zinc-800">Elena Rostova</p>
                <p className="text-[10px] text-zinc-600 truncate">Systems Thinker</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoUser('Marcus Chen', 'marcus.chen@civiclab.io')}
                className="rounded-lg border border-zinc-200 p-2 text-left hover:bg-zinc-50 transition-colors"
              >
                <p className="text-xs font-semibold text-zinc-800">Marcus Chen</p>
                <p className="text-[10px] text-zinc-600 truncate">Civic Policy Lead</p>
              </button>
            </div>
          </div>
        </div>

        {/* Current status if signed in */}
        {currentUser && (
          <div className="mt-4 text-center">
            <p className="text-xs text-zinc-500">
              Currently signed in as <strong className="text-zinc-800">{currentUser.name}</strong> ({currentUser.email}).
            </p>
            <button
              onClick={() => onNavigate('workspace')}
              className="mt-1 text-xs text-zinc-900 font-semibold underline hover:text-zinc-600"
            >
              Go to Workspace &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
