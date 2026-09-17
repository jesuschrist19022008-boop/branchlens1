import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Layers,
  RotateCcw,
  Save,
  Sparkles,
  Zap,
} from 'lucide-react';
import { solutionService } from '../services/solutionService';
import { AppView, Problem, Solution } from '../types';
import { Badge } from '../components/Badge';

interface SolutionWorkspacePageProps {
  problem: Problem;
  existingSolution?: Solution | null;
  onProceedToLenses: (solution: Solution) => void;
  onNavigate: (view: AppView) => void;
}

export const SolutionWorkspacePage: React.FC<SolutionWorkspacePageProps> = ({
  problem,
  existingSolution,
  onProceedToLenses,
  onNavigate,
}) => {
  const [title, setTitle] = useState(existingSolution?.title || '');
  const [proposedApproach, setProposedApproach] = useState(existingSolution?.proposedApproach || '');
  const [howItWorks, setHowItWorks] = useState(existingSolution?.howItWorks || '');
  const [implementationPlan, setImplementationPlan] = useState(existingSolution?.implementationPlan || '');
  const [resourcesRequired, setResourcesRequired] = useState(existingSolution?.resourcesRequired || '');
  const [tradeOffs, setTradeOffs] = useState(existingSolution?.tradeOffs || '');
  const [risks, setRisks] = useState(existingSolution?.risks || '');
  const [additionalNotes, setAdditionalNotes] = useState(existingSolution?.additionalNotes || '');

  const [problemBriefExpanded, setProblemBriefExpanded] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const draftStorageKey = `branchlens_solution_draft_${problem.id}`;

  // Load draft or existing solution
  useEffect(() => {
    if (existingSolution) {
      setTitle(existingSolution.title);
      setProposedApproach(existingSolution.proposedApproach);
      setHowItWorks(existingSolution.howItWorks);
      setImplementationPlan(existingSolution.implementationPlan);
      setResourcesRequired(existingSolution.resourcesRequired);
      setTradeOffs(existingSolution.tradeOffs);
      setRisks(existingSolution.risks);
      setAdditionalNotes(existingSolution.additionalNotes || '');
      return;
    }

    try {
      const draft = localStorage.getItem(draftStorageKey);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.proposedApproach) setProposedApproach(parsed.proposedApproach);
        if (parsed.howItWorks) setHowItWorks(parsed.howItWorks);
        if (parsed.implementationPlan) setImplementationPlan(parsed.implementationPlan);
        if (parsed.resourcesRequired) setResourcesRequired(parsed.resourcesRequired);
        if (parsed.tradeOffs) setTradeOffs(parsed.tradeOffs);
        if (parsed.risks) setRisks(parsed.risks);
        if (parsed.additionalNotes) setAdditionalNotes(parsed.additionalNotes);
      }
    } catch {
      // ignore
    }
  }, [problem.id, existingSolution]);

  // Debounced autosave
  useEffect(() => {
    setAutosaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        const draft = {
          title,
          proposedApproach,
          howItWorks,
          implementationPlan,
          resourcesRequired,
          tradeOffs,
          risks,
          additionalNotes,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(draftStorageKey, JSON.stringify(draft));
        setAutosaveStatus('saved');
      } catch {
        setAutosaveStatus('idle');
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [
    title,
    proposedApproach,
    howItWorks,
    implementationPlan,
    resourcesRequired,
    tradeOffs,
    risks,
    additionalNotes,
    draftStorageKey,
  ]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Solution title is required.';
    if (!proposedApproach.trim() || proposedApproach.length < 20) {
      errs.proposedApproach = 'Provide a substantive proposed approach (at least 20 chars).';
    }
    if (!howItWorks.trim() || howItWorks.length < 20) {
      errs.howItWorks = 'Explain how the mechanics or process operate.';
    }
    if (!implementationPlan.trim()) {
      errs.implementationPlan = 'Outline initial phases or operational rollout.';
    }
    if (!resourcesRequired.trim()) {
      errs.resourcesRequired = 'List personnel, financial, material, or institutional inputs.';
    }
    if (!tradeOffs.trim()) {
      errs.tradeOffs = 'Acknowledge what this solution sacrifices or deprioritizes.';
    }
    if (!risks.trim()) {
      errs.risks = 'Identify main failure risks or vulnerabilities.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    try {
      let saved: Solution;
      if (existingSolution) {
        saved = await solutionService.updateSolution(existingSolution.id, {
          title,
          proposedApproach,
          howItWorks,
          implementationPlan,
          resourcesRequired,
          tradeOffs,
          risks,
          additionalNotes,
        });
      } else {
        saved = await solutionService.saveSolution({
          problemId: problem.id,
          title,
          proposedApproach,
          howItWorks,
          implementationPlan,
          resourcesRequired,
          tradeOffs,
          risks,
          additionalNotes,
        });
      }

      onProceedToLenses(saved);
    } catch (err) {
      console.error('Failed to save solution', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFillSample = () => {
    setTitle('Capillary Multi-Stage Solar Stills with Halophyte Constructed Wetland Sinks');
    setProposedApproach(
      'Deploy modular, passively driven thermal solar evaporators manufactured from marine-grade aluminum and borosilicate glass. The system captures latent heat of condensation across 4 stages, generating 12 liters of distilled freshwater per square meter daily without grid power.'
    );
    setHowItWorks(
      'Seawater is drawn through natural capillary cotton-cellulose wicks into tiered evaporation chambers heated by evacuated solar tubes. Brine effluent with 80 PSU salinity drains downward into an engineered gravity-fed wetland planted with Avicennia marina mangroves and Salicornia europaea halophytes, which sequester heavy minerals and absorb sodium.'
    );
    setImplementationPlan(
      'Phase 1: Fabricate 10 prototype units in local workshops using standard pipe fittings. Phase 2: Deploy at municipal health clinic and community school. Phase 3: Train local fishing cooperative technicians on weekly descaling and halophyte seed harvesting.'
    );
    setResourcesRequired(
      'Initial capital: $85,000 for materials and tooling; 3 certified plumbing trainers; 0.5 hectare coastal tidal flat for the constructed wetland; ongoing annual maintenance reserve of $4,500.'
    );
    setTradeOffs(
      'Lower daily throughput compared to industrial reverse osmosis; requires larger coastal land footprint for wetlands; produces zero freshwater during heavy monsoonal overcast periods.'
    );
    setRisks(
      'Bio-fouling and algal crust formation on capillary wicks; unseasonal high storm tides flooding and washing out the halophyte wetland beds.'
    );
    setAdditionalNotes(
      'All structural joints use standard metric plumbing threads so parts can be purchased from any regional maritime hardware supplier.'
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 mb-6">
          <button
            onClick={() => onNavigate('problem-brief')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Problem Brief
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 shadow-2xs">
              {autosaveStatus === 'saving' ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Autosaving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Draft saved</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleFillSample}
              className="text-xs font-medium text-zinc-700 hover:text-zinc-950 underline"
            >
              Fill Sample Solution
            </button>
          </div>
        </div>

        {/* Collapsible Problem Context Bar */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-2xs mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-zinc-700">
                ACTIVE PROBLEM
              </span>
              <span className="font-serif text-sm font-bold text-zinc-900 truncate max-w-md sm:max-w-xl">
                {problem.title}
              </span>
            </div>

            <button
              onClick={() => setProblemBriefExpanded(!problemBriefExpanded)}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800"
            >
              {problemBriefExpanded ? (
                <>
                  Less <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Review Problem <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {problemBriefExpanded && (
            <div className="mt-4 pt-4 border-t border-zinc-100 text-xs text-zinc-600 space-y-2">
              <p>
                <strong className="text-zinc-800">Problem:</strong> {problem.description}
              </p>
              <p>
                <strong className="text-zinc-800">Desired Outcome:</strong> {problem.desiredOutcome}
              </p>
              <p>
                <strong className="text-zinc-800">Key Constraints:</strong> {problem.constraints}
              </p>
            </div>
          )}
        </div>

        {/* Title Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
              Stage 2 &bull; One Shared Solution
            </span>
            <span className="text-zinc-300">&bull;</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Fixed Anchor Across Lenses
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            What is your solution?
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600 max-w-2xl">
            This idea is your anchor. In the next step, multiple disciplinary lenses will interrogate,
            stress-test, and expand it.
          </p>
        </div>

        {/* Solution Workspace Form */}
        <form onSubmit={handleSaveAndProceed} className="space-y-6">
          {/* Solution Title */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
                Solution Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-zinc-500">{title.length} characters</span>
            </div>
            <input
              id="solution-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Passively Evaporated Solar Stills with Halophyte Mangrove Wetland Sinks"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
            />
            {errors.title && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.title}</p>}
          </div>

          {/* Proposed Approach */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
                Proposed Approach <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-zinc-500">
                {proposedApproach.length} characters
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-2">
              Summarize your high-level strategy and what makes it distinct from existing solutions.
            </p>
            <textarea
              id="solution-approach-input"
              rows={4}
              value={proposedApproach}
              onChange={(e) => setProposedApproach(e.target.value)}
              placeholder="Describe the architectural concept, why you chose this path, and what it achieves..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
            />
            {errors.proposedApproach && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.proposedApproach}</p>
            )}
          </div>

          {/* How It Works */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
                How It Works (Mechanisms & Flow) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-zinc-500">{howItWorks.length} characters</span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-2">
              Walk through the physical, technical, social, or procedural flow step by step.
            </p>
            <textarea
              id="solution-how-it-works-input"
              rows={4}
              value={howItWorks}
              onChange={(e) => setHowItWorks(e.target.value)}
              placeholder="Step 1: Raw inputs enter... Step 2: Processing occurs... Step 3: Outputs and byproducts are handled..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
            />
            {errors.howItWorks && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.howItWorks}</p>
            )}
          </div>

          {/* Implementation Plan & Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
                  Implementation Plan <span className="text-rose-500">*</span>
                </label>
              </div>
              <p className="text-[11px] text-zinc-500 mb-2">Phasing, timelines, pilot milestones.</p>
              <textarea
                rows={3}
                value={implementationPlan}
                onChange={(e) => setImplementationPlan(e.target.value)}
                placeholder="Phase 1 prototyping (months 1-3), Phase 2 pilot deployment, Phase 3 scaling..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
              />
              {errors.implementationPlan && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.implementationPlan}</p>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
                  Resources Required <span className="text-rose-500">*</span>
                </label>
              </div>
              <p className="text-[11px] text-zinc-500 mb-2">Budget, tooling, materials, personnel.</p>
              <textarea
                rows={3}
                value={resourcesRequired}
                onChange={(e) => setResourcesRequired(e.target.value)}
                placeholder="Hardware tools, software stack, human specialists, funding budget..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
              />
              {errors.resourcesRequired && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.resourcesRequired}</p>
              )}
            </div>
          </div>

          {/* Trade-offs & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
                  Acknowledged Trade-Offs <span className="text-rose-500">*</span>
                </label>
              </div>
              <p className="text-[11px] text-zinc-500 mb-2">
                What does this solution intentionally deprioritize?
              </p>
              <textarea
                rows={3}
                value={tradeOffs}
                onChange={(e) => setTradeOffs(e.target.value)}
                placeholder="Trading peak instantaneous speed for zero ongoing fossil fuels; higher spatial footprint..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
              />
              {errors.tradeOffs && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.tradeOffs}</p>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
                  Failure Modes & Risks <span className="text-rose-500">*</span>
                </label>
              </div>
              <p className="text-[11px] text-zinc-500 mb-2">What could break or cause backlash?</p>
              <textarea
                rows={3}
                value={risks}
                onChange={(e) => setRisks(e.target.value)}
                placeholder="Supply chain delays on specialized glass, community friction over coastal land rights..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
              />
              {errors.risks && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.risks}</p>}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
              Additional Notes & Caveats (Optional)
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any other details to provide rich context to disciplinary lenses..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-zinc-500">
              <span>Ready? Click below to choose which disciplinary lenses interrogate this solution.</span>
            </div>

            <button
              id="proceed-to-lenses-btn"
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-7 py-3.5 text-xs font-bold text-white shadow-md hover:bg-zinc-800 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Locking Solution...' : 'Proceed to Choose Lenses'}
              <ArrowRight className="h-4 w-4 text-amber-300" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
