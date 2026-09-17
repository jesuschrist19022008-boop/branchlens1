import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Search,
  X,
} from 'lucide-react';
import { lensService } from '../services/lensService';
import { AppView, Discipline, DisciplineCategory } from '../types';

interface DisciplineExplorerPageProps {
  onNavigate: (view: AppView) => void;
}

export const DisciplineExplorerPage: React.FC<DisciplineExplorerPageProps> = ({ onNavigate }) => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [categories, setCategories] = useState<DisciplineCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);

  useEffect(() => {
    setDisciplines(lensService.getAllDisciplines());
    setCategories(lensService.getCategories());
  }, []);

  const filteredDisciplines = disciplines.filter((d) => {
    if (selectedCategory !== 'All' && d.categoryName !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const question = d.keyQuestion || (d.whatItNotices && d.whatItNotices[0]) || '';
      return (
        d.name.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q) ||
        d.categoryName.toLowerCase().includes(q) ||
        (d.focusArea || d.whatItFocusesOn).toLowerCase().includes(q) ||
        question.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 mb-6">
          <button
            onClick={() => onNavigate('workspace')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workspace
          </button>
          <span className="text-xs font-mono text-zinc-500">
            Catalog: {disciplines.length} Academic & Professional Lenses
          </span>
        </div>

        {/* Hero Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
              Interactive Reference Directory
            </span>
            <span className="text-zinc-300">&bull;</span>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-800 border border-blue-200">
              40+ Disciplines Catalog
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            Discipline Explorer
          </h1>

          <p className="mt-2 text-sm sm:text-base text-zinc-600 max-w-2xl font-sans">
            Every discipline is a set of trained instincts—what it celebrates, what it dreads, and the
            unseen variables it automatically tracks.
          </p>
        </div>

        {/* Search & Categories Filter */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, methodology, paradigm, or question..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs text-zinc-900 placeholder:text-zinc-400 shadow-2xs focus:border-zinc-900 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              All Lenses ({disciplines.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === c.name
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Disciplines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDisciplines.map((disc) => (
            <div
              key={disc.id}
              onClick={() => setSelectedDiscipline(disc)}
              className="group cursor-pointer rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs hover:border-zinc-400 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                    {disc.categoryName}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-600">
                    Lens
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-zinc-900 leading-snug group-hover:text-amber-950 transition-colors">
                  {disc.name}
                </h3>

                <p className="mt-2 text-xs text-zinc-600 leading-relaxed font-sans">
                  {disc.tagline}
                </p>

                <div className="mt-4 rounded-xl border border-zinc-100 bg-[#FAF9F6] p-3">
                  <span className="text-[10px] font-mono uppercase tracking-wide text-zinc-600 block mb-1">
                    Fundamental Question:
                  </span>
                  <p className="font-serif text-xs italic text-zinc-800 leading-snug">
                    "{disc.keyQuestion || (disc.whatItNotices && disc.whatItNotices[0]) || 'What are the foundational assumptions?'}"
                  </p>
                </div>

                <div className="mt-4 text-[11px] text-zinc-600 space-y-1">
                  <div>
                    <strong className="text-zinc-800">Focus:</strong> {disc.focusArea || disc.whatItFocusesOn}
                  </div>
                  <div className="line-clamp-2">
                    <strong className="text-zinc-800">Notices:</strong> {disc.whatItNotices.join(', ')}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="text-zinc-600 font-mono text-[11px]">Inspect profile</span>
                <span className="font-semibold text-zinc-900 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Deep Dive &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Modal / Drawer when a Discipline is clicked */}
        {selectedDiscipline && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-zinc-200">
              <button
                onClick={() => setSelectedDiscipline(null)}
                className="absolute right-5 top-5 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
                  {selectedDiscipline.categoryName}
                </span>
                <h2 className="font-serif text-3xl font-bold text-zinc-900 mt-1">
                  {selectedDiscipline.name}
                </h2>
                <p className="text-sm text-zinc-600 mt-1">{selectedDiscipline.tagline}</p>
              </div>

              <div className="my-6 rounded-2xl border border-zinc-200 bg-[#FAF9F6] p-5">
                <span className="text-[10px] font-mono uppercase tracking-wide text-zinc-600 block mb-1">
                  Primary Interrogation Question:
                </span>
                <blockquote className="font-serif text-lg italic text-zinc-900">
                  "{selectedDiscipline.keyQuestion || (selectedDiscipline.whatItNotices && selectedDiscipline.whatItNotices[0]) || 'What are the foundational assumptions?'}"
                </blockquote>
              </div>

              <div className="space-y-4 text-xs text-zinc-700 leading-relaxed">
                <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <h4 className="font-mono text-[11px] uppercase tracking-wide font-bold text-zinc-900 mb-1">
                    What It Focuses On:
                  </h4>
                  <p>{selectedDiscipline.focusArea || selectedDiscipline.whatItFocusesOn}</p>
                </div>

                <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <h4 className="font-mono text-[11px] uppercase tracking-wide font-bold text-zinc-900 mb-1">
                    What It Immediately Notices (Trained Instinct):
                  </h4>
                  <p>{selectedDiscipline.whatItNotices.join(', ')}</p>
                </div>

                <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <h4 className="font-mono text-[11px] uppercase tracking-wide font-bold text-zinc-900 mb-1">
                    Common Constraints & Boundaries It Respects:
                  </h4>
                  <p>{selectedDiscipline.commonConstraints.join(', ')}</p>
                </div>

                <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <h4 className="font-mono text-[11px] uppercase tracking-wide font-bold text-zinc-900 mb-1">
                    How It Evaluates Solutions:
                  </h4>
                  <p>{selectedDiscipline.howItEvaluates || selectedDiscipline.evaluationMethods.join(', ')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border border-zinc-200 p-3">
                    <span className="font-mono text-[10px] uppercase text-zinc-600 block mb-1">
                      Key Application Areas:
                    </span>
                    <p className="font-medium text-zinc-900">{selectedDiscipline.applicationAreas.join(', ')}</p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-3">
                    <span className="font-mono text-[10px] uppercase text-zinc-600 block mb-1">
                      Related Disciplines:
                    </span>
                    <p className="font-medium text-zinc-900">{selectedDiscipline.relatedDisciplines.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedDiscipline(null)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedDiscipline(null);
                    onNavigate('new-analysis');
                  }}
                  className="rounded-xl bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
                >
                  Use This Lens in an Analysis &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
