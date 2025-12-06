import { useState, useEffect, useRef } from 'react';
import {
  CloudArrowUpIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { listFiles, deleteFile, uploadMultipleFiles, StorageFile } from '@/lib/firebase/storage';
import { toast } from 'react-hot-toast';

export default function FilesManager() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [folders, setFolders] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [folderInput, setFolderInput] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    filterFiles();
  }, [files, searchQuery, selectedFolder]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const allFiles = await listFiles('', 500);
      setFiles(allFiles);
      
      const uniqueFolders = Array.from(
        new Set(allFiles.map((f) => f.folder).filter(Boolean))
      ) as string[];
      setFolders(uniqueFolders);
    } catch (error: any) {
      toast.error('Errore nel caricamento dei file');
    } finally {
      setLoading(false);
    }
  };

  const filterFiles = () => {
    let filtered = files;

    if (selectedFolder !== 'all') {
      filtered = filtered.filter((f) => f.folder === selectedFolder);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.fullPath.toLowerCase().includes(query)
      );
    }

    setFilteredFiles(filtered);
  };

  const handleUpload = async (filesToUpload: FileList | null) => {
    if (!filesToUpload || filesToUpload.length === 0) return;

    setUploading(true);
    try {
      const fileArray = Array.from(filesToUpload);
      const basePath = folderInput.trim() ? folderInput.trim() : '';
      await uploadMultipleFiles(fileArray, basePath);
      toast.success(`${fileArray.length} file caricati con successo`);
      setFolderInput('');
      loadFiles();
    } catch (error: any) {
      toast.error('Errore durante il caricamento');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: StorageFile) => {
    if (!confirm(`Sei sicuro di voler eliminare ${file.name}?`)) return;

    try {
      await deleteFile(file.fullPath);
      toast.success('File eliminato');
      loadFiles();
    } catch (error: any) {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiato negli appunti');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestione File</h1>

      {/* Upload Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Carica File</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cartella (opzionale, es: "blog", "portfolio")
          </label>
          <input
            type="text"
            value={folderInput}
            onChange={(e) => setFolderInput(e.target.value)}
            placeholder="blog"
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
            >
              <CloudArrowUpIcon className="w-5 h-5 mr-2" />
              Seleziona file
            </label>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
              disabled={uploading}
            />
            <p className="mt-2 text-sm text-gray-600">
              o trascina i file qui
            </p>
          </div>
          {uploading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Caricamento in corso...</p>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="all">Tutte le cartelle</option>
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nessun file trovato
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredFiles.map((file) => (
              <div
                key={file.fullPath}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {file.contentType.startsWith('image/') ? (
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <DocumentDuplicateIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </h3>
                  {file.folder && (
                    <p className="text-xs text-gray-500 mt-1">
                      {file.folder}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(file.size)}
                  </p>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => copyUrl(file.url)}
                      className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                      Copia URL
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
