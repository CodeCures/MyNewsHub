'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import axios from 'axios';
import ConfirmDialog from '@/components/ConfirmDialog';
import AlertDialog from '@/components/AlertDialog';

interface Source {
  id: string;
  name: string;
  slug: string;
  url: string;
  is_active: boolean;
  api_key: string | null;
  configuration: any;
  created_at: string;
  updated_at: string;
}

interface KeyValuePair {
  key: string;
  value: string;
}

interface SourceFormData {
  name: string;
  slug: string;
  url: string;
  api_key: string;
  is_active: boolean;
  articles_path: string;
  query_params: KeyValuePair[];
  field_map: KeyValuePair[];
}

export default function SourcesAdminPage() {
  const { token } = useAuthStore();
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<SourceFormData>({
    name: '',
    slug: '',
    url: '',
    api_key: '',
    is_active: true,
    configuration: '{}',
  });

  // Dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    variant: 'success' as 'success' | 'error' | 'info',
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/sources`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSources(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sources');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSource(null);
    setFormData({
      name: '',
      slug: '',
      url: '',
      api_key: '',
      is_active: true,
      articles_path: 'articles',
      query_params: [{ key: '', value: '' }],
      field_map: [
        { key: 'url', value: '' },
        { key: 'title', value: '' },
        { key: 'content', value: '' },
        { key: 'published_at', value: '' },
      ],
    });
    setShowModal(true);
  };

  const openEditModal = (source: Source) => {
    setEditingSource(source);
    
    const config = source.configuration || {};
    const fieldMap = config.field_map || {};
    const queryParams = config.query_params || {};
    
    // Convert field_map object to array of key-value pairs
    const fieldMapArray = Object.entries(fieldMap).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    
    // Convert query_params object to array of key-value pairs
    const queryParamsArray = Object.entries(queryParams).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    
    setFormData({
      name: source.name,
      slug: source.slug,
      url: source.url,
      api_key: source.api_key || '',
      is_active: source.is_active,
      articles_path: config.articles_path || 'articles',
      query_params: queryParamsArray.length > 0 ? queryParamsArray : [{ key: '', value: '' }],
      field_map: fieldMapArray.length > 0 ? fieldMapArray : [{ key: 'url', value: '' }],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Convert arrays to objects
      const queryParams: any = {};
      formData.query_params.forEach(pair => {
        if (pair.key && pair.value) {
          queryParams[pair.key] = pair.value;
        }
      });

      const fieldMap: any = {};
      formData.field_map.forEach(pair => {
        if (pair.key && pair.value) {
          fieldMap[pair.key] = pair.value;
        }
      });

      const config = {
        field_map: fieldMap,
        query_params: queryParams,
        articles_path: formData.articles_path,
      };

      const payload = {
        name: formData.name,
        slug: formData.slug,
        url: formData.url,
        api_key: formData.api_key || null,
        is_active: formData.is_active,
        configuration: config,
      };

      if (editingSource) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/sources/${editingSource.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/sources`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowModal(false);
      await fetchSources();
    } catch (err: any) {
      setError(err.message || 'Failed to save source');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSourceStatus = async (id: string, currentStatus: boolean) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/sources/${id}`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchSources();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update source');
    }
  };

  const deleteSource = async () => {
    if (!sourceToDelete) return;
    
    setShowDeleteConfirm(false);

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/sources/${sourceToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setAlertConfig({
        title: 'Success',
        message: 'Source deleted successfully',
        variant: 'success',
      });
      setShowAlert(true);
      
      await fetchSources();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete source');
      setAlertConfig({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to delete source',
        variant: 'error',
      });
      setShowAlert(true);
    } finally {
      setSourceToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setSourceToDelete(id);
    setShowDeleteConfirm(true);
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading sources...</div>;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">News Sources</h2>
            <p className="text-gray-600 mt-1">Manage data sources for article scraping</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add New Source
          </button>
        </div>

        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="p-6">
          <div className="space-y-4">
            {sources.map((source) => (
              <div
                key={source.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{source.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          source.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {source.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{source.url}</p>
                    <div className="text-sm text-gray-500">
                      <p>Slug: {source.slug}</p>
                      <p>API Key: {source.api_key ? '••••••••' : 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(source)}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleSourceStatus(source.id, source.is_active)}
                      className={`px-4 py-2 rounded-lg transition ${
                        source.is_active
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {source.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteSource(source.id)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {sources.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No sources configured. Click "Add New Source" to get started.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingSource ? 'Edit Source' : 'Add New Source'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="NewsAPI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="newsapi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="https://api.example.com/v1/news"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="text"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Optional API key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Articles Path *
                </label>
                <input
                  type="text"
                  required
                  value={formData.articles_path}
                  onChange={(e) => setFormData({ ...formData, articles_path: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="articles or response.docs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Path to articles array in API response (e.g., "articles", "response.docs")
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-900">Query Parameters</h4>
                  <button
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      query_params: [...formData.query_params, { key: '', value: '' }] 
                    })}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Parameter
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.query_params.map((param, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => {
                          const newParams = [...formData.query_params];
                          newParams[index].key = e.target.value;
                          setFormData({ ...formData, query_params: newParams });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="Parameter name (e.g., page)"
                      />
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => {
                          const newParams = [...formData.query_params];
                          newParams[index].value = e.target.value;
                          setFormData({ ...formData, query_params: newParams });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="Value (e.g., 1, {api_key})"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newParams = formData.query_params.filter((_, i) => i !== index);
                          setFormData({ ...formData, query_params: newParams });
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Use {'{'}api_key{'}'} as placeholder for the API key field value
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">Field Mapping</h4>
                    <p className="text-sm text-gray-600">
                      Map API response fields to database fields
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      field_map: [...formData.field_map, { key: '', value: '' }] 
                    })}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Field
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-gray-600 mb-1">
                    <div>Database Field</div>
                    <div>API Response Field</div>
                    <div className="w-10"></div>
                  </div>
                  {formData.field_map.map((field, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => {
                          const newFields = [...formData.field_map];
                          newFields[index].key = e.target.value;
                          setFormData({ ...formData, field_map: newFields });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="url, title, content..."
                      />
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => {
                          const newFields = [...formData.field_map];
                          newFields[index].value = e.target.value;
                          setFormData({ ...formData, field_map: newFields });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="web_url, headline.main..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newFields = formData.field_map.filter((_, i) => i !== index);
                          setFormData({ ...formData, field_map: newFields });
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active (enable scraping for this source)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingSource ? 'Update Source' : 'Create Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSourceToDelete(null);
        }}
        onConfirm={deleteSource}
        title="Delete Source"
        message="Are you sure you want to delete this source? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        variant={alertConfig.variant}
      />
    </>
  );
}
