import { ALL_DISCIPLINES, DISCIPLINE_CATEGORIES } from '../data/disciplines';
import { Discipline, DisciplineCategory, DisciplineCategoryId } from '../types';

class LensService {
  public getCategories(): DisciplineCategory[] {
    return DISCIPLINE_CATEGORIES;
  }

  public getAllDisciplines(): Discipline[] {
    return ALL_DISCIPLINES;
  }

  public getDisciplineById(id: string): Discipline | null {
    return ALL_DISCIPLINES.find((d) => d.id === id) || null;
  }

  public getDisciplinesByIds(ids: string[]): Discipline[] {
    return ALL_DISCIPLINES.filter((d) => ids.includes(d.id));
  }

  public getDisciplinesByCategory(categoryId: DisciplineCategoryId): Discipline[] {
    return ALL_DISCIPLINES.filter((d) => d.categoryId === categoryId);
  }

  public searchDisciplines(query: string, categoryId?: DisciplineCategoryId | 'all'): Discipline[] {
    let list = ALL_DISCIPLINES;
    if (categoryId && categoryId !== 'all') {
      list = list.filter((d) => d.categoryId === categoryId);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.tagline.toLowerCase().includes(q) ||
          d.categoryName.toLowerCase().includes(q) ||
          d.whatItFocusesOn.toLowerCase().includes(q) ||
          d.whatItNotices.some((n) => n.toLowerCase().includes(q))
      );
    }
    return list;
  }
}

export const lensService = new LensService();
