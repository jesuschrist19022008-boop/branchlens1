import { INITIAL_USER_PROFILE } from '../data/profile';
import { AnalysisSession, ProfileSnapshot, UserProfile } from '../types';
import { supabase, ensureUuid, DEFAULT_SUPABASE_USER_ID } from '../lib/supabase';

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

  /**
   * Authoritatively loads profile snapshots from public.profile_snapshots in Supabase
   */
  public async getProfile(): Promise<UserProfile> {
    try {
      const { data: snapshotRows, error: snapshotError } = await supabase
        .from('profile_snapshots')
        .select('*')
        .order('created_at', { ascending: false });

      if (snapshotError) {
        console.error('[profile_snapshots select error]', {
          code: snapshotError.code,
          message: snapshotError.message,
          details: snapshotError.details,
          hint: snapshotError.hint,
        });
      } else if (snapshotRows && snapshotRows.length > 0) {
        const mappedSnapshots: ProfileSnapshot[] = snapshotRows.map((row: any) => {
          const raw = row.raw_output || {};
          return {
            id: row.id,
            date:
              raw.date ||
              (row.created_at
                ? new Date(row.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent'),
            problemTitle: row.problem_title || raw.problemTitle || 'Challenge Problem',
            lensesExamined: Array.isArray(row.lenses_examined)
              ? row.lenses_examined
              : typeof row.lenses_examined === 'string'
              ? JSON.parse(row.lenses_examined || '[]')
              : raw.lensesExamined || [],
            dominantSignals: Array.isArray(row.dominant_signals)
              ? row.dominant_signals
              : typeof row.dominant_signals === 'string'
              ? JSON.parse(row.dominant_signals || '[]')
              : raw.dominantSignals || [],
            reflectionNote: row.reflection_note || raw.reflectionNote || '',
          };
        });

        this.profile.recentSnapshots = mappedSnapshots;
        this.profile.totalAnalyses = Math.max(this.profile.totalAnalyses, mappedSnapshots.length);
        const totalLenses = mappedSnapshots.reduce(
          (acc, s) => acc + (s.lensesExamined?.length || 0),
          0
        );
        if (totalLenses > 0) {
          this.profile.lensesUsedCount = Math.max(this.profile.lensesUsedCount, totalLenses);
        }
      }
    } catch (err) {
      console.error('Failed to load profile snapshots from Supabase:', err);
    }

    return { ...this.profile };
  }

  /**
   * Records a completed analysis session into public.profile_snapshots in Supabase
   */
  public async recordAnalysis(session: AnalysisSession): Promise<UserProfile> {
    this.profile.totalAnalyses += 1;
    this.profile.lensesUsedCount += session.selectedDisciplineIds.length;

    const snapshotId = ensureUuid();
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || DEFAULT_SUPABASE_USER_ID;

    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const lensesExamined = Object.values(session.results).map((r) => r.disciplineName);
    const dominantSignals = ['Systems Thinking', 'Trade-off Awareness', 'Evidence-Based Thinking'];
    const reflectionNote = `Explored through ${session.selectedDisciplineIds.length} lenses. Showed balanced attention to multi-disciplinary friction and real-world operational constraints.`;

    const row = {
      id: snapshotId,
      user_id: userId,
      problem_title: session.problemTitle,
      lenses_examined: lensesExamined,
      dominant_signals: dominantSignals,
      reflection_note: reflectionNote,
      created_at: new Date().toISOString(),
      raw_output: {
        date: formattedDate,
        problemTitle: session.problemTitle,
        lensesExamined,
        dominantSignals,
        reflectionNote,
      },
    };

    try {
      const { error: insertError } = await supabase.from('profile_snapshots').insert(row);
      if (insertError) {
        console.error('[profile_snapshots insert failed]', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });
      } else {
        // Verify row exists in public.profile_snapshots
        const { data: verifyData, error: verifyError } = await supabase
          .from('profile_snapshots')
          .select('id')
          .eq('id', snapshotId)
          .single();
        if (verifyError || !verifyData) {
          console.warn('[profile_snapshots verify check]', {
            code: verifyError?.code,
            message: verifyError?.message,
            details: verifyError?.details,
            hint: verifyError?.hint,
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to insert profile snapshot:', {
        message: err?.message || String(err),
        details: err?.details || null,
      });
    }

    const newSnapshot: ProfileSnapshot = {
      id: snapshotId,
      date: formattedDate,
      problemTitle: session.problemTitle,
      lensesExamined,
      dominantSignals,
      reflectionNote,
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
