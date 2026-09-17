import React, { useEffect, useState } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { problemService } from '../services/problemService';
import { AppView, Problem } from '../types';

interface CreateProblemPageProps {
  initialProblem?: Problem | null;
  onProblemSaved: (problem: Problem) => void;
  onNavigate: (view: AppView) => void;
}

const DRAFT_STORAGE_KEY = 'branchlens_problem_draft_state';

export const CreateProblemPage: React.FC<CreateProblemPageProps> = ({
  initialProblem,
  onProblemSaved,
  onNavigate,
}) => {
  const [title, setTitle] = useState(initialProblem?.title || '');
  const [description, setDescription] = useState(initialProblem?.description || '');
  const [domain, setDomain] = useState(initialProblem?.domain || '');
  const [context, setContext] = useState(initialProblem?.context || '');
  const [peopleAffected, setPeopleAffected] = useState(initialProblem?.peopleAffected || '');
  const [desiredOutcome, setDesiredOutcome] = useState(initialProblem?.desiredOutcome || '');
  const [constraints, setConstraints] = useState(initialProblem?.constraints || '');
  const [risks, setRisks] = useState(initialProblem?.risks || '');
  const [additionalContext, setAdditionalContext] = useState(initialProblem?.additionalContext || '');

  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore draft on mount if not editing an existing problem
  useEffect(() => {
    if (!initialProblem) {
      try {
        const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (draft) {
          const parsed = JSON.parse(draft);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.description) setDescription(parsed.description);
          if (parsed.domain) setDomain(parsed.domain);
          if (parsed.context) setContext(parsed.context);
          if (parsed.peopleAffected) setPeopleAffected(parsed.peopleAffected);
          if (parsed.desiredOutcome) setDesiredOutcome(parsed.desiredOutcome);
          if (parsed.constraints) setConstraints(parsed.constraints);
          if (parsed.risks) setRisks(parsed.risks);
          if (parsed.additionalContext) setAdditionalContext(parsed.additionalContext);
        }
      } catch {
        // ignore
      }
    }
  }, [initialProblem]);

  // Autosave effect with debounce
  useEffect(() => {
    if (initialProblem) return; // don't autosave over editing session without confirmation

    setAutosaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        const draft = {
          title,
          description,
          domain,
          context,
          peopleAffected,
          desiredOutcome,
          constraints,
          risks,
          additionalContext,
          lastSaved: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        setAutosaveStatus('saved');
      } catch {
        setAutosaveStatus('idle');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [
    title,
    description,
    domain,
    context,
    peopleAffected,
    desiredOutcome,
    constraints,
    risks,
    additionalContext,
    initialProblem,
  ]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Problem title is required.';
    if (!description.trim() || description.length < 20) {
      errs.description = 'Please provide a clear description (at least 20 characters).';
    }
    if (!domain.trim()) errs.domain = 'Domain is required (you can enter any custom field).';
    if (!context.trim()) errs.context = 'Context helps disciplinary lenses evaluate constraints.';
    if (!peopleAffected.trim()) errs.peopleAffected = 'Specify who is affected by this challenge.';
    if (!desiredOutcome.trim()) errs.desiredOutcome = 'Define what better looks like.';
    if (!constraints.trim()) errs.constraints = 'List key physical, political, or financial boundaries.';
    if (!risks.trim()) errs.risks = 'Identify main failure or unintended consequence risks.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      let saved: Problem;
      if (initialProblem) {
        saved = await problemService.updateProblem(initialProblem.id, {
          title,
          description,
          domain,
          context,
          peopleAffected,
          desiredOutcome,
          constraints,
          risks,
          additionalContext,
        });
      } else {
        saved = await problemService.createProblem({
          title,
          description,
          domain,
          context,
          peopleAffected,
          desiredOutcome,
          constraints,
          risks,
          additionalContext,
          assumptions: 'Assumes affected stakeholders are consulted during solution phase.',
          successSignals: 'Measurable reduction in harm and verified adoption in target setting.',
        });
        // Clear draft on successful creation
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }

      onProblemSaved(saved);
      onNavigate('problem-brief');
    } catch (err) {
      console.error('Failed to save problem', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (confirm('Clear form and reset draft?')) {
      setTitle('');
      setDescription('');
      setDomain('');
      setContext('');
      setPeopleAffected('');
      setDesiredOutcome('');
      setConstraints('');
      setRisks('');
      setAdditionalContext('');
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setErrors({});
    }
  };

  // Quick preset inspiration button for user convenience
  const handleFillInspiration = (sampleType: 'energy' | 'civic' | 'health') => {
    if (sampleType === 'energy') {
      setTitle('Thermal Energy Storage for Rural Artisanal Cooperatives');
      setDomain('Clean Energy & Industrial Ecology');
      setDescription('Rural glassblowing and ceramics cooperatives rely on high-emission diesel furnaces because intermittent off-grid solar cannot maintain high kiln firing temperatures (850°C+).');
      setContext('Small cooperative workshops operate in areas where electric transmission lines are nonexistent or prone to daily blackouts.');
      setPeopleAffected('Over 35,000 regional craftspeople, furnace operators, and surrounding village residents exposed to diesel particulate.');
      setDesiredOutcome('Modular phase-change thermal storage batteries capable of holding 900°C for 6 hours of continuous firing with zero fossil fuel.');
      setConstraints('Must be built with locally abundant refractory clay and recycled scrap metals; no proprietary computer chips that cannot be replaced locally.');
      setRisks('Thermal shock cracking the clay casing; localized heat leaks posing severe burn hazards to furnace operators.');
      setAdditionalContext('Cooperative members have express willingness to pool collective savings for upfront fabrication if operating fuel costs decrease.');
    } else if (sampleType === 'civic') {
      setTitle('Preserving Algorithmic Due Process in Municipal Permit Approvals');
      setDomain('Administrative Law & Algorithmic Governance');
      setDescription('City housing inspection bureaus are quietly adopting automated black-box scoring systems to reject low-income tenant home improvement permits without statutory human explanations.');
      setContext('Budget-strapped city agencies purchase commercial off-the-shelf predictive tools that lack transparent rule logs.');
      setPeopleAffected('Low-income homeowners, municipal building inspectors, tenant advocacy attorneys, and local community boards.');
      setDesiredOutcome('A mandatory, machine-readable plain-language audit trail for every automated administrative decision with direct human appeal rights within 14 days.');
      setConstraints('Must fit within existing municipal administrative procedure statutes; cannot cost more than 5% of the annual agency IT budget.');
      setRisks('Vendor pushback claiming trade secrets; bureaucratic delays if all appeals require full evidentiary court hearings.');
      setAdditionalContext('Several homeowners have faced predatory code violation fines before being notified that an algorithm generated the citation.');
    } else {
      setTitle('Cold-Chain Vaccine Distribution in Monsoonal River Delta Settlements');
      setDomain('Global Health Logistics & Rural Infrastructure');
      setDescription('Childhood immunization rates in riverine marshlands drop 45% during annual 3-month monsoons because portable ice coolers melt before riverboat nurses can navigate swollen tributaries.');
      setContext('Villages are reachable solely by motorized dugout canoes navigating shifting sandbars in 38°C ambient heat and 95% humidity.');
      setPeopleAffected('Infants, pregnant mothers, and frontline traveling community health workers across 200 disconnected delta hamlets.');
      setDesiredOutcome('Passive, non-electric chemical cooling sleeves or evaporative vacuum flasks sustaining 2°C–8°C for 96 hours in extreme humidity.');
      setConstraints('Must weigh under 8kg when fully loaded with vials; must survive accidental drops into muddy river water; must cost under $45 per unit.');
      setRisks('Vials freezing accidentally if cooling agent is uncalibrated; mercury or chemical leakage if dropped against riverboat hulls.');
      setAdditionalContext('Frontline nurses are often women working 14-hour days with limited physical support.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header with Autosave indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
              {initialProblem ? 'Refine Problem Brief' : 'Guided Problem Formulation'}
            </span>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-zinc-900">
              {initialProblem ? 'Edit Your Problem' : 'Bring Your Own Problem'}
            </h1>
            <p className="mt-1 text-xs text-zinc-600">
              Define the problem thoroughly. The richer the constraints, the sharper the disciplinary lenses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 shadow-2xs">
              {autosaveStatus === 'saving' ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Autosaving draft...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Draft saved locally</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={handleReset}
              title="Reset draft"
              className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Inspiration Pills */}
        {!initialProblem && (
          <div className="mt-6 rounded-xl border border-zinc-200/80 bg-white p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-600">
                Need a starting spark? Load a realistic template:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFillInspiration('energy')}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-colors"
              >
                &bull; Thermal Storage for Crafts
              </button>
              <button
                type="button"
                onClick={() => handleFillInspiration('civic')}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-colors"
              >
                &bull; Algorithmic Municipal Permits
              </button>
              <button
                type="button"
                onClick={() => handleFillInspiration('health')}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-colors"
              >
                &bull; Delta Monsoon Cold-Chain
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* 1. Title */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
              1. Problem Title <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-zinc-500 mb-2">
              A precise, high-clarity title summarizing the tension.
            </p>
            <input
              id="problem-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Decentralized Solar Desalination for Isolated Coastal Communities"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
            />
            {errors.title && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.title}</p>}
          </div>

          {/* 2. Domain (Supports Custom Input!) */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
              2. Domain & Field <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-zinc-500 mb-2">
              Type <em>any</em> domain (you are never restricted to pre-set academic categories).
            </p>
            <input
              id="problem-domain-input"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. Marine Ecology & Water Security, Urban Heat Mitigation, Computational Linguistics"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
            />
            {errors.domain && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.domain}</p>}
          </div>

          {/* 3. Description */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
              3. Core Problem Description <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-zinc-500 mb-2">
              What is happening right now, why is it failing, and what is at stake?
            </p>
            <textarea
              id="problem-description-input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the real-world friction and the breakdown of existing approaches..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.description}</p>
            )}
          </div>

          {/* 4. Context & People Affected */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                4. Context & Environment <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-zinc-500 mb-2">Where does this take place physically/institutionally?</p>
              <textarea
                rows={3}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Physical setting, infrastructure status, historical backdrop..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
              />
              {errors.context && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.context}</p>}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                5. People Affected <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-zinc-500 mb-2">Who bears the burden or daily friction?</p>
              <textarea
                rows={3}
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(e.target.value)}
                placeholder="Residents, frontline workers, vulnerable patients, children..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
              />
              {errors.peopleAffected && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.peopleAffected}</p>
              )}
            </div>
          </div>

          {/* 6. What Better Looks Like */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
              6. What Better Looks Like (Desired Outcome) <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-zinc-500 mb-2">
              What does success feel and look like if this problem were effectively addressed?
            </p>
            <input
              type="text"
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              placeholder="e.g. Reliable 50L/person/day freshwater with zero diesel emissions and zero toxic brine plumes."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
            />
            {errors.desiredOutcome && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.desiredOutcome}</p>
            )}
          </div>

          {/* 7. Constraints & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                7. Hard Constraints <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-zinc-500 mb-2">Budget, physical limits, legal or environmental bans.</p>
              <textarea
                rows={3}
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="No access to high-voltage electricity; strict municipal heritage codes; strict budget ceilings..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
              />
              {errors.constraints && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.constraints}</p>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
                8. Primary Risks <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-zinc-500 mb-2">What could go wrong or cause unintended consequences?</p>
              <textarea
                rows={3}
                value={risks}
                onChange={(e) => setRisks(e.target.value)}
                placeholder="Severe tropical storms; toxic chemical bio-accumulation; community governance disputes..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
              />
              {errors.risks && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.risks}</p>}
            </div>
          </div>

          {/* 9. Additional Context (Optional) */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-1">
              9. Additional Context & Prior Attempts (Optional)
            </label>
            <p className="text-[11px] text-zinc-500 mb-2">
              Any background history, past failures, or organizational nuances worth noting.
            </p>
            <textarea
              rows={2}
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Commercial containerized units failed within 14 months due to proprietary pump replacement costs..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Action Row */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate('workspace')}
              className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>

            <button
              id="save-problem-btn"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 transition-colors active:scale-98 disabled:opacity-50"
            >
              <Save className="h-4 w-4 text-amber-300" />
              {isSubmitting ? 'Saving Brief...' : 'Save & View Problem Brief'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
