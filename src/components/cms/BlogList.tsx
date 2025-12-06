import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { blogService, type BlogPost } from '@/services/blog.service';
import { toast } from 'react-hot-toast';

export default function BlogList() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await blogService.getAllPosts();
      setItems(data);
    } catch (error: any) {
      toast.error(error.message || 'Errore nel caricamento del blog');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo articolo?')) return;

    try {
      await blogService.deletePost(slug);
      toast.success('Articolo eliminato');
      loadItems();
    } catch (error: any) {
      toast.error(error.message || 'Errore durante l\'eliminazione');
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
        <div className="flex space-x-3">
          <Link
            to="blog/categories"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Categorie
          </Link>
          <Link
            to="blog/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nuovo
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {items.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              Nessun articolo nel blog
            </li>
          ) : (
            items.map((item) => (
              <li key={item.slug}>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {item.title}
                      </p>
                      {!item.published && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Bozza
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">/{item.slug}</p>
                    {item.categories && item.categories.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.categories.map((cat) => (
                          <span
                            key={cat}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`blog/${item.slug}`}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(item.slug)}
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
