import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Cpu,
  Eye,
  FileText,
  HelpCircle,
  Layers,
  Scale,
  Share2,
  ShieldAlert,
  Sparkles,
  Users2,
  Zap,
} from 'lucide-react';
import { AnalysisSession, AppView, LensResult, Problem, Solution } from '../types';
import { Badge } from '../components/Badge';

interface LensAnalysisPageProps {
  session: AnalysisSession;
  problem: Problem;
  solution: Solution;
  onComparePerspectives: () => void;
  onNavigate: (view: AppView) => void;
}

export const LensAnalysisPage: React.FC<LensAnalysisPageProps> = ({
  session,
  problem,
  solution,
  onComparePerspectives,
  onNavigate,
}) => {
  const [activeDisciplineId, setActiveDisciplineId] = useState<string>(
    session.selectedDisciplineIds[0] || ''
  );
  const [contextExpanded, setContextExpanded] = useState(false);

  const activeResult: LensResult | undefined = session.results[activeDisciplineId];
  const allResults = Object.values(session.results);

  if (!activeResult) {
    return (
      <div className="p-12 text-center">
        <p className="text-zinc-500 text-sm">No analysis results loaded for this session.</p>
        <button
          onClick={() => onNavigate('workspace')}
          className="mt-4 text-xs font-semibold underline text-zinc-900"
        >
          Return to Workspace
        </button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-800 bg-amber-50 border-amber-200';
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top Context & Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('choose-lenses')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Adjust Lenses
            </button>
            <span className="text-zinc-300">|</span>
            <span className="text-xs font-mono text-zinc-500">
              Examining {session.selectedDisciplineIds.length} Disciplinary Perspectives
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="compare-perspectives-top-btn"
              onClick={onComparePerspectives}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition-colors"
            >
              <Scale className="h-3.5 w-3.5 text-amber-300" />
              Cross-Lens Comparison &rarr;
            </button>
          </div>
        </div>

        {/* Persistent Problem & Solution Anchor Drawer */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-zinc-700">
                  ONE SHARED SOLUTION
                </span>
                <span className="font-serif text-base font-bold text-zinc-900">
                  {solution.title}
                </span>
              </div>
              <p className="text-xs text-zinc-600 line-clamp-1 max-w-3xl">
                <strong className="text-zinc-800">Problem:</strong> {problem.title} &bull;{' '}
                <span className="italic">{problem.domain}</span>
              </p>
            </div>

            <button
              onClick={() => setContextExpanded(!contextExpanded)}
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 self-start md:self-auto"
            >
              {contextExpanded ? (
                <>
                  Hide Anchor Details <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Inspect Problem & Solution <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {contextExpanded && (
            <div className="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-600">
              <div className="space-y-2 bg-zinc-50 p-3.5 rounded-xl border border-zinc-100">
                <h4 className="font-semibold text-zinc-900 font-mono text-[11px] uppercase tracking-wide">
                  The Problem Brief
                </h4>
                <p>
                  <strong className="text-zinc-800">Description:</strong> {problem.description}
                </p>
                <p>
                  <strong className="text-zinc-800">People Affected:</strong> {problem.peopleAffected}
                </p>
                <p>
                  <strong className="text-zinc-800">Constraints:</strong> {problem.constraints}
                </p>
              </div>

              <div className="space-y-2 bg-zinc-50 p-3.5 rounded-xl border border-zinc-100">
                <h4 className="font-semibold text-zinc-900 font-mono text-[11px] uppercase tracking-wide">
                  The Constant Solution
                </h4>
                <p>
                  <strong className="text-zinc-800">Approach:</strong> {solution.proposedApproach}
                </p>
                <p>
                  <strong className="text-zinc-800">How It Works:</strong> {solution.howItWorks}
                </p>
                <p>
                  <strong className="text-zinc-800">Acknowledged Trade-Offs:</strong>{' '}
                  {solution.tradeOffs}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Discipline Lens Tabs / Switcher */}
        <div className="mb-8">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 block mb-2">
            Disciplinary Lenses:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {allResults.map((res) => {
              const isActive = res.disciplineId === activeDisciplineId;
              return (
                <button
                  key={res.disciplineId}
                  id={`tab-lens-${res.disciplineId}`}
                  onClick={() => setActiveDisciplineId(res.disciplineId)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>{res.disciplineName}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      isActive ? 'bg-zinc-800 text-amber-300' : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {res.fitScore}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Discipline Detailed Analysis */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-9 shadow-sm">
          {/* Lens Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-zinc-100 pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="purple">{activeResult.category}</Badge>
                <Badge variant="neutral">Disciplinary Perspective</Badge>
              </div>

              <h2 className="font-serif text-3xl font-bold tracking-tight text-zinc-900">
                {activeResult.disciplineName}
              </h2>
              <p className="mt-1 text-sm text-zinc-600">{activeResult.tagline}</p>
            </div>

            {/* Metric Badges & Fit Score Meter */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-center min-w-[90px]">
                <span className="text-[10px] font-mono uppercase text-zinc-600 block">
                  Disciplinary Fit
                </span>
                <span className="font-serif text-2xl font-bold text-zinc-900">
                  {activeResult.fitScore}
                  <span className="text-xs font-normal text-zinc-500">/100</span>
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 w-20">Feasibility:</span>
                  <span className="font-semibold text-zinc-800 rounded-md bg-zinc-100 px-2 py-0.5">
                    {activeResult.feasibility}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 w-20">Impact:</span>
                  <span className="font-semibold text-zinc-800 rounded-md bg-zinc-100 px-2 py-0.5">
                    {activeResult.impact}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 w-20">Effort:</span>
                  <span className="font-semibold text-zinc-800 rounded-md bg-zinc-100 px-2 py-0.5">
                    {activeResult.effort}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Inquiry Question */}
          <div className="my-8 rounded-2xl border border-zinc-200 bg-[#FAF9F6] p-6">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 block mb-2">
              The Fundamental Question this Lens Demands:
            </span>
            <blockquote className="font-serif text-xl sm:text-2xl font-medium italic text-zinc-900 leading-snug">
              "{activeResult.keyQuestion}"
            </blockquote>
          </div>

          {/* Strengths & Blind Spots: Contrasting Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Strengths */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <h3 className="font-serif text-lg font-bold text-zinc-900">
                  What This Lens Validates (Strengths)
                </h3>
              </div>
              <ul className="space-y-3">
                {activeResult.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Blind Spots */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-800">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <h3 className="font-serif text-lg font-bold text-zinc-900">
                  What You Likely Overlooked (Blind Spots)
                </h3>
              </div>
              <ul className="space-y-3">
                {activeResult.blindSpots.map((blind, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-600 shrink-0" />
                    <span>{blind}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Important Considerations & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Considerations */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-blue-600" />
                <h3 className="font-serif text-base font-bold text-zinc-900">
                  Critical Epistemic Considerations
                </h3>
              </div>
              <ul className="space-y-2.5">
                {activeResult.considerations.map((c, idx) => (
                  <li key={idx} className="text-xs text-zinc-600 leading-relaxed">
                    &bull; {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h3 className="font-serif text-base font-bold text-zinc-900">
                  Domain-Specific Risks
                </h3>
              </div>
              <ul className="space-y-2.5">
                {activeResult.risks.map((r, idx) => (
                  <li key={idx} className="text-xs text-zinc-600 leading-relaxed">
                    &bull; {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trade-Offs, Stakeholders & Suggestions */}
          <div className="rounded-2xl border border-zinc-200/90 bg-[#FAF9F6] p-6 space-y-6">
            <div>
              <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-800 mb-2">
                Disciplinary Trade-Off Assessment:
              </h4>
              <p className="text-xs text-zinc-700 leading-relaxed font-sans">
                {activeResult.tradeOffs}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-200/80">
              <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-800 mb-2">
                Primary Stakeholders Identified by this Lens:
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeResult.stakeholders.map((s, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-800 shadow-2xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200/80">
              <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-800 mb-2">
                Concrete Suggestions to Strengthen the Proposal:
              </h4>
              <div className="space-y-2">
                {activeResult.suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded-xl bg-white p-3 border border-zinc-200 text-xs text-zinc-700"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action: Proceed to Cross-Lens Comparison */}
          <div className="mt-10 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-zinc-500">
              Examining lens {allResults.findIndex((r) => r.disciplineId === activeDisciplineId) + 1} of{' '}
              {allResults.length}
            </span>

            <button
              id="compare-perspectives-bottom-btn"
              onClick={onComparePerspectives}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-7 py-3.5 text-xs font-bold text-white shadow-md hover:bg-zinc-800 active:scale-98 transition-all"
            >
              Compare All Perspectives
              <ArrowRight className="h-4 w-4 text-amber-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
