import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getDocument,
  createDocument,
  updateDocument,
  checkSlugExists,
  pagesCollection,
} from '@/lib/firebase/firestore';
import { generateSlug, isValidSlug } from '@/lib/utils/slug';
import { toast } from 'react-hot-toast';
import MarkdownEditor from './MarkdownEditor';
import { FirestoreEntity, Timestamp } from '@/lib/firebase/firestore';

export default function PagesForm() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditing = !!slug;

  const [formData, setFormData] = useState<Partial<FirestoreEntity>>({
    title: '',
    slug: '',
    body: '',
    published: false,
    seoTitle: '',
    seoDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [slugError, setSlugError] = useState('');
  const [checkingSlug, setCheckingSlug] = useState(false);

  useEffect(() => {
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

  const loadItem = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const item = await getDocument<FirestoreEntity>(pagesCollection, slug);
      if (item) {
        setFormData(item);
      } else {
        toast.error('Pagina non trovata');
        navigate('/vgadm/pages');
      }
    } catch (error: any) {
      toast.error('Errore nel caricamento');
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
      const exists = await checkSlugExists(
        pagesCollection,
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
      const now = Timestamp.now();
      const data: Partial<FirestoreEntity> = {
        ...formData,
        updatedAt: now,
        publishedAt: formData.published
          ? formData.publishedAt || now
          : null,
      };

      if (isEditing) {
        await updateDocument(pagesCollection, slug!, data);
        toast.success('Pagina aggiornata');
      } else {
        await createDocument(pagesCollection, {
          ...data,
          slug: formData.slug,
        } as any);
        toast.success('Pagina creata');
      }
      navigate('/vgadm/pages');
    } catch (error: any) {
      toast.error('Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
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
        {isEditing ? 'Modifica Pagina' : 'Nuova Pagina'}
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
                URL: /{formData.slug}
              </p>
            )}
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
            onClick={() => navigate('/vgadm/pages')}
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
