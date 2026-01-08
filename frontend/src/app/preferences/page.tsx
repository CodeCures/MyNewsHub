'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, usePreferencesStore } from '@/store';

export default function Preferences() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { preferences, isLoading, error, fetchPreferences, updatePreferences } = usePreferencesStore();
  
  const [formData, setFormData] = useState({
    preferred_sources: [] as string[],
    preferred_categories: [] as string[],
    preferred_authors: [] as string[],
  });
  const [sourceInput, setSourceInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const categories = ['Technology', 'Business', 'Sports', 'Entertainment', 'Health', 'Science', 'General'];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchPreferences();
  }, [isAuthenticated, router, fetchPreferences]);

  useEffect(() => {
    if (preferences) {
      setFormData({
        preferred_sources: preferences.preferred_sources || [],
        preferred_categories: preferences.preferred_categories || [],
        preferred_authors: preferences.preferred_authors || [],
      });
    }
  }, [preferences]);

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_categories: prev.preferred_categories.includes(category)
        ? prev.preferred_categories.filter((c) => c !== category)
        : [...prev.preferred_categories, category],
    }));
  };

  const addSource = () => {
    if (sourceInput.trim() && !formData.preferred_sources.includes(sourceInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        preferred_sources: [...prev.preferred_sources, sourceInput.trim()],
      }));
      setSourceInput('');
    }
  };

  const removeSource = (source: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_sources: prev.preferred_sources.filter((s) => s !== source),
    }));
  };

  const addAuthor = () => {
    if (authorInput.trim() && !formData.preferred_authors.includes(authorInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        preferred_authors: [...prev.preferred_authors, authorInput.trim()],
      }));
      setAuthorInput('');
    }
  };

  const removeAuthor = (author: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_authors: prev.preferred_authors.filter((a) => a !== author),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    try {
      await updatePreferences(formData);
      setSuccessMessage('Preferences saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Preferences</h1>
        <p className="text-gray-600">Customize your news feed by selecting your preferred sources, categories, and authors</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferred Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  formData.preferred_categories.includes(category)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferred Sources</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={sourceInput}
              onChange={(e) => setSourceInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSource())}
              placeholder="Enter source name (e.g., BBC News)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addSource}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.preferred_sources.map((source) => (
              <div
                key={source}
                className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
              >
                <span>{source}</span>
                <button
                  type="button"
                  onClick={() => removeSource(source)}
                  className="hover:text-blue-900"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferred Authors</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAuthor())}
              placeholder="Enter author name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addAuthor}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.preferred_authors.map((author) => (
              <div
                key={author}
                className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full"
              >
                <span>{author}</span>
                <button
                  type="button"
                  onClick={() => removeAuthor(author)}
                  className="hover:text-green-900"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/my-feeds')}
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            View My Feed
          </button>
        </div>
      </form>
    </div>
  );
}
