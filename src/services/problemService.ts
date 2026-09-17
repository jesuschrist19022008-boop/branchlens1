import { SEED_PROBLEMS } from '../data/problems';
import { Problem } from '../types';

const STORAGE_KEY = 'branchlens_problems_list';

class ProblemService {
  private problems: Problem[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.problems = JSON.parse(saved);
      } else {
        this.problems = SEED_PROBLEMS;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PROBLEMS));
      }
    } catch {
      this.problems = SEED_PROBLEMS;
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.problems));
    } catch {
      // ignore
    }
  }

  public async getProblems(): Promise<Problem[]> {
    return [...this.problems];
  }

  public async getProblemById(id: string): Promise<Problem | null> {
    const p = this.problems.find((item) => item.id === id);
    return p ? { ...p } : null;
  }

  public async createProblem(data: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>): Promise<Problem> {
    const newProblem: Problem = {
      ...data,
      id: `prob-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true,
      isSaved: true,
    };
    this.problems.unshift(newProblem);
    this.persist();
    return { ...newProblem };
  }

  public async updateProblem(id: string, updates: Partial<Problem>): Promise<Problem> {
    const index = this.problems.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Problem with id ${id} not found`);
    }
    const updated = {
      ...this.problems[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.problems[index] = updated;
    this.persist();
    return { ...updated };
  }

  public async deleteProblem(id: string): Promise<boolean> {
    const index = this.problems.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.problems.splice(index, 1);
    this.persist();
    return true;
  }

  public async toggleSaveProblem(id: string): Promise<boolean> {
    const problem = this.problems.find((p) => p.id === id);
    if (!problem) return false;
    problem.isSaved = !problem.isSaved;
    problem.updatedAt = new Date().toISOString();
    this.persist();
    return problem.isSaved;
  }

  public async searchProblems(query: string, domain?: string): Promise<Problem[]> {
    let list = [...this.problems];
    if (domain && domain !== 'All') {
      list = list.filter((p) => p.domain.toLowerCase().includes(domain.toLowerCase()));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.domain.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return list;
  }
}

export const problemService = new ProblemService();
