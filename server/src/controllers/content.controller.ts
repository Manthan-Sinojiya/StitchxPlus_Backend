import { Request, Response, NextFunction } from 'express';
import { PageModel, SiteContentModel, AuditLogModel } from '../models/index.js';
import { AppError } from '../utils/appError.js';
import { sanitizeRichText } from '../utils/sanitizeHtml.js';

// Default Fallback Data for Public API Readiness
const DEFAULT_HOME_CONTENT = {
  hero: {
    headline: 'Bespoke Tailoring Redefined',
    subtext: 'Master Italian wool craftsmanship, personalized to your exact physical pattern.',
    image: '/images/hero/suit1.jpg',
    ctaText: 'Design Your Custom Suit',
    ctaLink: '/customize',
  },
  featuredCollections: ['c1', 'c2', 'c3'],
  testimonials: [
    {
      id: 't1',
      author: 'Lord Charles Montagu',
      role: 'Diplomat & Patron',
      quote: 'The shoulder drape and Italian Vitale Barberis wool hand-feel are indistinguishable from Savile Row.',
      rating: 5,
    },
    {
      id: 't2',
      author: 'Julian Thorne',
      role: 'Executive Director',
      quote: 'Digital pattern measurement matched my exact jacket length on the very first try. Flawless fit.',
      rating: 5,
    },
  ],
  newsletter: {
    headline: 'Join the Stitchx Privé Circle',
    subtext: 'Receive private trunk show invitations and seasonal Italian fabric releases directly to your inbox.',
  },
};

const DEFAULT_NAV_CONTENT = [
  { id: 'n1', label: 'Collections', link: '/collections', sortOrder: 1 },
  { id: 'n2', label: 'Custom Studio', link: '/customize', sortOrder: 2 },
  { id: 'n3', label: 'About Atelier', link: '/page/about', sortOrder: 3 },
  { id: 'n4', label: 'FAQ', link: '/page/faq', sortOrder: 4 },
];

const DEFAULT_FOOTER_CONTENT = {
  columns: [
    {
      title: 'Bespoke Atelier',
      links: [
        { text: 'Custom Suits', url: '/collections' },
        { text: 'Measurement Guide', url: '/page/measurement-guide' },
        { text: '3D Suit Studio', url: '/customize' },
      ],
    },
    {
      title: 'Client Services',
      links: [
        { text: 'Shipping & Delivery', url: '/page/shipping' },
        { text: 'Returns & Alterations', url: '/page/returns' },
        { text: 'Frequently Asked Questions', url: '/page/faq' },
      ],
    },
    {
      title: 'Legal & Privacy',
      links: [
        { text: 'Privacy Policy', url: '/page/privacy-policy' },
        { text: 'Terms of Service', url: '/page/terms' },
      ],
    },
  ],
  socialLinks: {
    instagram: 'https://instagram.com/stitchxplus',
    facebook: 'https://facebook.com/stitchxplus',
    twitter: 'https://twitter.com/stitchxplus',
  },
  contact: {
    email: 'concierge@stitchxplus.com',
    phone: '+1 (800) 555-STITCH',
    address: '450 Lexington Avenue, Suite 2400, New York, NY 10017',
  },
};

const DEFAULT_ANNOUNCEMENT = {
  text: 'Complimentary Express International Shipping & Fitting Guarantee on all orders over $500',
  link: '/collections',
  isActive: true,
};

const DEFAULT_FAQ_CONTENT = [
  {
    id: 'f1',
    category: 'Fit & Measurements',
    question: 'How accurate is the digital pattern measurement system?',
    answer:
      'Our guided pattern engine achieves a 99.4% precise fit by matching 12 anatomical metrics against master tailoring formulas.',
    sortOrder: 1,
  },
  {
    id: 'f2',
    category: 'Shipping & Delivery',
    question: 'How long does bespoke tailoring and delivery take?',
    answer:
      'Each garment is hand-cut and tailored in 14-21 business days, followed by 2-3 day express DHL global delivery.',
    sortOrder: 2,
  },
];

const DEFAULT_SETTINGS = {
  siteName: 'Stitchx Plus LLC',
  logo: '/logo.svg',
  contactEmail: 'concierge@stitchxplus.com',
  contactPhone: '+1 (800) 555-STITCH',
  currency: 'USD',
  defaultSeoTitle: 'Stitchx Plus LLC — Master Bespoke Menswear & Custom Suits',
  defaultSeoDescription:
    'Experience digital bespoke menswear tailoring. Crafted from premier Italian wools to your exact physical pattern.',
};

// ============================================================================
// PUBLIC READ CONTROLLERS
// ============================================================================

export async function getPublicPageBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const page = await PageModel.findOne({ slug: slug.toLowerCase(), status: 'published' });

    if (!page) {
      return next(new AppError('Requested page not found or is currently unpublished', 404));
    }

    res.status(200).json({ status: 'success', data: { page } });
  } catch (error) {
    next(error);
  }
}

export async function getPublicHomeContent(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await SiteContentModel.findOne({ key: 'home', status: 'published' });
    const content = doc ? doc.data : DEFAULT_HOME_CONTENT;
    res.status(200).json({ status: 'success', data: { content } });
  } catch (error) {
    next(error);
  }
}

export async function getPublicNavContent(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await SiteContentModel.findOne({ key: 'nav', status: 'published' });
    const content = doc ? doc.data : DEFAULT_NAV_CONTENT;
    res.status(200).json({ status: 'success', data: { items: content } });
  } catch (error) {
    next(error);
  }
}

export async function getPublicFooterContent(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await SiteContentModel.findOne({ key: 'footer', status: 'published' });
    const content = doc ? doc.data : DEFAULT_FOOTER_CONTENT;
    res.status(200).json({ status: 'success', data: { content } });
  } catch (error) {
    next(error);
  }
}

export async function getPublicAnnouncementContent(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await SiteContentModel.findOne({ key: 'announcement', status: 'published' });
    const content = doc ? doc.data : DEFAULT_ANNOUNCEMENT;
    res.status(200).json({ status: 'success', data: { announcement: content } });
  } catch (error) {
    next(error);
  }
}

export async function getPublicSettingsContent(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await SiteContentModel.findOne({ key: 'settings', status: 'published' });
    const content = doc ? doc.data : DEFAULT_SETTINGS;
    res.status(200).json({ status: 'success', data: { settings: content } });
  } catch (error) {
    next(error);
  }
}

export async function getPublicFaqContent(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await SiteContentModel.findOne({ key: 'faq', status: 'published' });
    const content = doc ? doc.data : DEFAULT_FAQ_CONTENT;
    res.status(200).json({ status: 'success', data: { items: content } });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN CONTENT CONTROLLERS (PROTECTED)
// ============================================================================

export async function adminGetPages(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pages = await PageModel.find().sort({ updatedAt: -1 });
    res.status(200).json({ status: 'success', data: { pages } });
  } catch (error) {
    next(error);
  }
}

export async function adminGetPageById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const page = await PageModel.findById(id);
    if (!page) {
      return next(new AppError('Page not found', 404));
    }
    res.status(200).json({ status: 'success', data: { page } });
  } catch (error) {
    next(error);
  }
}

export async function adminCreatePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, slug, body, seo, status, selectedProducts } = req.body;
    if (!title || !slug) {
      return next(new AppError('Page title and slug are required', 400));
    }

    const sanitizedBody = sanitizeRichText(body || '');

    const page = await PageModel.create({
      title,
      slug: slug.toLowerCase().trim(),
      body: sanitizedBody,
      selectedProducts: Array.isArray(selectedProducts) ? selectedProducts : [],
      seo: seo || {},
      status: status || 'draft',
    });

    // Write Audit Log matching IAuditLogDocument
    await AuditLogModel.create({
      userId: req.user?.userId || 'admin-system',
      userEmail: 'admin@stitchxplus.com',
      userName: 'Admin User',
      action: 'PAGE_CREATE',
      entityType: 'Page',
      entityId: page.id,
      changes: { title, slug, status: page.status },
    });

    res.status(201).json({ status: 'success', data: { page } });
  } catch (error) {
    next(error);
  }
}

export async function adminUpdatePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const page = await PageModel.findById(id);

    if (!page) {
      return next(new AppError('Page not found', 404));
    }

    const { title, slug, body, seo, status, selectedProducts } = req.body;

    if (title) page.title = title;
    if (slug) page.slug = slug.toLowerCase().trim();
    if (body !== undefined) page.body = sanitizeRichText(body);
    if (selectedProducts !== undefined) page.selectedProducts = Array.isArray(selectedProducts) ? selectedProducts : [];
    if (seo) page.seo = { ...page.seo, ...seo };
    if (status) page.status = status;

    await page.save();

    // Write Audit Log matching IAuditLogDocument
    await AuditLogModel.create({
      userId: req.user?.userId || 'admin-system',
      userEmail: 'admin@stitchxplus.com',
      userName: 'Admin User',
      action: 'PAGE_UPDATE',
      entityType: 'Page',
      entityId: page.id,
      changes: { title: page.title, slug: page.slug, status: page.status },
    });

    res.status(200).json({ status: 'success', data: { page } });
  } catch (error) {
    next(error);
  }
}

export async function adminDeletePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const page = await PageModel.findByIdAndDelete(id);

    if (!page) {
      return next(new AppError('Page not found', 404));
    }

    // Write Audit Log matching IAuditLogDocument
    await AuditLogModel.create({
      userId: req.user?.userId || 'admin-system',
      userEmail: 'admin@stitchxplus.com',
      userName: 'Admin User',
      action: 'PAGE_DELETE',
      entityType: 'Page',
      entityId: id,
      changes: { title: page.title, slug: page.slug },
    });

    res.status(200).json({ status: 'success', message: 'Page deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function adminGetBlockContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { key } = req.params;
    let doc = await SiteContentModel.findOne({ key });

    if (!doc) {
      // Default initial seeds if block doesn't exist in database yet
      let defaultData: any = {};
      if (key === 'home') defaultData = DEFAULT_HOME_CONTENT;
      else if (key === 'nav') defaultData = DEFAULT_NAV_CONTENT;
      else if (key === 'footer') defaultData = DEFAULT_FOOTER_CONTENT;
      else if (key === 'announcement') defaultData = DEFAULT_ANNOUNCEMENT;
      else if (key === 'faq') defaultData = DEFAULT_FAQ_CONTENT;
      else if (key === 'settings') defaultData = DEFAULT_SETTINGS;

      doc = await SiteContentModel.create({ key, data: defaultData, status: 'published' });
    }

    res.status(200).json({ status: 'success', data: { block: doc } });
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateBlockContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { key } = req.params;
    const { data, status } = req.body;

    let doc = await SiteContentModel.findOne({ key });

    if (!doc) {
      doc = new SiteContentModel({ key, data, status: status || 'published' });
    } else {
      if (data) {
        doc.data = data;
        doc.markModified('data');
      }
      if (status) doc.status = status;
    }

    await doc.save();

    // Write Audit Log matching IAuditLogDocument
    await AuditLogModel.create({
      userId: req.user?.userId || 'admin-system',
      userEmail: 'admin@stitchxplus.com',
      userName: 'Admin User',
      action: 'SITE_CONTENT_UPDATE',
      entityType: 'SiteContent',
      entityId: doc.id,
      changes: { key, status: doc.status },
    });

    res.status(200).json({ status: 'success', data: { block: doc } });
  } catch (error) {
    next(error);
  }
}
