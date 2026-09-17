import { User } from '../types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const STORAGE_KEY = 'branchlens_auth_user';

const DEFAULT_USER: User = {
  id: 'usr-elena-rostova-2026',
  name: 'Elena Rostova',
  email: 'elena.rostova@research.org',
  avatarInitials: 'ER',
  joinedDate: 'August 2026',
  role: 'Systems Thinker & Explorer',
};

class AuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      } else {
        // Default to authenticated for rich instant exploration, but allow signing out
        this.currentUser = DEFAULT_USER;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      }
    } catch {
      this.currentUser = DEFAULT_USER;
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public subscribe(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.currentUser));
  }

  public async signIn(email: string, _password?: string): Promise<{ user: User; error: string | null }> {
    await new Promise((res) => setTimeout(res, 400));
    if (!email || !email.includes('@')) {
      return { user: null as unknown as User, error: 'Please enter a valid email address.' };
    }

    const name = email.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = name
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Explorer';

    const user: User = {
      id: `usr-${Date.now()}`,
      name: formattedName,
      email,
      avatarInitials: formattedName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'EX',
      joinedDate: 'September 2026',
      role: 'Interdisciplinary Problem Solver',
    };

    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.notify();
    return { user, error: null };
  }

  public async signUp(name: string, email: string, _password?: string): Promise<{ user: User; error: string | null }> {
    await new Promise((res) => setTimeout(res, 450));
    if (!name.trim()) {
      return { user: null as unknown as User, error: 'Name cannot be empty.' };
    }
    if (!email || !email.includes('@')) {
      return { user: null as unknown as User, error: 'Please enter a valid email address.' };
    }

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'EX';

    const user: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      avatarInitials: initials,
      joinedDate: 'September 2026',
      role: 'Inquirer & Problem Designer',
    };

    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.notify();
    return { user, error: null };
  }

  public async signOut(): Promise<void> {
    await new Promise((res) => setTimeout(res, 200));
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  }

  public async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 350));
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Invalid email address provided.' };
    }
    return {
      success: true,
      message: `Password reset instructions sent to ${email}. (Ready for Supabase Auth integration)`,
    };
  }
}

export const authService = new AuthService();
