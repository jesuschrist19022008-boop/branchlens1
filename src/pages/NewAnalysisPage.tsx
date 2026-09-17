import React from 'react';
import { PlusCircle, BookOpen, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { AppView } from '../types';

interface NewAnalysisPageProps {
  onNavigate: (view: AppView) => void;
}

export const NewAnalysisPage: React.FC<NewAnalysisPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[85vh] bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
            Phase 1 &bull; Problem Definition
          </span>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            How would you like to begin?
          </h1>
          <p className="mt-3 text-sm text-zinc-600 max-w-xl mx-auto">
            BranchLens starts with a single concrete challenge. You can formulate any real-world problem
            from your own work, or explore curated examples.
          </p>
        </div>

        {/* Two Equal Choices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Choice 1: Bring Your Own Problem */}
          <div
            id="choice-bring-own-problem"
            onClick={() => onNavigate('create-problem')}
            className="group cursor-pointer rounded-2xl border-2 border-zinc-200 bg-white p-8 shadow-xs hover:border-zinc-900 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white mb-6 group-hover:scale-105 transition-transform">
                <PlusCircle className="h-7 w-7 text-amber-300" />
              </div>

              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-mono font-medium text-zinc-700 uppercase tracking-wide">
                Custom Inquiries
              </span>

              <h2 className="mt-4 font-serif text-2xl font-bold text-zinc-900">
                Bring Your Own Problem
              </h2>

              <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                Formulate any authentic real-world challenge. Enter custom domains, affected stakeholders,
                constraints, and risks. The system never forces you into predefined topics or categories.
              </p>

              <div className="mt-6 space-y-2 border-t border-zinc-100 pt-4 text-xs text-zinc-600">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Your own research, business, or community challenge</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Guided problem brief builder with autosave</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Completely private to your session</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-100">
              <button
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-semibold text-white group-hover:bg-zinc-800 transition-colors"
              >
                Create New Problem &rarr;
              </button>
            </div>
          </div>

          {/* Choice 2: Explore Problem Library */}
          <div
            id="choice-explore-library"
            onClick={() => onNavigate('problem-library')}
            className="group cursor-pointer rounded-2xl border-2 border-zinc-200 bg-white p-8 shadow-xs hover:border-emerald-700 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-white mb-6 group-hover:scale-105 transition-transform">
                <BookOpen className="h-7 w-7 text-emerald-200" />
              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-mono font-medium text-emerald-800 uppercase tracking-wide border border-emerald-200">
                Optional Inspiration
              </span>

              <h2 className="mt-4 font-serif text-2xl font-bold text-zinc-900">
                Explore Problem Library
              </h2>

              <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                Select from rich, cross-disciplinary problem briefs spanning pediatric genomics,
                passive urban heat sink architectures, indigenous linguistic vaults, and smallholder soil microbiomes.
              </p>

              <div className="mt-6 space-y-2 border-t border-zinc-100 pt-4 text-xs text-zinc-600">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Pre-structured briefs with real-world complexities</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Optional seed solutions ready to interrogate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Filter by domain, stakeholders, and difficulty</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-100">
              <button
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-xs font-semibold text-white group-hover:bg-emerald-900 transition-colors"
              >
                Browse Library Problems &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="mt-10 rounded-xl border border-zinc-200 bg-white p-4 text-center text-xs text-zinc-600">
          <p>
            <strong>Core Principle:</strong> The problem library is strictly optional. BranchLens is
            built to analyze <em>any</em> legitimate dilemma you encounter in the wild.
          </p>
        </div>
      </div>
    </div>
  );
};
