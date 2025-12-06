import { api } from './api';

export interface StorageFile {
  name: string;
  fullPath: string;
  url: string;
  size: number;
  contentType: string;
  updated: Date;
  folder?: string;
}

class StorageService {
  async listFiles(folder?: string, maxResults?: number): Promise<StorageFile[]> {
    const params = new URLSearchParams();
    if (folder) params.append('folder', folder);
    if (maxResults) params.append('maxResults', maxResults.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<StorageFile[]>(`/storage/list${query}`);
  }

  async uploadFiles(files: File[], folder?: string): Promise<{ files: StorageFile[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folder) {
      formData.append('folder', folder);
    }

    return api.postFormData<{ files: StorageFile[] }>('/storage/upload', formData);
  }

  async deleteFile(fullPath: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>('/storage/delete', { fullPath });
  }
}

export const storageService = new StorageService();
