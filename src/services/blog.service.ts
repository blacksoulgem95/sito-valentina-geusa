import { api } from './api';

export interface BlogPost {
  slug: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt?: Date | null;
  updatedAt: Date;
  featuredImage?: string;
  categories?: string[];
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface BlogCategory {
  slug: string;
  name: string;
}

class BlogService {
  async getAllPosts(published?: boolean): Promise<BlogPost[]> {
    const query = published !== undefined ? `?published=${published}` : '';
    return api.get<BlogPost[]>(`/blog${query}`);
  }

  async getPostBySlug(slug: string): Promise<BlogPost> {
    return api.get<BlogPost>(`/blog/${slug}`);
  }

  async createPost(post: Omit<BlogPost, 'updatedAt'>): Promise<{ slug: string; message: string }> {
    return api.post<{ slug: string; message: string }>('/blog', post);
  }

  async updatePost(slug: string, data: Partial<BlogPost>): Promise<{ slug: string; message: string }> {
    return api.put<{ slug: string; message: string }>(`/blog/${slug}`, data);
  }

  async deletePost(slug: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/blog/${slug}`);
  }

  async checkSlugExists(slug: string, excludeSlug?: string): Promise<boolean> {
    try {
      const post = await this.getPostBySlug(slug);
      return excludeSlug ? post.slug !== excludeSlug : true;
    } catch {
      return false;
    }
  }
}

class BlogCategoryService {
  async getAll(): Promise<BlogCategory[]> {
    return api.get<BlogCategory[]>('/blog-categories');
  }

  async create(category: BlogCategory): Promise<{ slug: string; message: string }> {
    return api.post<{ slug: string; message: string }>('/blog-categories', category);
  }

  async update(slug: string, data: Partial<BlogCategory>): Promise<{ slug: string; message: string }> {
    return api.put<{ slug: string; message: string }>(`/blog-categories/${slug}`, data);
  }

  async delete(slug: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/blog-categories/${slug}`);
  }
}

export const blogService = new BlogService();
export const blogCategoryService = new BlogCategoryService();
