import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Compass,
  FileText,
  History,
  Info,
  Layers,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
} from 'lucide-react';
import { profileService } from '../services/profileService';
import { AppView, ProfileDimension, UserProfile } from '../types';
import { Badge } from '../components/Badge';

interface ProfilePageProps {
  onNavigate: (view: AppView) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<ProfileDimension | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const p = await profileService.getProfile();
    setProfile(p);
    if (p.dimensions.length > 0) {
      setSelectedDimension(p.dimensions[0]);
    }
  };

  const handleReset = async () => {
    if (confirm('Reset your profile history and baseline observations?')) {
      const p = await profileService.resetProfile();
      setProfile(p);
      if (p.dimensions.length > 0) {
        setSelectedDimension(p.dimensions[0]);
      }
    }
  };

  const getSignalBadgeVariant = (signal: ProfileDimension['signal']) => {
    switch (signal) {
      case 'Strong signal':
        return 'success';
      case 'Developing strength':
        return 'accent';
      case 'Worth exploring':
        return 'warning';
      case 'In the mix':
        return 'purple';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 mb-6">
          <button
            onClick={() => onNavigate('workspace')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workspace
          </button>

          <button
            onClick={handleReset}
            className="text-xs text-zinc-500 hover:text-zinc-800 underline"
          >
            Reset Profile History
          </button>
        </div>

        {/* Hero Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
              Cognitive Reflection Space
            </span>
            <span className="text-zinc-300">&bull;</span>
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200">
              Qualitative Behavioral Signals
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            A profile, <span className="italic font-normal text-zinc-700">not a label.</span>
          </h1>

          <p className="mt-2 text-sm sm:text-base text-zinc-600 max-w-2xl font-sans">
            How you approach real-world dilemmas, the assumptions you question, and the angles you
            instinctively interrogate.
          </p>
        </div>

        {/* MANDATORY DISCLAIMER BANNER */}
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-5 sm:p-6 shadow-2xs mb-10">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-200/80 text-amber-900 shrink-0 mt-0.5">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-amber-950 uppercase tracking-wide">
                Ethical Grounding Principle
              </h3>
              <p className="mt-1 text-xs text-amber-900 leading-relaxed font-sans">
                <strong>Important Notice:</strong> This profile describes your approach to the problems
                you explored. It is not a prediction of your career, major, intelligence, personality,
                or future performance.
              </p>
            </div>
          </div>
        </div>

        {/* Overall Profile Stats */}
        {profile && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Problems Explored
              </span>
              <p className="font-serif text-3xl font-bold text-zinc-900 mt-1">
                {profile.problemsExplored}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">Real-world inquiries</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Lenses Interrogated
              </span>
              <p className="font-serif text-3xl font-bold text-zinc-900 mt-1">
                {profile.lensesUsedCount}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">From 40+ disciplines</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Syntheses Run
              </span>
              <p className="font-serif text-3xl font-bold text-zinc-900 mt-1">
                {profile.totalAnalyses}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">Multi-lens comparisons</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Inquiry Style
              </span>
              <p className="font-serif text-xl font-bold text-zinc-900 mt-1 truncate">
                Eclectic Polymath
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">Descriptive, non-rigid</p>
            </div>
          </div>
        )}

        {/* Qualitative Dimensions Grid */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-zinc-900">
                Problem-Solving Dimensions
              </h2>
              <p className="text-xs text-zinc-500">
                Qualitative signals observed across your recent problems, solutions, and lenses
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile?.dimensions.map((dim) => {
              const isSelected = selectedDimension?.id === dim.id;
              return (
                <div
                  key={dim.id}
                  onClick={() => setSelectedDimension(dim)}
                  className={`cursor-pointer rounded-2xl border-2 p-6 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-zinc-900 bg-white shadow-sm ring-1 ring-zinc-900'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif text-lg font-bold text-zinc-900">{dim.title}</h3>
                      <Badge variant={getSignalBadgeVariant(dim.signal)}>{dim.signal}</Badge>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed font-sans">{dim.description}</p>

                    <div className="mt-4 rounded-xl bg-zinc-50 p-3.5 border border-zinc-100 text-xs text-zinc-700">
                      <span className="font-semibold text-zinc-900 text-[11px] font-mono uppercase tracking-wide block mb-1">
                        Observed Evidence:
                      </span>
                      <p className="italic text-zinc-700 leading-relaxed">"{dim.evidenceNote || dim.evidenceNotes?.[0] || 'Continuous observational signal across exploratory sessions.'}"</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-100">
                    <span className="text-[10px] font-mono uppercase text-zinc-600 block mb-1.5">
                      Related Disciplinary Lenses:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(dim.relatedDisciplines || dim.relatedDisciplineInteractions || []).map((d, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile History Timeline */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-9 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <History className="h-5 w-5 text-zinc-700" />
            <h2 className="font-serif text-2xl font-bold text-zinc-900">Profile History</h2>
          </div>
          <p className="text-xs text-zinc-600 mb-8">
            How your problem-solving approaches have expanded across problems, solutions, and lens combinations
          </p>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-zinc-200">
            {profile?.recentSnapshots.map((snap, idx) => (
              <div key={snap.id} className="relative flex items-start gap-4 pl-8">
                {/* Timeline circle */}
                <div className="absolute left-1.5 mt-1.5 h-4 w-4 rounded-full border-2 border-zinc-900 bg-white" />

                <div className="flex-1 rounded-2xl border border-zinc-200/90 bg-[#FAF9F6] p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h4 className="font-serif text-base font-bold text-zinc-900">
                      {snap.problemTitle}
                    </h4>
                    <span className="text-[11px] font-mono text-zinc-500">{snap.date}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 my-2">
                    <span className="text-[11px] text-zinc-500">Lenses Examined:</span>
                    {snap.lensesExamined.map((l, lIdx) => (
                      <span
                        key={lIdx}
                        className="rounded bg-white border border-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-800"
                      >
                        {l}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed mt-2">{snap.reflectionNote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
