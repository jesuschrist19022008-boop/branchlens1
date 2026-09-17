import React, { useEffect, useState } from 'react';
import {
  PlusCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Compass,
  FileEdit,
  FolderKanban,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import { analysisService } from '../services/analysisService';
import { problemService } from '../services/problemService';
import { profileService } from '../services/profileService';
import { solutionService } from '../services/solutionService';
import {
  AnalysisSession,
  AppView,
  Problem,
  Solution,
  User,
  UserProfile,
} from '../types';
import { Badge } from '../components/Badge';

interface WorkspacePageProps {
  currentUser: User | null;
  onNavigate: (view: AppView) => void;
  onSelectProblem: (problem: Problem) => void;
  onSelectSession: (session: AnalysisSession) => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  currentUser,
  onNavigate,
  onSelectProblem,
  onSelectSession,
}) => {
  const [recentProblems, setRecentProblems] = useState<Problem[]>([]);
  const [recentSessions, setRecentSessions] = useState<AnalysisSession[]>([]);
  const [activeDraft, setActiveDraft] = useState<{ problem: Problem; solution: Solution | null } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const [problems, sessions, userProf, solutions] = await Promise.all([
          problemService.getProblems(),
          analysisService.getRecentSessions(),
          profileService.getProfile(),
          solutionService.getRecentSolutions(),
        ]);

        setRecentProblems(problems.slice(0, 4));
        setRecentSessions(sessions.slice(0, 3));
        setProfile(userProf);

        // Find a draft if available
        if (problems.length > 0) {
          const firstProb = problems[0];
          const matchedSol = solutions.find((s) => s.problemId === firstProb.id) || null;
          setActiveDraft({ problem: firstProb, solution: matchedSol });
        }
      } catch (err) {
        console.error('Failed to load workspace data', err);
      } finally {
        setLoading(false);
      }
    };
    loadWorkspace();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Top Welcome Header */}
      <div className="border-b border-zinc-200/80 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
                Inquiry Workspace
              </span>
              <span className="text-zinc-300">&bull;</span>
              <span className="text-xs text-zinc-600">
                {currentUser?.role || 'Interdisciplinary Thinker'}
              </span>
            </div>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Hello, {currentUser ? currentUser.name : 'Thinker'}.
            </h1>
            <p className="mt-1 text-sm text-zinc-600 max-w-xl">
              Bring any real-world challenge or investigate how disciplines deconstruct your ideas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="workspace-new-analysis-primary-btn"
              onClick={() => onNavigate('new-analysis')}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition-all active:scale-98"
            >
              <PlusCircle className="h-4 w-4 text-amber-300" />
              New Analysis
            </button>
            <button
              onClick={() => onNavigate('problem-library')}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors"
            >
              <BookOpen className="h-4 w-4 text-zinc-500" />
              Explore Library
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Two Main Entry Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Card 1: Bring Your Own Problem */}
          <div className="relative group overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-7 shadow-xs hover:border-zinc-400 hover:shadow-sm transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
                  <PlusCircle className="h-5 w-5 text-amber-400" />
                </div>
                <Badge variant="accent">Open Canvas</Badge>
              </div>
              <h3 className="mt-5 font-serif text-2xl font-bold text-zinc-900">
                Bring Your Own Problem
              </h3>
              <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                Formulate any authentic challenge you are grappling with—climate adaptation, municipal
                ordinances, linguistic documentation, rare diseases, or hardware design.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Guided Problem Designer</span>
              <button
                id="workspace-bring-problem-cta"
                onClick={() => onNavigate('create-problem')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 group-hover:translate-x-0.5 transition-transform"
              >
                Create Problem Brief <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Explore Problem Library */}
          <div className="relative group overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-7 shadow-xs hover:border-zinc-400 hover:shadow-sm transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white">
                  <BookOpen className="h-5 w-5 text-emerald-200" />
                </div>
                <Badge variant="success">Curated Inquiries</Badge>
              </div>
              <h3 className="mt-5 font-serif text-2xl font-bold text-zinc-900">
                Explore Problem Library
              </h3>
              <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                Need inspiration? Explore real-world dilemmas across marine brine cycles, cross-border
                pediatric genomics, endangered dialect vaults, and passive urban heat sinks.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Optional Seed Challenges</span>
              <button
                id="workspace-explore-library-cta"
                onClick={() => onNavigate('problem-library')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 group-hover:translate-x-0.5 transition-transform"
              >
                Browse All Inquiries <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Bento Grid: Profile Snapshot + Continue Draft */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Profile Snapshot: "Good questions have a shape." */}
          <div className="lg:col-span-7 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-zinc-900">
                    Profile Snapshot
                  </h3>
                  <p className="text-[11px] text-zinc-500 italic">
                    “Good questions have a shape.”
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('profile')}
                className="text-xs font-semibold text-zinc-800 hover:text-zinc-600 underline"
              >
                Full Profile &rarr;
              </button>
            </div>

            {profile ? (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                    <span className="text-[11px] text-zinc-500">Problems Explored</span>
                    <p className="font-serif text-xl font-bold text-zinc-900 mt-0.5">
                      {profile.problemsExplored}
                    </p>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                    <span className="text-[11px] text-zinc-500">Lenses Interrogated</span>
                    <p className="font-serif text-xl font-bold text-zinc-900 mt-0.5">
                      {profile.lensesUsedCount}
                    </p>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-zinc-500">Analyses Completed</span>
                    <p className="font-serif text-xl font-bold text-zinc-900 mt-0.5">
                      {profile.totalAnalyses}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 block mb-2">
                    Leading Qualitative Patterns:
                  </span>
                  <div className="space-y-2">
                    {profile.dimensions.slice(0, 3).map((dim) => (
                      <div
                        key={dim.id}
                        className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/70 px-3 py-2 text-xs"
                      >
                        <span className="font-medium text-zinc-900">{dim.title}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            dim.signal === 'Strong signal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {dim.signal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200/80 bg-[#FAF9F6] p-3 text-[11px] text-zinc-600">
                  <span className="font-semibold text-zinc-800">Latest Observation: </span>
                  {profile.recentSnapshots[0]?.reflectionNote ||
                    'Approaches challenges with strong ecological systems balance and trade-off sensitivity.'}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500">
                Run your first analysis to activate your problem-solving profile reflections.
              </div>
            )}
          </div>

          {/* Continue Draft / Active Problem Card */}
          <div className="lg:col-span-5 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-2">
                  <FileEdit className="h-4 w-4 text-zinc-500" />
                  <h3 className="font-serif text-base font-bold text-zinc-900">
                    Continue Active Draft
                  </h3>
                </div>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-800 border border-amber-200">
                  Draft In Progress
                </span>
              </div>

              {activeDraft ? (
                <div className="mt-4">
                  <span className="text-[11px] font-mono text-zinc-600 uppercase tracking-wider">
                    {activeDraft.problem.domain}
                  </span>
                  <h4 className="mt-1 font-serif text-lg font-bold text-zinc-900 leading-snug">
                    {activeDraft.problem.title}
                  </h4>
                  <p className="mt-2 text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                    {activeDraft.problem.description}
                  </p>

                  <div className="mt-4 rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 font-medium">Solution Status</span>
                      <span className="text-emerald-700 font-semibold">
                        {activeDraft.solution ? 'Draft Ready' : 'Awaiting Solution'}
                      </span>
                    </div>
                    {activeDraft.solution && (
                      <p className="mt-1 text-xs font-serif font-medium text-zinc-800 truncate">
                        "{activeDraft.solution.title}"
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No drafts active. Start a new problem to begin.
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
              {activeDraft && (
                <button
                  onClick={() => {
                    onSelectProblem(activeDraft.problem);
                    onNavigate('solution-workspace');
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors"
                >
                  Resume Solution Workspace &rarr;
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recent Work & Explorations */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-zinc-900">
                Recent Inquiries & Solutions
              </h3>
              <p className="text-xs text-zinc-500">Problems you have recently evaluated or saved</p>
            </div>
            <button
              onClick={() => onNavigate('my-work')}
              className="text-xs font-semibold text-zinc-800 hover:text-zinc-600 underline"
            >
              View all work &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProblems.map((prob) => (
              <div
                key={prob.id}
                onClick={() => {
                  onSelectProblem(prob);
                  onNavigate('problem-brief');
                }}
                className="group cursor-pointer rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs hover:border-zinc-400 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-2">
                    <span className="truncate max-w-[140px] font-mono text-zinc-600">{prob.domain}</span>
                    {prob.isSaved && <Bookmark className="h-3 w-3 text-amber-500 fill-amber-500" />}
                  </div>
                  <h4 className="font-serif text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-amber-900 transition-colors">
                    {prob.title}
                  </h4>
                  <p className="mt-2 text-[11px] text-zinc-600 line-clamp-3 leading-relaxed">
                    {prob.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-600">{prob.difficulty || 'Standard'}</span>
                  <span className="font-medium text-zinc-900 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Open Brief &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
