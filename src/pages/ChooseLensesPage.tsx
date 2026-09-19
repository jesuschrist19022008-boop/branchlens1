import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Compass,
  Info,
  Layers,
  RotateCcw,
  Search,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { analysisService } from '../services/analysisService';
import { lensService } from '../services/lensService';
import { AppView, Discipline, DisciplineCategory, Problem, Solution } from '../types';
import { Badge } from '../components/Badge';

interface ChooseLensesPageProps {
  problem: Problem;
  solution: Solution;
  onRunAnalysis: (selectedDisciplineIds: string[]) => void;
  onNavigate: (view: AppView) => void;
}

export const ChooseLensesPage: React.FC<ChooseLensesPageProps> = ({
  problem,
  solution,
  onRunAnalysis,
  onNavigate,
}) => {
  const [allDisciplines, setAllDisciplines] = useState<Discipline[]>([]);
  const [categories, setCategories] = useState<DisciplineCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLensIds, setSelectedLensIds] = useState<string[]>([]);

  useEffect(() => {
    const list = lensService.getAllDisciplines();
    const cats = lensService.getCategories();
    setAllDisciplines(list);
    setCategories(cats);

    // Check if solution already has saved lenses in Supabase
    const initLenses = async () => {
      const savedLenses = await analysisService.getSolutionLenses(solution.id);
      if (savedLenses && savedLenses.length > 0) {
        setSelectedLensIds(Array.from(new Set(savedLenses)));
      } else {
        const defaultUuids = Array.from(
          new Set(
            ['environmental-science', 'economics', 'computer-science', 'sociology']
              .map((slug) => lensService.getDisciplineUuid(slug))
          )
        );
        setSelectedLensIds(defaultUuids);
      }
    };
    initLenses();
  }, [solution.id]);

  const toggleLens = (idOrSlug: string) => {
    const realUuid = lensService.getDisciplineUuid(idOrSlug);
    setSelectedLensIds((prev) => {
      const set = new Set(prev);
      if (set.has(realUuid)) {
        set.delete(realUuid);
      } else {
        set.add(realUuid);
      }
      return Array.from(set);
    });
  };

  const clearAllLenses = () => {
    setSelectedLensIds([]);
  };

  const selectSuggestedTriad = (type: 'balanced' | 'technical' | 'humanities') => {
    if (type === 'balanced') {
      setSelectedLensIds(
        Array.from(
          new Set(
            ['environmental-science', 'economics', 'sociology', 'mechanical-engineering'].map((s) =>
              lensService.getDisciplineUuid(s)
            )
          )
        )
      );
    } else if (type === 'technical') {
      setSelectedLensIds(
        Array.from(
          new Set(
            ['computer-science', 'materials-science', 'mechanical-engineering', 'data-science'].map((s) =>
              lensService.getDisciplineUuid(s)
            )
          )
        )
      );
    } else {
      setSelectedLensIds(
        Array.from(
          new Set(
            ['philosophy-ethics', 'sociology', 'anthropology', 'public-policy'].map((s) =>
              lensService.getDisciplineUuid(s)
            )
          )
        )
      );
    }
  };

  const filteredDisciplines = allDisciplines.filter((disc) => {
    if (selectedCategory !== 'All' && disc.categoryName !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const question = disc.keyQuestion || (disc.whatItNotices && disc.whatItNotices[0]) || '';
      return (
        disc.name.toLowerCase().includes(q) ||
        disc.tagline.toLowerCase().includes(q) ||
        disc.categoryName.toLowerCase().includes(q) ||
        question.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedDisciplines = allDisciplines.filter((d) => selectedLensIds.includes(d.id));

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-36 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 mb-6">
          <button
            onClick={() => onNavigate('solution-workspace')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Solution Workspace
          </button>

          <div className="text-xs text-zinc-500 font-mono">
            {selectedLensIds.length} of {allDisciplines.length} Lenses Selected
          </div>
        </div>

        {/* Hero Banner with Mandated Quotes */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
              Stage 3 &bull; Multi-Disciplinary Inquiry
            </span>
            <span className="text-zinc-300">&bull;</span>
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200">
              Prism Selection
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            Same solution. <span className="italic font-normal text-zinc-700">New questions.</span>
          </h1>

          <p className="mt-2 text-base text-zinc-600 max-w-2xl font-sans">
            Your idea stays constant. The questions around it change.
          </p>

          {/* Quick Context Pill */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-700 shadow-2xs">
            <span className="font-semibold text-zinc-900">Anchor Solution:</span>
            <span className="italic truncate max-w-sm sm:max-w-lg text-zinc-600">
              "{solution.title}"
            </span>
          </div>
        </div>

        {/* Suggested Quick Combos */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-600">
            Quick Inquiry Combinations:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => selectSuggestedTriad('balanced')}
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              Classic Quad (Ecology, Econ, CS, Sociology)
            </button>
            <button
              onClick={() => selectSuggestedTriad('technical')}
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              Deep Tech (CS, Materials, MechEng, Data)
            </button>
            <button
              onClick={() => selectSuggestedTriad('humanities')}
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              Ethics & Policy (Ethics, Sociology, Anthro, Policy)
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search disciplines (e.g., Cybernetics, Urban Planning, Marine Biology, Ethics, Game Theory)..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs text-zinc-900 placeholder:text-zinc-400 shadow-2xs focus:border-zinc-900 focus:outline-hidden"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              All Lenses ({allDisciplines.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Disciplines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDisciplines.map((disc) => {
            const isSelected = selectedLensIds.includes(disc.id);
            return (
              <div
                key={disc.id}
                id={`lens-card-${disc.id}`}
                onClick={() => toggleLens(disc.id)}
                className={`group cursor-pointer rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-zinc-900 bg-white shadow-sm ring-2 ring-zinc-900/10'
                    : 'border-zinc-200/90 bg-white hover:border-zinc-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                      {disc.categoryName}
                    </span>
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
                        isSelected
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-300 bg-white group-hover:border-zinc-400'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-zinc-900 leading-snug">
                    {disc.name}
                  </h3>

                  <p className="mt-1 text-xs text-zinc-600 leading-relaxed font-sans line-clamp-2">
                    {disc.tagline}
                  </p>

                  <div className="mt-4 rounded-xl border border-zinc-100 bg-[#FAF9F6] p-3">
                    <span className="text-[10px] font-mono uppercase tracking-wide text-zinc-600 block mb-1">
                      Key Inquiry Question:
                    </span>
                    <p className="font-serif text-xs italic text-zinc-800 leading-snug">
                      "{disc.keyQuestion || (disc.whatItNotices && disc.whatItNotices[0]) || 'What are the core constraints?'}"
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-600">
                    Focus: <strong className="text-zinc-800">{disc.focusArea || disc.whatItFocusesOn}</strong>
                  </span>
                  <span
                    className={`font-semibold ${
                      isSelected ? 'text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-800'
                    }`}
                  >
                    {isSelected ? 'Selected' : '+ Add Lens'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky Selected-Lens Bottom Tray */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-200 bg-[#FAF9F6]/95 backdrop-blur-md px-4 py-3 shadow-lg">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-serif text-sm font-bold text-zinc-900">
                  {selectedLensIds.length} Lenses Active
                </span>
                {selectedLensIds.length > 0 && (
                  <button
                    onClick={clearAllLenses}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 underline ml-1"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Selected chips list */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {selectedDisciplines.slice(0, 5).map((d, idx) => (
                  <span
                    key={`${d.id}-${idx}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-2xs shrink-0"
                  >
                    {d.name.split(' ')[0]}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLens(d.id);
                      }}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {selectedDisciplines.length > 5 && (
                  <span className="rounded-lg bg-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-700 shrink-0">
                    +{selectedDisciplines.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* Run Analysis Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                id="run-analysis-btn"
                disabled={selectedLensIds.length === 0}
                onClick={() => onRunAnalysis(Array.from(new Set(selectedLensIds)))}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-900 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-4 w-4 text-emerald-200" />
                Run Analysis ({selectedLensIds.length})
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
