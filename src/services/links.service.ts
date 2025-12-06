import { api } from './api';

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  [key: string]: string | undefined;
}

class LinksService {
  async getSocialLinks(): Promise<SocialLinks> {
    return api.get<SocialLinks>('/links/socials');
  }

  async updateSocialLinks(links: Partial<SocialLinks>): Promise<{ message: string }> {
    return api.put<{ message: string }>('/links/socials-update', links);
  }
}

export const linksService = new LinksService();
