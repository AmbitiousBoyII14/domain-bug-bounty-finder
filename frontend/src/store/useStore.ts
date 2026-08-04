import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null; accessToken: string | null; refreshToken: string | null;
  setAuth: (u: User, a: string, r: string) => void;
  setTokens: (a: string, r: string) => void;
  setUser: (u: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(persist((set) => ({
  user: null, accessToken: null, refreshToken: null,
  setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, accessToken: null, refreshToken: null }),
}), { name: 'domain-finder-auth' }));

interface UIState {
  theme: 'dark' | 'light'; accentColor: string; sidebarOpen: boolean;
  setTheme: (t: 'dark' | 'light') => void;
  setAccentColor: (c: string) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(persist((set) => ({
  theme: 'dark', accentColor: 'cyan', sidebarOpen: true,
  setTheme: (theme) => {
    set({ theme });
    if (theme === 'light') { document.documentElement.classList.add('light'); document.documentElement.classList.remove('dark'); }
    else { document.documentElement.classList.add('dark'); document.documentElement.classList.remove('light'); }
  },
  setAccentColor: (accentColor) => set({ accentColor }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}), { name: 'domain-finder-ui' }));
