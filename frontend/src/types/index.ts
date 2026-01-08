export interface User {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  source_id: string;
  source_name: string;
  title: string;
  description: string;
  content: string;
  author: string | null;
  url: string;
  image_url: string | null;
  published_at: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserPreferences {
  preferred_sources: string[];
  preferred_categories: string[];
  preferred_authors: string[];
}

export interface ArticleFilters {
  search?: string;
  category?: string;
  source?: string;
  author?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}
