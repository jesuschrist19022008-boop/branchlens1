import { SEED_PROBLEMS } from '../data/problems';
import { supabase, slugToUuid, isValidUuid, ensureUuid, DEFAULT_SUPABASE_USER_ID } from '../lib/supabase';
import { Problem } from '../types';

class ProblemService {
  private inMemoryCache: Map<string, Problem> = new Map();
  private seedIdToUuidMap: Map<string, string> = new Map();

  constructor() {
    this.initSeeds();
  }

  private initSeeds() {
    for (const seed of SEED_PROBLEMS) {
      const uuid = isValidUuid(seed.id) ? seed.id : slugToUuid(seed.id);
      this.seedIdToUuidMap.set(seed.id, uuid);
      const prob: Problem = {
        ...seed,
        id: uuid,
      };
      this.inMemoryCache.set(uuid, prob);
      this.inMemoryCache.set(seed.id, prob);
    }
  }

  public getProblemUuid(idOrSeedId: string): string {
    if (isValidUuid(idOrSeedId)) return idOrSeedId;
    return this.seedIdToUuidMap.get(idOrSeedId) || slugToUuid(idOrSeedId);
  }

  private mapRowToProblem(row: any): Problem {
    return {
      id: row.id,
      title: row.title || 'Untitled Challenge',
      description: row.description || '',
      domain: row.domain || 'General',
      context: row.context || '',
      peopleAffected: row.people_affected || row.peopleAffected || '',
      desiredOutcome: row.desired_outcome || row.desiredOutcome || '',
      constraints: Array.isArray(row.constraints)
        ? row.constraints
        : typeof row.constraints === 'string'
        ? row.constraints.split('\n').filter(Boolean)
        : [],
      risks: Array.isArray(row.risks)
        ? row.risks
        : typeof row.risks === 'string'
        ? row.risks.split('\n').filter(Boolean)
        : [],
      tags: Array.isArray(row.tags) ? row.tags : [],
      author: row.author || 'Thinker',
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
      isSaved: Boolean(row.is_saved ?? row.isSaved ?? true),
      isCustom: Boolean(row.is_custom ?? row.isCustom ?? false),
    };
  }

  public async getProblems(): Promise<Problem[]> {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const problems = data.map((r: any) => this.mapRowToProblem(r));
        problems.forEach((p: Problem) => this.inMemoryCache.set(p.id, p));
        return problems;
      }

      // Seed initial problems into database if table is empty
      const initialSeeds = Array.from(new Set(Array.from(this.inMemoryCache.values())));
      for (const p of initialSeeds) {
        try {
          await supabase.from('problems').upsert({
            id: p.id,
            title: p.title,
            description: p.description,
            domain: p.domain,
            context: p.context,
            people_affected: p.peopleAffected,
            constraints: p.constraints,
            risks: p.risks,
            status: 'active',
            user_id: DEFAULT_SUPABASE_USER_ID,
            created_at: p.createdAt,
            updated_at: p.updatedAt,
          });
        } catch {
          // ignore
        }
      }
      return initialSeeds;
    } catch {
      return Array.from(new Set(Array.from(this.inMemoryCache.values())));
    }
  }

  public async getProblemById(idOrSeedId: string): Promise<Problem | null> {
    if (!idOrSeedId) return null;
    const uuid = this.getProblemUuid(idOrSeedId);

    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('id', uuid)
        .single();

      if (!error && data) {
        const prob = this.mapRowToProblem(data);
        this.inMemoryCache.set(prob.id, prob);
        return prob;
      }
    } catch {
      // fallback
    }

    return this.inMemoryCache.get(uuid) || this.inMemoryCache.get(idOrSeedId) || null;
  }

  public async createProblem(data: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>): Promise<Problem> {
    const uuid = ensureUuid();
    const now = new Date().toISOString();

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || DEFAULT_SUPABASE_USER_ID;

    const row = {
      id: uuid,
      title: data.title,
      description: data.description,
      domain: data.domain,
      context: data.context,
      people_affected: data.peopleAffected,
      constraints: data.constraints,
      risks: data.risks,
      status: 'active',
      user_id: userId,
      created_at: now,
      updated_at: now,
    };

    try {
      await supabase.from('problems').insert(row);
    } catch (err) {
      console.warn('Notice inserting problem to database:', err);
    }

    const created: Problem = {
      ...data,
      id: uuid,
      createdAt: now,
      updatedAt: now,
      isCustom: true,
      isSaved: true,
    };

    this.inMemoryCache.set(uuid, created);
    return created;
  }

  public async updateProblem(id: string, updates: Partial<Problem>): Promise<Problem> {
    const uuid = this.getProblemUuid(id);
    const existing = await this.getProblemById(uuid);
    if (!existing) {
      throw new Error(`Problem with id ${id} not found`);
    }

    const now = new Date().toISOString();
    const updated: Problem = {
      ...existing,
      ...updates,
      id: uuid,
      updatedAt: now,
    };

    try {
      await supabase
        .from('problems')
        .update({
          title: updated.title,
          description: updated.description,
          domain: updated.domain,
          context: updated.context,
          people_affected: updated.peopleAffected,
          constraints: updated.constraints,
          risks: updated.risks,
          status: 'active',
          updated_at: now,
        })
        .eq('id', uuid);
    } catch {
      // fallback
    }

    this.inMemoryCache.set(uuid, updated);
    return updated;
  }

  public async deleteProblem(id: string): Promise<boolean> {
    const uuid = this.getProblemUuid(id);
    this.inMemoryCache.delete(uuid);
    this.inMemoryCache.delete(id);

    try {
      await supabase.from('problems').delete().eq('id', uuid);
      return true;
    } catch {
      return false;
    }
  }

  public async toggleSaveProblem(id: string): Promise<boolean> {
    const prob = await this.getProblemById(id);
    if (!prob) return false;
    prob.isSaved = !prob.isSaved;
    await this.updateProblem(prob.id, { isSaved: prob.isSaved });
    return prob.isSaved;
  }

  public async searchProblems(query: string, domain?: string): Promise<Problem[]> {
    const list = await this.getProblems();
    let filtered = list;
    if (domain && domain !== 'All') {
      filtered = filtered.filter((p) => p.domain.toLowerCase().includes(domain.toLowerCase()));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.domain.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return filtered;
  }
}

export const problemService = new ProblemService();
