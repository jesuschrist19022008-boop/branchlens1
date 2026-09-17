import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Sparkles,
  PlusCircle,
  Tag,
  Compass,
} from 'lucide-react';
import { problemService } from '../services/problemService';
import { AppView, Problem } from '../types';
import { Badge } from '../components/Badge';

interface ProblemLibraryPageProps {
  onSelectProblem: (problem: Problem) => void;
  onNavigate: (view: AppView) => void;
}

export const ProblemLibraryPage: React.FC<ProblemLibraryPageProps> = ({
  onSelectProblem,
  onNavigate,
}) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [onlySaved, setOnlySaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    const list = await problemService.getProblems();
    setProblems(list);
    setLoading(false);
  };

  const handleToggleSave = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isSaved = await problemService.toggleSaveProblem(id);
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSaved } : p))
    );
  };

  const domains = ['All', 'Water & Climate', 'Linguistics', 'Urban Resilience', 'Healthcare', 'Agriculture'];

  const filteredProblems = problems.filter((p) => {
    if (onlySaved && !p.isSaved) return false;
    if (selectedDomain !== 'All') {
      const match =
        p.domain.toLowerCase().includes(selectedDomain.toLowerCase().split(' ')[0]) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(selectedDomain.toLowerCase().split(' ')[0])));
      if (!match) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/80 pb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
              Inspiration Catalog &bull; Optional Reference
            </span>
            <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              Problem Library
            </h1>
            <p className="mt-1 text-sm text-zinc-600 max-w-2xl">
              Curated real-world dilemmas engineered with structural tension. Use these as instant springboards
              or bring your own custom inquiry at any time.
            </p>
          </div>

          <div>
            <button
              onClick={() => onNavigate('create-problem')}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition-colors"
            >
              <PlusCircle className="h-4 w-4 text-amber-300" />
              Bring Your Own Instead
            </button>
          </div>
        </div>

        {/* Search & Domain Filter Bar */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems by title, domain, stakeholders, or keywords..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs text-zinc-900 placeholder:text-zinc-400 shadow-2xs focus:border-zinc-900 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {domains.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedDomain === d
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {d}
              </button>
            ))}

            <button
              onClick={() => setOnlySaved(!onlySaved)}
              className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                onlySaved
                  ? 'bg-amber-100 border border-amber-300 text-amber-900'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Bookmark className={`h-3 w-3 ${onlySaved ? 'fill-amber-600 text-amber-600' : ''}`} />
              Saved Only
            </button>
          </div>
        </div>

        {/* Problem Editorial Cards Grid */}
        <div className="mt-8">
          {filteredProblems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
              <Compass className="mx-auto h-8 w-8 text-zinc-400" />
              <h3 className="mt-3 font-serif text-lg font-bold text-zinc-900">
                No matching inquiries found
              </h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                No problems matched your current filters. Try resetting the search or formulate your own
                custom problem brief.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDomain('All');
                  setOnlySaved(false);
                }}
                className="mt-4 text-xs font-semibold text-zinc-900 underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProblems.map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => {
                    onSelectProblem(prob);
                    onNavigate('problem-brief');
                  }}
                  className="group cursor-pointer rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:border-zinc-400 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[11px] font-semibold text-zinc-600 truncate max-w-[200px]">
                        {prob.domain}
                      </span>
                      <button
                        onClick={(e) => handleToggleSave(e, prob.id)}
                        className="p-1 rounded-md text-zinc-400 hover:text-amber-600 hover:bg-zinc-50"
                        title={prob.isSaved ? 'Remove bookmark' : 'Bookmark problem'}
                      >
                        {prob.isSaved ? (
                          <BookmarkCheck className="h-4 w-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-zinc-900 leading-snug group-hover:text-amber-950 transition-colors">
                      {prob.title}
                    </h3>

                    <p className="mt-2.5 text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                      {prob.description}
                    </p>

                    <div className="mt-4 rounded-xl bg-zinc-50 p-3 border border-zinc-100/90 text-[11px] text-zinc-600 space-y-1">
                      <div>
                        <strong className="text-zinc-800">Stakeholders:</strong> {prob.peopleAffected}
                      </div>
                      <div className="truncate">
                        <strong className="text-zinc-800">Key Constraint:</strong> {prob.constraints}
                      </div>
                    </div>

                    {prob.tags && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {prob.tags.map((t) => (
                          <Badge key={t} variant="neutral">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-zinc-600">
                      {prob.difficulty || 'Complex'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 group-hover:translate-x-0.5 transition-transform">
                      View Problem Brief &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
