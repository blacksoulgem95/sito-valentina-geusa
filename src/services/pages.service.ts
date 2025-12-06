import { api } from './api';

export interface Page {
  slug: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt?: Date | null;
  updatedAt: Date;
  seoTitle?: string;
  seoDescription?: string;
}

class PagesService {
  async getAll(published?: boolean): Promise<Page[]> {
    const query = published !== undefined ? `?published=${published}` : '';
    return api.get<Page[]>(`/pages${query}`);
  }

  async getBySlug(slug: string): Promise<Page> {
    return api.get<Page>(`/pages/${slug}`);
  }

  async create(page: Omit<Page, 'updatedAt'>): Promise<{ slug: string; message: string }> {
    return api.post<{ slug: string; message: string }>('/pages', page);
  }

  async update(slug: string, data: Partial<Page>): Promise<{ slug: string; message: string }> {
    return api.put<{ slug: string; message: string }>(`/pages/${slug}`, data);
  }

  async delete(slug: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/pages/${slug}`);
  }

  async checkSlugExists(slug: string, excludeSlug?: string): Promise<boolean> {
    try {
      const page = await this.getBySlug(slug);
      return excludeSlug ? page.slug !== excludeSlug : true;
    } catch {
      return false;
    }
  }
}

export const pagesService = new PagesService();
