'use client';

import { useState, FormEvent, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticatedHttpClient } from '@/hooks/useAuthenticatedHttpClient';
import { sourcesToOptions, categoriesToOptions, stringsToOptions } from '@/lib/utils/selectOptions';
import { sourceService } from '@/services/sourceService';
import { categoryService } from '@/services/categoryService';
import { authorService } from '@/services/authorService';
import Select from 'react-select';
import type { Source, Category, SelectOption, UserPreferences } from '@/types';

interface PreferencesData {
  preferences: UserPreferences | null;
  sources: Source[];
  categories: Category[];
  authors: string[];
}

export default function PreferencesClient() {
  const router = useRouter();
  const { httpClient, isLoading: isAuthLoading } = useAuthenticatedHttpClient();
  const [isPending, startTransition] = useTransition();
  
  // Data state - all fetched client-side once
  const [data, setData] = useState<PreferencesData>({
    preferences: null,
    sources: [],
    categories: [],
    authors: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    preferred_sources: [],
    preferred_categories: [],
    preferred_authors: [],
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch all data once on mount
  useEffect(() => {
    if (!httpClient || isAuthLoading) return;
    
    async function loadData() {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const [preferencesRes, sources, categories, authors] = await Promise.all([
          httpClient.get('/preferences'),
          sourceService.getAll(),
          categoryService.getAll(),
          authorService.getAll(),
        ]);
        
        const preferences = preferencesRes.data?.data || preferencesRes.data || null;
        
        setData({ preferences, sources, categories, authors });
        
        // Set form data from loaded preferences
        if (preferences) {
          setFormData({
            preferred_sources: preferences.preferred_sources || [],
            preferred_categories: preferences.preferred_categories || [],
            preferred_authors: preferences.preferred_authors || [],
          });
        }
      } catch (error) {
        console.error('Failed to load preferences data:', error);
        setErrorMessage('Failed to load preferences data');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [httpClient, isAuthLoading]);

  // Generate select options
  const sourceOptions = sourcesToOptions(data.sources);
  const categoryOptions = categoriesToOptions(data.categories);
  const authorOptions = stringsToOptions(data.authors);

  // Get selected values for react-select - compare with normalization
  const selectedSources = sourceOptions.filter(opt => 
    formData.preferred_sources.some(id => String(id) === String(opt.value))
  );

  const selectedCategories = categoryOptions.filter(opt => 
    formData.preferred_categories.some(id => String(id) === String(opt.value))
  );

  const selectedAuthors = authorOptions.filter(opt => 
    formData.preferred_authors.includes(String(opt.value))
  );

  const handleSourceChange = (selected: readonly SelectOption[]) => {
    setFormData(prev => ({
      ...prev,
      preferred_sources: selected.map(opt => String(opt.value)),
    }));
  };

  const handleCategoryChange = (selected: readonly SelectOption[]) => {
    setFormData(prev => ({
      ...prev,
      preferred_categories: selected.map(opt => String(opt.value)),
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
    setErrorMessage('');

    try {
      await httpClient.put('/preferences', formData);
      setSuccessMessage('Preferences saved successfully!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to save preferences');
      console.error('Failed to save preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      ) : (
        <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Preferences</h1>
        <p className="text-gray-600">Customize your news feed by selecting your preferred sources, categories, and authors</p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{errorMessage}</p>
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
            isDisabled={isSaving || isPending}
            noOptionsMessage={() => 'No options'}
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
            isDisabled={isSaving || isPending}
            noOptionsMessage={() => 'No options'}
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
            isDisabled={isSaving || isPending}
            noOptionsMessage={() => 'No options'}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSaving || isPending}
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
    </>\n    )}\n    </div>
  );
}
