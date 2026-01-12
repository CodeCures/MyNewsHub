import { create } from 'zustand';
import type { Article, PaginatedResponse, UserPreferences } from '@/types';
import { articlesApi, preferencesApi } from '@/lib/api';

// Auth is handled by NextAuth - we only track isAuthenticated from client-side session
interface AuthState {
  isAuthenticated: boolean;
  setAuthenticated: (isAuthenticated: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));

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
