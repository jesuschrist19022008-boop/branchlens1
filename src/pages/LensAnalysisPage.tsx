import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Layers,
  Loader2,
  RefreshCw,
  Scale,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { analysisService } from '../services/analysisService';
import { lensService } from '../services/lensService';
import { AnalysisSession, AppView, LensResult, Problem, Solution } from '../types';

interface LensAnalysisPageProps {
  solutionId?: string;
  session?: AnalysisSession | null;
  problem?: Problem | null;
  solution?: Solution | null;
  onComparePerspectives: () => void;
  onNavigate: (view: AppView) => void;
  onUpdateSession?: (session: AnalysisSession) => void;
}

export const LensAnalysisPage: React.FC<LensAnalysisPageProps> = ({
  solutionId,
  session: initialSession,
  problem: initialProblem,
  solution: initialSolution,
  onComparePerspectives,
  onNavigate,
  onUpdateSession,
}) => {
  const [session, setSession] = useState<AnalysisSession | null>(initialSession || null);
  const [problem, setProblem] = useState<Problem | null>(initialProblem || null);
  const [solution, setSolution] = useState<Solution | null>(initialSolution || null);
  const [missingDisciplineIds, setMissingDisciplineIds] = useState<string[]>([]);
  const [activeDisciplineId, setActiveDisciplineId] = useState<string>('');
  const [contextExpanded, setContextExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGeneratingMissing, setIsGeneratingMissing] = useState(false);

  // Resolved solution UUID
  const effectiveSolutionId = solutionId || initialSolution?.id || initialSession?.solutionId || '';

  const loadAnalysisFromSupabase = async (solId: string) => {
    if (!solId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const status = await analysisService.getAnalysesForSolution(solId);
      setSession(status.session);
      if (status.problem) setProblem(status.problem);
      if (status.solution) setSolution(status.solution);
      setMissingDisciplineIds(status.missingDisciplineIds);

      if (status.session && onUpdateSession) {
        onUpdateSession(status.session);
      }

      if (status.session && status.session.selectedDisciplineIds.length > 0) {
        setActiveDisciplineId((prev) =>
          prev && status.session?.results[prev]
            ? prev
            : status.session!.selectedDisciplineIds[0]
        );
      }
    } catch (err) {
      console.error('Failed to load analysis from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveSolutionId) {
      loadAnalysisFromSupabase(effectiveSolutionId);
    } else {
      setLoading(false);
    }
  }, [effectiveSolutionId]);

  const handleGenerateMissing = async () => {
    if (!effectiveSolutionId || missingDisciplineIds.length === 0) return;
    setIsGeneratingMissing(true);
    try {
      await analysisService.generateMissingAnalyses(effectiveSolutionId, missingDisciplineIds);
      await loadAnalysisFromSupabase(effectiveSolutionId);
    } catch (err) {
      console.error('Failed generating missing analyses:', err);
    } finally {
      setIsGeneratingMissing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700 mb-3" />
        <p className="text-sm font-medium text-zinc-700">Loading analysis from database...</p>
        <p className="text-xs text-zinc-500 mt-1">Retrieving disciplinary evaluations</p>
      </div>
    );
  }

  // If no saved analysis rows exist, show clean informative empty state with Run Analysis action
  if (!session || Object.keys(session.results).length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 bg-[#FAF9F6]">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-zinc-200 text-center shadow-xs">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 mb-4 border border-amber-200/60">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-zinc-900 mb-2">
            Analysis has not been generated yet.
          </h2>
          <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
            Select disciplinary lenses to stress-test this solution across empirical, technical, and human dimensions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="run-analysis-empty-state-btn"
              onClick={() => onNavigate('choose-lenses')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              Run Analysis
            </button>
            <button
              onClick={() => onNavigate('workspace')}
              className="w-full sm:w-auto text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-4 py-3"
            >
              Return to Workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allResults = Object.values(session.results);
  const activeResult: LensResult | undefined =
    session.results[activeDisciplineId] || allResults[0];

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
              Examining {allResults.length} Disciplinary Perspectives
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

        {/* Missing disciplines banner if partial analysis exists */}
        {missingDisciplineIds.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-xs text-amber-950 leading-relaxed">
                <strong>Partial Analysis Saved:</strong> {missingDisciplineIds.length}{' '}
                {missingDisciplineIds.length === 1 ? 'selected lens has' : 'selected lenses have'} not been evaluated yet ({' '}
                {missingDisciplineIds
                  .map((id) => lensService.getDisciplineById(id)?.name || id)
                  .join(', ')}
                ).
              </p>
            </div>
            <button
              disabled={isGeneratingMissing}
              onClick={handleGenerateMissing}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-4 py-2 text-xs font-semibold text-amber-50 shadow-xs hover:bg-amber-900 transition-all shrink-0 disabled:opacity-50"
            >
              {isGeneratingMissing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                  Generate Missing ({missingDisciplineIds.length})
                </>
              )}
            </button>
          </div>
        )}

        {/* Persistent Problem & Solution Anchor Drawer */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-zinc-700">
                  ONE SHARED SOLUTION
                </span>
                <span className="font-serif text-base font-bold text-zinc-900">
                  {solution?.title || session.solutionTitle}
                </span>
              </div>
              <p className="text-xs text-zinc-600 line-clamp-1 max-w-3xl">
                <strong className="text-zinc-800">Problem:</strong>{' '}
                {problem?.title || session.problemTitle} &bull;{' '}
                <span className="italic">{problem?.domain || 'General'}</span>
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
                  <strong className="text-zinc-800">Description:</strong>{' '}
                  {problem?.description || 'N/A'}
                </p>
                <p>
                  <strong className="text-zinc-800">People Affected:</strong>{' '}
                  {problem?.peopleAffected || 'N/A'}
                </p>
                <p>
                  <strong className="text-zinc-800">Constraints:</strong>{' '}
                  {Array.isArray(problem?.constraints)
                    ? problem.constraints.join(', ')
                    : problem?.constraints || 'N/A'}
                </p>
              </div>

              <div className="space-y-2 bg-zinc-50 p-3.5 rounded-xl border border-zinc-100">
                <h4 className="font-semibold text-zinc-900 font-mono text-[11px] uppercase tracking-wide">
                  The Constant Solution
                </h4>
                <p>
                  <strong className="text-zinc-800">Approach:</strong>{' '}
                  {solution?.proposedApproach || 'N/A'}
                </p>
                <p>
                  <strong className="text-zinc-800">How It Works:</strong>{' '}
                  {solution?.howItWorks || 'N/A'}
                </p>
                <p>
                  <strong className="text-zinc-800">Acknowledged Trade-Offs:</strong>{' '}
                  {solution?.tradeOffs || 'N/A'}
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
              const isActive = (activeResult && activeResult.disciplineId === res.disciplineId);
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
        {activeResult && (
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-9 shadow-sm">
            {/* Lens Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-zinc-100 pb-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="purple">{activeResult.category || activeResult.categoryName}</Badge>
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
                  {(activeResult.considerations || activeResult.importantConsiderations || []).map((c, idx) => (
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
                  {Array.isArray(activeResult.tradeOffs) ? activeResult.tradeOffs.join(' ') : activeResult.tradeOffs}
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
                  {(activeResult.suggestions || activeResult.improvementSuggestions || []).map((sug, idx) => (
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
                Examining lens {allResults.findIndex((r) => r.disciplineId === activeResult.disciplineId) + 1} of{' '}
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
        )}
      </div>
    </div>
  );
};
