import React, { useEffect, useState, useMemo } from 'react';
import { Compass, Sparkles, CheckCircle2, Layers, Cpu, Eye } from 'lucide-react';
import { AnalysisStage, Discipline } from '../types';

interface AnalysisLoadingPageProps {
  selectedDisciplines: Discipline[];
  currentStage: AnalysisStage;
  progressPercent: number;
  currentDisciplineName?: string;
  onComplete: () => void;
}

export const AnalysisLoadingPage: React.FC<AnalysisLoadingPageProps> = ({
  selectedDisciplines,
  currentStage,
  progressPercent,
  currentDisciplineName,
  onComplete,
}) => {
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

  const uniqueDisciplines = useMemo(() => {
    const seen = new Set<string>();
    return selectedDisciplines.filter((d) => {
      if (!d || !d.id || seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
  }, [selectedDisciplines]);

  const reflectiveQuotes = [
    {
      quote: "No problem can be solved from the same level of consciousness that created it.",
      author: "Albert Einstein",
    },
    {
      quote: "To a man with a hammer, everything looks like a nail. We provide forty different tools.",
      author: "Interdisciplinary Epistemology",
    },
    {
      quote: "Real discovery consists not in seeking new lands, but in seeing with new eyes.",
      author: "Marcel Proust",
    },
    {
      quote: "The boundary of your discipline is the beginning of your blind spot.",
      author: "Systems Architecture Axiom",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuoteIndex((prev) => (prev + 1) % reflectiveQuotes.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const stageDescriptions: Record<AnalysisStage, string> = {
    idle: 'Preparing inquiry canvas...',
    inspecting: 'Inspecting physical, technical, and operational constraints...',
    synthesizing: 'Synthesizing theoretical perspective and domain paradigms...',
    calculating: 'Calculating cross-lens tensions and second-order trade-offs...',
    finalizing: 'Synthesizing qualitative signals and cross-disciplinary brief...',
    complete: 'Analysis complete. Loading synthesis brief...',
  };

  return (
    <div className="min-h-[85vh] bg-[#FAF9F6] py-16 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl text-center">
        {/* Animated Prism Graphic */}
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-zinc-900 shadow-xl transition-all animate-pulse" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 border border-amber-400/40">
            <Compass className="h-8 w-8 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
          Interdisciplinary Synthesis Engine
        </span>

        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-zinc-900">
          Turning the Lenses
        </h2>

        {/* Current Active Discipline Badge */}
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs text-zinc-700 shadow-2xs">
          <Eye className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
          <span>
            Currently Interrogating:{' '}
            <strong className="text-zinc-900">
              {currentDisciplineName || selectedDisciplines[0]?.name || 'Domain'}
            </strong>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-2">
            <span>{stageDescriptions[currentStage]}</span>
            <span className="font-semibold text-zinc-900">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-zinc-900 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Selected Lenses Pipeline Indicators */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {uniqueDisciplines.map((disc, idx) => {
            const isCompleted =
              progressPercent >= ((idx + 1) / uniqueDisciplines.length) * 80;
            const isCurrent =
              currentDisciplineName === disc.name ||
              (!currentDisciplineName && idx === 0);

            return (
              <div
                key={`${disc.id}-${idx}`}
                className={`rounded-xl border p-2.5 text-left transition-all ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/60 text-emerald-950'
                    : isCurrent
                    ? 'border-zinc-900 bg-white shadow-2xs'
                    : 'border-zinc-200 bg-white/60 text-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-zinc-600">0{idx + 1}</span>
                  {isCompleted && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                </div>
                <p className="mt-1 font-serif text-xs font-bold truncate">{disc.name}</p>
              </div>
            );
          })}
        </div>

        {/* Epistemic Reflections Rotator */}
        <div className="mt-12 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 block mb-2">
            Epistemological Perspective:
          </span>
          <blockquote className="font-serif text-sm italic text-zinc-800 leading-relaxed">
            "{reflectiveQuotes[activeQuoteIndex].quote}"
          </blockquote>
          <p className="mt-2 text-[11px] font-medium text-zinc-600">
            &mdash; {reflectiveQuotes[activeQuoteIndex].author}
          </p>
        </div>
      </div>
    </div>
  );
};
