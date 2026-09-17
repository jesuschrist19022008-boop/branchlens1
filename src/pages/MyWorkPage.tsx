import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Copy,
  FileEdit,
  FolderKanban,
  Layers,
  PlusCircle,
  Scale,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { analysisService } from '../services/analysisService';
import { problemService } from '../services/problemService';
import { solutionService } from '../services/solutionService';
import { AnalysisSession, AppView, Problem, Solution } from '../types';
import { Badge } from '../components/Badge';

interface MyWorkPageProps {
  onSelectProblem: (problem: Problem) => void;
  onSelectSession: (session: AnalysisSession) => void;
  onNavigate: (view: AppView) => void;
}

export const MyWorkPage: React.FC<MyWorkPageProps> = ({
  onSelectProblem,
  onSelectSession,
  onNavigate,
}) => {
  const [tab, setTab] = useState<'problems' | 'solutions' | 'analyses'>('problems');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pList, sList, sessList] = await Promise.all([
      problemService.getProblems(),
      solutionService.getRecentSolutions(),
      analysisService.getRecentSessions(),
    ]);
    setProblems(pList);
    setSolutions(sList);
    setSessions(sessList);
  };

  const handleDeleteProblem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this problem?')) {
      await problemService.deleteProblem(id);
      setProblems((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleDuplicateProblem = async (problem: Problem, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated = await problemService.createProblem({
      ...problem,
      title: `${problem.title} (Copy)`,
    });
    setProblems((prev) => [duplicated, ...prev]);
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
            onClick={() => onNavigate('new-analysis')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5 text-amber-300" />
            New Inquiry
          </button>
        </div>

        {/* Hero Title */}
        <div className="mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
            Archive & Working Studio
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            My Work
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600 max-w-xl">
            All your formulated problems, constant solutions, and multi-lens comparative analyses.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-zinc-200/60 p-1 mb-8 max-w-md">
          <button
            onClick={() => setTab('problems')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === 'problems' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Problems ({problems.length})
          </button>
          <button
            onClick={() => setTab('solutions')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === 'solutions' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Solutions ({solutions.length})
          </button>
          <button
            onClick={() => setTab('analyses')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === 'analyses' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Analyses ({sessions.length})
          </button>
        </div>

        {/* Tab 1: Problems */}
        {tab === 'problems' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {problems.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProblem(p);
                  onNavigate('problem-brief');
                }}
                className="group cursor-pointer rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs hover:border-zinc-400 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                    <span className="font-mono text-[11px] font-semibold text-zinc-600">{p.domain}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDuplicateProblem(p, e)}
                        title="Duplicate"
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProblem(p.id, e)}
                        title="Delete"
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-zinc-900 leading-snug group-hover:text-amber-950 transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">
                    {p.isSaved ? 'Saved problem' : 'Custom inquiry'}
                  </span>
                  <span className="font-semibold text-zinc-900 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Open Brief &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Solutions */}
        {tab === 'solutions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solutions.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-600 block mb-1">
                    Constant Solution Anchor
                  </span>
                  <h3 className="font-serif text-lg font-bold text-zinc-900 leading-snug">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                    {s.proposedApproach}
                  </p>
                  <div className="mt-3 rounded-lg bg-zinc-50 p-2.5 text-[11px] text-zinc-600 border border-zinc-100">
                    <strong>Trade-offs:</strong> {s.tradeOffs}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Created {new Date(s.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => {
                      const prob = problems.find((p) => p.id === s.problemId);
                      if (prob) {
                        onSelectProblem(prob);
                        onNavigate('solution-workspace');
                      }
                    }}
                    className="font-semibold text-zinc-900 underline hover:text-zinc-600"
                  >
                    Edit in Workspace &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Analyses History */}
        {tab === 'analyses' && (
          <div className="space-y-4">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => {
                  onSelectSession(sess);
                  onNavigate('cross-lens-comparison');
                }}
                className="group cursor-pointer rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs hover:border-zinc-400 hover:shadow-xs transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] text-zinc-500">
                    Session ID: {sess.id.slice(0, 18)}...
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(sess.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-zinc-900 group-hover:text-amber-950 transition-colors">
                  {sess.problemTitle}
                </h3>
                <p className="mt-1 text-xs text-zinc-600 italic">
                  Anchor Solution: "{sess.solutionTitle}"
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-zinc-500">Lenses Compared:</span>
                  {sess.selectedDisciplineIds.map((dId) => {
                    const res = sess.results[dId];
                    return (
                      <span
                        key={dId}
                        className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-800"
                      >
                        {res ? res.disciplineName : dId}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-medium">Synthesis & Matrix Available</span>
                  <span className="font-semibold text-zinc-900 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Open Comparison &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
