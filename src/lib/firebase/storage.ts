import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
  getMetadata,
  UploadMetadata,
} from 'firebase/storage';
import { storage } from './config';

export interface StorageFile {
  name: string;
  fullPath: string;
  url: string;
  size: number;
  contentType: string;
  updated: Date;
  folder?: string;
}

export const uploadFile = async (
  file: File,
  path: string,
  metadata?: UploadMetadata
): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file, metadata);
  return await getDownloadURL(snapshot.ref);
};

export const uploadMultipleFiles = async (
  files: File[],
  basePath: string = ''
): Promise<string[]> => {
  const uploadPromises = files.map((file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = basePath ? `${basePath}/${fileName}` : fileName;
    return uploadFile(file, filePath);
  });
  return Promise.all(uploadPromises);
};

export const listFiles = async (
  folder: string = '',
  maxResults: number = 100
): Promise<StorageFile[]> => {
  const folderRef = ref(storage, folder);
  const result = await listAll(folderRef);
  
  const files: StorageFile[] = [];
  
  // Process files in current folder
  for (const itemRef of result.items) {
    try {
      const url = await getDownloadURL(itemRef);
      const metadata = await getMetadata(itemRef);
      const pathParts = itemRef.fullPath.split('/');
      const folderName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : undefined;
      
      files.push({
        name: itemRef.name,
        fullPath: itemRef.fullPath,
        url,
        size: metadata.size,
        contentType: metadata.contentType || 'application/octet-stream',
        updated: new Date(metadata.updated),
        folder: folderName,
      });
    } catch (error) {
      console.error(`Error processing file ${itemRef.name}:`, error);
    }
  }
  
  // Recursively process subfolders
  for (const prefixRef of result.prefixes) {
    const subFiles = await listFiles(prefixRef.fullPath, maxResults);
    files.push(...subFiles);
  }
  
  return files.slice(0, maxResults);
};

export const deleteFile = async (fullPath: string): Promise<void> => {
  const fileRef = ref(storage, fullPath);
  await deleteObject(fileRef);
};

export const getFileUrl = async (path: string): Promise<string> => {
  const fileRef = ref(storage, path);
  return await getDownloadURL(fileRef);
};
