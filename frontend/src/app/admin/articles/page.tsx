'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import axios from 'axios';
import { format } from 'date-fns';
import Link from 'next/link';
import ConfirmDialog from '@/components/ConfirmDialog';
import AlertDialog from '@/components/AlertDialog';

interface Source {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  image_url: string | null;
  published_at: string;
  source: Source;
  author: string | null;
  category: Category | null;
  created_at: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function ArticlesAdminPage() {
  const { token } = useAuthStore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    variant: 'success' as 'success' | 'error' | 'info',
  });

  useEffect(() => {
    if (token) {
      fetchArticles(currentPage);
    }
  }, [currentPage, token]);

  const fetchArticles = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles?page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setArticles(response.data.data || []);
      setMeta(response.data.meta || null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch articles';
      setError(errorMessage);
      setArticles([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerScrape = async () => {
    setShowConfirmDialog(false);
    setIsScrapingLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/scrape`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setAlertConfig({
        title: 'Success',
        message: response.data.message || 'Articles are being scraped. Please wait...',
        variant: 'success',
      });
      setShowAlertDialog(true);
      
      setTimeout(() => {
        fetchArticles(currentPage);
      }, 5000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to trigger scraping';
      setAlertConfig({
        title: 'Error',
        message: errorMessage,
        variant: 'error',
      });
      setShowAlertDialog(true);
    } finally {
      setIsScrapingLoading(false);
    }
  };

  const getSourceName = (source: Source): string => {
    return source?.name || 'Unknown';
  };

  const getCategoryName = (category: Category | null): string => {
    return category?.name || '-';
  };

  const formatDate = (dateString: string): string => {
    try {
      const cleanDate = dateString.replace(/\.\d{6}Z$/, 'Z');
      return format(new Date(cleanDate), 'MMM d, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
          <p className="text-gray-600 mt-1">
            {meta ? `${meta.total} total articles` : 'Manage scraped articles'}
          </p>
        </div>
        <button
          onClick={() => setShowConfirmDialog(true)}
          disabled={isScrapingLoading}
          className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ${
            isScrapingLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isScrapingLoading ? 'Scraping...' : '🔄 Scrape Latest Articles'}
        </button>
      </div>

      {error && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {articles.length === 0 && !isLoading ? (
        <div className="p-12 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-600 mb-6">
            No articles have been scraped yet. Click the button below to fetch the latest articles.
          </p>
          <button
            onClick={() => setShowConfirmDialog(true)}
            disabled={isScrapingLoading}
            className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
              isScrapingLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isScrapingLoading ? 'Scraping...' : '🔄 Scrape Articles Now'}
          </button>
        </div>
      ) : (
        <>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Article
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {article.image_url && (
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-20 h-14 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {article.title}
                            </div>
                            {article.description && (
                              <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                                {article.description}
                              </div>
                            )}
                            {article.author && (
                              <div className="text-xs text-gray-400 mt-1">
                                By {article.author}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getSourceName(article.source)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getCategoryName(article.category)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(article.published_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/articles/${article.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          target="_blank"
                        >
                          View
                        </Link>
                        <span className="text-gray-300 mx-2">•</span>
                        <a
                          href={article.url}
                          className="text-gray-600 hover:text-gray-900"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Source
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {meta.current_page} of {meta.last_page} ({meta.total} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={meta.current_page === 1 || isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={meta.current_page === meta.last_page || isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={triggerScrape}
        title="Scrape Articles"
        message="This will trigger article scraping from all active sources. This may take a few moments. Continue?"
        confirmText="Start Scraping"
        cancelText="Cancel"
        isLoading={isScrapingLoading}
        variant="info"
      />

      <AlertDialog
        isOpen={showAlertDialog}
        onClose={() => setShowAlertDialog(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        variant={alertConfig.variant}
      />
    </div>
  );
}
