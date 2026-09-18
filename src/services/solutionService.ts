import { SEED_SOLUTIONS } from '../data/problems';
import { supabase, slugToUuid, isValidUuid, ensureUuid, DEFAULT_SUPABASE_USER_ID } from '../lib/supabase';
import { problemService } from './problemService';
import { Solution } from '../types';

class SolutionService {
  private inMemoryCache: Map<string, Solution> = new Map();
  private seedIdToUuidMap: Map<string, string> = new Map();

  constructor() {
    this.initSeeds();
  }

  private initSeeds() {
    Object.values(SEED_SOLUTIONS).forEach((seed) => {
      if (seed && seed.id) {
        const uuid = isValidUuid(seed.id) ? seed.id : slugToUuid(seed.id);
        this.seedIdToUuidMap.set(seed.id, uuid);

        const realProblemId = problemService.getProblemUuid(seed.problemId);
        const mapped: Solution = {
          ...seed,
          id: uuid,
          problemId: realProblemId,
        };
        this.inMemoryCache.set(uuid, mapped);
        this.inMemoryCache.set(seed.id, mapped);
      }
    });
  }

  public getSolutionUuid(idOrSeedId: string): string {
    if (isValidUuid(idOrSeedId)) return idOrSeedId;
    return this.seedIdToUuidMap.get(idOrSeedId) || slugToUuid(idOrSeedId);
  }

  private mapRowToSolution(row: any): Solution {
    return {
      id: row.id,
      problemId: row.problem_id || row.problemId,
      title: row.title || 'Untitled Solution',
      proposedApproach: row.proposed_approach || row.proposedApproach || '',
      howItWorks: row.how_it_works || row.howItWorks || '',
      implementationPlan: row.implementation_plan || row.implementationPlan || '',
      resourcesRequired: row.resources_required || row.resourcesRequired || '',
      tradeOffs: row.tradeoffs || row.trade_offs || row.tradeOffs || '',
      risks: row.risks || '',
      additionalNotes: row.notes || row.additional_notes || row.additionalNotes || '',
      targetAudience: row.target_audience || row.targetAudience || '',
      keyAssumptions: row.key_assumptions || row.keyAssumptions || '',
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }

  public async getSolutionById(idOrSeedId: string): Promise<Solution | null> {
    if (!idOrSeedId) return null;
    const realUuid = this.getSolutionUuid(idOrSeedId);

    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('id', realUuid)
        .single();

      if (!error && data) {
        const sol = this.mapRowToSolution(data);
        this.inMemoryCache.set(sol.id, sol);
        return sol;
      }
    } catch {
      // fallback to memory
    }

    return this.inMemoryCache.get(realUuid) || this.inMemoryCache.get(idOrSeedId) || null;
  }

  public async getSolutionByProblemId(problemId: string): Promise<Solution | null> {
    if (!problemId) return null;
    const realProblemUuid = problemService.getProblemUuid(problemId);

    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('problem_id', realProblemUuid)
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const sol = this.mapRowToSolution(data[0]);
        this.inMemoryCache.set(sol.id, sol);
        return sol;
      }
    } catch {
      // fallback
    }

    // Check in-memory cache
    for (const sol of this.inMemoryCache.values()) {
      if (sol.problemId === realProblemUuid || sol.problemId === problemId) {
        return sol;
      }
    }

    return null;
  }

  /**
   * Persists solution into public.solutions in Supabase using real UUIDs
   */
  public async saveSolution(
    solutionData: Omit<Solution, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<Solution> {
    const now = new Date().toISOString();

    // NEVER use template IDs like sol-oral-languages-1 as database solution IDs.
    // Database solution ID MUST be a real UUID.
    const realSolutionId =
      solutionData.id && isValidUuid(solutionData.id)
        ? solutionData.id
        : ensureUuid();

    const realProblemId = problemService.getProblemUuid(solutionData.problemId);

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || DEFAULT_SUPABASE_USER_ID;

    const row = {
      id: realSolutionId,
      problem_id: realProblemId,
      user_id: userId,
      title: solutionData.title || 'Untitled Solution',
      proposed_approach: solutionData.proposedApproach || '',
      how_it_works: solutionData.howItWorks || '',
      implementation_plan: solutionData.implementationPlan || '',
      resources_required: solutionData.resourcesRequired || '',
      tradeoffs: solutionData.tradeOffs || '',
      risks: solutionData.risks || '',
      notes: solutionData.additionalNotes || '',
      status: 'active',
      created_at: now,
      updated_at: now,
    };

    try {
      const { error } = await supabase.from('solutions').upsert(row);
      if (error) {
        console.warn('Supabase notice upserting into public.solutions:', error.message || error);
      }
    } catch (err) {
      console.warn('Failed to upsert solution into Supabase:', err);
    }

    const solution: Solution = {
      ...solutionData,
      id: realSolutionId,
      problemId: realProblemId,
      createdAt: now,
      updatedAt: now,
    };

    this.inMemoryCache.set(realSolutionId, solution);
    if (solutionData.id && solutionData.id !== realSolutionId) {
      this.seedIdToUuidMap.set(solutionData.id, realSolutionId);
      this.inMemoryCache.set(solutionData.id, solution);
    }

    return { ...solution };
  }

  public async updateSolution(id: string, updates: Partial<Solution>): Promise<Solution> {
    const realSolutionId = this.getSolutionUuid(id);
    const existing = await this.getSolutionById(realSolutionId);

    const now = new Date().toISOString();
    const updated: Solution = {
      ...(existing || {
        id: realSolutionId,
        problemId: updates.problemId ? problemService.getProblemUuid(updates.problemId) : '',
        title: updates.title || 'Untitled Solution',
        proposedApproach: updates.proposedApproach || '',
        howItWorks: updates.howItWorks || '',
        implementationPlan: updates.implementationPlan || '',
        resourcesRequired: updates.resourcesRequired || '',
        tradeOffs: updates.tradeOffs || '',
        risks: updates.risks || '',
        additionalNotes: updates.additionalNotes || '',
        createdAt: now,
        updatedAt: now,
      }),
      ...updates,
      id: realSolutionId,
      updatedAt: now,
    };

    if (updates.problemId) {
      updated.problemId = problemService.getProblemUuid(updates.problemId);
    }

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || DEFAULT_SUPABASE_USER_ID;

    try {
      await supabase.from('solutions').upsert({
        id: realSolutionId,
        problem_id: updated.problemId,
        user_id: userId,
        title: updated.title,
        proposed_approach: updated.proposedApproach,
        how_it_works: updated.howItWorks,
        implementation_plan: updated.implementationPlan,
        resources_required: updated.resourcesRequired,
        tradeoffs: updated.tradeOffs,
        risks: updated.risks,
        notes: updated.additionalNotes || '',
        status: 'active',
        updated_at: now,
      });
    } catch (err) {
      console.warn('Failed to update solution in Supabase:', err);
    }

    this.inMemoryCache.set(realSolutionId, updated);
    return { ...updated };
  }

  public async getRecentSolutions(): Promise<Solution[]> {
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const solutions = data.map((r: any) => this.mapRowToSolution(r));
        solutions.forEach((s: Solution) => this.inMemoryCache.set(s.id, s));
        return solutions;
      }
    } catch {
      // fallback
    }

    return Array.from(new Set(Array.from(this.inMemoryCache.values()))).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
}

export const solutionService = new SolutionService();
