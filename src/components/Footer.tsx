import React from 'react';
import { AppView } from '../types';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-zinc-200/80 bg-[#FAF9F6] text-zinc-600 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-amber-50">
                <div className="h-3 w-3 rounded-full border border-amber-300" />
              </div>
              <span className="font-serif text-lg font-bold text-zinc-900">BranchLens</span>
            </div>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-zinc-600">
              One problem. Many ways to see it. An interdisciplinary inquiry platform helping thinkers,
              students, and designers understand how different disciplines evaluate, critique, and expand
              the same shared solution.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Frontend-First Active &bull; Supabase-Ready
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Platform</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('workspace')}
                  className="hover:text-zinc-900 transition-colors"
                >
                  Main Workspace
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('new-analysis')}
                  className="hover:text-zinc-900 transition-colors"
                >
                  Start New Analysis
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('create-problem')}
                  className="hover:text-zinc-900 transition-colors"
                >
                  Bring Your Own Problem
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('problem-library')}
                  className="hover:text-zinc-900 transition-colors"
                >
                  Problem Library
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Disciplines</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('discipline-explorer')}
                  className="hover:text-zinc-900 transition-colors"
                >
                  Discipline Explorer (40+)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('profile')}
                  className="hover:text-zinc-900 transition-colors"
                >
                  Problem-Solving Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-work')}
                  className="hover:text-zinc-900 transition-colors"
                >
                  Saved Analyses & Drafts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('settings')}
                  className="hover:text-zinc-900 transition-colors"
                >
                  Account & Privacy
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Reflective Pledge</h4>
            <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
              BranchLens is an educational mirror, not a career prediction algorithm or personality test.
              It reveals how ideas bend when viewed through alternate professional and scientific lenses.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>&copy; 2026 BranchLens. Built for deliberate interdisciplinary thinking.</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-zinc-500">Designed with Editorial Precision</span>
            <span className="text-zinc-300">&bull;</span>
            <button
              onClick={() => onNavigate('settings')}
              className="text-[11px] hover:text-zinc-900 transition-colors"
            >
              Privacy & Data Ethics
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
