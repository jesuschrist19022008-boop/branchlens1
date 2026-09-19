import React, { useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { SEED_PROBLEMS, SEED_SOLUTIONS } from './data/problems';
import { AnalysisLoadingPage } from './pages/AnalysisLoadingPage';
import { AuthPage } from './pages/AuthPage';
import { ChooseLensesPage } from './pages/ChooseLensesPage';
import { CreateProblemPage } from './pages/CreateProblemPage';
import { CrossLensComparisonPage } from './pages/CrossLensComparisonPage';
import { DisciplineExplorerPage } from './pages/DisciplineExplorerPage';
import { LandingPage } from './pages/LandingPage';
import { LensAnalysisPage } from './pages/LensAnalysisPage';
import { MyWorkPage } from './pages/MyWorkPage';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { ProblemBriefPage } from './pages/ProblemBriefPage';
import { ProblemLibraryPage } from './pages/ProblemLibraryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { SolutionWorkspacePage } from './pages/SolutionWorkspacePage';
import { WorkspacePage } from './pages/WorkspacePage';
import { analysisService } from './services/analysisService';
import { authService } from './services/authService';
import { lensService } from './services/lensService';
import { problemService } from './services/problemService';
import { profileService } from './services/profileService';
import { solutionService } from './services/solutionService';
import {
  AnalysisSession,
  AnalysisStage,
  AppView,
  Discipline,
  Problem,
  Solution,
  User,
} from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Active Inquiry State
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<AnalysisSession | null>(null);

  // Progressive Analysis Simulation State
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>('idle');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisCurrentDiscipline, setAnalysisCurrentDiscipline] = useState<string | undefined>();
  const [activeAnalysisDisciplines, setActiveAnalysisDisciplines] = useState<Discipline[]>([]);

  // Navigation with hash synchronization for clean browser refresh persistence
  const navigateTo = (view: AppView, solutionId?: string) => {
    setCurrentView(view);
    if (solutionId) {
      setSelectedSolutionId(solutionId);
      window.location.hash = `#/${view}?solutionId=${solutionId}`;
    } else if (selectedSolutionId && (view === 'lens-analysis' || view === 'cross-lens-comparison' || view === 'choose-lenses' || view === 'solution-workspace')) {
      window.location.hash = `#/${view}?solutionId=${selectedSolutionId}`;
    } else {
      window.location.hash = `#/${view}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Restore navigation and context from URL hash or storage across refreshes
  useEffect(() => {
    const handleHashRoute = async () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#/')) {
        const withoutPrefix = hash.slice(2);
        const [viewPart, queryPart] = withoutPrefix.split('?');
        const validViews: AppView[] = [
          'landing',
          'auth',
          'workspace',
          'new-analysis',
          'create-problem',
          'problem-library',
          'problem-brief',
          'solution-workspace',
          'choose-lenses',
          'analysis-loading',
          'lens-analysis',
          'cross-lens-comparison',
          'profile',
          'discipline-explorer',
          'my-work',
          'settings',
        ];

        if (viewPart && validViews.includes(viewPart as AppView)) {
          setCurrentView(viewPart as AppView);
        }

        if (queryPart) {
          const params = new URLSearchParams(queryPart);
          const solId = params.get('solutionId');
          if (solId) {
            setSelectedSolutionId(solId);
            const sol = await solutionService.getSolutionById(solId);
            if (sol) {
              setSelectedSolution(sol);
              const prob = await problemService.getProblemById(sol.problemId);
              if (prob) setSelectedProblem(prob);
            }
          }
        }
      }
    };

    handleHashRoute();
    window.addEventListener('hashchange', handleHashRoute);
    return () => window.removeEventListener('hashchange', handleHashRoute);
  }, []);

  // Initialize user & default seed context
  useEffect(() => {
    const initApp = async () => {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      // Pre-seed an initial default problem so all deep routes have rich context
      const problems = await problemService.getProblems();
      if (problems.length > 0) {
        if (!selectedProblem) {
          setSelectedProblem(problems[0]);
        }
        const sol = await solutionService.getSolutionByProblemId(problems[0].id);
        if (!selectedSolution && sol) {
          setSelectedSolution(sol);
          setSelectedSolutionId(sol.id);
        }
      }

      // Check for any existing session
      const sessions = await analysisService.getRecentSessions();
      if (sessions.length > 0 && !selectedSession) {
        setSelectedSession(sessions[0]);
        if (!selectedSolutionId) {
          setSelectedSolutionId(sessions[0].solutionId);
        }
      }
    };
    initApp();
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    setCurrentUser(null);
    navigateTo('landing');
  };

  const handleProblemSelected = async (prob: Problem) => {
    setSelectedProblem(prob);
    const sol = await solutionService.getSolutionByProblemId(prob.id);
    setSelectedSolution(sol);
    if (sol) setSelectedSolutionId(sol.id);
  };

  const handleProblemSaved = (saved: Problem) => {
    setSelectedProblem(saved);
  };

  const handleStartSolution = async (prob: Problem) => {
    setSelectedProblem(prob);
    let sol = await solutionService.getSolutionByProblemId(prob.id);
    if (!sol) {
      sol = await solutionService.saveSolution({
        id: `sol-${prob.id}`,
        problemId: prob.id,
        title: `Decentralized Adaptive Framework for ${prob.title}`,
        proposedApproach: `A community-anchored, open-standard intervention structured to directly counter the systemic vulnerabilities outlined in ${prob.title}.`,
        howItWorks: `Combines robust physical infrastructure with localized governance protocols, iterative peer monitoring, and open diagnostic benchmarks.`,
        keyAssumptions: `Assumes local community leadership can sustain operational stewardship with minimal ongoing external dependencies.`,
        targetAudience: prob.peopleAffected || 'Impacted community stakeholders',
        tradeOffs: `Trades rapid centralized deployment speed for resilient, localized autonomy and long-term diagnostic transparency.`,
      });
    }
    setSelectedSolution(sol);
    setSelectedSolutionId(sol.id);
    navigateTo('solution-workspace', sol.id);
  };

  const handleProceedToLenses = async (sol: Solution) => {
    const savedSol = await solutionService.saveSolution(sol);
    setSelectedSolution(savedSol);
    setSelectedSolutionId(savedSol.id);
    navigateTo('choose-lenses', savedSol.id);
  };

  const handleRunAnalysis = async (selectedDisciplineIds: string[]) => {
    if (!selectedProblem || !selectedSolution) return;

    // Convert all inputs to real UUIDs from public.disciplines.id
    const realDisciplineUuids = Array.from(
      new Set(selectedDisciplineIds.map((id) => lensService.getDisciplineUuid(id)))
    );
    const discs = lensService.getDisciplinesByIds(realDisciplineUuids);
    setActiveAnalysisDisciplines(discs);
    navigateTo('analysis-loading');

    try {
      const session = await analysisService.executeAnalysis(
        selectedProblem,
        selectedSolution,
        realDisciplineUuids,
        (progress, stage, disciplineName) => {
          setAnalysisProgress(progress);
          setAnalysisStage(stage);
          setAnalysisCurrentDiscipline(disciplineName);
        }
      );

      // Record in profile
      await profileService.recordAnalysis(session);
      setSelectedSession(session);
      setSelectedSolutionId(session.solutionId);

      // Smooth transition to analysis view using the REAL persisted solution UUID
      setTimeout(() => {
        navigateTo('lens-analysis', session.solutionId);
      }, 500);
    } catch (err) {
      console.error('Analysis failed', err);
      navigateTo('choose-lenses', selectedSolution.id);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6] text-zinc-900 font-sans selection:bg-amber-200 selection:text-zinc-950">
      {/* Universal Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={navigateTo}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Main Dynamic View Outlet */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={navigateTo}
            onSelectSampleProblem={(pId) => {
              const p = SEED_PROBLEMS.find((item) => item.id === pId);
              if (p) {
                handleProblemSelected(p);
                navigateTo('problem-brief');
              }
            }}
          />
        )}

        {currentView === 'auth' && (
          <AuthPage
            currentUser={currentUser}
            onAuthSuccess={(user) => {
              setCurrentUser(user);
              navigateTo('workspace');
            }}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'workspace' && (
          <WorkspacePage
            currentUser={currentUser}
            onNavigate={navigateTo}
            onSelectProblem={(p) => {
              handleProblemSelected(p);
            }}
            onSelectSession={(sess) => {
              setSelectedSession(sess);
              setSelectedSolutionId(sess.solutionId);
              navigateTo('lens-analysis', sess.solutionId);
            }}
          />
        )}

        {currentView === 'new-analysis' && (
          <NewAnalysisPage onNavigate={navigateTo} />
        )}

        {currentView === 'create-problem' && (
          <CreateProblemPage
            initialProblem={null}
            onProblemSaved={handleProblemSaved}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'problem-library' && (
          <ProblemLibraryPage
            onSelectProblem={handleProblemSelected}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'problem-brief' && (
          <ProblemBriefPage
            problem={selectedProblem}
            onEditProblem={() => navigateTo('create-problem')}
            onStartSolution={handleStartSolution}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'solution-workspace' && (
          <SolutionWorkspacePage
            problem={selectedProblem || ({} as any)}
            existingSolution={selectedSolution}
            onProceedToLenses={handleProceedToLenses}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'choose-lenses' && selectedProblem && selectedSolution && (
          <ChooseLensesPage
            problem={selectedProblem}
            solution={selectedSolution}
            onRunAnalysis={handleRunAnalysis}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'analysis-loading' && (
          <AnalysisLoadingPage
            selectedDisciplines={activeAnalysisDisciplines}
            currentStage={analysisStage}
            progressPercent={analysisProgress}
            currentDisciplineName={analysisCurrentDiscipline}
            onComplete={() => navigateTo('lens-analysis', selectedSolutionId || selectedSolution?.id)}
          />
        )}

        {currentView === 'lens-analysis' && (
          <LensAnalysisPage
            solutionId={selectedSolutionId || selectedSolution?.id || selectedSession?.solutionId}
            session={selectedSession}
            problem={selectedProblem}
            solution={selectedSolution}
            onComparePerspectives={() =>
              navigateTo('cross-lens-comparison', selectedSolutionId || selectedSolution?.id)
            }
            onNavigate={navigateTo}
            onUpdateSession={(sess) => {
              setSelectedSession(sess);
            }}
          />
        )}

        {currentView === 'cross-lens-comparison' && (
          <CrossLensComparisonPage
            solutionId={selectedSolutionId || selectedSolution?.id || selectedSession?.solutionId}
            session={selectedSession}
            problem={selectedProblem}
            solution={selectedSolution}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'profile' && (
          <ProfilePage onNavigate={navigateTo} />
        )}

        {currentView === 'discipline-explorer' && (
          <DisciplineExplorerPage onNavigate={navigateTo} />
        )}

        {currentView === 'my-work' && (
          <MyWorkPage
            onSelectProblem={(p) => {
              handleProblemSelected(p);
            }}
            onSelectSession={(sess) => {
              setSelectedSession(sess);
              setSelectedSolutionId(sess.solutionId);
              navigateTo('lens-analysis', sess.solutionId);
            }}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'settings' && (
          <SettingsPage
            currentUser={currentUser}
            onSignOut={handleSignOut}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Universal Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}
