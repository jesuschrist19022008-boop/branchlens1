import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  Download,
  Lock,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import { authService } from '../services/authService';
import { AppView, User as UserType } from '../types';

interface SettingsPageProps {
  currentUser: UserType | null;
  onSignOut: () => void;
  onNavigate: (view: AppView) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  onSignOut,
  onNavigate,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleExportJSON = () => {
    const backup: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('branchlens')) {
        try {
          backup[key] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch {
          backup[key] = localStorage.getItem(key);
        }
      }
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `branchlens-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all stored mock data and local storage to factory defaults?')) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('branchlens')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 mb-6">
          <button
            onClick={() => onNavigate('workspace')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workspace
          </button>
        </div>

        {/* Hero Title */}
        <div className="mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
            Preferences & Data Ethics
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            Account & Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600 max-w-xl">
            Manage your workspace data, view our privacy architecture, or export your problem briefs.
          </p>
        </div>

        {/* 1. Account Details */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-zinc-700" />
            <h2 className="font-serif text-xl font-bold text-zinc-900">Account Details</h2>
          </div>

          {currentUser ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-zinc-50 p-3.5 border border-zinc-100">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1">Name</span>
                  <p className="font-semibold text-zinc-900 text-sm">{currentUser.name}</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3.5 border border-zinc-100">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1">Email</span>
                  <p className="font-semibold text-zinc-900 text-sm">{currentUser.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-zinc-500">
                  Role: <strong className="text-zinc-800">{currentUser.role || 'Thinker'}</strong>
                </span>
                <button
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-600">
              <p>You are using BranchLens in guest mode.</p>
              <button
                onClick={() => onNavigate('auth')}
                className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Sign In to Save Profile
              </button>
            </div>
          )}
        </div>

        {/* 2. Privacy Principles */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
            <h2 className="font-serif text-xl font-bold text-zinc-900">Privacy & Data Architecture</h2>
          </div>
          <p className="text-sm font-semibold text-emerald-950 italic">
            "Your problems & solutions remain private. Zero third-party data tracking."
          </p>
          <div className="mt-4 space-y-2 text-xs text-zinc-700 leading-relaxed">
            <p>
              &bull; <strong>Sovereign Thinking:</strong> Your formulation of sensitive research, institutional
              challenges, or civic dilemmas is never sold, indexed, or shared with commercial advertising brokers.
            </p>
            <p>
              &bull; <strong>Clean Separation of Concerns:</strong> When Supabase is connected in production,
              all documents will be protected under strict PostgreSQL Row Level Security (RLS) ensuring that
              only your authenticated session token can read or decrypt your submissions.
            </p>
            <p>
              &bull; <strong>No Reductive Scoring:</strong> We never generate punitive scores or share your
              disciplinary profile snapshots with employers, colleges, or external scoreboards.
            </p>
          </div>
        </div>

        {/* 3. Saved Work & Data Management */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-zinc-700" />
            <h2 className="font-serif text-xl font-bold text-zinc-900">Data Management & Export</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-900">Export All Data as JSON</h4>
                <p className="text-[11px] text-zinc-500">
                  Download all your local problem briefs, solutions, and multi-lens analyses.
                </p>
              </div>
              <button
                onClick={handleExportJSON}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors shrink-0"
              >
                <Download className="h-3.5 w-3.5 text-zinc-500" />
                {downloadSuccess ? 'Downloaded!' : 'Export JSON'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-900">Reset Local Storage to Defaults</h4>
                <p className="text-[11px] text-zinc-500">
                  Wipes local cached drafts and restores clean mock catalog.
                </p>
              </div>
              <button
                onClick={handleResetData}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 shadow-2xs hover:bg-rose-50 transition-colors shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5 text-rose-500" />
                {resetSuccess ? 'Resetting...' : 'Reset Storage'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
