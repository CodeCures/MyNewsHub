import { useState, useEffect, useCallback } from 'react';
import { useAuthenticatedHttpClient } from '@/hooks/useAuthenticatedHttpClient';
import httpClient from '@/lib/httpClient';
import type { Article, PaginationMeta, Source, Category } from '@/types';
import { useDebouncedValue } from '@/utils/debounce';

interface UseArticlesOptions {
  endpoint?: string;
  autoFetch?: boolean;
  enableFilters?: boolean;
  enableScraping?: boolean;
  enableDelete?: boolean;
  requireAuth?: boolean; // New flag to determine if auth is required
}

interface ArticleFilters {
  search?: string;
  source?: string;
  category?: string;
  author?: string;
  page?: number;
}

export function useArticles(options: UseArticlesOptions = {}) {
  const {
    endpoint = '/articles',
    autoFetch = true,
    enableFilters = true,
    enableScraping = false,
    enableDelete = false,
    requireAuth = false, // Default to false for public pages
  } = options;

  // Only use auth hook if required
  const auth = requireAuth ? useAuthenticatedHttpClient() : { isLoading: false, isAuthenticated: true };
  const { isLoading: authLoading, isAuthenticated } = auth;

  // Data states
  const [articles, setArticles] = useState<Article[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  
  // Filter options
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);

  // Admin-specific states
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [scrapeConfirmOpen, setScrapeConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  // Use debounced value for search
  const debouncedSearch = useDebouncedValue(search, 500);

  // Fetch articles when filters change
  useEffect(() => {
    if (autoFetch && !authLoading && isAuthenticated) {
      fetchArticlesData();
    }
  }, [currentPage, debouncedSearch, selectedSource, selectedCategory, selectedAuthor, endpoint, authLoading, isAuthenticated]);

  // Load filter options
  useEffect(() => {
    if (enableFilters && requireAuth && !authLoading && isAuthenticated) {
      loadFilterOptions();
    }
  }, [enableFilters, requireAuth, authLoading, isAuthenticated]);

  const loadFilterOptions = async () => {
    try {
      const { sourceService } = await import('@/services/sourceService');
      const { categoryService } = await import('@/services/categoryService');
      const { authorService } = await import('@/services/authorService');
      
      const [sources, categories, authors] = await Promise.all([
        sourceService.getAll(),
        categoryService.getAll(),
        authorService.getAll(),
      ]);
      
      setSources(sources);
      setCategories(categories);
      setAuthors(authors);
    } catch (err) {
      console.error('Failed to fetch filter options', err);
    }
  };

  const fetchArticlesData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: ArticleFilters = { page: currentPage };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedSource) params.source = selectedSource;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedAuthor) params.author = selectedAuthor;

      const response = await httpClient.get(endpoint, { params });
      
      setArticles(response.data.data || []);
      setMeta(response.data.meta || null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch articles';
      setError(errorMessage);
      setArticles([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerScrape = async () => {
    if (!enableScraping) return;
    
    setScrapeConfirmOpen(false);
    setIsScrapingLoading(true);
    setError(null);

    try {
      await httpClient.post('/admin/scrape/articles');
      
      setAlertMessage('Articles are being scraped. Please wait...');
      setAlertOpen(true);
      
      setTimeout(() => {
        fetchArticlesData();
      }, 5000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to trigger scraping';
      setAlertMessage(errorMessage);
      setAlertOpen(true);
    } finally {
      setIsScrapingLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!enableDelete || !deleteTarget) return;

    try {
      await httpClient.delete(`/admin/articles/${deleteTarget}`);
      setAlertMessage('Article deleted successfully');
      setAlertOpen(true);
      fetchArticlesData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete article';
      setAlertMessage(errorMessage);
      setAlertOpen(true);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const clearFilters = useCallback(() => {
    setSearch('');
    setSelectedSource('');
    setSelectedCategory('');
    setSelectedAuthor('');
    setCurrentPage(1);
  }, []);

  const openDeleteDialog = useCallback((id: number) => {
    setDeleteTarget(id);
    setDeleteConfirmOpen(true);
  }, []);

  const refetch = useCallback(() => {
    fetchArticlesData();
  }, [currentPage, debouncedSearch, selectedSource, selectedCategory, selectedAuthor, endpoint]);

  return {
    // Data
    articles,
    meta,
    isLoading,
    error,
    
    // Filters
    currentPage,
    search,
    selectedSource,
    selectedCategory,
    selectedAuthor,
    sources,
    categories,
    authors,
    
    // Admin-specific
    isScrapingLoading,
    alertOpen,
    alertMessage,
    deleteConfirmOpen,
    scrapeConfirmOpen,
    
    // Setters
    setCurrentPage,
    setSearch,
    setSelectedSource,
    setSelectedCategory,
    setSelectedAuthor,
    setAlertOpen,
    setDeleteConfirmOpen,
    setScrapeConfirmOpen,
    
    // Actions
    triggerScrape,
    handleDelete,
    clearFilters,
    openDeleteDialog,
    refetch,
  };
}
