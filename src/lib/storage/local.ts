import { promises as fs } from 'fs';
import path from 'path';
import { getCorsHeaders } from '../api/cors';

const STORAGE_PATH = process.env.STORAGE_PATH || './storage';

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_PATH, { recursive: true });
  } catch (error) {
    console.error('Error creating storage directory:', error);
    throw error;
  }
}

export async function saveFile(file: File, folder: string = ''): Promise<{ name: string; fullPath: string; url: string; size: number; contentType: string }> {
  await ensureStorageDir();
  
  const fileName = `${Date.now()}-${file.name}`;
  const folderPath = folder ? path.join(STORAGE_PATH, folder) : STORAGE_PATH;
  await fs.mkdir(folderPath, { recursive: true });
  
  const filePath = path.join(folderPath, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  
  const fullPath = folder ? `${folder}/${fileName}` : fileName;
  const url = `/api/image/${fullPath}`;
  
  return {
    name: file.name,
    fullPath,
    url,
    size: file.size,
    contentType: file.type || 'application/octet-stream',
  };
}

export async function listFiles(folder: string = '', maxResults: number = 1000): Promise<Array<{ name: string; fullPath: string; url: string; size: number; contentType: string; updated: Date; folder?: string }>> {
  await ensureStorageDir();
  
  const folderPath = folder ? path.join(STORAGE_PATH, folder) : STORAGE_PATH;
  
  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    const files: Array<{ name: string; fullPath: string; url: string; size: number; contentType: string; updated: Date; folder?: string }> = [];
    
    for (const entry of entries.slice(0, maxResults)) {
      if (entry.isFile()) {
        const filePath = path.join(folderPath, entry.name);
        const stats = await fs.stat(filePath);
        const fullPath = folder ? `${folder}/${entry.name}` : entry.name;
        const url = `/api/image/${fullPath}`;
        
        // Try to determine content type from extension
        const ext = path.extname(entry.name).toLowerCase();
        const contentTypeMap: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.pdf': 'application/pdf',
        };
        const contentType = contentTypeMap[ext] || 'application/octet-stream';
        
        files.push({
          name: entry.name,
          fullPath,
          url,
          size: stats.size,
          contentType,
          updated: stats.mtime,
          folder: folder || undefined,
        });
      }
    }
    
    return files.sort((a, b) => b.updated.getTime() - a.updated.getTime());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function deleteFile(fullPath: string): Promise<void> {
  const filePath = path.join(STORAGE_PATH, fullPath);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function getFile(fullPath: string): Promise<{ buffer: Buffer; contentType: string; size: number } | null> {
  const filePath = path.join(STORAGE_PATH, fullPath);
  try {
    const buffer = await fs.readFile(filePath);
    const stats = await fs.stat(filePath);
    
    // Try to determine content type from extension
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    return {
      buffer,
      contentType,
      size: stats.size,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

