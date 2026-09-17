import { INITIAL_USER_PROFILE } from '../data/profile';
import { AnalysisSession, ProfileSnapshot, UserProfile } from '../types';

const STORAGE_KEY = 'branchlens_user_profile';

class ProfileService {
  private profile: UserProfile = INITIAL_USER_PROFILE;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.profile = JSON.parse(saved);
      } else {
        this.profile = INITIAL_USER_PROFILE;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USER_PROFILE));
      }
    } catch {
      this.profile = INITIAL_USER_PROFILE;
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch {
      // ignore
    }
  }

  public async getProfile(): Promise<UserProfile> {
    return { ...this.profile };
  }

  public async recordAnalysis(session: AnalysisSession): Promise<UserProfile> {
    this.profile.totalAnalyses += 1;
    this.profile.lensesUsedCount += session.selectedDisciplineIds.length;

    // Create a snapshot
    const newSnapshot: ProfileSnapshot = {
      id: `snap-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      problemTitle: session.problemTitle,
      lensesExamined: Object.values(session.results).map((r) => r.disciplineName),
      dominantSignals: ['Systems Thinking', 'Trade-off Awareness', 'Evidence-Based Thinking'],
      reflectionNote: `Explored through ${session.selectedDisciplineIds.length} lenses. Showed balanced attention to multi-disciplinary friction and real-world operational constraints.`,
    };

    this.profile.recentSnapshots.unshift(newSnapshot);
    if (this.profile.recentSnapshots.length > 8) {
      this.profile.recentSnapshots.pop();
    }

    this.persist();
    return { ...this.profile };
  }

  public async resetProfile(): Promise<UserProfile> {
    this.profile = { ...INITIAL_USER_PROFILE };
    this.persist();
    return { ...this.profile };
  }
}

export const profileService = new ProfileService();
