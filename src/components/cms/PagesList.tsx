import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { pagesService, type Page } from '@/services/pages.service';
import { toast } from 'react-hot-toast';

export default function PagesList() {
  const [items, setItems] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await pagesService.getAll();
      setItems(data);
    } catch (error: any) {
      toast.error(error.message || 'Errore nel caricamento delle pagine');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa pagina?')) return;

    try {
      await pagesService.delete(slug);
      toast.success('Pagina eliminata');
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
        <h1 className="text-3xl font-bold text-gray-900">Pagine</h1>
        <Link
          to="/pages/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nuova
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {items.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              Nessuna pagina
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
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/pages/${item.slug}`}
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
