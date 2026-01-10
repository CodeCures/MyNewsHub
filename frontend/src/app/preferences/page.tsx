'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, usePreferencesStore } from '@/store';
import httpClient from '@/lib/httpClient';
import Select from 'react-select';
import Loading from '@/components/Loading';
import ErrorAlert from '@/components/ErrorAlert';
import type { Source, Category, SelectOption } from '@/types';

export default function Preferences() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { preferences, isLoading, error, fetchPreferences, updatePreferences } = usePreferencesStore();
  
  const [formData, setFormData] = useState({
    preferred_sources: [] as number[],
    preferred_categories: [] as number[],
    preferred_authors: [] as string[],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  
  const [isLoadingSources, setIsLoadingSources] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchPreferences();
    fetchSources();
    fetchCategories();
    fetchAuthors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchSources = async () => {
    try {
      setIsLoadingSources(true);
      const response = await httpClient.get('/admin/sources');
      setSources(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch sources', err);
    } finally {
      setIsLoadingSources(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await httpClient.get('/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      setIsLoadingAuthors(true);
      const response = await httpClient.get('/authors');
      setAuthors(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch authors', err);
    } finally {
      setIsLoadingAuthors(false);
    }
  };

  useEffect(() => {
    if (preferences) {
      setFormData({
        preferred_sources: preferences.preferred_sources || [],
        preferred_categories: preferences.preferred_categories || [],
        preferred_authors: preferences.preferred_authors || [],
      });
    }
  }, [preferences]);

  // Convert data to react-select options
  const categoryOptions: SelectOption[] = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }));

  const sourceOptions: SelectOption[] = sources.map(src => ({
    value: src.id,
    label: src.name,
  }));

  const authorOptions: SelectOption[] = authors.map(author => ({
    value: author,
    label: author,
  }));

  // Get selected values for react-select
  const selectedCategories = categoryOptions.filter(opt => 
    formData.preferred_categories.includes(opt.value as number)
  );

  const selectedSources = sourceOptions.filter(opt => 
    formData.preferred_sources.includes(opt.value as number)
  );

  const selectedAuthors = authorOptions.filter(opt => 
    formData.preferred_authors.includes(opt.value as string)
  );

  const handleCategoryChange = (selected: readonly SelectOption[]) => {
    setFormData(prev => ({
      ...prev,
      preferred_categories: selected.map(opt => opt.value as number),
    }));
  };

  const handleSourceChange = (selected: readonly SelectOption[]) => {
    setFormData(prev => ({
      ...prev,
      preferred_sources: selected.map(opt => opt.value as number),
    }));
  };

  const handleAuthorChange = (selected: readonly SelectOption[]) => {
    setFormData(prev => ({
      ...prev,
      preferred_authors: selected.map(opt => opt.value as string),
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferred Sources</h2>
          <Select
            isMulti
            options={sourceOptions}
            value={selectedSources}
            onChange={(selected) => handleSourceChange(selected as SelectOption[])}
            placeholder="Search and select sources..."
            className="text-gray-900"
            classNamePrefix="select"
            isClearable
            isSearchable
            isLoading={isLoadingSources}
            noOptionsMessage={() => isLoadingSources ? 'Loading...' : 'No options'}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferred Categories</h2>
          <Select
            isMulti
            options={categoryOptions}
            value={selectedCategories}
            onChange={(selected) => handleCategoryChange(selected as SelectOption[])}
            placeholder="Search and select categories..."
            className="text-gray-900"
            classNamePrefix="select"
            isClearable
            isSearchable
            isLoading={isLoadingCategories}
            noOptionsMessage={() => isLoadingCategories ? 'Loading...' : 'No options'}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferred Authors</h2>
          <Select
            isMulti
            options={authorOptions}
            value={selectedAuthors}
            onChange={(selected) => handleAuthorChange(selected as SelectOption[])}
            placeholder="Search and select authors..."
            className="text-gray-900"
            classNamePrefix="select"
            isClearable
            isSearchable
            isLoading={isLoadingAuthors}
            noOptionsMessage={() => isLoadingAuthors ? 'Loading...' : 'No options'}
          />
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
