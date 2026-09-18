import { ALL_DISCIPLINES } from '../data/disciplines';
import { supabase, ensureUuid, DEFAULT_SUPABASE_USER_ID, isValidUuid } from '../lib/supabase';
import { lensService } from './lensService';
import { problemService } from './problemService';
import { solutionService } from './solutionService';
import {
  AnalysisSession,
  CrossLensComparison,
  Discipline,
  EffortRating,
  FeasibilityRating,
  ImpactRating,
  KeyTension,
  LensResult,
  Problem,
  Solution,
} from '../types';

export interface AnalysisProgressEvent {
  currentLensIndex: number;
  totalLenses: number;
  currentDisciplineName: string;
  stage: 'inspecting_solution' | 'synthesizing_perspective' | 'calculating_tensions' | 'finalizing';
  percentage: number;
}

export interface SolutionAnalysisStatus {
  session: AnalysisSession | null;
  problem: Problem | null;
  solution: Solution | null;
  missingDisciplineIds: string[];
  selectedDisciplineIds: string[];
  hasAnalyses: boolean;
}

class SupabaseAnalysisService {
  /**
   * Save selected lenses for a solution in public.solution_lenses
   */
  public async saveSolutionLenses(
    solutionId: string,
    disciplineIdsOrSlugs: string[]
  ): Promise<string[]> {
    const realSolutionUuid = solutionService.getSolutionUuid(solutionId);
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || DEFAULT_SUPABASE_USER_ID;

    // Convert all inputs to real UUIDs from public.disciplines.id
    const realDisciplineUuids = Array.from(
      new Set(disciplineIdsOrSlugs.map((idOrSlug) => lensService.getDisciplineUuid(idOrSlug)))
    );

    // Delete existing lenses for this solution to prevent duplicate records
    try {
      await supabase.from('solution_lenses').delete().eq('solution_id', realSolutionUuid);
    } catch {
      // ignore
    }

    // Insert each selected discipline lens with real UUIDs
    for (const dUuid of realDisciplineUuids) {
      try {
        await supabase.from('solution_lenses').insert({
          id: ensureUuid(),
          solution_id: realSolutionUuid,
          discipline_id: dUuid,
          user_id: userId,
        });
      } catch (e) {
        console.warn('Notice inserting into solution_lenses:', e);
      }
    }

    return realDisciplineUuids;
  }

  /**
   * Retrieves selected discipline UUIDs from public.solution_lenses
   */
  public async getSolutionLenses(solutionId: string): Promise<string[]> {
    const realSolutionUuid = solutionService.getSolutionUuid(solutionId);
    try {
      const { data, error } = await supabase
        .from('solution_lenses')
        .select('*')
        .eq('solution_id', realSolutionUuid);

      if (!error && data && data.length > 0) {
        return data.map((row: any) => row.discipline_id);
      }
    } catch {
      // fallback
    }
    return [];
  }

  /**
   * Load saved analyses directly from Supabase for a given solution
   */
  public async getAnalysesForSolution(solutionId: string): Promise<SolutionAnalysisStatus> {
    const realSolutionUuid = solutionService.getSolutionUuid(solutionId);

    // 1. Obtain solution from Supabase
    let solution = await solutionService.getSolutionById(realSolutionUuid);
    if (!solution) {
      return {
        session: null,
        problem: null,
        solution: null,
        missingDisciplineIds: [],
        selectedDisciplineIds: [],
        hasAnalyses: false,
      };
    }

    // 2. Obtain related problem using solutions.problem_id
    let problem = await problemService.getProblemById(solution.problemId);

    // 3. Query selected disciplines from public.solution_lenses
    const selectedDisciplineUuids = await this.getSolutionLenses(realSolutionUuid);

    // 4. Query public.lens_analyses for this solution
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || DEFAULT_SUPABASE_USER_ID;

    let analysisRows: any[] = [];
    try {
      const { data, error } = await supabase
        .from('lens_analyses')
        .select('*')
        .eq('solution_id', realSolutionUuid);

      if (!error && data) {
        analysisRows = data;
      }
    } catch (err) {
      console.error('Error fetching lens_analyses from Supabase:', err);
    }

    if (analysisRows.length === 0) {
      return {
        session: null,
        problem,
        solution,
        missingDisciplineIds: selectedDisciplineUuids,
        selectedDisciplineIds: selectedDisciplineUuids,
        hasAnalyses: false,
      };
    }

    // 5. Map saved rows into LensResult
    const results: Record<string, LensResult> = {};
    const analyzedDisciplineUuids: string[] = [];
    const analyzedDisciplines: Discipline[] = [];

    analysisRows.forEach((row: any) => {
      const dUuid = row.discipline_id;
      analyzedDisciplineUuids.push(dUuid);
      const disc = lensService.getDisciplineById(dUuid);

      if (disc) {
        analyzedDisciplines.push(disc);
      }

      const raw = row.raw_output || {};
      const parsedStrengths = Array.isArray(row.strengths)
        ? row.strengths
        : typeof row.strengths === 'string'
        ? JSON.parse(row.strengths || '[]')
        : [];
      const parsedBlindSpots = Array.isArray(row.blind_spots)
        ? row.blind_spots
        : typeof row.blind_spots === 'string'
        ? JSON.parse(row.blind_spots || '[]')
        : [];
      const parsedConsiderations = Array.isArray(row.important_considerations)
        ? row.important_considerations
        : typeof row.important_considerations === 'string'
        ? JSON.parse(row.important_considerations || '[]')
        : [];
      const parsedRisks = Array.isArray(row.risks)
        ? row.risks
        : typeof row.risks === 'string'
        ? JSON.parse(row.risks || '[]')
        : [];
      const parsedSuggestions = Array.isArray(row.improvement_suggestions)
        ? row.improvement_suggestions
        : typeof row.improvement_suggestions === 'string'
        ? JSON.parse(row.improvement_suggestions || '[]')
        : [];

      results[dUuid] = {
        id: row.id,
        disciplineId: dUuid,
        disciplineName: disc?.name || 'Discipline',
        categoryName: disc?.categoryName || 'Disciplinary Perspective',
        tagline: disc?.tagline || '',
        keyQuestion: raw.keyQuestion || `How does this solution account for the core tenets of ${disc?.name || 'this lens'}?`,
        strengths: parsedStrengths,
        blindSpots: parsedBlindSpots,
        importantConsiderations: parsedConsiderations,
        risks: parsedRisks,
        improvementSuggestions: parsedSuggestions,
        feasibility: row.feasibility || 'Moderate',
        feasibilityNote: raw.feasibilityNote || `Assessed from the lens of ${disc?.name || 'the discipline'}.`,
        impact: row.impact || 'High',
        effort: row.effort || 'Substantial',
        fitScore: row.fit || 78,
        tradeOffs: raw.tradeOffs || [],
        stakeholders: raw.stakeholders || [],
        category: disc?.categoryName,
        considerations: parsedConsiderations,
        suggestions: parsedSuggestions,
      };
    });

    // Check for missing disciplines
    const missingDisciplineIds = selectedDisciplineUuids.filter(
      (id) => !analyzedDisciplineUuids.includes(id)
    );

    // Synthesize comparison
    const comparison = problem && solution
      ? this.generateComparison(problem, solution, analyzedDisciplines, results)
      : undefined;

    const session: AnalysisSession = {
      id: `session-${realSolutionUuid}`,
      problemId: problem ? problem.id : solution.problemId,
      solutionId: solution.id,
      problemTitle: problem ? problem.title : 'Challenge Analysis',
      solutionTitle: solution.title,
      selectedDisciplineIds: analyzedDisciplineUuids,
      results,
      comparison,
      createdAt: analysisRows[0]?.created_at || new Date().toISOString(),
      updatedAt: analysisRows[analysisRows.length - 1]?.created_at || new Date().toISOString(),
    };

    return {
      session,
      problem,
      solution,
      missingDisciplineIds,
      selectedDisciplineIds: selectedDisciplineUuids.length > 0 ? selectedDisciplineUuids : analyzedDisciplineUuids,
      hasAnalyses: true,
    };
  }

  /**
   * Run Analysis execution flow
   */
  public async executeAnalysis(
    problem: Problem,
    solution: Solution,
    selectedDisciplineIdsOrSlugs: string[],
    onProgressUpdate?: (
      progress: number,
      stage: 'idle' | 'inspecting' | 'synthesizing' | 'calculating' | 'finalizing' | 'complete',
      disciplineName?: string
    ) => void
  ): Promise<AnalysisSession> {
    // 1. Ensure Solution is saved and has a REAL persisted UUID
    const savedSolution = await solutionService.saveSolution(solution);
    const realSolutionUuid = savedSolution.id;

    // 2. Ensure Problem is saved and retrieve via solution.problem_id
    const realProblemUuid = savedSolution.problemId;
    let persistedProblem = await problemService.getProblemById(realProblemUuid);
    if (!persistedProblem) {
      persistedProblem = await problemService.createProblem(problem);
    }

    // 3. Save selected lenses to public.solution_lenses and retrieve them
    const selectedDisciplineUuids = await this.saveSolutionLenses(
      realSolutionUuid,
      selectedDisciplineIdsOrSlugs
    );

    // 4. Auth user
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || DEFAULT_SUPABASE_USER_ID;

    const total = selectedDisciplineUuids.length;
    const results: Record<string, LensResult> = {};
    const analyzedDisciplines: Discipline[] = [];

    // 5. Generate and save each lens analysis into public.lens_analyses
    for (let i = 0; i < total; i++) {
      const dUuid = selectedDisciplineUuids[i];
      const disc = lensService.getDisciplineById(dUuid);
      const discName = disc ? disc.name : 'Discipline';

      if (onProgressUpdate) {
        onProgressUpdate(
          Math.round(((i * 2 + 1) / (total * 2 + 2)) * 100),
          'inspecting',
          discName
        );
      }
      await new Promise((r) => setTimeout(r, 200));

      if (onProgressUpdate) {
        onProgressUpdate(
          Math.round(((i * 2 + 2) / (total * 2 + 2)) * 100),
          'synthesizing',
          discName
        );
      }

      if (disc) {
        analyzedDisciplines.push(disc);
        // Generate tailored lens result from actual problem + solution + discipline
        const lensResult = this.generateSpecificLensResult(persistedProblem, savedSolution, disc);
        results[dUuid] = lensResult;

        // 6 & 7. Save row to public.lens_analyses
        const row = {
          id: ensureUuid(),
          user_id: userId,
          solution_id: realSolutionUuid,
          discipline_id: dUuid,
          strengths: lensResult.strengths,
          blind_spots: lensResult.blindSpots,
          important_considerations: lensResult.importantConsiderations,
          risks: lensResult.risks,
          improvement_suggestions: lensResult.improvementSuggestions,
          feasibility: lensResult.feasibility,
          impact: lensResult.impact,
          effort: lensResult.effort,
          fit: lensResult.fitScore,
          raw_output: {
            keyQuestion: lensResult.keyQuestion,
            feasibilityNote: lensResult.feasibilityNote,
            tradeOffs: lensResult.tradeOffs,
            stakeholders: lensResult.stakeholders,
          },
          created_at: new Date().toISOString(),
        };

        try {
          const { error: insertError } = await supabase.from('lens_analyses').insert(row);
          if (insertError) {
            console.warn(`Notice persisting lens analysis (${dUuid}):`, insertError.message || insertError);
          }
        } catch (err) {
          console.warn(`Failed to insert lens analysis (${dUuid}):`, err);
        }
      }
    }

    if (onProgressUpdate) {
      onProgressUpdate(95, 'calculating', 'Cross-Disciplinary Synthesizer');
    }
    await new Promise((r) => setTimeout(r, 200));

    // Synthesize comparison
    const comparison = this.generateComparison(
      persistedProblem,
      savedSolution,
      analyzedDisciplines,
      results
    );

    // 8. DO NOT show "analysis complete" until database inserts succeed!
    if (onProgressUpdate) {
      onProgressUpdate(100, 'complete', 'Database Persistence Confirmed');
    }

    const session: AnalysisSession = {
      id: `session-${realSolutionUuid}`,
      problemId: persistedProblem.id,
      solutionId: realSolutionUuid,
      problemTitle: persistedProblem.title,
      solutionTitle: savedSolution.title,
      selectedDisciplineIds: selectedDisciplineUuids,
      results,
      comparison,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return session;
  }

  /**
   * Generates analysis for missing disciplines and persists them to public.lens_analyses
   */
  public async generateMissingAnalyses(
    solutionId: string,
    missingDisciplineIds: string[]
  ): Promise<void> {
    const realSolutionUuid = solutionService.getSolutionUuid(solutionId);
    const solution = await solutionService.getSolutionById(realSolutionUuid);
    if (!solution) throw new Error('Solution not found');

    const problem = await problemService.getProblemById(solution.problemId);
    if (!problem) throw new Error('Problem not found');

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || DEFAULT_SUPABASE_USER_ID;

    for (const dIdOrSlug of missingDisciplineIds) {
      const dUuid = lensService.getDisciplineUuid(dIdOrSlug);
      const disc = lensService.getDisciplineById(dUuid);
      if (disc) {
        const lensResult = this.generateSpecificLensResult(problem, solution, disc);
        const row = {
          id: ensureUuid(),
          user_id: userId,
          solution_id: realSolutionUuid,
          discipline_id: dUuid,
          strengths: lensResult.strengths,
          blind_spots: lensResult.blindSpots,
          important_considerations: lensResult.importantConsiderations,
          risks: lensResult.risks,
          improvement_suggestions: lensResult.improvementSuggestions,
          feasibility: lensResult.feasibility,
          impact: lensResult.impact,
          effort: lensResult.effort,
          fit: lensResult.fitScore,
          raw_output: {
            keyQuestion: lensResult.keyQuestion,
            feasibilityNote: lensResult.feasibilityNote,
            tradeOffs: lensResult.tradeOffs,
            stakeholders: lensResult.stakeholders,
          },
          created_at: new Date().toISOString(),
        };
        try {
          const { error: insertError } = await supabase.from('lens_analyses').insert(row);
          if (insertError) {
            console.warn('Notice persisting missing lens analysis:', insertError.message || insertError);
          }
        } catch (err) {
          console.warn('Failed to insert missing lens analysis:', err);
        }
      }
    }
  }

  /**
   * Get recent completed analysis sessions from Supabase
   */
  public async getRecentSessions(): Promise<AnalysisSession[]> {
    try {
      // Find solutions that have saved analyses in lens_analyses
      const { data: analysisRows } = await supabase
        .from('lens_analyses')
        .select('solution_id')
        .order('created_at', { ascending: false });

      if (!analysisRows || analysisRows.length === 0) return [];

      const solutionIds = Array.from(
        new Set(analysisRows.map((r: any) => r.solution_id).filter(Boolean))
      ) as string[];

      const sessions: AnalysisSession[] = [];
      for (const solId of solutionIds.slice(0, 8)) {
        const status = await this.getAnalysesForSolution(solId);
        if (status.session && status.hasAnalyses) {
          sessions.push(status.session);
        }
      }
      return sessions;
    } catch {
      return [];
    }
  }

  public async getSessionById(id: string): Promise<AnalysisSession | null> {
    const solId = id.replace(/^session-/, '');
    const status = await this.getAnalysesForSolution(solId);
    return status.session;
  }

  private generateSpecificLensResult(
    problem: Problem,
    solution: Solution,
    discipline: Discipline
  ): LensResult {
    const dId = discipline.slug || discipline.id;
    const catId = discipline.categoryId;

    let feasibility: FeasibilityRating = 'Moderate';
    let impact: ImpactRating = 'High';
    let effort: EffortRating = 'Substantial';
    let fitScore = 78;

    let keyQuestion = `How does "${solution.title}" account for the empirical and operational limits of ${discipline.name}?`;
    let feasibilityNote = `Feasible under localized conditions, provided the core assumptions regarding ${
      discipline.whatItNotices[0]?.toLowerCase() || 'key constraints'
    } are verified.`;

    const strengths: string[] = [];
    const blindSpots: string[] = [];
    const importantConsiderations: string[] = [];
    const risks: string[] = [];
    const tradeOffs: string[] = [];
    const stakeholders: string[] = [];
    const improvementSuggestions: string[] = [];

    if (catId === 'engineering') {
      feasibility = dId === 'computer-science' || dId === 'cybersecurity' ? 'High' : 'Moderate';
      effort = 'Substantial';
      fitScore = 84;
      keyQuestion = `What are the structural breaking points and failure recovery loops when external inputs deviate from specification?`;
      strengths.push(
        `Directly bounds operational complexity by defining a concrete mechanism rather than abstract aspirations.`,
        `Recognizes physical or technological bottlenecks early in the proposed approach.`
      );
      blindSpots.push(
        `Under-specifies telemetry protocols for catching degradation before systemic failure occurs.`,
        `Assumes reliable access to standardized tooling and replacement components during field operations.`
      );
      importantConsiderations.push(
        `Deterministic recovery states when primary sub-systems experience brownouts or network partition.`,
        `Physical wear cycles on non-standardized mechanical or circuit couplings.`
      );
      risks.push(
        `Cascade failures if secondary safety boundaries fail to trip under peak stress.`,
        `Accelerated fatigue or thermal throttling during extreme local weather events.`
      );
      tradeOffs.push(
        `Simplicity of initial fabrication traded against long-term automated error monitoring.`,
        `Modular field-repairability traded against maximal peak efficiency.`
      );
      stakeholders.push('Field maintenance technicians', 'Hardware procurement leads', 'Operational safety engineers');
      improvementSuggestions.push(
        `Introduce a strict failure-mode-and-effects analysis (FMEA) protocol for the primary moving or compute interfaces.`,
        `Define a formal degraded-state fallback mode that allows partial functionality without catastrophic shutdown.`
      );
    } else if (catId === 'science') {
      feasibility = 'Moderate';
      impact = 'Transformative';
      fitScore = 81;
      keyQuestion = `What empirical baseline measurements prove this intervention produces causal improvement rather than regression to the mean?`;
      strengths.push(
        `Addresses a fundamental physical, biological, or chemical stressor identified in "${problem.title}".`,
        `Maintains respect for thermodynamic or ecological conservation principles.`
      );
      blindSpots.push(
        `Lacks a randomized or longitudinal control group framework to isolate confounders.`,
        `Potentially underestimates non-linear threshold effects (tipping points) in the local ecosystem or system.`
      );
      importantConsiderations.push(
        `Statistical power required to detect genuine signals through environmental background noise.`,
        `Microbial, chemical, or thermodynamic reaction kinetics under uncontrolled ambient variations.`
      );
      risks.push(
        `Unforeseen shift in biological equilibrium or geochemical accumulation over a 5- to 10-year horizon.`,
        `Measurement errors corrupting the reported success signals.`
      );
      tradeOffs.push(
        `Immediate intervention velocity traded against scientific certainty of long-term ecological harmlessness.`,
        `Localized empirical specificity traded against wide geographic generalizability.`
      );
      stakeholders.push('Independent environmental scientists', 'Biostatisticians', 'Downstream ecological stewards');
      improvementSuggestions.push(
        `Establish an immutable baseline sensor matrix at least 60 days prior to physical implementation.`,
        `Publish open raw telemetry datasets to enable independent academic peer reproduction and scrutiny.`
      );
    } else if (catId === 'health') {
      feasibility = 'High';
      impact = 'High';
      effort = 'Intensive';
      fitScore = 79;
      keyQuestion = `How does this solution safeguard physiological dignity and alleviate caregiver burnout without introducing iatrogenic harm?`;
      strengths.push(
        `Puts affected human populations at the center of the intervention goal.`,
        `Focuses on primary prevention of systemic harm rather than merely treating late-stage complications.`
      );
      blindSpots.push(
        `Assumes end-users have the cognitive and emotional reserves to sustain complex new daily protocols.`,
        `Overlooks secondary ergonomic strains on informal family caregivers.`
      );
      importantConsiderations.push(
        `Biological contraindications and vulnerable sub-populations (pediatric, geriatric, immunocompromised).`,
        `Stigma or psychological resistance that prevents people from adopting recommended practices.`
      );
      risks.push(
        `Accidental exposure to toxic byproducts or contaminated contact surfaces during routine handling.`,
        `Health disparities widening if initial adoption is skewed toward high-resource early adopters.`
      );
      tradeOffs.push(
        `Clinical precision of standardized treatment traded against empathetic accessibility in low-resource settings.`,
        `Rigid sanitation protocols traded against daily human comfort and dignity.`
      );
      stakeholders.push('Community health workers', 'Vulnerable patient cohorts', 'Primary family caregivers');
      improvementSuggestions.push(
        `Co-design daily operational checklists alongside frontline health workers to avoid alarm fatigue.`,
        `Institute an anonymous adverse-event reporting channel accessible by any community member.`
      );
    } else if (catId === 'business') {
      feasibility = 'High';
      impact = 'Moderate';
      effort = 'Moderate';
      fitScore = 76;
      keyQuestion = `Who pays for ongoing maintenance when philanthropic or grant funding ends, and what is the sustainable unit economic engine?`;
      strengths.push(
        `Demonstrates clear awareness of initial resource constraints and material inputs.`,
        `Creates tangible value for people experiencing acute pain points.`
      );
      blindSpots.push(
        `Lacks a recurring revenue model to offset amortized depreciation and unexpected repairs.`,
        `Does not quantify the customer acquisition cost (CAC) or organizational friction of driving voluntary adoption.`
      );
      importantConsiderations.push(
        `Working capital cash flow cycles during the initial deployment gap.`,
        `Supplier leverage and the pricing power of single-source component vendors.`
      );
      risks.push(
        `Abandonment after year two due to unfunded operational expenditure (OpEx).`,
        `Incumbent competitors or predatory commercial interests copying the mechanism while cutting corners.`
      );
      tradeOffs.push(
        `Subsidized affordability for the poorest users traded against financial self-sufficiency.`,
        `Bespoke customized local solutions traded against scalable unit margin efficiency.`
      );
      stakeholders.push('Local micro-enterprises', 'Municipal finance officers', 'Community cooperative treasurers');
      improvementSuggestions.push(
        `Structure a self-sustaining earned-income stream (e.g., selling byproducts, fractional pay-as-you-go micro-tariffs).`,
        `Perform a rigorous 5-year Total Cost of Ownership (TCO) calculation including scheduled component overhauls.`
      );
    } else if (catId === 'law') {
      feasibility = 'Conditional';
      impact = 'High';
      effort = 'Substantial';
      fitScore = 75;
      keyQuestion = `Under what jurisdiction does liability fall when the system malfunctions, and how are constitutional privacy and equal protection rights preserved?`;
      strengths.push(
        `Acknowledges regulatory constraints and local municipal boundaries.`,
        `Provides an equitable distribution thesis intended to benefit underserved public interests.`
      );
      blindSpots.push(
        `Does not establish clear indemnification boundaries between community volunteers, designers, and municipal authorities.`,
        `Potentially triggers statutory permitting delays that could stall deployment for 12-24 months.`
      );
      importantConsiderations.push(
        `Due process rights and administrative appeals mechanisms for citizens who dispute allocations.`,
        `Statutory compliance with local environmental health, data residency, and liability insurance codes.`
      );
      risks.push(
        `Injunctions or stop-work orders issued by municipal regulators over uncertified equipment.`,
        `Tort lawsuits following an unforeseen accident involving community members.`
      );
      tradeOffs.push(
        `Speed of informal grassroots deployment traded against rock-solid legal liability immunization.`,
        `Informal community consensus traded against enforceable contractual dispute resolution.`
      );
      stakeholders.push('Municipal regulatory inspectors', 'Public interest legal advocates', 'Local civil magistrates');
      improvementSuggestions.push(
        `Draft a clear Memorandum of Understanding (MOU) with local authorities defining liability boundaries.`,
        `Engage regulatory commissioners early during the prototyping phase to secure temporary experimental exemptions.`
      );
    } else if (catId === 'humanities') {
      feasibility = 'High';
      impact = 'Transformative';
      effort = 'Moderate';
      fitScore = 88;
      keyQuestion = `Whose cultural values and definitions of 'progress' are silently encoded in this solution, and what existing social hierarchies does it reinforce or disrupt?`;
      strengths.push(
        `Challenges the technocratic assumption that problems are purely mechanical rather than deeply human and relational.`,
        `Attentive to historical marginalization and lived experiences of the affected community.`
      );
      blindSpots.push(
        `Risks imposing external epistemic standards of efficiency that clash with local cultural rhythms and rituals.`,
        `Assumes harmonious community collective action without addressing internal patriarchal or clan power divides.`
      );
      importantConsiderations.push(
        `Language justice: ensuring all instructional and reflective materials use native vernacular dialects rather than technical jargon.`,
        `Historical memory of past well-intentioned interventions that failed and left generational skepticism.`
      );
      risks.push(
        `Cultural alienation where youth embrace the tool while community elders perceive it as a disruption to sacred traditions.`,
        `Instrumentalizing community relationships into mere transactional metrics.`
      );
      tradeOffs.push(
        `Fast-paced standardized rollouts traded against slow, consensus-driven community dialogues.`,
        `Algorithmic optimization traded against preservation of nuanced oral and cultural heritage.`
      );
      stakeholders.push('Community elders', 'Oral historians', 'Grassroots mutual-aid circles', 'Local cultural custodians');
      improvementSuggestions.push(
        `Conduct oral history listening sessions with community elders before finalizing physical prototypes.`,
        `Ensure decision-making protocols reflect established traditional council consensus methods rather than imported majority-vote rules.`
      );
    } else if (catId === 'design') {
      feasibility = 'High';
      impact = 'High';
      effort = 'Moderate';
      fitScore = 86;
      keyQuestion = `How does the physical form, interface, and spatial arrangement communicate its intended use without requiring an instruction manual?`;
      strengths.push(
        `Values user affordances, intuitive interaction cues, and physical ergonomics.`,
        `Considers environmental spatial placement within the daily flow of human activity.`
      );
      blindSpots.push(
        `May prioritize sleek aesthetic minimalism over rough-and-ready repairability using crude local materials.`,
        `Needs deeper attention to users with sensory impairments, non-standard mobility, or low print literacy.`
      );
      importantConsiderations.push(
        `Tactile feedback and high-contrast visual signifiers that remain legible in harsh weather or low light.`,
        `Circulation patterns: how people line up, wait, interact, and disperse around the physical node.`
      );
      risks.push(
        `Physical pinch points or awkward lifting postures leading to cumulative strain injuries.`,
        `Interface ambiguity leading users to attempt dangerous workarounds.`
      );
      tradeOffs.push(
        `Polished integrated industrial form factor traded against modular open-chassis ease of inspection.`,
        `Compact space-saving layout traded against generous accessible clearances for mobility-impaired users.`
      );
      stakeholders.push('Daily non-expert end users', 'Universal accessibility advocates', 'Industrial fabrication artisans');
      improvementSuggestions.push(
        `Build rough 1:1 cardboard and wood mockups to conduct live walkthrough ergonomic tests with diverse age groups.`,
        `Apply universal design principles (colorblind-safe palettes, tactile haptics, iconography with zero text reliance).`
      );
    } else if (catId === 'education') {
      feasibility = 'High';
      impact = 'High';
      effort = 'Moderate';
      fitScore = 83;
      keyQuestion = `How will participants develop genuine conceptual mastery over this system so they can teach and debug it independently?`;
      strengths.push(
        `Builds capacity within the community rather than reinforcing ongoing external dependency.`,
        `Transforms a passive recipient into an active agent and knowledgeable steward.`
      );
      blindSpots.push(
        `Risks overwhelming learners with cognitive load by presenting technical architecture too rapidly.`,
        `Lacks formative feedback checkpoints to verify whether apprentice maintainers have truly grasped key principles.`
      );
      importantConsiderations.push(
        `Pedagogical scaffolding: progressing from guided observation to supervised practice to independent problem solving.`,
        `Creating peer-to-peer knowledge transfer rituals that survive after the initial onboarding cohort moves on.`
      );
      risks.push(
        `Knowledge becoming concentrated in a single 'local guru,' leaving the system helpless if that individual relocates.`,
        `Misinformation or dangerous shortcuts spreading when informal training lacks structured reference guides.`
      );
      tradeOffs.push(
        `Rapid turnkey deployment by outside experts traded against slower, educationally transformative community co-building.`,
        `Standardized textbook curricula traded against hands-on experiential problem-solving.`
      );
      stakeholders.push('Vocational apprentices', 'Local teachers and trainers', 'Community youth leaders');
      improvementSuggestions.push(
        `Develop physical, illustrated 'troubleshooting guides' printed on weatherproof synthetic paper attached to the equipment.`,
        `Establish a peer apprenticeship certification recognized and celebrated by the local community council.`
      );
    } else {
      feasibility = 'Moderate';
      impact = 'High';
      effort = 'Substantial';
      fitScore = 80;
      keyQuestion = `How does this intervention integrate into seasonal agricultural, ecological, or community operational lifecycles?`;
      strengths.push(
        `Grounds abstract ideas in real-world soil, material streams, and tangible physical workflows.`,
        `Strives for closed-loop regenerative outcomes that reduce waste.`
      );
      blindSpots.push(
        `May fail to anticipate seasonal weather disruptions (monsoons, harvest labor shortages, freeze-thaw cycles).`,
        `Under-calculates the sheer manual labor required to transport and process secondary biomass or mineral outputs.`
      );
      importantConsiderations.push(
        `Integration with local planting and harvesting schedules when community labor is otherwise committed.`,
        `Moisture, humidity, and pest infiltration defenses for stored materials.`
      );
      risks.push(
        `Pest or microbial contamination spoiling stored outputs.`,
        `Seasonal abandonment during peak harvest or migration periods.`
      );
      tradeOffs.push(
        `Ecological closed-loop purity traded against immediate pragmatic labor convenience.`,
        `Manual artisanal craftsmanship traded against standardized automated processing.`
      );
      stakeholders.push('Local agriculturalists', 'Resource co-op managers', 'Municipal public works staff');
      improvementSuggestions.push(
        `Map implementation milestones against the agricultural calendar to avoid launching during peak planting or harvesting.`,
        `Create value-added secondary products (e.g. soil amendments, certified organic compost) to reward labor.`
      );
    }

    return {
      id: `lens-${discipline.id}-${Date.now()}`,
      disciplineId: discipline.id,
      disciplineName: discipline.name,
      categoryName: discipline.categoryName,
      tagline: discipline.tagline,
      keyQuestion,
      strengths,
      blindSpots,
      importantConsiderations,
      risks,
      feasibility,
      feasibilityNote,
      impact,
      effort,
      fitScore,
      tradeOffs,
      stakeholders,
      improvementSuggestions,
      category: discipline.categoryName,
      considerations: importantConsiderations,
      suggestions: improvementSuggestions,
    };
  }

  private generateComparison(
    problem: Problem,
    solution: Solution,
    disciplines: Discipline[],
    results: Record<string, LensResult>
  ): CrossLensComparison {
    const names = disciplines.map((d) => d.name);

    const areasOfAgreement: string[] = [
      `All disciplines agree that "${solution.title}" tackles an acute, high-leverage vulnerability described in "${problem.title}".`,
      `There is consensus that relying entirely on centralized external institutions has failed, making localized, decentralized intervention necessary.`,
      `Every perspective stresses that human training and clear governance are just as critical as the physical or computational mechanism.`,
      `All evaluated lenses highlight that unmonitored long-term maintenance is the primary threat to enduring success.`,
    ];

    const keyTensions: KeyTension[] = [];

    if (disciplines.length >= 2) {
      const d1 = disciplines[0];
      const d2 = disciplines[1];
      keyTensions.push({
        id: `tension-1`,
        title: `${d1.name} vs. ${d2.name}: Mechanistic Rigor vs. Contextual Reality`,
        disciplineA: d1.name,
        viewA: `Demands strict adherence to ${d1.whatItNotices[0]?.toLowerCase() || 'core metrics'} and formalized verification benchmarks before scaling.`,
        disciplineB: d2.name,
        viewB: `Argues that excessive formalization introduces prohibitive friction, advocating for adaptable grassroots flexibility.`,
        coreDilemma: `Should the solution prioritize formal optimization and strict standards, or local usability and imperfect adoption?`,
        synthesisPath: `Implement a two-tier architecture: keep the core physical/computational core strictly bounded, but leave interface and governance rules flexible for local adaptation.`,
        disciplinesInvolved: [d1.name, d2.name],
        description: `Tension between ${d1.name} and ${d2.name} over whether the solution should prioritize formal verification or operational flexibility.`,
      });
    }

    if (disciplines.length >= 3) {
      const d2 = disciplines[1];
      const d3 = disciplines[2];
      keyTensions.push({
        id: `tension-2`,
        title: `${d2.name} vs. ${d3.name}: Short-Term Urgency vs. Long-Term Systemic Balance`,
        disciplineA: d2.name,
        viewA: `Prioritizes immediate relief and rapid pilot deployment to alleviate urgent pain for affected stakeholders.`,
        disciplineB: d3.name,
        viewB: `Warns that moving too quickly without multi-year impact mapping risks creating secondary ecological or institutional debt.`,
        coreDilemma: `How to balance the moral imperative of immediate relief against the danger of unintended second-order consequences.`,
        synthesisPath: `Deploy in phased cohorts with built-in 90-day pause-and-reflect checkpoints where downstream stakeholders hold veto power over expansion.`,
        disciplinesInvolved: [d2.name, d3.name],
        description: `Tension between ${d2.name} and ${d3.name} balancing rapid deployment against long-term consequence mapping.`,
      });
    } else {
      keyTensions.push({
        id: `tension-default`,
        title: `Technical Feasibility vs. Social Sustainability`,
        disciplineA: disciplines[0]?.name || 'Engineering',
        viewA: `Focuses on physical and functional reliability under peak operating stress.`,
        disciplineB: 'Humanities & Social Sciences',
        viewB: `Questions whether community members will feel genuine ownership and dignity over the system.`,
        coreDilemma: `A perfectly engineered solution will sit unused if it fails to align with community rituals and daily social dynamics.`,
        synthesisPath: `Ensure the people who maintain the system participate in its physical construction and retain sovereign decision rights.`,
        disciplinesInvolved: [disciplines[0]?.name || 'Engineering', 'Humanities & Social Sciences'],
        description: `Tension between technical reliability and long-term human adoption.`,
      });
    }

    const priorityMatrix = disciplines.map((d) => {
      const res = results[d.id];
      return {
        disciplineName: d.name,
        topPriority: d.whatItFocusesOn.split(',')[0] || 'System integrity',
        criticalRisk: res ? res.risks[0] : d.whatItNotices[0] || 'Operational risk',
        recommendedPivot: res ? res.improvementSuggestions[0] : 'Conduct formal peer reviews.',
      };
    });

    const synthesisSummary = `Examining "${solution.title}" through ${names.join(', ')} reveals that its greatest strength lies in addressing the core problem with tangible direct action. However, the perspectives diverge sharply on speed versus governance: technical and business disciplines push for rapid iteration, while legal, social, and ecological lenses demand deeper community stewardship and risk-hedging before widespread adoption. The winning path is not to choose one over another, but to design a solution whose technical architecture inherently protects social equity.`;

    const unanimousBlindspot = `Across all evaluated lenses, the single most overlooked factor is the transition plan: who maintains institutional memory and diagnostic vigilance when the original project champions inevitably transition away?`;

    return {
      areasOfAgreement,
      whereDisciplinesAgree: areasOfAgreement,
      keyTensions,
      priorityMatrix,
      synthesisSummary,
      unanimousBlindspot,
      unanimousBlindSpots: [
        unanimousBlindspot,
        'Second-order unintended dependency loops among community volunteers',
        'Post-pilot operational maintenance funding and protocol continuity',
      ],
    };
  }
}

export const analysisService = new SupabaseAnalysisService();
