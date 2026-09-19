import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileDown,
  Layers,
  Loader2,
  Scale,
  ShieldAlert,
  Sparkles,
  Split,
  Users2,
  Zap,
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { analysisService } from '../services/analysisService';
import { AnalysisSession, AppView, Problem, Solution } from '../types';

interface CrossLensComparisonPageProps {
  solutionId?: string;
  session?: AnalysisSession | null;
  problem?: Problem | null;
  solution?: Solution | null;
  onNavigate: (view: AppView) => void;
}

export const CrossLensComparisonPage: React.FC<CrossLensComparisonPageProps> = ({
  solutionId,
  session: initialSession,
  problem: initialProblem,
  solution: initialSolution,
  onNavigate,
}) => {
  const [session, setSession] = useState<AnalysisSession | null>(initialSession || null);
  const [problem, setProblem] = useState<Problem | null>(initialProblem || null);
  const [solution, setSolution] = useState<Solution | null>(initialSolution || null);
  const [loading, setLoading] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const effectiveSolutionId = solutionId || initialSolution?.id || initialSession?.solutionId || '';

  useEffect(() => {
    if (!initialSession?.comparison && effectiveSolutionId) {
      setLoading(true);
      analysisService.getAnalysesForSolution(effectiveSolutionId).then((status) => {
        if (status.session) setSession(status.session);
        if (status.problem) setProblem(status.problem);
        if (status.solution) setSolution(status.solution);
        setLoading(false);
      });
    }
  }, [effectiveSolutionId, initialSession]);

  const rawResults = session?.results ? Object.values(session.results) : [];
  const results = React.useMemo(() => {
    const seen = new Set<string>();
    return rawResults.filter((r) => {
      if (!r || !r.disciplineId || seen.has(r.disciplineId)) return false;
      seen.add(r.disciplineId);
      return true;
    });
  }, [rawResults]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#FAF9F6] text-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700 mb-3" />
        <p className="text-sm font-medium text-zinc-700">Loading cross-lens synthesis...</p>
      </div>
    );
  }

  const comparison = session?.comparison;

  if (!comparison || results.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#FAF9F6] text-center">
        <Scale className="h-10 w-10 text-zinc-400 mb-3" />
        <h2 className="font-serif text-2xl font-bold text-zinc-900 mb-2">
          Comparison not yet synthesized
        </h2>
        <p className="text-sm text-zinc-600 mb-6 max-w-md">
          Please run disciplinary analyses for your selected lenses first to generate cross-lens synthesis and tensions.
        </p>
        <button
          onClick={() => onNavigate('lens-analysis')}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to Lens Analysis
        </button>
      </div>
    );
  }

  const activeProblemTitle = problem?.title || session?.problemTitle || 'Challenge Problem';
  const activeSolutionTitle = solution?.title || session?.solutionTitle || 'Anchor Solution';
  const activeProblemDomain = problem?.domain || 'General Inquiry';

  const handleExportBrief = () => {
    const agreements = comparison.whereDisciplinesAgree || comparison.areasOfAgreement || [];
    const blindspots = comparison.unanimousBlindSpots || (comparison.unanimousBlindspot ? [comparison.unanimousBlindspot] : []);
    const briefText = `
BRANCHLENS INTERDISCIPLINARY SYNTHESIS BRIEF
============================================
Problem: ${activeProblemTitle} (${activeProblemDomain})
Anchor Solution: ${activeSolutionTitle}
Date: ${new Date().toLocaleDateString()}

WHERE DISCIPLINES AGREE:
${agreements.map((item) => `- ${item}`).join('\n')}

PRIMARY CROSS-DISCIPLINARY TENSIONS:
${comparison.keyTensions.map((t) => `* Tension: ${t.title}\n  Polarity: ${(t.disciplinesInvolved || [t.disciplineA, t.disciplineB]).join(' vs. ')}\n  Synthesis Path: ${t.synthesisPath}`).join('\n\n')}

CROSS-CUTTING BLIND SPOTS:
${blindspots.map((b) => `- ${b}`).join('\n')}

SYNTHESIS SUMMARY:
${comparison.synthesisSummary}
    `.trim();

    const blob = new Blob([briefText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BranchLens-Synthesis-${problem?.id || 'brief'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 mb-8">
          <button
            onClick={() => onNavigate('lens-analysis')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Individual Lenses
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportBrief}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <FileDown className="h-3.5 w-3.5 text-zinc-500" />
              Export Synthesis Brief
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              View Profile Reflection &rarr;
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
              Stage 5 &bull; Cross-Disciplinary Synthesis
            </span>
            <span className="text-zinc-300">&bull;</span>
            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 border border-purple-200">
              Comparative Dialectic
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
            Cross-Lens Comparison & Synthesis
          </h1>
          <p className="mt-2 text-sm text-zinc-600 max-w-2xl">
            Where distinct disciplinary traditions converge, collide, and reveal irreducible tensions across "{activeSolutionTitle}".
          </p>
        </div>

        {/* 1. Synthesis Summary Card */}
        <div className="mb-8 rounded-3xl border border-zinc-200 bg-white p-7 sm:p-9 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="font-serif text-xl font-bold text-zinc-900">
              Holistic Dialectic Summary
            </h2>
          </div>

          <p className="font-serif text-base sm:text-lg leading-relaxed text-zinc-800">
            {comparison.synthesisSummary}
          </p>

          <div className="mt-6 pt-5 border-t border-zinc-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase text-zinc-500 mr-2">Evaluated Inquiries:</span>
            {results.map((r, idx) => (
              <span
                key={`${r.disciplineId}-${idx}`}
                className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800"
              >
                {r.disciplineName}
              </span>
            ))}
          </div>
        </div>

        {/* 2. Areas of Consensus (Where Disciplines Agree) */}
        <div className="mb-8 rounded-3xl border border-emerald-200/80 bg-emerald-50/30 p-7 sm:p-9 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h3 className="font-serif text-xl font-bold text-zinc-900">
              Where the Disciplines Reach Unanimous Consensus
            </h3>
          </div>

          <p className="text-xs text-zinc-600 mb-6">
            Despite holding completely different epistemological starting points, every interrogated lens converged on the following foundational tenets:
          </p>

          <div className="space-y-3">
            {(comparison.whereDisciplinesAgree || comparison.areasOfAgreement || []).map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-2xl bg-white p-4 border border-emerald-100 text-xs text-zinc-800 shadow-2xs"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                <span className="leading-relaxed font-sans">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Primary Cross-Disciplinary Tensions */}
        <div className="mb-8 rounded-3xl border border-zinc-200 bg-white p-7 sm:p-9 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-5 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                <Split className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-zinc-900">
                  Productive Disciplinary Tensions
                </h3>
                <p className="text-xs text-zinc-500">
                  Where paradigms clash, innovation happens. Real problems do not have single neat answers.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {comparison.keyTensions.map((tension) => (
              <div
                key={tension.id}
                className="rounded-2xl border border-zinc-200 bg-[#FAF9F6] p-6 space-y-4 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/80 pb-3">
                  <h4 className="font-serif text-base font-bold text-zinc-900">
                    {tension.title}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    {(tension.disciplinesInvolved || [tension.disciplineA, tension.disciplineB]).map(
                      (d, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-zinc-200 px-2 py-0.5 text-[10px] font-mono font-semibold text-zinc-800"
                        >
                          {d}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl bg-white p-4 border border-zinc-200/70">
                    <span className="font-mono text-[10px] uppercase text-zinc-500 block mb-1">
                      {tension.disciplineA} View:
                    </span>
                    <p className="text-zinc-700 leading-relaxed">{tension.viewA}</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 border border-zinc-200/70">
                    <span className="font-mono text-[10px] uppercase text-zinc-500 block mb-1">
                      {tension.disciplineB} View:
                    </span>
                    <p className="text-zinc-700 leading-relaxed">{tension.viewB}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50/60 p-4 border border-amber-200/70 text-xs">
                  <div className="flex items-center gap-1.5 mb-1 text-amber-900 font-semibold font-mono text-[11px] uppercase tracking-wide">
                    <Zap className="h-3.5 w-3.5 text-amber-600" />
                    Actionable Synthesis Pathway:
                  </div>
                  <p className="text-amber-950 leading-relaxed font-sans">
                    {tension.synthesisPath}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Cross-Cutting Unanimous Blind Spot */}
        <div className="mb-8 rounded-3xl border border-rose-200 bg-rose-50/40 p-7 sm:p-9 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h3 className="font-serif text-xl font-bold text-zinc-900">
              Cross-Cutting Blind Spots
            </h3>
          </div>

          <p className="text-xs text-zinc-600 mb-6">
            The systemic vulnerabilities that multiple lenses independently warned about:
          </p>

          <div className="space-y-3">
            {(comparison.unanimousBlindSpots || [comparison.unanimousBlindspot]).map(
              (bs, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white p-4 border border-rose-100 text-xs text-zinc-800 shadow-2xs leading-relaxed flex items-start gap-2.5"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{bs}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* 5. Cross-Disciplinary Priority Matrix Table */}
        <div className="mb-10 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
          <h3 className="font-serif text-lg font-bold text-zinc-900 mb-1">
            Comparative Lens Matrix
          </h3>
          <p className="text-xs text-zinc-500 mb-6">
            Side-by-side juxtaposition of key priorities, critical risks, and proposed pivots across evaluated domains.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50 border-b border-zinc-200 font-mono text-[11px] uppercase text-zinc-600">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Discipline</th>
                  <th className="py-3 px-4">Top Mandated Priority</th>
                  <th className="py-3 px-4">Primary Flagged Risk</th>
                  <th className="py-3 px-4 rounded-r-xl">Recommended Pivot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {comparison.priorityMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-zinc-900 whitespace-nowrap">
                      {item.disciplineName}
                    </td>
                    <td className="py-3.5 px-4 leading-relaxed max-w-xs">{item.topPriority}</td>
                    <td className="py-3.5 px-4 leading-relaxed max-w-xs text-rose-900">
                      {item.criticalRisk}
                    </td>
                    <td className="py-3.5 px-4 leading-relaxed max-w-xs text-emerald-950 font-medium">
                      {item.recommendedPivot}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-zinc-200">
          <button
            onClick={() => onNavigate('lens-analysis')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700 hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Detailed Lens Review
          </button>

          <button
            onClick={() => onNavigate('workspace')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-zinc-800"
          >
            Return to Workspace
            <ArrowRight className="h-4 w-4 text-amber-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
