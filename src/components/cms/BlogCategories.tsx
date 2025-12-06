import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  checkSlugExists,
  blogCategoriesCollection,
} from '@/lib/firebase/firestore';
import { generateSlug, isValidSlug } from '@/lib/utils/slug';
import { toast } from 'react-hot-toast';

interface Category {
  slug: string;
  name: string;
}

export default function BlogCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (formData.name && !editingCategory) {
      const generatedSlug = generateSlug(formData.name);
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, editingCategory]);

  useEffect(() => {
    if (formData.slug) {
      validateSlug();
    }
  }, [formData.slug]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getDocuments<Category>(blogCategoriesCollection, []);
      setCategories(data);
    } catch (error: any) {
      toast.error('Errore nel caricamento delle categorie');
    } finally {
      setLoading(false);
    }
  };

  const validateSlug = async () => {
    if (!formData.slug) {
      setSlugError('');
      return;
    }

    if (!isValidSlug(formData.slug)) {
      setSlugError('Lo slug può contenere solo lettere minuscole, numeri e trattini');
      return;
    }

    try {
      const exists = await checkSlugExists(
        blogCategoriesCollection,
        formData.slug,
        editingCategory?.slug
      );
      if (exists) {
        setSlugError('Questo slug è già in uso');
      } else {
        setSlugError('');
      }
    } catch (error) {
      setSlugError('Errore nella validazione dello slug');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slugError || !formData.name || !formData.slug) {
      toast.error('Compila tutti i campi');
      return;
    }

    try {
      if (editingCategory) {
        await updateDocument(blogCategoriesCollection, editingCategory.slug, formData);
        toast.success('Categoria aggiornata');
      } else {
        await createDocument(blogCategoriesCollection, {
          ...formData,
          slug: formData.slug,
        } as any);
        toast.success('Categoria creata');
      }
      resetForm();
      loadCategories();
    } catch (error: any) {
      toast.error('Errore durante il salvataggio');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug });
    setShowForm(true);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa categoria?')) return;

    try {
      await deleteDocument(blogCategoriesCollection, slug);
      toast.success('Categoria eliminata');
      loadCategories();
    } catch (error: any) {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '' });
    setEditingCategory(null);
    setShowForm(false);
    setSlugError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Categorie Blog</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nuova Categoria
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {editingCategory ? 'Modifica Categoria' : 'Nuova Categoria'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    slug: generateSlug(e.target.value),
                  }))
                }
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 ${
                  slugError
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-pink-500'
                }`}
                required
              />
              {slugError && (
                <p className="mt-1 text-sm text-red-600">{slugError}</p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={!!slugError}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
              >
                Salva
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {categories.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              Nessuna categoria
            </li>
          ) : (
            categories.map((category) => (
              <li key={category.slug}>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {category.name}
                    </p>
                    <p className="text-sm text-gray-500">{category.slug}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.slug)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
