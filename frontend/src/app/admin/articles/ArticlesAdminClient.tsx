'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import httpClient from '@/lib/httpClient';
import { sourcesToOptions, categoriesToOptions } from '@/lib/utils/selectOptions';
import { formatDate } from '@/lib/utils/format';
import Link from 'next/link';
import ConfirmDialog from '@/components/ConfirmDialog';
import AlertDialog from '@/components/AlertDialog';
import Select from 'react-select';
import type { Article, PaginationMeta, Source, Category } from '@/types';

interface ArticlesData {
  articles: Article[];
  meta: PaginationMeta | null;
  sources: Source[];
  categories: Category[];
}

interface ArticleFilters {
  search?: string;
  source?: string;
  category?: string;
  page?: number;
}

interface ArticlesAdminClientProps {
  initialData: ArticlesData;
  initialFilters: ArticleFilters;
}

export default function ArticlesAdminClient({ initialData, initialFilters }: ArticlesAdminClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Local UI state
  const [searchInput, setSearchInput] = useState(initialFilters.search || '');
  const [selectedSource, setSelectedSource] = useState<string | null>(initialFilters.source || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialFilters.category || null);
  
  // Dialog states
  const [scrapeConfirmOpen, setScrapeConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);

  const sourceOptions = sourcesToOptions(initialData.sources);
  const categoryOptions = categoriesToOptions(initialData.categories);

  // Update URL params which triggers server-side refetch
  const updateFilters = (newFilters: Partial<ArticleFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    
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
    
    startTransition(() => {
      router.push(`/admin/articles?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handleSourceChange = (sourceId: string | null) => {
    setSelectedSource(sourceId);
    updateFilters({ source: sourceId || undefined });
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    updateFilters({ category: categoryId || undefined });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSelectedSource(null);
    setSelectedCategory(null);
    router.push('/admin/articles');
  };

  const openDeleteDialog = (articleId: number) => {
    setArticleToDelete(articleId);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;

    try {
      await httpClient.delete(`/articles/${articleToDelete}`);
      setAlertMessage('Article deleted successfully');
      setAlertOpen(true);
      setDeleteConfirmOpen(false);
      
      // Refresh the data
      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      setAlertMessage(error.response?.data?.message || 'Failed to delete article');
      setAlertOpen(true);
    } finally {
      setArticleToDelete(null);
    }
  };

  const triggerScrape = async () => {
    setIsScrapingLoading(true);
    try {
      await httpClient.post('/admin/scrape');
      setAlertMessage('Scraping started successfully. Articles will be available shortly.');
      setAlertOpen(true);
      setScrapeConfirmOpen(false);
      
      // Refresh the data after a delay
      setTimeout(() => {
        startTransition(() => {
          router.refresh();
        });
      }, 3000);
    } catch (error: any) {
      setAlertMessage(error.response?.data?.message || 'Failed to start scraping');
      setAlertOpen(true);
    } finally {
      setIsScrapingLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
            <p className="text-gray-600 mt-1">
              {initialData.meta ? `${initialData.meta.total} total articles` : 'Manage scraped articles'}
            </p>
          </div>
          <button
            onClick={() => setScrapeConfirmOpen(true)}
            disabled={isScrapingLoading || isPending}
            className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ${
              isScrapingLoading || isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isScrapingLoading ? 'Scraping...' : '🔄 Scrape Latest Articles'}
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex gap-4">
          <Select
            options={sourceOptions}
            value={sourceOptions.find(opt => opt.value === selectedSource) || null}
            onChange={(selected) => handleSourceChange(selected ? String(selected.value) : null)}
            placeholder="All Sources"
            className="flex-1 text-gray-900"
            classNamePrefix="select"
            isClearable
            isSearchable
            isDisabled={isPending}
          />

          <Select
            options={categoryOptions}
            value={categoryOptions.find(opt => opt.value === selectedCategory) || null}
            onChange={(selected) => handleCategoryChange(selected ? String(selected.value) : null)}
            placeholder="All Categories"
            className="flex-1 text-gray-900"
            classNamePrefix="select"
            isClearable
            isSearchable
            isDisabled={isPending}
          />

          <button
            onClick={clearFilters}
            disabled={isPending}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isPending && (
        <div className="text-center py-4 border-b border-gray-200">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {initialData.articles.length === 0 ? (
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
            onClick={() => setScrapeConfirmOpen(true)}
            disabled={isScrapingLoading || isPending}
            className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
              isScrapingLoading || isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isScrapingLoading ? 'Scraping...' : '🔄 Scrape Articles Now'}
          </button>
        </div>
      ) : (
        <>
          <div className="p-6" style={{ opacity: isPending ? 0.6 : 1 }}>
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
                  {initialData.articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {article.image_url && (
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-20 h-14 object-cover rounded shrink-0"
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
                                By {typeof article.author === 'string' ? article.author : article.author.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {typeof article.source === 'string' ? article.source : article.source?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof article.category === 'string' ? article.category : article.category?.name}
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
                        <span className="text-gray-300 mx-2">•</span>
                        <button
                          onClick={() => openDeleteDialog(Number(article.id))}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {initialData.meta && initialData.meta.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {initialData.meta.current_page} of {initialData.meta.last_page} ({initialData.meta.total} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, initialData.meta!.current_page - 1))}
                  disabled={initialData.meta.current_page === 1 || isPending}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(initialData.meta!.last_page, initialData.meta!.current_page + 1))}
                  disabled={initialData.meta.current_page === initialData.meta.last_page || isPending}
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
        isOpen={scrapeConfirmOpen}
        onClose={() => setScrapeConfirmOpen(false)}
        onConfirm={triggerScrape}
        title="Scrape Articles"
        message="This will trigger article scraping from all active sources. This may take a few moments. Continue?"
        confirmText="Start Scraping"
        cancelText="Cancel"
        isLoading={isScrapingLoading}
        variant="info"
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Article"
        message="Are you sure you want to delete this article? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <AlertDialog
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={alertMessage.includes('success') ? 'Success' : 'Info'}
        message={alertMessage}
        variant={alertMessage.includes('success') ? 'success' : 'info'}
      />
    </div>
  );
}
