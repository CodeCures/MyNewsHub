import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Article, PaginatedResponse, UserPreferences } from '@/types';
import { authApi, articlesApi, preferencesApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await authApi.login(email, password);
        localStorage.setItem('auth_token', response.token);
        set({ user: response.user, token: response.token, isAuthenticated: true });
      },

      register: async (name, email, password, passwordConfirmation) => {
        const response = await authApi.register(name, email, password, passwordConfirmation);
        localStorage.setItem('auth_token', response.token);
        set({ user: response.user, token: response.token, isAuthenticated: true });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          localStorage.removeItem('auth_token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

interface ArticlesState {
  articles: Article[];
  paginationData: PaginatedResponse<Article>['meta'] | null;
  personalizedFeed: Article[];
  personalizedPaginationData: PaginatedResponse<Article>['meta'] | null;
  personalizedMessage: string | null;
  currentArticle: Article | null;
  isLoading: boolean;
  error: string | null;
  fetchArticles: (filters?: any) => Promise<void>;
  fetchArticle: (id: string) => Promise<void>;
  fetchPersonalizedFeed: (page?: number, filters?: any) => Promise<void>;
  clearCurrentArticle: () => void;
}

export const useArticlesStore = create<ArticlesState>((set) => ({
  articles: [],
  paginationData: null,
  personalizedFeed: [],
  personalizedPaginationData: null,
  personalizedMessage: null,
  currentArticle: null,
  isLoading: false,
  error: null,

  fetchArticles: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await articlesApi.getArticles(filters);
      const { data, meta } = response;
      set({ articles: data, paginationData: meta, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchArticle: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const article = await articlesApi.getArticle(id);
      set({ currentArticle: article, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPersonalizedFeed: async (page = 1, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await articlesApi.getPersonalizedFeed(page, filters);
      const { data, meta, message } = response;
      set({ 
        personalizedFeed: data, 
        personalizedPaginationData: meta || null, 
        personalizedMessage: message || null,
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearCurrentArticle: () => set({ currentArticle: null }),
}));

interface PreferencesState {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (preferences: UserPreferences) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: null,
  isLoading: false,
  error: null,

  fetchPreferences: async () => {
    set({ isLoading: true, error: null });
    try {
      const preferences = await preferencesApi.getPreferences();
      set({ preferences, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updatePreferences: async (preferences) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await preferencesApi.setPreferences(preferences);
      set({ preferences: updated, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
