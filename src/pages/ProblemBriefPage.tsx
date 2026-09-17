import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Edit3,
  Layers,
  Sparkles,
  AlertTriangle,
  Scale,
  Users2,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { problemService } from '../services/problemService';
import { AppView, Problem } from '../types';
import { Badge } from '../components/Badge';

interface ProblemBriefPageProps {
  problem: Problem | null;
  onEditProblem: (problem: Problem) => void;
  onStartSolution: (problem: Problem) => void;
  onNavigate: (view: AppView) => void;
}

export const ProblemBriefPage: React.FC<ProblemBriefPageProps> = ({
  problem,
  onEditProblem,
  onStartSolution,
  onNavigate,
}) => {
  const [isSaved, setIsSaved] = useState(problem?.isSaved ?? false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!problem) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-[#FAF9F6]">
        <h2 className="font-serif text-2xl font-bold text-zinc-800">No Problem Brief Selected</h2>
        <p className="mt-2 text-xs text-zinc-500">Choose a problem from the library or create a custom one.</p>
        <button
          onClick={() => onNavigate('problem-library')}
          className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white"
        >
          Go to Problem Library
        </button>
      </div>
    );
  }

  const handleToggleSave = async () => {
    const newState = await problemService.toggleSaveProblem(problem.id);
    setIsSaved(newState);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 mb-6">
          <button
            onClick={() => onNavigate('problem-library')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                isSaved
                  ? 'border-amber-300 bg-amber-50 text-amber-900'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5 text-zinc-400" />
                  Save Problem
                </>
              )}
            </button>

            <button
              onClick={() => onEditProblem(problem)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5 text-zinc-400" />
              Edit Brief
            </button>
          </div>
        </div>

        {/* Hero Brief Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-7 sm:p-9 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="font-mono text-xs font-semibold text-zinc-600 uppercase tracking-widest">
              {problem.domain}
            </span>
            <span className="text-zinc-300">&bull;</span>
            <Badge variant="accent">Structured Problem Brief</Badge>
            {problem.difficulty && (
              <Badge variant="neutral">{problem.difficulty}</Badge>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
            {problem.title}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
            {problem.description}
          </p>

          {/* Structured Analysis Sections */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
            {/* Context */}
            <div className="rounded-xl bg-zinc-50/80 p-4 border border-zinc-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Context & Setting
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">{problem.context}</p>
            </div>

            {/* People Affected */}
            <div className="rounded-xl bg-zinc-50/80 p-4 border border-zinc-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
                <Users2 className="h-3.5 w-3.5 text-emerald-600" />
                People Affected
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">{problem.peopleAffected}</p>
            </div>

            {/* Desired Outcome */}
            <div className="rounded-xl bg-zinc-50/80 p-4 border border-zinc-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                What Better Looks Like (Desired Outcome)
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">{problem.desiredOutcome}</p>
            </div>

            {/* Constraints */}
            <div className="rounded-xl bg-zinc-50/80 p-4 border border-zinc-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
                <Scale className="h-3.5 w-3.5 text-amber-600" />
                Key Constraints & Bounds
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">{problem.constraints}</p>
            </div>

            {/* Risks */}
            <div className="rounded-xl bg-zinc-50/80 p-4 border border-zinc-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                Primary Risks
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">{problem.risks}</p>
            </div>

            {/* Assumptions & Success Signals */}
            <div className="rounded-xl bg-zinc-50/80 p-4 border border-zinc-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                Assumptions & Success Signals
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {problem.assumptions || 'Assumes community willingness to pilot novel technical and organizational workflows.'}{' '}
                {problem.successSignals && `Success indicators: ${problem.successSignals}`}
              </p>
            </div>
          </div>

          {problem.additionalContext && (
            <div className="mt-6 rounded-xl border border-zinc-200 bg-[#FAF9F6] p-4 text-xs text-zinc-600">
              <span className="font-semibold text-zinc-800">Additional Context & Field Notes: </span>
              {problem.additionalContext}
            </div>
          )}

          {/* Primary Call to Action: Start Solution */}
          <div className="mt-10 pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-zinc-900 block">
                Next Stage: Propose One Shared Solution
              </span>
              <span className="text-[11px] text-zinc-500">
                You will formulate a single solution, which remains constant across all subsequent disciplinary inquiries.
              </span>
            </div>

            <button
              id="start-solution-btn"
              onClick={() => onStartSolution(problem)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-zinc-800 active:scale-98 transition-all"
            >
              Start Solution
              <ArrowRight className="h-4 w-4 text-amber-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
