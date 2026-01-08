'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useArticlesStore } from '@/store';
import { format } from 'date-fns';
import Loading from '@/components/Loading';
import ErrorAlert from '@/components/ErrorAlert';

export default function ArticleDetail() {
  const params = useParams();
  const router = useRouter();
  const { currentArticle, isLoading, error, fetchArticle } = useArticlesStore();
  const articleId = params.id as string;

  useEffect(() => {
    if (articleId) {
      fetchArticle(parseInt(articleId));
    }
  }, [articleId, fetchArticle]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={() => fetchArticle(parseInt(articleId))} />;
  }

  if (!currentArticle) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to articles
      </button>

      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        {currentArticle.image_url && (
          <div className="relative h-96 w-full">
            <img
              src={currentArticle.image_url}
              alt={currentArticle.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {currentArticle.category}
            </span>
            <span className="text-gray-600 text-sm">{currentArticle.source}</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {currentArticle.title}
          </h1>

          <div className="flex items-center gap-4 text-gray-600 text-sm mb-6 pb-6 border-b">
            {currentArticle.author && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{currentArticle.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{format(new Date(currentArticle.published_at), 'MMMM d, yyyy')}</span>
            </div>
          </div>

          {currentArticle.description && (
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
              {currentArticle.description}
            </p>
          )}

          {currentArticle.content && (
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {currentArticle.content}
              </p>
            </div>
          )}

          {currentArticle.url && (
            <a
              href={currentArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Read Original Article
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </article>
    </div>
  );
}
