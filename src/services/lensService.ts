import { ALL_DISCIPLINES, DISCIPLINE_CATEGORIES } from '../data/disciplines';
import { supabase, slugToUuid, isValidUuid } from '../lib/supabase';
import { Discipline, DisciplineCategory, DisciplineCategoryId } from '../types';

class LensService {
  private disciplines: Discipline[] = [];
  private uuidToSlugMap = new Map<string, string>();
  private slugToUuidMap = new Map<string, string>();
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    // Map initial seed disciplines so each has a guaranteed UUID as its .id, and slug as .slug
    this.disciplines = ALL_DISCIPLINES.map((d) => {
      const originalSlug = d.id;
      const realUuid = isValidUuid(d.id) ? d.id : slugToUuid(originalSlug);

      this.uuidToSlugMap.set(realUuid, originalSlug);
      this.slugToUuidMap.set(originalSlug, realUuid);
      this.slugToUuidMap.set(d.name.toLowerCase(), realUuid);

      return {
        ...d,
        id: realUuid,
        slug: originalSlug,
      };
    });
    this.syncWithSupabase();
  }

  public async syncWithSupabase(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const { data: dbDisciplines, error } = await supabase.from('disciplines').select('*');
      if (!error && dbDisciplines && dbDisciplines.length > 0) {
        dbDisciplines.forEach((row: any) => {
          const rowUuid = row.id;
          const rowSlug = row.slug || row.name?.toLowerCase().replace(/\s+/g, '-');
          if (rowSlug && isValidUuid(rowUuid)) {
            this.uuidToSlugMap.set(rowUuid, rowSlug);
            this.slugToUuidMap.set(rowSlug, rowUuid);
            if (row.name) {
              this.slugToUuidMap.set(row.name.toLowerCase(), rowUuid);
            }

            // Update in-memory discipline id
            const existing = this.disciplines.find(
              (d) => d.slug === rowSlug || d.name.toLowerCase() === row.name?.toLowerCase()
            );
            if (existing) {
              existing.id = rowUuid;
              existing.slug = rowSlug;
            }
          }
        });
      } else {
        // Seed public.disciplines table in Supabase if empty
        const payload = this.disciplines.map((d) => ({
          id: d.id,
          slug: d.slug,
          name: d.name,
          category_id: d.categoryId,
          category_name: d.categoryName,
          tagline: d.tagline,
          what_it_focuses_on: d.whatItFocusesOn,
          what_it_notices: d.whatItNotices,
          common_constraints: d.commonConstraints,
          evaluation_methods: d.evaluationMethods,
          application_areas: d.applicationAreas,
          related_disciplines: d.relatedDisciplines,
          icon: d.icon,
        }));
        await supabase.from('disciplines').upsert(payload);
      }
      this.isInitialized = true;
    } catch {
      // Non-blocking fallback
    }
  }

  public getCategories(): DisciplineCategory[] {
    return DISCIPLINE_CATEGORIES;
  }

  public getAllDisciplines(): Discipline[] {
    return this.disciplines;
  }

  public getDisciplineById(idOrSlug: string): Discipline | null {
    if (!idOrSlug) return null;
    const clean = idOrSlug.trim();
    const cleanLower = clean.toLowerCase();

    // 1. Direct match by UUID
    let found = this.disciplines.find((d) => d.id === clean);
    if (found) return found;

    // 2. Match by slug
    found = this.disciplines.find((d) => d.slug === clean || d.slug?.toLowerCase() === cleanLower);
    if (found) return found;

    // 3. Match by name
    found = this.disciplines.find((d) => d.name.toLowerCase() === cleanLower);
    if (found) return found;

    // 4. Match via slug map
    const mappedUuid = this.slugToUuidMap.get(clean) || this.slugToUuidMap.get(cleanLower);
    if (mappedUuid) {
      found = this.disciplines.find((d) => d.id === mappedUuid);
      if (found) return found;
    }

    return null;
  }

  /**
   * Resolves ANY identifier (slug, name, or UUID) to the REAL database UUID
   */
  public getDisciplineUuid(idOrSlug: string): string {
    const disc = this.getDisciplineById(idOrSlug);
    if (disc) return disc.id;
    if (isValidUuid(idOrSlug)) return idOrSlug;
    return slugToUuid(idOrSlug);
  }

  public getDisciplinesByIds(idsOrSlugs: string[]): Discipline[] {
    return idsOrSlugs
      .map((id) => this.getDisciplineById(id))
      .filter((d): d is Discipline => d !== null);
  }

  public getDisciplinesByCategory(categoryId: DisciplineCategoryId): Discipline[] {
    return this.disciplines.filter((d) => d.categoryId === categoryId);
  }

  public searchDisciplines(query: string, categoryId?: DisciplineCategoryId | 'all'): Discipline[] {
    let list = this.disciplines;
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
          (d.slug && d.slug.toLowerCase().includes(q)) ||
          d.whatItNotices.some((n) => n.toLowerCase().includes(q))
      );
    }
    return list;
  }
}

export const lensService = new LensService();
