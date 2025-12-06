import { useState, useEffect } from 'react';
import { linksService, type SocialLinks } from '@/services/links.service';
import { toast } from 'react-hot-toast';

export default function SocialLinksManager() {
  const [links, setLinks] = useState<SocialLinks>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const data = await linksService.getSocialLinks();
      setLinks(data);
    } catch (error: any) {
      toast.error(error.message || 'Errore nel caricamento dei link social');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await linksService.updateSocialLinks(links);
      toast.success('Link social aggiornati con successo');
    } catch (error: any) {
      toast.error(error.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Link Social</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram URL
            </label>
            <input
              type="url"
              value={links.instagram || ''}
              onChange={(e) => setLinks((prev) => ({ ...prev, instagram: e.target.value }))}
              placeholder="https://instagram.com/username"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              URL completo del profilo Instagram (es: https://instagram.com/username)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={links.linkedin || ''}
              onChange={(e) => setLinks((prev) => ({ ...prev, linkedin: e.target.value }))}
              placeholder="https://linkedin.com/in/username"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              URL completo del profilo LinkedIn (es: https://linkedin.com/in/username)
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={loadLinks}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </form>
    </div>
  );
}
