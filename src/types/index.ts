export type DisciplineCategoryId =
  | 'engineering'
  | 'science'
  | 'health'
  | 'business'
  | 'law'
  | 'humanities'
  | 'design'
  | 'education'
  | 'applied';

export interface DisciplineCategory {
  id: DisciplineCategoryId;
  name: string;
  shortDescription: string;
  accentColor: string;
}

export interface Discipline {
  id: string;
  slug?: string;
  name: string;
  categoryId: DisciplineCategoryId;
  categoryName: string;
  tagline: string;
  whatItFocusesOn: string;
  whatItNotices: string[];
  commonConstraints: string[];
  evaluationMethods: string[];
  applicationAreas: string[];
  relatedDisciplines: string[];
  icon: string;
  // Conveniences for UI binding
  keyQuestion?: string;
  focusArea?: string;
  howItEvaluates?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  domain: string;
  context: string;
  peopleAffected: string;
  desiredOutcome: string;
  constraints: string;
  risks: string;
  additionalContext?: string;
  assumptions?: string;
  successSignals?: string;
  createdAt: string;
  updatedAt: string;
  isCustom?: boolean;
  isSaved?: boolean;
  tags?: string[];
  difficulty?: 'Accessible' | 'Intermediate' | 'Complex';
  author?: string;
}

export interface Solution {
  id: string;
  problemId: string;
  title: string;
  proposedApproach: string;
  howItWorks: string;
  implementationPlan?: string;
  resourcesRequired?: string;
  tradeOffs: string;
  risks?: string;
  additionalNotes?: string;
  targetAudience?: string;
  keyAssumptions?: string;
  createdAt: string;
  updatedAt: string;
}

export type FeasibilityRating = 'High' | 'Moderate' | 'Conditional' | 'Challenging';
export type ImpactRating = 'Transformative' | 'High' | 'Moderate' | 'Localized';
export type EffortRating = 'Low' | 'Moderate' | 'Substantial' | 'Intensive';

export interface LensResult {
  id: string;
  disciplineId: string;
  disciplineName: string;
  categoryName: string;
  tagline: string;
  keyQuestion: string;
  strengths: string[];
  blindSpots: string[];
  importantConsiderations: string[];
  risks: string[];
  feasibility: FeasibilityRating;
  feasibilityNote: string;
  impact: ImpactRating;
  effort: EffortRating;
  fitScore: number; // 0-100 fit rating
  tradeOffs: string[];
  stakeholders: string[];
  improvementSuggestions: string[];
  // Conveniences for UI rendering
  category?: string;
  considerations?: string[];
  suggestions?: string[];
}

export interface KeyTension {
  id: string;
  title: string;
  disciplineA: string;
  viewA: string;
  disciplineB: string;
  viewB: string;
  coreDilemma: string;
  synthesisPath: string;
  // UI aliases
  disciplinesInvolved?: string[];
  description?: string;
}

export interface CrossLensComparison {
  areasOfAgreement: string[];
  keyTensions: KeyTension[];
  priorityMatrix: {
    disciplineName: string;
    topPriority: string;
    criticalRisk: string;
    recommendedPivot: string;
  }[];
  synthesisSummary: string;
  unanimousBlindspot: string;
  // UI aliases
  whereDisciplinesAgree?: string[];
  unanimousBlindSpots?: string[];
}

export interface AnalysisSession {
  id: string;
  problemId: string;
  solutionId: string;
  problemTitle: string;
  solutionTitle: string;
  selectedDisciplineIds: string[];
  results: Record<string, LensResult>;
  comparison?: CrossLensComparison;
  createdAt: string;
  updatedAt: string;
}

export type QualitativeSignal =
  | 'Strong signal'
  | 'Developing strength'
  | 'Worth exploring'
  | 'In the mix';

export interface ProfileDimension {
  id: string;
  title: string;
  signal: QualitativeSignal;
  description: string;
  evidenceNotes: string[];
  relatedDisciplineInteractions: string[];
  // UI aliases
  evidenceNote?: string;
  relatedDisciplines?: string[];
}

export interface ProfileSnapshot {
  id: string;
  date: string;
  problemTitle: string;
  lensesExamined: string[];
  dominantSignals: string[];
  reflectionNote: string;
}

export interface UserProfile {
  dimensions: ProfileDimension[];
  totalAnalyses: number;
  problemsExplored: number;
  lensesUsedCount: number;
  topPerspectives: string[];
  recentSnapshots: ProfileSnapshot[];
  disclaimer: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  joinedDate: string;
  role?: string;
}

export type AnalysisStage =
  | 'idle'
  | 'inspecting'
  | 'synthesizing'
  | 'calculating'
  | 'finalizing'
  | 'complete';

export type AppView =
  | 'landing'
  | 'auth'
  | 'workspace'
  | 'new-analysis'
  | 'create-problem'
  | 'problem-library'
  | 'problem-brief'
  | 'solution-workspace'
  | 'choose-lenses'
  | 'analysis-loading'
  | 'lens-analysis'
  | 'cross-lens-comparison'
  | 'profile'
  | 'discipline-explorer'
  | 'my-work'
  | 'settings';
