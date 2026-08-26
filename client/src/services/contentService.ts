import { apiClient } from './apiClient';

export interface CMSHeroSlide {
  id?: string;
  subtitle?: string;
  title: string;
  subtext?: string;
  image: string;
  altText?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface CMSHero {
  headline?: string;
  subtext?: string;
  image?: string;
  altText?: string;
  ctaText?: string;
  ctaLink?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CMSTestimonial {
  id: string;
  author: string;
  role?: string;
  quote: string;
  rating?: number;
}

export interface CMSNewsletter {
  headline: string;
  subtext: string;
}

export interface CMSHomeData {
  hero: CMSHero;
  slides?: CMSHeroSlide[];
  featuredCollections?: string[];
  testimonials?: CMSTestimonial[];
  newsletter?: CMSNewsletter;
}

export interface CMSNavItem {
  id: string;
  label: string;
  link: string;
  sortOrder?: number;
  children?: { id: string; label: string; link: string }[];
}

export interface CMSFooterColumn {
  title: string;
  links: { text: string; url: string }[];
}

export interface CMSFooterData {
  columns: CMSFooterColumn[];
  socialLinks?: { instagram?: string; facebook?: string; twitter?: string; linkedin?: string };
  contact?: { email?: string; phone?: string; address?: string };
}

export interface CMSAnnouncement {
  text: string;
  link?: string;
  isActive: boolean;
}

export interface CMSFAQItem {
  id: string;
  category?: string;
  question: string;
  answer: string;
  sortOrder?: number;
}

export interface CMSPage {
  _id?: string;
  slug: string;
  title: string;
  body: string;
  selectedProducts?: string[];
  seo?: {
    title?: string;
    description?: string;
  };
  status: 'draft' | 'published';
  updatedAt?: string;
}

export const contentService = {
  // Public Read
  getHomeContent: async (): Promise<CMSHomeData> => {
    const res = await apiClient.get<any>('/content/home');
    const data = res.data?.content || res.data || {};
    return data;
  },

  getNavContent: async (): Promise<CMSNavItem[]> => {
    const res = await apiClient.get<any>('/content/nav');
    const items = res.data?.items || res.data || [];
    return Array.isArray(items) ? items : [];
  },

  getFooterContent: async (): Promise<CMSFooterData> => {
    const res = await apiClient.get<any>('/content/footer');
    const data = res.data?.content || res.data || {};
    return data;
  },

  getAnnouncementContent: async (): Promise<CMSAnnouncement> => {
    const res = await apiClient.get<any>('/content/announcement');
    const data = res.data?.announcement || res.data || { text: '', isActive: false };
    return data;
  },

  getFaqContent: async (): Promise<CMSFAQItem[]> => {
    const res = await apiClient.get<any>('/faq');
    const items = res.data?.items || res.data || [];
    return Array.isArray(items) ? items : [];
  },

  getPageBySlug: async (slug: string): Promise<CMSPage> => {
    const res = await apiClient.get<any>(`/pages/${slug}`);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Page not found');
    }
    return res.data?.page || res.data;
  },

  // Admin Write
  getBlockContent: async (key: string): Promise<any> => {
    const res = await apiClient.get<any>(`/admin/content/blocks/${key}`);
    if (res.data?.block?.data !== undefined) {
      return res.data.block.data;
    }
    return res.data?.data ?? res.data;
  },

  updateBlockContent: async (key: string, data: any): Promise<any> => {
    const res = await apiClient.put<any>(`/admin/content/blocks/${key}`, { data });
    return res.data;
  },

  getAdminPages: async (): Promise<CMSPage[]> => {
    const res = await apiClient.get<any>('/admin/content/pages');
    const pages = res.data?.pages || res.data || [];
    return Array.isArray(pages) ? pages : [];
  },

  createPage: async (pageData: Partial<CMSPage>): Promise<CMSPage> => {
    const res = await apiClient.post<any>('/admin/content/pages', pageData);
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed to create page');
    return res.data?.page || res.data;
  },

  updatePage: async (id: string, pageData: Partial<CMSPage>): Promise<CMSPage> => {
    const res = await apiClient.patch<any>(`/admin/content/pages/${id}`, pageData);
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Failed to update page');
    return res.data?.page || res.data;
  },

  deletePage: async (id: string): Promise<void> => {
    const res = await apiClient.delete<void>(`/admin/content/pages/${id}`);
    if (!res.success) throw new Error(res.error?.message || 'Failed to delete page');
  },
};
