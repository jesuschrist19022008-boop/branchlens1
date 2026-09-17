import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileDown,
  Layers,
  Scale,
  ShieldAlert,
  Sparkles,
  Split,
  Users2,
  Zap,
} from 'lucide-react';
import { AnalysisSession, AppView, Problem, Solution } from '../types';
import { Badge } from '../components/Badge';

interface CrossLensComparisonPageProps {
  session: AnalysisSession;
  problem: Problem;
  solution: Solution;
  onNavigate: (view: AppView) => void;
}

export const CrossLensComparisonPage: React.FC<CrossLensComparisonPageProps> = ({
  session,
  problem,
  solution,
  onNavigate,
}) => {
  const [copiedNotification, setCopiedNotification] = useState(false);
  const comparison = session.comparison;
  const results = Object.values(session.results);

  const handleExportBrief = () => {
    const agreements = comparison.whereDisciplinesAgree || comparison.areasOfAgreement || [];
    const blindspots = comparison.unanimousBlindSpots || [comparison.unanimousBlindspot];
    const briefText = `
BRANCHLENS INTERDISCIPLINARY SYNTHESIS BRIEF
============================================
Problem: ${problem.title} (${problem.domain})
Anchor Solution: ${solution.title}
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
    link.download = `BranchLens-Synthesis-${problem.id}.txt`;
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
              Stage 4 &bull; Synthesis & Divergence
            </span>
            <span className="text-zinc-300">&bull;</span>
            <Badge variant="amber">The Core Educational Insight</Badge>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            Cross-Lens Comparison
          </h1>

          <p className="mt-2 text-base text-zinc-600 font-sans max-w-2xl">
            Where disciplines converge, where they clash on priorities, and the blind spots invisible
            to any single field.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs text-zinc-700 shadow-2xs">
            <span className="font-semibold text-zinc-900">Comparing Lenses:</span>
            <span className="text-zinc-600">
              {results.map((r) => r.disciplineName).join(' &bull; ')}
            </span>
          </div>
        </div>

        {/* Section 1: Where Disciplines Agree */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-zinc-900">
                Where Disciplines Agree (Shared Ground)
              </h2>
              <p className="text-xs text-zinc-600">
                Unanimous principles affirmed across multiple perspectives
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {(comparison.whereDisciplinesAgree || comparison.areasOfAgreement || []).map((agreement, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white/90 p-4 text-xs text-zinc-700 leading-relaxed shadow-2xs"
              >
                <span className="font-mono text-xs font-bold text-emerald-700">0{idx + 1}</span>
                <p>{agreement}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Key Tensions & Dialectics (Where Disciplines Clash) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <Split className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-zinc-900">
                Where Disciplines Clash (Key Tensions)
              </h2>
              <p className="text-xs text-zinc-600">
                Competing priorities that require conscious value judgements, not just technical compromises
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {comparison.keyTensions.map((tension, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-200/90 bg-[#FAF9F6] p-5 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/80 pb-3">
                  <h3 className="font-serif text-lg font-bold text-zinc-900">
                    {tension.title}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {(tension.disciplinesInvolved || [tension.disciplineA, tension.disciplineB]).map((d, dIdx) => (
                      <span
                        key={dIdx}
                        className="rounded-md bg-white border border-zinc-200 px-2 py-0.5 text-[11px] font-mono text-zinc-800"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="mt-3 text-xs text-zinc-700 leading-relaxed">
                  {tension.description}
                </p>

                <div className="mt-4 rounded-xl bg-white p-3.5 border border-zinc-200 text-xs">
                  <span className="font-mono text-[10px] uppercase tracking-wide text-zinc-600 block mb-1">
                    Potential Synthesis Path:
                  </span>
                  <p className="italic text-zinc-800 leading-relaxed">
                    "{tension.synthesisPath}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Cross-Disciplinary Priority & Risk Matrix */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-5 w-5 text-zinc-700" />
            <h2 className="font-serif text-2xl font-bold text-zinc-900">
              Disciplinary Matrix
            </h2>
          </div>
          <p className="text-xs text-zinc-600 mb-6">
            Direct comparative snapshot across all selected lenses
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-mono uppercase text-zinc-500">
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Fit Score</th>
                  <th className="py-3 px-4">Feasibility</th>
                  <th className="py-3 px-4">Impact</th>
                  <th className="py-3 px-4">Primary Concern</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {results.map((r) => (
                  <tr key={r.disciplineId} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-zinc-900">{r.disciplineName}</td>
                    <td className="py-3 px-4 text-zinc-500">{r.category}</td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{r.fitScore}%</td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium">
                        {r.feasibility}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium">
                        {r.impact}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 max-w-xs truncate" title={r.blindSpots[0]}>
                      {r.blindSpots[0] || r.keyQuestion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Unanimous / Cross-Cutting Blind Spots */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-800">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-zinc-900">
                Blind Spots Across All Lenses
              </h2>
              <p className="text-xs text-zinc-600">
                Under-specified layers that were repeatedly flagged across perspectives
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {(comparison.unanimousBlindSpots || [comparison.unanimousBlindspot]).map((blind, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-rose-100 bg-white p-4 text-xs text-zinc-700 leading-relaxed shadow-2xs flex items-start gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-1" />
                <span>{blind}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Synthesis Summary Brief */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 block mb-1">
            Holistic Epistemic Conclusion:
          </span>
          <h2 className="font-serif text-2xl font-bold text-zinc-900 mb-4">
            Synthesis Summary
          </h2>
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-sans">
            {comparison.synthesisSummary}
          </p>

          <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-zinc-500">
              This synthesis has been appended to your Problem-Solving Profile.
            </div>

            <button
              onClick={() => onNavigate('profile')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 transition-colors"
            >
              Open Problem-Solving Profile &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
