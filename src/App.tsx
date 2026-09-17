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
  const [selectedSession, setSelectedSession] = useState<AnalysisSession | null>(null);

  // Progressive Analysis Simulation State
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>('idle');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisCurrentDiscipline, setAnalysisCurrentDiscipline] = useState<string | undefined>();
  const [activeAnalysisDisciplines, setActiveAnalysisDisciplines] = useState<Discipline[]>([]);

  // Initialize user & default seed context
  useEffect(() => {
    const initApp = async () => {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      // Pre-seed an initial default problem so all deep routes have rich context
      const problems = await problemService.getProblems();
      if (problems.length > 0) {
        setSelectedProblem(problems[0]);
        const solutions = await solutionService.getRecentSolutions();
        const matched = solutions.find((s) => s.problemId === problems[0].id);
        if (matched) {
          setSelectedSolution(matched);
        } else if (SEED_SOLUTIONS[0]) {
          setSelectedSolution(SEED_SOLUTIONS[0]);
        }
      }

      // Check for any existing session
      const sessions = await analysisService.getRecentSessions();
      if (sessions.length > 0) {
        setSelectedSession(sessions[0]);
      }
    };
    initApp();
  }, []);

  // Scroll to top on route change
  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setCurrentUser(null);
    navigateTo('landing');
  };

  const handleProblemSelected = async (prob: Problem) => {
    setSelectedProblem(prob);
    // Find associated solution or default
    const sols = await solutionService.getRecentSolutions();
    const matched = sols.find((s) => s.problemId === prob.id) || null;
    setSelectedSolution(matched);
  };

  const handleProblemSaved = (saved: Problem) => {
    setSelectedProblem(saved);
  };

  const handleStartSolution = (prob: Problem) => {
    setSelectedProblem(prob);
    navigateTo('solution-workspace');
  };

  const handleProceedToLenses = (sol: Solution) => {
    setSelectedSolution(sol);
    navigateTo('choose-lenses');
  };

  const handleRunAnalysis = async (selectedDisciplineIds: string[]) => {
    if (!selectedProblem || !selectedSolution) return;

    const discs = lensService.getDisciplinesByIds(selectedDisciplineIds);
    setActiveAnalysisDisciplines(discs);
    navigateTo('analysis-loading');

    try {
      const session = await analysisService.executeAnalysis(
        selectedProblem,
        selectedSolution,
        selectedDisciplineIds,
        (progress, stage, disciplineName) => {
          setAnalysisProgress(progress);
          setAnalysisStage(stage);
          setAnalysisCurrentDiscipline(disciplineName);
        }
      );

      // Record in profile
      await profileService.recordAnalysis(session);
      setSelectedSession(session);

      // Smooth transition to analysis view
      setTimeout(() => {
        navigateTo('lens-analysis');
      }, 500);
    } catch (err) {
      console.error('Analysis failed', err);
      navigateTo('choose-lenses');
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

        {currentView === 'solution-workspace' && selectedProblem && (
          <SolutionWorkspacePage
            problem={selectedProblem}
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
            onComplete={() => navigateTo('lens-analysis')}
          />
        )}

        {currentView === 'lens-analysis' && selectedSession && selectedProblem && selectedSolution && (
          <LensAnalysisPage
            session={selectedSession}
            problem={selectedProblem}
            solution={selectedSolution}
            onComparePerspectives={() => navigateTo('cross-lens-comparison')}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'cross-lens-comparison' && selectedSession && selectedProblem && selectedSolution && (
          <CrossLensComparisonPage
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
