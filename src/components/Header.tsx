import React, { useState } from 'react';
import {
  Compass,
  Layers,
  Sparkles,
  BookOpen,
  User as UserIcon,
  LogOut,
  Settings as SettingsIcon,
  FolderKanban,
  PlusCircle,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { AppView, User } from '../types';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  currentUser: User | null;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onSignOut,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Workspace', view: 'workspace' as AppView, icon: Layers },
    { label: 'Library', view: 'problem-library' as AppView, icon: BookOpen },
    { label: 'Discipline Explorer', view: 'discipline-explorer' as AppView, icon: Compass },
    { label: 'My Work', view: 'my-work' as AppView, icon: FolderKanban },
    { label: 'Profile', view: 'profile' as AppView, icon: Sparkles },
  ];

  const handleNav = (v: AppView) => {
    onNavigate(v);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-[#FAF9F6]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            id="brand-logo-btn"
            onClick={() => handleNav('landing')}
            className="group flex items-center gap-2.5 text-left transition-opacity hover:opacity-90"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-amber-50 shadow-sm transition-transform group-hover:scale-105">
              {/* Abstract Prism / Lens Aperture mark */}
              <div className="h-4 w-4 rounded-full border border-amber-200/60 transition-transform group-hover:rotate-45" />
              <div className="absolute h-2 w-2 rounded-full bg-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-zinc-900">
                BranchLens
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-zinc-600">
                Interdisciplinary Studio
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  id={`nav-link-${item.view}`}
                  onClick={() => handleNav(item.view)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-amber-300' : 'text-zinc-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Action Controls & User Account */}
        <div className="flex items-center gap-3">
          <button
            id="header-new-analysis-btn"
            onClick={() => handleNav('new-analysis')}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-emerald-800 active:scale-98"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Analysis
          </button>

          {currentUser ? (
            <div className="relative">
              <button
                id="user-menu-dropdown-toggle"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-50"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-bold text-white">
                  {currentUser.avatarInitials}
                </div>
                <span className="hidden lg:inline text-xs font-medium text-zinc-700">
                  {currentUser.name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 z-50">
                  <div className="border-b border-zinc-100 px-3 py-2">
                    <p className="text-xs font-semibold text-zinc-900">{currentUser.name}</p>
                    <p className="truncate text-[11px] text-zinc-500">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => handleNav('profile')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
                    Problem-Solving Profile
                  </button>
                  <button
                    onClick={() => handleNav('my-work')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <FolderKanban className="h-3.5 w-3.5 text-zinc-500" />
                    Saved Work & Drafts
                  </button>
                  <button
                    onClick={() => handleNav('settings')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <SettingsIcon className="h-3.5 w-3.5 text-zinc-500" />
                    Account & Privacy
                  </button>
                  <div className="my-1 border-t border-zinc-100" />
                  <button
                    onClick={() => {
                      onSignOut();
                      setUserDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="header-sign-in-btn"
              onClick={() => handleNav('auth')}
              className="rounded-lg border border-zinc-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-200/60"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-zinc-200 bg-[#FAF9F6] px-4 py-3 md:hidden space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => handleNav(item.view)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-zinc-200">
            <button
              onClick={() => handleNav('new-analysis')}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-700 py-2 text-xs font-semibold text-white"
            >
              <PlusCircle className="h-4 w-4" />
              New Analysis
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
