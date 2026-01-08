import httpClient from '@/lib/httpClient';
import type { Article, ArticleFilters, AuthResponse, PaginatedResponse, User, UserPreferences } from '@/types';

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await httpClient.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    const { data } = await httpClient.post<AuthResponse>('/auth/register', { 
      name, 
      email, 
      password, 
      password_confirmation 
    });
    return data;
  },

  logout: async () => {
    await httpClient.post('/auth/logout');
  },

  getUser: async () => {
    const { data } = await httpClient.get<User>('/auth/user');
    return data;
  },
};

export const articlesApi = {
  getArticles: async (filters?: ArticleFilters) => {
    const { data } = await httpClient.get<PaginatedResponse<Article>>('/articles', { params: filters });
    return data;
  },

  getArticle: async (id: string) => {
    const { data } = await httpClient.get<Article>(`/articles/${id}`);
    return data;
  },

  getPersonalizedFeed: async (page = 1) => {
    const { data } = await httpClient.get<PaginatedResponse<Article>>('/articles/personalized/feed', {
      params: { page },
    });
    return data;
  },
};

export const preferencesApi = {
  getPreferences: async () => {
    const { data } = await httpClient.get<UserPreferences>('/preferences');
    return data;
  },

  setPreferences: async (preferences: UserPreferences) => {
    const { data } = await httpClient.post<UserPreferences>('/preferences', preferences);
    return data;
  },
};
