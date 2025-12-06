import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { blogService, blogCategoryService, type BlogPost, type BlogCategory } from '@/services/blog.service';
import { generateSlug, isValidSlug } from '@/lib/utils/slug';
import { toast } from 'react-hot-toast';
import MarkdownEditor from './MarkdownEditor';

export default function BlogForm() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditing = !!slug;

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    body: '',
    published: false,
    featuredImage: '',
    categories: [],
    tags: [],
    seoTitle: '',
    seoDescription: '',
  });
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [slugError, setSlugError] = useState('');
  const [checkingSlug, setCheckingSlug] = useState(false);

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadItem();
    }
  }, [slug]);

  useEffect(() => {
    if (!isEditing && formData.title && !formData.slug) {
      const generatedSlug = generateSlug(formData.title);
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, isEditing]);

  useEffect(() => {
    if (formData.slug) {
      validateSlug();
    }
  }, [formData.slug]);

  const loadCategories = async () => {
    try {
      const data = await blogCategoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadItem = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const item = await blogService.getPostBySlug(slug);
      setFormData(item);
    } catch (error: any) {
      toast.error(error.message || 'Articolo non trovato');
      navigate('/blog');
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

    setCheckingSlug(true);
    try {
      const exists = await blogService.checkSlugExists(
        formData.slug,
        isEditing ? slug : undefined
      );
      if (exists) {
        setSlugError('Questo slug è già in uso');
      } else {
        setSlugError('');
      }
    } catch (error) {
      setSlugError('Errore nella validazione dello slug');
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (slugError || !formData.slug || !formData.title || !formData.body) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await blogService.updatePost(slug!, formData);
        toast.success('Articolo aggiornato');
      } else {
        await blogService.createPost({
          ...formData,
          slug: formData.slug!,
        } as BlogPost);
        toast.success('Articolo creato');
      }
      navigate('/blog');
    } catch (error: any) {
      toast.error(error.message || 'Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categorySlug: string) => {
    const current = formData.categories || [];
    const updated = current.includes(categorySlug)
      ? current.filter((c) => c !== categorySlug)
      : [...current, categorySlug];
    setFormData((prev) => ({ ...prev, categories: updated }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map((t) => t.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, tags }));
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Modifica Articolo' : 'Nuovo Articolo'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Titolo *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
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
            {checkingSlug && (
              <p className="mt-1 text-sm text-gray-500">Verifica in corso...</p>
            )}
            {slugError && (
              <p className="mt-1 text-sm text-red-600">{slugError}</p>
            )}
            {formData.slug && !slugError && (
              <p className="mt-1 text-sm text-gray-500">
                URL: /blog/{formData.slug}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Immagine principale
            </label>
            <input
              type="url"
              value={formData.featuredImage || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  featuredImage: e.target.value,
                }))
              }
              placeholder="https://..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categorie
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => toggleCategory(cat.slug)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.categories?.includes(cat.slug)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tag (separati da virgola)
            </label>
            <input
              type="text"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="design, web, portfolio"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contenuto *
            </label>
            <MarkdownEditor
              value={formData.body || ''}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, body: value }))
              }
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, published: e.target.checked }))
              }
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
              Pubblicato
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              SEO Title
            </label>
            <input
              type="text"
              value={formData.seoTitle || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              SEO Description
            </label>
            <textarea
              value={formData.seoDescription || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seoDescription: e.target.value,
                }))
              }
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/vgadm/blog')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={loading || !!slugError}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </form>
    </div>
  );
}
