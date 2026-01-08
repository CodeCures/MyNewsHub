'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useArticlesStore } from '@/store';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import Loading from '@/components/Loading';
import ErrorAlert from '@/components/ErrorAlert';
import EmptyState from '@/components/EmptyState';

export default function MyFeeds() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { personalizedFeed, paginationData, isLoading, error, fetchPersonalizedFeed } = useArticlesStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchPersonalizedFeed(page);
  }, [page, isAuthenticated, router, fetchPersonalizedFeed]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={() => fetchPersonalizedFeed(page)} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Personalized Feed</h1>
        <p className="text-gray-600">Articles tailored to your preferences and interests</p>
      </div>

      {isLoading ? (
        <Loading />
      ) : personalizedFeed.length === 0 ? (
        <EmptyState
          title="No Personalized Articles Yet"
          message="Set your preferences to get personalized news recommendations."
          actionLabel="Set Preferences"
          onAction={() => router.push('/preferences')}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalizedFeed.map((article) => (
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
