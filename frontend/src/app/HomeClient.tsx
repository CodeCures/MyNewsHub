'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import type { Article, PaginationMeta } from '@/types';

interface ArticlesData {
  articles: Article[];
  meta: PaginationMeta | null;
}

interface ArticleFilters {
  search?: string;
  source?: number;
  category?: number;
  page?: number;
}

interface HomeClientProps {
  initialData: ArticlesData;
  initialFilters: ArticleFilters;
}

export default function HomeClient({ initialData, initialFilters }: HomeClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Local UI state
  const [searchInput, setSearchInput] = useState(initialFilters.search || '');

  // Update URL params which triggers server-side refetch
  const updateFilters = (newFilters: Partial<ArticleFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove each filter
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    
    // Reset to page 1 when filters change (unless it's a page change)
    if (!('page' in newFilters)) {
      params.delete('page');
    }
    
    // Navigate with new params (server component will refetch)
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchInput('');
    router.push('/');
  };



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest News</h1>
        <p className="text-gray-600">Stay updated with the latest news from around the world</p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4 bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            disabled={isPending}
          >
            Search
          </button>
        </form>

        {initialFilters.search && (
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 transition"
              disabled={isPending}
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Loading indicator during transition */}
      {isPending && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Articles Grid */}
      {initialData.articles.length === 0 ? (
        <EmptyState
          title="No Articles Found"
          message="No articles match your current filters."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ opacity: isPending ? 0.6 : 1 }}>
            {initialData.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {initialData.meta && initialData.meta.last_page > 1 && (
            <Pagination
              currentPage={initialData.meta.current_page}
              lastPage={initialData.meta.last_page}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
