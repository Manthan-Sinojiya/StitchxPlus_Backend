import { apiClient } from './apiClient';
import { CustomSection, HomeLayoutSection } from '@stitchx/shared';

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

export interface CMSCuratedItem {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
}

export interface CMSCuratedCollectionSection {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  items: CMSCuratedItem[];
}

export const DEFAULT_CURATED_COLLECTION: CMSCuratedCollectionSection = {
  title: 'Curated Collections For Style',
  subtitle: 'Thoughtfully designed fashion pieces defining modern elegance.',
  buttonText: 'Shop Collections',
  buttonLink: '/collections',
  items: [
    {
      id: 'curated_1',
      title: 'Fresh Seasonal Designs',
      description:
        'A carefully curated selection of timeless essentials designed for effortless daily styling, a refined look that seamlessly adapts to your everyday lifestyle.',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
      link: '/collections?category=new',
    },
    {
      id: 'curated_2',
      title: 'Sparkling Diamond Favorites',
      description:
        'Handcrafted luxury pieces with brilliant detailing, bringing a touch of sparkle and opulent craftsmanship to your wardrobe.',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
      link: '/collections?category=suits',
    },
    {
      id: 'curated_3',
      title: 'Bold Designs That Elevate Looks',
      description:
        'Contemporary silhouettes and tailored cuts crafted from premier Italian wool, engineered to make a bold statement at every occasion.',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
      link: '/collections?category=blazers',
    },
    {
      id: 'curated_4',
      title: 'Responsibly Made Conscious Fashion',
      description:
        'Sustainably sourced fabrics woven by heritage mills in Biella & Como, crafted with zero compromise on luxury or sustainability.',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80',
      link: '/collections?category=tuxedos',
    },
  ],
};

export interface CMSHomeData {
  hero: CMSHero;
  slides?: CMSHeroSlide[];
  featuredCollections?: string[];
  testimonials?: CMSTestimonial[];
  newsletter?: CMSNewsletter;
  curatedCollection?: CMSCuratedCollectionSection;
}

export interface CMSNavSubItem {
  id?: string;
  label: string;
  link: string;
  badge?: string;
  badgeColor?: string;
}

export interface CMSNavColumn {
  id?: string;
  title: string;
  links: CMSNavSubItem[];
}

export interface CMSNavItem {
  id: string;
  label: string;
  link: string;
  sortOrder?: number;
  isMegaMenu?: boolean;
  megaImage?: string;
  megaImageTitle?: string;
  megaImageLink?: string;
  columns?: CMSNavColumn[];
  children?: CMSNavSubItem[];
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

export const DEFAULT_FAQ_ITEMS: CMSFAQItem[] = [
  {
    id: 'faq-1',
    question: 'How accurate is the digital pattern measurement system?',
    answer: 'Our digital fit algorithm asks 6 key physical metrics and calculates over 30 micro-body variables with 99.4% tailor accuracy.',
    sortOrder: 1,
  },
  {
    id: 'faq-2',
    question: 'How long does bespoke tailoring and delivery take?',
    answer: 'Standard bespoke tailoring takes 2-3 weeks from digital order confirmation to your doorstep. Expedited 10-day atelier rush delivery is available.',
    sortOrder: 2,
  },
  {
    id: 'faq-3',
    question: 'What fabrics do you source?',
    answer: 'We exclusively partner with heritage mills in Biella and Como, Italy including Loro Piana, Vitale Barberis Canonico, and Dormeuil.',
    sortOrder: 3,
  },
  {
    id: 'faq-4',
    question: 'What if my suit needs minor adjustments?',
    answer: 'We cover up to $75 in local tailoring credits or provide a complete free remake if your garment falls outside our Fit Guarantee.',
    sortOrder: 4,
  },
];

export const DEFAULT_TESTIMONIALS: CMSTestimonial[] = [
  {
    id: 't-1',
    author: 'Alexander V.',
    role: 'Managing Partner, Financial Advisory',
    quote: 'The digital fit algorithm was impeccably accurate. The Italian wool double-breasted suit fits better than my $4,000 Savile Row custom suit.',
    rating: 5,
  },
  {
    id: 't-2',
    author: 'Julian M.',
    role: 'Architect & Design Principal',
    quote: 'Unrivaled tailoring precision. The jacket drape, sleeve length, and fabric hand feel are world class. Stitchx Plus is now my exclusive tailor.',
    rating: 5,
  },
];

export const DEFAULT_CUSTOM_SECTIONS: CustomSection[] = [
  { id: 'sec-new', name: 'New Arrivals', code: 'new', badgeText: 'New', isBuiltin: true, isActive: true, sortOrder: 1 },
  { id: 'sec-bestsellers', name: 'Best Sellers', code: 'bestsellers', badgeText: 'Top Choice', isBuiltin: true, isActive: true, sortOrder: 2 },
  { id: 'sec-sale', name: 'On Sale', code: 'sale', badgeText: 'Sale', isBuiltin: true, isActive: true, sortOrder: 3 },
  { id: 'sec-deals', name: 'Special Deals', code: 'deals', badgeText: 'Special', isBuiltin: true, isActive: true, sortOrder: 4 },
  { id: 'sec-diwali', name: 'Diwali Sale', code: 'diwali_sale', badgeText: 'Diwali Special', description: 'Festive promotional offers & discounts', badgeColor: 'amber', isBuiltin: false, isActive: true, sortOrder: 5 },
  { id: 'sec-summer', name: 'Summer Luxury', code: 'summer_luxury', badgeText: 'Summer Edition', description: 'Lightweight linen & silk bespoke suits', badgeColor: 'blue', isBuiltin: false, isActive: true, sortOrder: 6 },
];

export const DEFAULT_HOME_LAYOUT_SECTIONS: HomeLayoutSection[] = [
  { id: 'sec_hero', type: 'hero', title: 'Immersive Full-Bleed Hero Slider', subtitle: 'Hero Banner', isActive: true, sortOrder: 1 },
  { id: 'sec_showcase', type: 'showcase_tabs', title: 'Dynamic Product Showcase Tabs', subtitle: 'New Arrivals, Best Sellers, Custom Sections', isActive: true, sortOrder: 2 },
  { id: 'sec_categories', type: 'categories', title: 'Signature Menswear Categories', subtitle: 'Curated Apparel Grids', isActive: true, sortOrder: 3 },
  { id: 'sec_curated', type: 'curated_collections' as any, title: 'Curated Collections For Style', subtitle: 'Interactive Accordion & Dynamic Image Gallery', isActive: true, sortOrder: 4 },
  { id: 'sec_faq', type: 'faq', title: 'Tailoring Process & FAQ', subtitle: 'Frequently Asked Questions', isActive: true, sortOrder: 5 },
  { id: 'sec_testimonials', type: 'testimonials', title: 'Words From Our Bespoke Clientele', subtitle: 'Client Reviews', isActive: true, sortOrder: 6 },
];

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
    let items: CMSFAQItem[] = [];
    try {
      const res = await apiClient.get<any>('/faq');
      if (res.data?.items && Array.isArray(res.data.items) && res.data.items.length > 0) {
        items = res.data.items;
      }
    } catch (_e) {}
    if (items.length === 0) {
      try {
        const block = await contentService.getBlockContent('faq_items');
        if (Array.isArray(block) && block.length > 0) {
          items = block;
        }
      } catch (_e) {}
    }
    if (items.length === 0) {
      const saved = localStorage.getItem('stitchx_faq_items');
      if (saved) {
        try {
          items = JSON.parse(saved);
        } catch (_e) {}
      }
    }
    if (!items || items.length === 0) {
      items = DEFAULT_FAQ_ITEMS;
    }
    localStorage.setItem('stitchx_faq_items', JSON.stringify(items));
    return items;
  },

  saveFaqContent: async (items: CMSFAQItem[]): Promise<void> => {
    const ordered = items.map((it, idx) => ({ ...it, sortOrder: idx + 1 }));
    localStorage.setItem('stitchx_faq_items', JSON.stringify(ordered));
    try {
      await contentService.updateBlockContent('faq_items', ordered);
    } catch (_e) {}
    window.dispatchEvent(new CustomEvent('cms-faq-updated'));
  },

  getTestimonialsContent: async (): Promise<CMSTestimonial[]> => {
    let items: CMSTestimonial[] = [];
    try {
      const block = await contentService.getBlockContent('testimonials_items');
      if (Array.isArray(block) && block.length > 0) {
        items = block;
      }
    } catch (_e) {}
    if (items.length === 0) {
      const saved = localStorage.getItem('stitchx_testimonials_items');
      if (saved) {
        try {
          items = JSON.parse(saved);
        } catch (_e) {}
      }
    }
    if (!items || items.length === 0) {
      items = DEFAULT_TESTIMONIALS;
    }
    localStorage.setItem('stitchx_testimonials_items', JSON.stringify(items));
    return items;
  },

  saveTestimonialsContent: async (items: CMSTestimonial[]): Promise<void> => {
    localStorage.setItem('stitchx_testimonials_items', JSON.stringify(items));
    try {
      await contentService.updateBlockContent('testimonials_items', items);
    } catch (_e) {}
    window.dispatchEvent(new CustomEvent('cms-testimonials-updated'));
  },

  getPageBySlug: async (slug: string): Promise<CMSPage> => {
    const res = await apiClient.get<any>(`/pages/${slug}`);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Page not found');
    }
    return res.data?.page || res.data;
  },

  getCuratedCollectionContent: async (): Promise<CMSCuratedCollectionSection> => {
    let data: CMSCuratedCollectionSection | null = null;
    try {
      const block = await contentService.getBlockContent('curated_collections');
      if (block && block.title && Array.isArray(block.items)) {
        data = block;
      }
    } catch (_e) {}
    if (!data) {
      const saved = localStorage.getItem('stitchx_curated_collections');
      if (saved) {
        try {
          data = JSON.parse(saved);
        } catch (_e) {}
      }
    }
    if (!data || !data.items || data.items.length === 0) {
      data = DEFAULT_CURATED_COLLECTION;
    }
    localStorage.setItem('stitchx_curated_collections', JSON.stringify(data));
    return data;
  },

  saveCuratedCollectionContent: async (data: CMSCuratedCollectionSection): Promise<void> => {
    localStorage.setItem('stitchx_curated_collections', JSON.stringify(data));
    try {
      await contentService.updateBlockContent('curated_collections', data);
    } catch (_e) {}
    window.dispatchEvent(new CustomEvent('curated-collections-updated'));
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

  getCustomSections: async (): Promise<CustomSection[]> => {
    let sections: CustomSection[] = [];
    try {
      const data = await contentService.getBlockContent('custom_publication_sections');
      if (Array.isArray(data) && data.length > 0) {
        sections = data;
      }
    } catch (_e) {}
    if (sections.length === 0) {
      const saved = localStorage.getItem('stitchx_custom_sections');
      if (saved) {
        try {
          sections = JSON.parse(saved);
        } catch (_e) {}
      }
    }
    if (!sections || sections.length === 0) {
      sections = DEFAULT_CUSTOM_SECTIONS;
    }
    sections = sections
      .map((sec, idx) => ({
        ...sec,
        sortOrder: typeof sec.sortOrder === 'number' ? sec.sortOrder : idx + 1,
      }))
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    localStorage.setItem('stitchx_custom_sections', JSON.stringify(sections));
    return sections;
  },

  saveCustomSections: async (sections: CustomSection[]): Promise<void> => {
    const ordered = sections.map((sec, idx) => ({ ...sec, sortOrder: idx + 1 }));
    localStorage.setItem('stitchx_custom_sections', JSON.stringify(ordered));
    try {
      await contentService.updateBlockContent('custom_publication_sections', ordered);
    } catch (_e) {}
    window.dispatchEvent(new CustomEvent('custom-sections-updated'));
  },

  getHomeLayout: async (): Promise<HomeLayoutSection[]> => {
    let sections: HomeLayoutSection[] = [];
    try {
      const data = await contentService.getBlockContent('home_layout_sections');
      if (Array.isArray(data) && data.length > 0) {
        sections = data;
      }
    } catch (_e) {}
    if (sections.length === 0) {
      const saved = localStorage.getItem('stitchx_home_layout_sections');
      if (saved) {
        try {
          sections = JSON.parse(saved);
        } catch (_e) {}
      }
    }
    if (!sections || sections.length === 0) {
      sections = [...DEFAULT_HOME_LAYOUT_SECTIONS];
    }

    // Filter out newsletter section as requested by user
    sections = sections.filter((s) => s.type !== 'newsletter');

    // Ensure all default section types (such as curated_collections) are included if missing from old saved state
    for (const defSec of DEFAULT_HOME_LAYOUT_SECTIONS) {
      if (defSec.type === 'newsletter') continue;
      const exists = sections.some((s) => s.type === defSec.type || s.id === defSec.id);
      if (!exists) {
        sections.push(defSec);
      }
    }

    sections = sections
      .map((sec, idx) => ({
        ...sec,
        sortOrder: typeof sec.sortOrder === 'number' ? sec.sortOrder : idx + 1,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    localStorage.setItem('stitchx_home_layout_sections', JSON.stringify(sections));
    return sections;
  },

  saveHomeLayout: async (sections: HomeLayoutSection[]): Promise<void> => {
    const ordered = sections.filter((sec) => sec.type !== 'newsletter').map((sec, idx) => ({ ...sec, sortOrder: idx + 1 }));
    localStorage.setItem('stitchx_home_layout_sections', JSON.stringify(ordered));
    try {
      await contentService.updateBlockContent('home_layout_sections', ordered);
    } catch (_e) {}
    window.dispatchEvent(new CustomEvent('home-layout-updated'));
  },
};
