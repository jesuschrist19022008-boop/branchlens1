import { SEED_SOLUTIONS } from '../data/problems';
import { Solution } from '../types';

const STORAGE_KEY = 'branchlens_solutions_map';

class SolutionService {
  private solutions: Record<string, Solution> = {};

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.solutions = JSON.parse(saved);
      } else {
        this.solutions = { ...SEED_SOLUTIONS };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SOLUTIONS));
      }
    } catch {
      this.solutions = { ...SEED_SOLUTIONS };
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.solutions));
    } catch {
      // ignore
    }
  }

  public async getSolutionByProblemId(problemId: string): Promise<Solution | null> {
    const sol = Object.values(this.solutions).find((s) => s.problemId === problemId);
    return sol ? { ...sol } : null;
  }

  public async saveSolution(
    solutionData: Omit<Solution, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<Solution> {
    const now = new Date().toISOString();
    const id = solutionData.id || `sol-${Date.now()}`;
    const existing = this.solutions[id];

    const solution: Solution = {
      ...solutionData,
      id,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    this.solutions[id] = solution;
    this.persist();
    return { ...solution };
  }

  public async updateSolution(id: string, updates: Partial<Solution>): Promise<Solution> {
    const existing = this.solutions[id];
    if (!existing) {
      throw new Error(`Solution with id ${id} not found`);
    }
    const updated: Solution = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.solutions[id] = updated;
    this.persist();
    return { ...updated };
  }

  public async getRecentSolutions(): Promise<Solution[]> {
    return Object.values(this.solutions).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
}

export const solutionService = new SolutionService();
