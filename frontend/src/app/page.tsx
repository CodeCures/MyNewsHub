'use client';

import { useEffect, useState } from 'react';
import { useArticlesStore } from '@/store';
import { ArticleFilters } from '@/types';
import ArticleCard from '@/components/ArticleCard';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import Pagination from '@/components/Pagination';
import Loading from '@/components/Loading';
import ErrorAlert from '@/components/ErrorAlert';
import EmptyState from '@/components/EmptyState';

export default function Home() {
  const { articles, paginationData, isLoading, error, fetchArticles } = useArticlesStore();
  const [filters, setFilters] = useState<ArticleFilters>({
    page: 1,
    per_page: 12,
  });

  useEffect(() => {
    fetchArticles(filters);
  }, [filters, fetchArticles]);

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search, page: 1 });
  };

  const handleCategoryChange = (category: string) => {
    setFilters({ ...filters, category: category || undefined, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <ErrorAlert 
        message={error} 
        onRetry={() => fetchArticles(filters)} 
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Latest News</h1>
        <p className="text-gray-600">Stay informed with the latest headlines from around the world</p>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="mb-8">
        <CategoryFilter 
          selectedCategory={filters.category || ''} 
          onCategoryChange={handleCategoryChange} 
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : articles.length === 0 ? (
        <EmptyState
          title="No Articles Found"
          message="Try adjusting your search or filters to find what you're looking for."
          actionLabel="Clear Filters"
          onAction={() => setFilters({ page: 1, per_page: 12 })}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {paginationData && (
            <Pagination
              currentPage={paginationData.current_page}
              lastPage={paginationData.last_page}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
