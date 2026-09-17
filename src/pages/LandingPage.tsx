import React, { useState } from 'react';
import {
  ArrowRight,
  Compass,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  BookOpen,
  Split,
  Eye,
  CheckCircle2,
  Cpu,
  Landmark,
  Scale,
  Users2,
  TreePine,
  Activity,
} from 'lucide-react';
import { AppView } from '../types';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
  onSelectSampleProblem?: (problemId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  // Interactive Lens demonstration state on the hero section
  const [activeHeroLens, setActiveHeroLens] = useState<'engineering' | 'economics' | 'ecology' | 'sociology'>('engineering');

  const heroLenses = {
    engineering: {
      name: 'Computer Science & Engineering',
      icon: Cpu,
      color: 'border-blue-500 text-blue-700 bg-blue-50/70',
      question: 'Where will this architecture experience latency spikes or state concurrency conflicts under peak load?',
      notice: 'Under-specified error recovery loops and hardware single-points-of-failure.',
    },
    economics: {
      name: 'Economics & Business',
      icon: Scale,
      color: 'border-amber-500 text-amber-800 bg-amber-50/70',
      question: 'Who absorbs the recurring depreciation cost once grant funding terminates after year two?',
      notice: 'Unviable unit economics and unaddressed principal-agent incentive misalignment.',
    },
    ecology: {
      name: 'Environmental Science',
      icon: TreePine,
      color: 'border-emerald-500 text-emerald-800 bg-emerald-50/70',
      question: 'What is the full lifecycle material footprint and downstream bio-accumulation in local biomes?',
      notice: 'Neglected toxic byproduct leaching and secondary energy consumption during extraction.',
    },
    sociology: {
      name: 'Sociology & Anthropology',
      icon: Users2,
      color: 'border-indigo-500 text-indigo-800 bg-indigo-50/70',
      question: 'Whose cultural dignity and lived power dynamics does this solution silently disrupt or empower?',
      notice: 'Technocratic paternalism and lack of sovereign local community decision rights.',
    },
  };

  const processSteps = [
    {
      step: '01',
      title: 'Name the problem',
      desc: 'Bring any genuine real-world tension—from municipal groundwater rights to pediatric diagnostic networks. No canned assignments.',
      icon: Landmark,
    },
    {
      step: '02',
      title: 'Write one solution',
      desc: 'Draft your proposed approach, implementation plan, and trade-offs. This single solution remains constant throughout the exploration.',
      icon: Layers,
    },
    {
      step: '03',
      title: 'Turn the lens',
      desc: 'Select from 40+ disciplines across science, humanities, engineering, and design to interrogate your proposal.',
      icon: Compass,
    },
    {
      step: '04',
      title: 'Compare perspectives',
      desc: 'Discover where disciplines fiercely agree, where they clash on priorities, and where your blind spots hide.',
      icon: Split,
    },
    {
      step: '05',
      title: 'Reflect',
      desc: 'Review qualitative signals in your problem-solving profile that chart how you think without reductive labels or career boxes.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="w-full bg-[#FAF9F6]">
      {/* Editorial Announcement Banner */}
      <div className="border-b border-zinc-200/80 bg-zinc-900 px-4 py-2.5 text-center text-xs font-medium text-zinc-300">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="text-white font-semibold">Frontend-First Studio:</span> Explore interdisciplinary inquiry across 40+ disciplines with real-world problems.
        </span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-800 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              An Interdisciplinary Thinking Instrument
            </div>

            <h1 className="mt-8 font-serif text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl leading-[1.08]">
              One Problem. <br />
              <span className="italic font-normal text-zinc-700">Many Ways to See It.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-zinc-600 font-sans leading-relaxed max-w-2xl mx-auto">
              BranchLens lets you write one solution, then explore what different disciplines notice,
              question, and challenge.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                id="hero-start-thinking-btn"
                onClick={() => onNavigate('new-analysis')}
                className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-zinc-900 px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-zinc-800 active:scale-98"
              >
                Start Thinking
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                id="hero-explore-problems-btn"
                onClick={() => onNavigate('problem-library')}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors"
              >
                <BookOpen className="h-4 w-4 text-zinc-500" />
                Explore Problems
              </button>
            </div>

            <p className="mt-4 text-xs text-zinc-500 font-mono">
              Bring ANY real-world problem &bull; 40+ Disciplinary Lenses &bull; Zero career labels
            </p>
          </div>

          {/* Interactive Multi-Perspective Showcase */}
          <div className="mt-16 mx-auto max-w-5xl rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-sm">
            <div className="border-b border-zinc-100 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-600">
                    Live Concept Demonstration
                  </span>
                  <h3 className="font-serif text-xl font-bold text-zinc-900 mt-1">
                    The Problem Remains Constant. The Inquiries Diverge.
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> One Shared Solution Below
                </div>
              </div>

              {/* Sample Shared Solution Box */}
              <div className="mt-4 rounded-xl bg-zinc-50/90 p-4 border border-zinc-200/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                  <span className="rounded-md bg-zinc-200 px-2 py-0.5 font-mono text-[11px] text-zinc-800">
                    SHARED SOLUTION
                  </span>
                  Passively Evaporated Multi-Stage Solar Distillers with Halophyte Wetland Sinks
                </div>
                <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                  "Deploy capillary-action thermal solar stills for island drinking water, channeling dense brine
                  residue into constructed mangrove bio-filtration wetlands rather than dumping salt directly into coastal reefs."
                </p>
              </div>
            </div>

            {/* Lens Switcher Tabs */}
            <div className="mt-6">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-3">
                Click a perspective lens to rotate the prism:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['engineering', 'economics', 'ecology', 'sociology'] as const).map((key) => {
                  const item = heroLenses[key];
                  const Icon = item.icon;
                  const isActive = activeHeroLens === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveHeroLens(key)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-amber-300' : 'text-zinc-500'}`} />
                        <span className="text-xs font-bold truncate">{item.name.split('&')[0]}</span>
                      </div>
                      <span className={`text-[11px] leading-tight ${isActive ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {isActive ? 'Active Lens View' : 'Switch Lens'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Lens Insight Card */}
              <div className="mt-5 rounded-xl border border-zinc-200 bg-[#FAF9F6] p-5 transition-all">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-600">
                    What {heroLenses[activeHeroLens].name} Asks:
                  </span>
                </div>
                <blockquote className="mt-2 font-serif text-lg text-zinc-900 font-medium italic leading-snug">
                  "{heroLenses[activeHeroLens].question}"
                </blockquote>
                <div className="mt-4 pt-3 border-t border-zinc-200/80 flex items-center gap-2 text-xs text-zinc-600">
                  <Eye className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    <strong className="text-zinc-900">What it immediately notices:</strong>{' '}
                    {heroLenses[activeHeroLens].notice}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 5-Step Process Section */}
      <section className="border-t border-zinc-200/80 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
              The Architecture of Inquiry
            </span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
              How BranchLens Works
            </h2>
            <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
              Real problem-solving is not finding one right answer. It is discovering the invisible
              assumptions that different disciplines question.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-6">
            {processSteps.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.step}
                  className="group relative rounded-2xl border border-zinc-200/90 bg-[#FAF9F6] p-5 transition-all hover:border-zinc-400 hover:shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-zinc-600">{p.step}</span>
                    <Icon className="h-4 w-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-zinc-900">{p.title}</h3>
                  <p className="mt-2 text-xs text-zinc-600 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* "A profile, not a label" Reflective Philosophy Section */}
      <section className="border-t border-zinc-200/80 bg-[#FAF9F6] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-800">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Cognitive Growth & Self-Awareness
              </div>
              <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
                A profile, <br />
                <span className="italic text-zinc-700">not a label.</span>
              </h2>
              <p className="mt-6 text-sm sm:text-base text-zinc-600 leading-relaxed">
                Most educational tools try to categorize you: introvert vs. extrovert, coder vs. marketer,
                STEM vs. arts. BranchLens rejects these reductive boxes.
              </p>
              <p className="mt-4 text-sm sm:text-base text-zinc-600 leading-relaxed">
                Instead, our <strong>Problem-Solving Profile</strong> captures the qualitative signals of how
                you actually approached the problems you explored: whether you intuitively traced second-order
                ecological consequences, probed legal liability thresholds, or designed around human dignity.
              </p>

              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 leading-relaxed">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                  Our Grounded Pledge:
                </div>
                <p className="mt-1 text-amber-800">
                  This profile describes your approach to the problems you explored. It is not a prediction
                  of your career, major, intelligence, personality, or future performance.
                </p>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => onNavigate('profile')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-zinc-900 underline underline-offset-4 hover:text-zinc-600"
                >
                  Inspect the Profile Dimensions &rarr;
                </button>
              </div>
            </div>

            {/* Profile Graphic Simulation */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div>
                    <h4 className="font-serif text-base font-bold text-zinc-900">
                      Problem-Solving Dimensions
                    </h4>
                    <p className="text-xs text-zinc-500">Qualitative signals from recent inquiries</p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-mono font-medium text-zinc-700">
                    Reflective Model
                  </span>
                </div>

                <div className="mt-5 space-y-3.5">
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">Systems Thinking</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        Strong signal
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-600">
                      Proactively accounts for second-order feedback loops and downstream ecological trade-offs.
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">Trade-off Awareness</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        Strong signal
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-600">
                      Weighed footprint and speed against long-term maintenance and community governance.
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">User / People Focus</span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                        Developing strength
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-600">
                      Consistently centers affected vulnerable populations and operator dignity.
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">Business Awareness</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                        Worth exploring
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-600">
                      Opportunity to analyze long-term capital replacement costs and operating unit margins.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="border-t border-zinc-200/80 bg-zinc-900 py-16 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Bring one problem. Write one solution. <br />
            <span className="italic text-amber-300 font-normal">See it through many perspectives.</span>
          </h2>
          <p className="mt-4 text-sm text-zinc-400 max-w-xl mx-auto">
            Ready to test how an economist, a sociologist, a cyberneticist, and an environmental scientist
            see your idea?
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('new-analysis')}
              className="w-full sm:w-auto rounded-xl bg-amber-400 px-8 py-3.5 text-sm font-semibold text-zinc-950 shadow-md transition-all hover:bg-amber-300 active:scale-98"
            >
              Start Your First Analysis
            </button>
            <button
              onClick={() => onNavigate('discipline-explorer')}
              className="w-full sm:w-auto rounded-xl border border-zinc-700 px-6 py-3.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Browse 40+ Disciplines
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
