export interface User {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  roles?: string[];
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string | number;
  name: string;
  slug: string;
  url?: string;
  is_active?: boolean;
  api_key?: string | null;
  configuration?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string | number;
  name: string;
  slug: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string | number;
  source_id?: string;
  source_name?: string;
  source?: Source;
  title: string;
  description: string;
  content?: string;
  author: Author | string | null;
  url: string;
  image_url: string | null;
  published_at: string;
  category: Category | string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
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

export interface SelectOption {
  value: number | string;
  label: string;
}

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface SourceFormData {
  name: string;
  slug: string;
  url: string;
  api_key: string;
  is_active: boolean;
  articles_path: string;
  query_params: KeyValuePair[];
  field_map: KeyValuePair[];
}
