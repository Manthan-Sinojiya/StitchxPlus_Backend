import { useState, useEffect } from 'react';
import {
  contentService,
  CMSNavItem,
  CMSFooterData,
  CMSAnnouncement,
  CMSHomeData,
  CMSPage,
  CMSCuratedCollectionSection,
  CMSCuratedItem,
  CMSFAQItem,
  CMSTestimonial,
  DEFAULT_CURATED_COLLECTION,
} from '../../services/contentService';
import { adminService } from '../../services/adminService';
import { Product, CustomSection, HomeLayoutSection } from '@stitchx/shared';
import {
  Card,
  Button,
  Input,
  Tabs,
  Modal,
  ImageUploader,
  useToast,
  Pagination,
  RichTextEditor,
} from '../../components/ui';
import {
  FileText,
  Navigation,
  Globe,
  Bell,
  Home,
  Plus,
  Trash2,
  Edit2,
  Save,
  Layers,
  Sparkles,
  Search,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  LayoutGrid,
  Tag,
  X,
  HelpCircle,
  MessageSquare,
  Star,
} from 'lucide-react';

export function AdminContentPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('home_layout');
  const [loading, setLoading] = useState(false);

  // States
  const [navItems, setNavItems] = useState<CMSNavItem[]>([]);
  const [footerData, setFooterData] = useState<CMSFooterData>({ columns: [], socialLinks: {}, contact: {} });
  const [announcement, setAnnouncement] = useState<CMSAnnouncement>({ text: '', link: '', isActive: false });
  const [homeData, setHomeData] = useState<CMSHomeData>({
    hero: { headline: '', subtext: '', ctaText: '', ctaLink: '' },
    newsletter: { headline: '', subtext: '' },
  });
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [pageSearch, setPageSearch] = useState('');
  const [cmsPageCurrentPage, setCmsPageCurrentPage] = useState(1);
  const pagesPerPage = 8;

  // New States for Reorderable Showcase Tabs, Layout, FAQ, Testimonials & Curated Section
  const [showcaseSections, setShowcaseSections] = useState<CustomSection[]>([]);
  const [homeLayoutSections, setHomeLayoutSections] = useState<HomeLayoutSection[]>([]);
  const [curatedCollection, setCuratedCollection] = useState<CMSCuratedCollectionSection>(DEFAULT_CURATED_COLLECTION);
  const [faqItems, setFaqItems] = useState<CMSFAQItem[]>([]);
  const [testimonialsItems, setTestimonialsItems] = useState<CMSTestimonial[]>([]);

  // Showcase Section Modal State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CustomSection | null>(null);
  const [sectionForm, setSectionForm] = useState({
    name: '',
    code: '',
    badgeText: '',
    description: '',
    badgeColor: 'amber',
    isActive: true,
  });

  // Homepage Layout Section Modal State
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [editingLayoutSection, setEditingLayoutSection] = useState<HomeLayoutSection | null>(null);
  const [layoutForm, setLayoutForm] = useState({
    type: 'custom_promo' as HomeLayoutSection['type'],
    title: '',
    subtitle: '',
    bannerImage: '',
    bannerAlt: '',
    heading: '',
    subtext: '',
    ctaText: '',
    ctaLink: '',
    customHtml: '',
    isActive: true,
  });

  // Modal State for CMS Page CRUD
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Partial<CMSPage> | null>(null);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    setLoading(true);
    try {
      const [n, f, a, h, p, prods, secs, layout, curated, faqs, tests] = await Promise.all([
        contentService.getBlockContent('nav').catch(() => []),
        contentService.getBlockContent('footer').catch(() => ({ columns: [], socialLinks: {}, contact: {} })),
        contentService.getBlockContent('announcement').catch(() => ({ text: '', link: '', isActive: false })),
        contentService.getBlockContent('home').catch(() => ({ hero: {}, newsletter: {} })),
        contentService.getAdminPages().catch(() => []),
        adminService.getProducts({ limit: 1000 }).catch(() => []),
        contentService.getCustomSections().catch(() => []),
        contentService.getHomeLayout().catch(() => []),
        contentService.getCuratedCollectionContent().catch(() => DEFAULT_CURATED_COLLECTION),
        contentService.getFaqContent().catch(() => []),
        contentService.getTestimonialsContent().catch(() => []),
      ]);

      setNavItems(Array.isArray(n) ? n : []);
      setFooterData(f || { columns: [], socialLinks: {}, contact: {} });
      setAnnouncement(a || { text: '', link: '', isActive: false });
      setHomeData(h || { hero: { headline: '', subtext: '' } });
      setPages(Array.isArray(p) ? p : []);
      const fetchedProducts = Array.isArray(prods) ? prods : (prods?.products || prods?.data || []);
      setAllProducts(fetchedProducts);
      setShowcaseSections(Array.isArray(secs) ? secs : []);
      setHomeLayoutSections(Array.isArray(layout) ? layout : []);
      if (curated) setCuratedCollection(curated);
      setFaqItems(Array.isArray(faqs) ? faqs : []);
      setTestimonialsItems(Array.isArray(tests) ? tests : []);
    } catch (_err) {
      toast('error', 'Load Error', 'Failed to load CMS content from server');
    } finally {
      setLoading(false);
    }
  };

  // FAQ CRUD Handlers
  const handleSaveFaqs = async () => {
    try {
      await contentService.saveFaqContent(faqItems);
      toast('success', 'FAQ Saved', 'Frequently Asked Questions list updated live.');
    } catch (_err) {
      toast('error', 'Save Error', 'Failed to save FAQ items');
    }
  };

  const addFaqItem = () => {
    const newItem: CMSFAQItem = {
      id: `faq-${Date.now()}`,
      question: 'New Question...',
      answer: 'Answer content...',
      sortOrder: faqItems.length + 1,
    };
    setFaqItems([...faqItems, newItem]);
  };

  const removeFaqItem = (id: string) => {
    setFaqItems(faqItems.filter((f) => f.id !== id));
  };

  const moveFaqUp = (idx: number) => {
    if (idx <= 0) return;
    const updated = [...faqItems];
    const temp = updated[idx - 1];
    updated[idx - 1] = updated[idx];
    updated[idx] = temp;
    setFaqItems(updated);
  };

  const moveFaqDown = (idx: number) => {
    if (idx >= faqItems.length - 1) return;
    const updated = [...faqItems];
    const temp = updated[idx + 1];
    updated[idx + 1] = updated[idx];
    updated[idx] = temp;
    setFaqItems(updated);
  };

  // Testimonials CRUD Handlers
  const handleSaveTestimonials = async () => {
    try {
      await contentService.saveTestimonialsContent(testimonialsItems);
      toast('success', 'Testimonials Saved', 'Client endorsements updated live.');
    } catch (_err) {
      toast('error', 'Save Error', 'Failed to save testimonials items');
    }
  };

  const addTestimonialItem = () => {
    const newItem: CMSTestimonial = {
      id: `t-${Date.now()}`,
      author: 'Patron Name',
      role: 'Executive / Client Title',
      quote: 'Client quote text here...',
      rating: 5,
    };
    setTestimonialsItems([...testimonialsItems, newItem]);
  };

  const removeTestimonialItem = (id: string) => {
    setTestimonialsItems(testimonialsItems.filter((t) => t.id !== id));
  };

  const moveTestimonialUp = (idx: number) => {
    if (idx <= 0) return;
    const updated = [...testimonialsItems];
    const temp = updated[idx - 1];
    updated[idx - 1] = updated[idx];
    updated[idx] = temp;
    setTestimonialsItems(updated);
  };

  const moveTestimonialDown = (idx: number) => {
    if (idx >= testimonialsItems.length - 1) return;
    const updated = [...testimonialsItems];
    const temp = updated[idx + 1];
    updated[idx + 1] = updated[idx];
    updated[idx] = temp;
    setTestimonialsItems(updated);
  };

  const handleSaveCuratedCollection = async () => {
    try {
      await contentService.saveCuratedCollectionContent(curatedCollection);
      toast('success', 'Curated Collection Saved', 'Curated section content & images updated live.');
    } catch (_err) {
      toast('error', 'Save Error', 'Failed to save curated collection content');
    }
  };

  // --- SHOWCASE SECTIONS REORDER & CRUD HANDLERS ---
  const moveShowcaseSectionUp = async (idx: number) => {
    if (idx <= 0) return;
    const updated = [...showcaseSections];
    const temp = updated[idx - 1];
    updated[idx - 1] = updated[idx];
    updated[idx] = temp;
    setShowcaseSections(updated);
    await contentService.saveCustomSections(updated);
    toast('success', 'Sequence Updated', `Moved "${updated[idx - 1].name}" up.`);
  };

  const moveShowcaseSectionDown = async (idx: number) => {
    if (idx >= showcaseSections.length - 1) return;
    const updated = [...showcaseSections];
    const temp = updated[idx + 1];
    updated[idx + 1] = updated[idx];
    updated[idx] = temp;
    setShowcaseSections(updated);
    await contentService.saveCustomSections(updated);
    toast('success', 'Sequence Updated', `Moved "${updated[idx + 1].name}" down.`);
  };

  const toggleShowcaseSectionActive = async (idx: number) => {
    const updated = [...showcaseSections];
    updated[idx].isActive = updated[idx].isActive === false ? true : false;
    setShowcaseSections(updated);
    await contentService.saveCustomSections(updated);
    toast('info', 'Status Toggled', `"${updated[idx].name}" is now ${updated[idx].isActive ? 'Visible' : 'Hidden'}.`);
  };

  const handleSaveShowcaseSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.name || !sectionForm.code) {
      toast('error', 'Validation Error', 'Section Title and System Code are required');
      return;
    }

    let updated: CustomSection[];
    if (editingSection) {
      updated = showcaseSections.map((sec) =>
        sec.id === editingSection.id
          ? {
              ...sec,
              name: sectionForm.name,
              code: sectionForm.code,
              badgeText: sectionForm.badgeText,
              description: sectionForm.description,
              badgeColor: sectionForm.badgeColor,
              isActive: sectionForm.isActive,
            }
          : sec,
      );
    } else {
      const newSec: CustomSection = {
        id: `sec_${Date.now()}`,
        name: sectionForm.name,
        code: sectionForm.code,
        badgeText: sectionForm.badgeText || sectionForm.name,
        description: sectionForm.description,
        badgeColor: sectionForm.badgeColor || 'amber',
        isActive: true,
        isBuiltin: false,
        sortOrder: showcaseSections.length + 1,
      };
      updated = [...showcaseSections, newSec];
    }

    setShowcaseSections(updated);
    await contentService.saveCustomSections(updated);
    toast('success', 'Section Saved', `Showcase section "${sectionForm.name}" updated successfully.`);
    setIsSectionModalOpen(false);
    setEditingSection(null);
  };

  const handleDeleteShowcaseSection = async (id: string, name: string) => {
    const updated = showcaseSections.filter((s) => s.id !== id);
    setShowcaseSections(updated);
    await contentService.saveCustomSections(updated);
    toast('info', 'Section Removed', `"${name}" showcase section deleted.`);
  };

  // --- HOMEPAGE LAYOUT SECTIONS REORDER & CRUD HANDLERS ---
  const moveLayoutSectionUp = async (idx: number) => {
    if (idx <= 0) return;
    const updated = [...homeLayoutSections];
    const temp = updated[idx - 1];
    updated[idx - 1] = updated[idx];
    updated[idx] = temp;
    setHomeLayoutSections(updated);
    await contentService.saveHomeLayout(updated);
    toast('success', 'Layout Reordered', `Moved "${updated[idx - 1].title}" up on Homepage.`);
  };

  const moveLayoutSectionDown = async (idx: number) => {
    if (idx >= homeLayoutSections.length - 1) return;
    const updated = [...homeLayoutSections];
    const temp = updated[idx + 1];
    updated[idx + 1] = updated[idx];
    updated[idx] = temp;
    setHomeLayoutSections(updated);
    await contentService.saveHomeLayout(updated);
    toast('success', 'Layout Reordered', `Moved "${updated[idx + 1].title}" down on Homepage.`);
  };

  const toggleLayoutSectionActive = async (idx: number) => {
    const updated = [...homeLayoutSections];
    updated[idx].isActive = updated[idx].isActive === false ? true : false;
    setHomeLayoutSections(updated);
    await contentService.saveHomeLayout(updated);
    toast('info', 'Section Visibility', `"${updated[idx].title}" is now ${updated[idx].isActive ? 'Visible' : 'Hidden'} on Homepage.`);
  };

  const handleSaveLayoutSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!layoutForm.title) {
      toast('error', 'Validation Error', 'Section Title is required');
      return;
    }

    let updated: HomeLayoutSection[];
    if (editingLayoutSection) {
      updated = homeLayoutSections.map((sec) =>
        sec.id === editingLayoutSection.id
          ? {
              ...sec,
              type: layoutForm.type,
              title: layoutForm.title,
              subtitle: layoutForm.subtitle,
              bannerImage: layoutForm.bannerImage,
              bannerAlt: layoutForm.bannerAlt,
              heading: layoutForm.heading,
              subtext: layoutForm.subtext,
              ctaText: layoutForm.ctaText,
              ctaLink: layoutForm.ctaLink,
              customHtml: layoutForm.customHtml,
              isActive: layoutForm.isActive,
            }
          : sec,
      );
    } else {
      const newSec: HomeLayoutSection = {
        id: `layout_sec_${Date.now()}`,
        type: layoutForm.type,
        title: layoutForm.title,
        subtitle: layoutForm.subtitle,
        bannerImage: layoutForm.bannerImage,
        bannerAlt: layoutForm.bannerAlt,
        heading: layoutForm.heading,
        subtext: layoutForm.subtext,
        ctaText: layoutForm.ctaText,
        ctaLink: layoutForm.ctaLink,
        customHtml: layoutForm.customHtml,
        isActive: layoutForm.isActive,
        sortOrder: homeLayoutSections.length + 1,
      };
      updated = [...homeLayoutSections, newSec];
    }

    setHomeLayoutSections(updated);
    await contentService.saveHomeLayout(updated);
    toast('success', 'Homepage Layout Saved', `Homepage section "${layoutForm.title}" saved.`);
    setIsLayoutModalOpen(false);
    setEditingLayoutSection(null);
  };

  const handleDeleteLayoutSection = async (id: string, title: string) => {
    const updated = homeLayoutSections.filter((s) => s.id !== id);
    setHomeLayoutSections(updated);
    await contentService.saveHomeLayout(updated);
    toast('info', 'Section Deleted', `Homepage section "${title}" removed.`);
  };

  // Nav Handlers
  const handleSaveNav = async () => {
    try {
      await contentService.updateBlockContent('nav', navItems);
      window.dispatchEvent(new CustomEvent('cms-nav-updated'));
      toast('success', 'Nav Saved', 'Navigation menu updated live on storefront.');
    } catch (_err) {
      toast('error', 'Save Error', 'Failed to save navigation menu');
    }
  };

  const addNavItem = () => {
    setNavItems([
      ...navItems,
      {
        id: `nav_${Date.now()}`,
        label: 'New Link',
        link: '/collections',
        sortOrder: navItems.length + 1,
        children: [],
      },
    ]);
  };

  const removeNavItem = (idx: number) => {
    const updated = [...navItems];
    updated.splice(idx, 1);
    setNavItems(updated);
  };

  const addSubMenuItem = (navIdx: number) => {
    const updated = [...navItems];
    if (!updated[navIdx].children) updated[navIdx].children = [];
    updated[navIdx].children!.push({
      id: `sub_${Date.now()}`,
      label: 'New Sub-Menu Link',
      link: '/collections',
    });
    setNavItems(updated);
  };

  const removeSubMenuItem = (navIdx: number, subIdx: number) => {
    const updated = [...navItems];
    if (updated[navIdx]?.children) {
      updated[navIdx].children!.splice(subIdx, 1);
      setNavItems(updated);
    }
  };

  const addMegaColumn = (navIdx: number) => {
    const updated = [...navItems];
    if (!updated[navIdx].columns) updated[navIdx].columns = [];
    updated[navIdx].columns!.push({
      id: `col_${Date.now()}`,
      title: 'NEW HEADING',
      links: [
        { id: `sub_${Date.now()}`, label: 'New Link', link: '/collections', badge: 'Trend' },
      ],
    });
    setNavItems(updated);
  };

  const removeMegaColumn = (navIdx: number, colIdx: number) => {
    const updated = [...navItems];
    if (updated[navIdx]?.columns) {
      updated[navIdx].columns!.splice(colIdx, 1);
      setNavItems(updated);
    }
  };

  const addMegaColumnLink = (navIdx: number, colIdx: number) => {
    const updated = [...navItems];
    if (updated[navIdx]?.columns?.[colIdx]) {
      if (!updated[navIdx].columns![colIdx].links) updated[navIdx].columns![colIdx].links = [];
      updated[navIdx].columns![colIdx].links.push({
        id: `sub_${Date.now()}`,
        label: 'New Link',
        link: '/collections',
        badge: '',
      });
      setNavItems(updated);
    }
  };

  const removeMegaColumnLink = (navIdx: number, colIdx: number, lIdx: number) => {
    const updated = [...navItems];
    if (updated[navIdx]?.columns?.[colIdx]?.links) {
      updated[navIdx].columns![colIdx].links.splice(lIdx, 1);
      setNavItems(updated);
    }
  };

  // Footer Handlers
  const handleSaveFooter = async () => {
    try {
      await contentService.updateBlockContent('footer', footerData);
      window.dispatchEvent(new CustomEvent('cms-nav-updated'));
      toast('success', 'Footer Saved', 'Footer structure updated live on storefront.');
    } catch (_err) {
      toast('error', 'Save Error', 'Failed to save footer content');
    }
  };

  const addFooterColumn = () => {
    setFooterData({
      ...footerData,
      columns: [...(footerData.columns || []), { title: 'New Column', links: [{ text: 'Link 1', url: '/' }] }],
    });
  };

  const removeFooterColumn = (idx: number) => {
    const updated = [...(footerData.columns || [])];
    updated.splice(idx, 1);
    setFooterData({ ...footerData, columns: updated });
  };

  const addFooterLink = (colIdx: number) => {
    const updatedCols = [...(footerData.columns || [])];
    if (!updatedCols[colIdx].links) updatedCols[colIdx].links = [];
    updatedCols[colIdx].links.push({ text: 'New Link', url: '/' });
    setFooterData({ ...footerData, columns: updatedCols });
  };

  const removeFooterLink = (colIdx: number, lIdx: number) => {
    const updatedCols = [...(footerData.columns || [])];
    if (updatedCols[colIdx] && updatedCols[colIdx].links) {
      updatedCols[colIdx].links.splice(lIdx, 1);
      setFooterData({ ...footerData, columns: updatedCols });
    }
  };

  // Announcement Handlers
  const handleSaveAnnouncement = async () => {
    try {
      await contentService.updateBlockContent('announcement', announcement);
      window.dispatchEvent(new CustomEvent('cms-nav-updated'));
      toast('success', 'Announcement Saved', 'Announcement bar status updated live.');
    } catch (_err) {
      toast('error', 'Save Error', 'Failed to save announcement bar');
    }
  };

  // Homepage Handlers
  const handleSaveHome = async () => {
    try {
      await contentService.updateBlockContent('home', homeData);
      window.dispatchEvent(new CustomEvent('cms-nav-updated'));
      toast('success', 'Homepage Content Saved', 'Homepage sections updated live.');
    } catch (_err) {
      toast('error', 'Save Error', 'Failed to save homepage blocks');
    }
  };

  // Page CRUD Handlers
  const handleSavePage = async () => {
    if (!editingPage?.title || !editingPage?.slug) {
      toast('error', 'Validation Error', 'Title and Slug are required');
      return;
    }

    try {
      if (editingPage._id) {
        await contentService.updatePage(editingPage._id, editingPage);
        toast('success', 'Page Updated', `Page "${editingPage.title}" updated.`);
      } else {
        await contentService.createPage(editingPage);
        toast('success', 'Page Created', `Page "${editingPage.title}" published.`);
      }
      window.dispatchEvent(new CustomEvent('cms-nav-updated'));
      setIsPageModalOpen(false);
      setEditingPage(null);
      const updatedPages = await contentService.getAdminPages();
      setPages(updatedPages);
    } catch (err: any) {
      toast('error', 'Error Saving Page', err.message || 'Failed to save page');
    }
  };

  const handleDeletePage = async (id: string, title: string) => {
    try {
      await contentService.deletePage(id);
      window.dispatchEvent(new CustomEvent('cms-nav-updated'));
      toast('info', 'Page Deleted', `Page "${title}" deleted.`);
      setPages(pages.filter((p) => p._id !== id));
    } catch (err: any) {
      toast('error', 'Error', err.message || 'Failed to delete page');
    }
  };

  useEffect(() => {
    setCmsPageCurrentPage(1);
  }, [pageSearch]);

  const filteredCmsPages = (pages || []).filter(
    (p) =>
      p.title.toLowerCase().includes(pageSearch.toLowerCase()) ||
      p.slug.toLowerCase().includes(pageSearch.toLowerCase()),
  );

  const totalCmsPages = Math.ceil(filteredCmsPages.length / pagesPerPage) || 1;
  const paginatedCmsPages = filteredCmsPages.slice(
    (cmsPageCurrentPage - 1) * pagesPerPage,
    cmsPageCurrentPage * pagesPerPage,
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
              CMS Backoffice
            </span>
            <span className="text-xs text-slate-400 font-mono">Site Content & Layout Engine</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-slate-900 mt-1">
            Site Content & Dynamic Layout Manager
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingPage({
                title: '',
                slug: '',
                body: '<h2>Our Craftsmanship</h2><p>Describe your atelier processes here...</p>',
                status: 'published',
                seo: { title: '', description: '' },
              });
              setIsPageModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New CMS Page
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-xs text-slate-500 font-mono uppercase tracking-wider">
          Syncing Content Engine from Database...
        </div>
      )}

      {/* Tabs */}
      <Tabs
        defaultTabId={activeTab}
        onChange={setActiveTab}
        items={[
          {
            id: 'home_layout',
            label: (
              <span className="flex items-center gap-2 font-medium">
                <LayoutGrid className="w-4 h-4" /> Homepage Layout Sequence
              </span>
            ),
            content: (
              <Card className="p-6 space-y-6 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5 text-amber-600" />
                      Dynamic Homepage Layout & Section Sequence
                    </h3>
                    <p className="text-xs text-slate-500">
                      Reorder, toggle visibility, or add custom sections to the live Homepage layout.
                    </p>
                  </div>
                  <Button
                    variant="gold"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                      setEditingLayoutSection(null);
                      setLayoutForm({
                        type: 'custom_promo',
                        title: '',
                        subtitle: '',
                        bannerImage: '',
                        bannerAlt: '',
                        heading: '',
                        subtext: '',
                        ctaText: 'Explore Now',
                        ctaLink: '/collections',
                        customHtml: '',
                        isActive: true,
                      });
                      setIsLayoutModalOpen(true);
                    }}
                  >
                    Add Homepage Section
                  </Button>
                </div>

                <div className="space-y-4">
                  {homeLayoutSections.map((sec, idx) => (
                    <div
                      key={sec.id || idx}
                      className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        sec.isActive !== false
                          ? 'bg-slate-50/90 border-slate-200/90 shadow-2xs hover:border-amber-300'
                          : 'bg-slate-100/50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Sequence Controls */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveLayoutSectionUp(idx)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Move Up in Sequence"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <span className="text-[11px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === homeLayoutSections.length - 1}
                            onClick={() => moveLayoutSectionDown(idx)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Move Down in Sequence"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                              {sec.type.replace('_', ' ')}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{sec.title}</span>
                          </div>
                          {sec.subtitle && <p className="text-xs text-slate-500">{sec.subtitle}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => toggleLayoutSectionActive(idx)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                            sec.isActive !== false
                              ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              : 'border-slate-200 text-slate-500 bg-slate-100 hover:bg-slate-200'
                          }`}
                        >
                          {sec.isActive !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5" /> Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> Hidden
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingLayoutSection(sec);
                            setLayoutForm({
                              type: sec.type,
                              title: sec.title || '',
                              subtitle: sec.subtitle || '',
                              bannerImage: sec.bannerImage || '',
                              bannerAlt: sec.bannerAlt || '',
                              heading: sec.heading || '',
                              subtext: sec.subtext || '',
                              ctaText: sec.ctaText || '',
                              ctaLink: sec.ctaLink || '',
                              customHtml: sec.customHtml || '',
                              isActive: sec.isActive ?? true,
                            });
                            setIsLayoutModalOpen(true);
                          }}
                          className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl border border-slate-200 transition-all"
                          title="Edit Section Settings"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {!['hero', 'showcase_tabs', 'categories', 'faq', 'testimonials', 'newsletter'].includes(sec.type) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteLayoutSection(sec.id, sec.title)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-all"
                            title="Delete Section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ),
          },
          {
            id: 'curated_collections',
            label: (
              <span className="flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-amber-600" /> Curated Collections Section
              </span>
            ),
            content: (
              <Card className="p-6 space-y-8 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      Curated Collections Section Configurator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage section title, subtitle, bottom button, and dynamic items with photo gallery switching on hover/click.
                    </p>
                  </div>
                  <Button
                    variant="gold"
                    onClick={handleSaveCuratedCollection}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Curated Changes
                  </Button>
                </div>

                {/* Main Section Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Section Title
                    </label>
                    <Input
                      value={curatedCollection.title}
                      onChange={(e) =>
                        setCuratedCollection({ ...curatedCollection, title: e.target.value })
                      }
                      placeholder="e.g. Curated Collections For Style"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Section Subtitle
                    </label>
                    <Input
                      value={curatedCollection.subtitle}
                      onChange={(e) =>
                        setCuratedCollection({ ...curatedCollection, subtitle: e.target.value })
                      }
                      placeholder="e.g. Thoughtfully designed fashion pieces..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Bottom CTA Button Label
                    </label>
                    <Input
                      value={curatedCollection.buttonText}
                      onChange={(e) =>
                        setCuratedCollection({ ...curatedCollection, buttonText: e.target.value })
                      }
                      placeholder="e.g. Shop Collections"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Bottom CTA Button Link
                    </label>
                    <Input
                      value={curatedCollection.buttonLink}
                      onChange={(e) =>
                        setCuratedCollection({ ...curatedCollection, buttonLink: e.target.value })
                      }
                      placeholder="e.g. /collections"
                    />
                  </div>
                </div>

                {/* Interactive Items Management */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-600" />
                      Interactive Collection Items ({curatedCollection.items.length})
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItem: CMSCuratedItem = {
                          id: `curated_${Date.now()}`,
                          title: 'New Curated Style',
                          description: 'Description of the new curated design item...',
                          image:
                            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
                          link: '/collections',
                        };
                        setCuratedCollection({
                          ...curatedCollection,
                          items: [...curatedCollection.items, newItem],
                        });
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Item
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {curatedCollection.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 relative"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                              Item #{idx + 1}
                            </span>
                            {/* Reorder Controls */}
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                if (idx === 0) return;
                                const updated = [...curatedCollection.items];
                                const temp = updated[idx - 1];
                                updated[idx - 1] = updated[idx];
                                updated[idx] = temp;
                                setCuratedCollection({ ...curatedCollection, items: updated });
                              }}
                              className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === curatedCollection.items.length - 1}
                              onClick={() => {
                                if (idx >= curatedCollection.items.length - 1) return;
                                const updated = [...curatedCollection.items];
                                const temp = updated[idx + 1];
                                updated[idx + 1] = updated[idx];
                                updated[idx] = temp;
                                setCuratedCollection({ ...curatedCollection, items: updated });
                              }}
                              className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {curatedCollection.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...curatedCollection.items];
                                updated.splice(idx, 1);
                                setCuratedCollection({ ...curatedCollection, items: updated });
                              }}
                              className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove Item
                            </button>
                          )}
                        </div>

                        {/* Catalog Product Quick Autofill Selector */}
                        {allProducts.length > 0 && (
                          <div className="bg-amber-50/60 border border-amber-200/80 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              Autofill from Store Catalog Product:
                            </span>
                            <select
                              value=""
                              onChange={(e) => {
                                const prodId = e.target.value;
                                if (!prodId) return;
                                const prod = allProducts.find((p) => (p.id || (p as any)._id) === prodId);
                                if (prod) {
                                  const updated = [...curatedCollection.items];
                                  const imgUrl = typeof prod.images?.[0] === 'string' ? prod.images[0] : (prod.images?.[0] as any)?.url || '';
                                  updated[idx] = {
                                    ...updated[idx],
                                    title: prod.name,
                                    description: prod.description || `Explore our bespoke ${prod.name} crafted for tailored perfection.`,
                                    image: imgUrl || updated[idx].image,
                                    link: `/collections?category=${(prod.category as any)?.slug || 'all'}`,
                                  };
                                  setCuratedCollection({ ...curatedCollection, items: updated });
                                  toast('info', 'Autofilled from Product', `Loaded details from "${prod.name}"`);
                                }
                              }}
                              className="text-xs bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden font-medium cursor-pointer w-full sm:w-auto"
                            >
                              <option value="">-- Select Product to Autofill --</option>
                              {allProducts.map((p) => (
                                <option key={p.id || (p as any)._id} value={p.id || (p as any)._id}>
                                  {p.name} (${p.basePrice || (p as any).price || 0})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          {/* Image Uploader & Preview */}
                          <div className="lg:col-span-4 space-y-2">
                            <label className="block text-xs font-bold text-slate-700">
                              Item Photo (Left Gallery Display)
                            </label>
                            <ImageUploader
                              value={item.image}
                              onChange={(val) => {
                                const updated = [...curatedCollection.items];
                                updated[idx].image = typeof val === 'string' ? val : val.url;
                                setCuratedCollection({ ...curatedCollection, items: updated });
                              }}
                              folder="curated"
                            />
                          </div>

                          {/* Text Fields */}
                          <div className="lg:col-span-8 space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Item Title
                              </label>
                              <Input
                                value={item.title}
                                onChange={(e) => {
                                  const updated = [...curatedCollection.items];
                                  updated[idx].title = e.target.value;
                                  setCuratedCollection({ ...curatedCollection, items: updated });
                                }}
                                placeholder="e.g. Fresh Seasonal Designs"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Expanded Description
                              </label>
                              <textarea
                                value={item.description}
                                onChange={(e) => {
                                  const updated = [...curatedCollection.items];
                                  updated[idx].description = e.target.value;
                                  setCuratedCollection({ ...curatedCollection, items: updated });
                                }}
                                rows={3}
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-sans text-slate-800"
                                placeholder="Describe this item..."
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Click Action Link URL
                              </label>
                              <Input
                                value={item.link || ''}
                                onChange={(e) => {
                                  const updated = [...curatedCollection.items];
                                  updated[idx].link = e.target.value;
                                  setCuratedCollection({ ...curatedCollection, items: updated });
                                }}
                                placeholder="e.g. /collections?category=new"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <Button
                    variant="gold"
                    onClick={handleSaveCuratedCollection}
                    className="flex items-center gap-2 px-8"
                  >
                    <Save className="w-4 h-4" /> Save Curated Changes
                  </Button>
                </div>
              </Card>
            ),
          },
          {
            id: 'showcase_tabs',
            label: (
              <span className="flex items-center gap-2 font-medium">
                <Tag className="w-4 h-4" /> Showcase Tabs & Categories Reorder
              </span>
            ),
            content: (
              <Card className="p-6 space-y-6 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-amber-600" />
                      Product Showcase Tabs Reordering & Category Management
                    </h3>
                    <p className="text-xs text-slate-500">
                      Reorder tab sequence (New Arrivals, Best Sellers, Diwali Sale, etc.) on the Homepage product showcase.
                    </p>
                  </div>
                  <Button
                    variant="gold"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                      setEditingSection(null);
                      setSectionForm({
                        name: '',
                        code: '',
                        badgeText: '',
                        description: '',
                        badgeColor: 'amber',
                        isActive: true,
                      });
                      setIsSectionModalOpen(true);
                    }}
                  >
                    Add Showcase Tab / Section
                  </Button>
                </div>

                <div className="space-y-4">
                  {showcaseSections.map((sec, idx) => (
                    <div
                      key={sec.id || sec.code || idx}
                      className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        sec.isActive !== false
                          ? 'bg-slate-50/90 border-slate-200/90 shadow-2xs hover:border-amber-300'
                          : 'bg-slate-100/50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Sequence Controls */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveShowcaseSectionUp(idx)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <span className="text-[11px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === showcaseSections.length - 1}
                            onClick={() => moveShowcaseSectionDown(idx)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{sec.name}</span>
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                              code: {sec.code}
                            </span>
                            {sec.isBuiltin && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                                Built-in
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {sec.description || `Pill Badge Text: "${sec.badgeText || sec.name}"`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => toggleShowcaseSectionActive(idx)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                            sec.isActive !== false
                              ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              : 'border-slate-200 text-slate-500 bg-slate-100 hover:bg-slate-200'
                          }`}
                        >
                          {sec.isActive !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5" /> Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> Hidden
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingSection(sec);
                            setSectionForm({
                              name: sec.name || '',
                              code: sec.code || '',
                              badgeText: sec.badgeText || '',
                              description: sec.description || '',
                              badgeColor: sec.badgeColor || 'amber',
                              isActive: sec.isActive ?? true,
                            });
                            setIsSectionModalOpen(true);
                          }}
                          className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl border border-slate-200 transition-all"
                          title="Edit Tab Settings"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {!sec.isBuiltin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteShowcaseSection(sec.id, sec.name)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-all"
                            title="Delete Custom Tab"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ),
          },
          {
            id: 'nav',
            label: (
              <span className="flex items-center gap-2 font-medium">
                <Navigation className="w-4 h-4" /> Header Navigation & Sub-Menus
              </span>
            ),
            content: (
              <Card className="p-6 space-y-6 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-amber-600" />
                      Header Navigation & Sub-Menu Dropdown Configurator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure top-level menu items and nested sub-menu dropdowns with hover state rendering.
                    </p>
                  </div>
                  <Button variant="gold" size="sm" onClick={handleSaveNav} leftIcon={<Save className="w-4 h-4" />}>
                    Save Navigation
                  </Button>
                </div>

                <div className="space-y-6">
                  {(navItems || []).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Main Menu Link
                          </span>
                          {item.isMegaMenu && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-300">
                              Mega Menu Active
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeNavItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove Main Menu Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <Input
                          label="Link Label *"
                          value={item.label}
                          onChange={(e) => {
                            const updated = [...(navItems || [])];
                            updated[idx].label = e.target.value;
                            setNavItems(updated);
                          }}
                          placeholder="e.g. Shop or Collections"
                        />
                        <Input
                          label="Link Target URL *"
                          value={item.link}
                          onChange={(e) => {
                            const updated = [...(navItems || [])];
                            updated[idx].link = e.target.value;
                            setNavItems(updated);
                          }}
                          placeholder="e.g. /collections"
                        />
                        <div className="flex items-center gap-2.5 pb-2">
                          <input
                            type="checkbox"
                            id={`mega_check_${idx}`}
                            checked={item.isMegaMenu || false}
                            onChange={(e) => {
                              const updated = [...(navItems || [])];
                              updated[idx].isMegaMenu = e.target.checked;
                              if (e.target.checked && (!updated[idx].columns || updated[idx].columns!.length === 0)) {
                                updated[idx].columns = [
                                  {
                                    id: `col_1`,
                                    title: 'SHOP FEATURE',
                                    links: [
                                      { id: 'sub_1', label: 'Pagination Link', link: '/collections', badge: 'Trend' },
                                      { id: 'sub_2', label: 'Filter Sidebar', link: '/collections' },
                                    ],
                                  },
                                  {
                                    id: `col_2`,
                                    title: 'MY PAGES',
                                    links: [
                                      { id: 'sub_3', label: 'Wish List', link: '/account' },
                                      { id: 'sub_4', label: 'View Cart', link: '/cart' },
                                    ],
                                  },
                                ];
                                if (!updated[idx].megaImage) {
                                  updated[idx].megaImage =
                                    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80';
                                  updated[idx].megaImageTitle = `Shop ${item.label}`;
                                  updated[idx].megaImageLink = item.link;
                                }
                              }
                              setNavItems(updated);
                            }}
                            className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                          />
                          <label htmlFor={`mega_check_${idx}`} className="text-xs font-bold text-slate-800 cursor-pointer">
                            Enable Multi-Column Mega Menu
                          </label>
                        </div>
                      </div>

                      {/* IF MEGA MENU IS ENABLED */}
                      {item.isMegaMenu ? (
                        <div className="space-y-6 pt-2">
                          {/* Banner Image Card Configurator */}
                          <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200 space-y-4">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                              Featured Banner Card (Right side of Mega Menu)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Input
                                label="Banner Overlay Title"
                                value={item.megaImageTitle || ''}
                                onChange={(e) => {
                                  const updated = [...navItems];
                                  updated[idx].megaImageTitle = e.target.value;
                                  setNavItems(updated);
                                }}
                                placeholder="e.g. Shop Men or Autumn Edition"
                              />
                              <Input
                                label="Banner Link URL"
                                value={item.megaImageLink || ''}
                                onChange={(e) => {
                                  const updated = [...navItems];
                                  updated[idx].megaImageLink = e.target.value;
                                  setNavItems(updated);
                                }}
                                placeholder="e.g. /collections?category=menswear"
                              />
                            </div>
                            <ImageUploader
                              label="Featured Promo Banner Image"
                              value={{ url: item.megaImage || '', altText: item.megaImageTitle || '' }}
                              onChange={({ url }) => {
                                const updated = [...navItems];
                                updated[idx].megaImage = url;
                                setNavItems(updated);
                              }}
                              folder="cms/nav"
                            />
                          </div>

                          {/* Multi-Column Headings & Links Configurator */}
                          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-purple-600" />
                                Mega Menu Column Headings ({item.columns?.length || 0})
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addMegaColumn(idx)}
                                className="text-xs"
                              >
                                + Add Column Heading
                              </Button>
                            </div>

                            {item.columns && item.columns.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {item.columns.map((col, cIdx) => (
                                  <div key={col.id || cIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                                    <div className="flex items-center justify-between gap-2">
                                      <Input
                                        label={`Column #${cIdx + 1} Heading Title`}
                                        value={col.title}
                                        onChange={(e) => {
                                          const updated = [...navItems];
                                          updated[idx].columns![cIdx].title = e.target.value;
                                          setNavItems(updated);
                                        }}
                                        placeholder="e.g. SHOP FEATURE, PRODUCT HOVER, MY PAGES"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeMegaColumn(idx, cIdx)}
                                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0 mt-5"
                                        title="Remove Column"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Links under Heading */}
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                                          Sub-Links under "{col.title}"
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => addMegaColumnLink(idx, cIdx)}
                                          className="text-xs text-purple-700 hover:text-purple-900 font-bold"
                                        >
                                          + Add Sub-Link
                                        </button>
                                      </div>

                                      {col.links && col.links.length > 0 ? (
                                        <div className="space-y-2">
                                          {col.links.map((sub, lIdx) => (
                                            <div key={sub.id || lIdx} className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-2">
                                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <Input
                                                  placeholder="Link Label"
                                                  value={sub.label}
                                                  onChange={(e) => {
                                                    const updated = [...navItems];
                                                    updated[idx].columns![cIdx].links[lIdx].label = e.target.value;
                                                    setNavItems(updated);
                                                  }}
                                                />
                                                <Input
                                                  placeholder="URL Target"
                                                  value={sub.link}
                                                  onChange={(e) => {
                                                    const updated = [...navItems];
                                                    updated[idx].columns![cIdx].links[lIdx].link = e.target.value;
                                                    setNavItems(updated);
                                                  }}
                                                />
                                                <div className="flex items-center gap-2">
                                                  <Input
                                                    placeholder="Badge (Hot, New)"
                                                    value={sub.badge || ''}
                                                    onChange={(e) => {
                                                      const updated = [...navItems];
                                                      updated[idx].columns![cIdx].links[lIdx].badge = e.target.value;
                                                      setNavItems(updated);
                                                    }}
                                                  />
                                                  <button
                                                    type="button"
                                                    onClick={() => removeMegaColumnLink(idx, cIdx, lIdx)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 shrink-0"
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-[11px] text-slate-400 italic">No links in this column yet.</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 italic text-center py-4">
                                No columns created yet. Click "+ Add Column Heading" to create column headings and sub-links.
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* SIMPLE DROPDOWN CONFIGURATOR */
                        <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-amber-600" />
                              Simple Sub-Menu Dropdown Links ({item.children?.length || 0})
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => addSubMenuItem(idx)}
                              className="text-xs"
                            >
                              + Add Sub-Menu Child Link
                            </Button>
                          </div>

                          {item.children && item.children.length > 0 ? (
                            <div className="space-y-2 pl-3 border-l-2 border-amber-500">
                              {item.children.map((sub, sIdx) => (
                                <div key={sub.id || sIdx} className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                  <Input
                                    placeholder="Sub-Menu Label"
                                    value={sub.label}
                                    onChange={(e) => {
                                      const updated = [...navItems];
                                      updated[idx].children![sIdx].label = e.target.value;
                                      setNavItems(updated);
                                    }}
                                  />
                                  <Input
                                    placeholder="Sub-Menu URL (e.g. /collections?category=suits)"
                                    value={sub.link}
                                    onChange={(e) => {
                                      const updated = [...navItems];
                                      updated[idx].children![sIdx].link = e.target.value;
                                      setNavItems(updated);
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeSubMenuItem(idx, sIdx)}
                                    className="p-1.5 text-slate-400 hover:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">No sub-menu dropdown items configured for this link.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={addNavItem} leftIcon={<Plus className="w-4 h-4" />}>
                    Add Top-Level Menu Link
                  </Button>
                </div>
              </Card>
            ),
          },
          {
            id: 'home',
            label: (
              <span className="flex items-center gap-2 font-medium">
                <Home className="w-4 h-4" /> Hero Banner & Slides
              </span>
            ),
            content: (
              <Card className="p-6 space-y-6 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                      <Home className="w-5 h-5 text-amber-600" />
                      Homepage Hero Slider & Marketing Blocks
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure high-res hero imagery, headlines, and call-to-action buttons.
                    </p>
                  </div>
                  <Button variant="gold" size="sm" onClick={handleSaveHome} leftIcon={<Save className="w-4 h-4" />}>
                    Save Hero Content
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Primary Hero Headline"
                      value={homeData?.hero?.headline || ''}
                      onChange={(e) =>
                        setHomeData({
                          ...homeData,
                          hero: { ...homeData.hero, headline: e.target.value },
                        })
                      }
                      placeholder="e.g. Find Your Signature Style"
                    />
                    <Input
                      label="CTA Button Text"
                      value={homeData?.hero?.ctaText || ''}
                      onChange={(e) =>
                        setHomeData({
                          ...homeData,
                          hero: { ...homeData.hero, ctaText: e.target.value },
                        })
                      }
                      placeholder="e.g. Shop Bespoke Collection"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Subtext Paragraph
                    </label>
                    <textarea
                      rows={2}
                      value={homeData?.hero?.subtext || ''}
                      onChange={(e) =>
                        setHomeData({
                          ...homeData,
                          hero: { ...homeData.hero, subtext: e.target.value },
                        })
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <ImageUploader
                    label="Homepage Main Hero Background Image"
                    value={{ url: homeData?.hero?.image || '', altText: homeData?.hero?.altText || '' }}
                    onChange={({ url, altText }) =>
                      setHomeData({
                        ...homeData,
                        hero: { ...homeData.hero, image: url, altText },
                      })
                    }
                    folder="cms/hero"
                  />
                </div>
              </Card>
            ),
          },
          {
            id: 'footer',
            label: (
              <span className="flex items-center gap-2 font-medium">
                <Globe className="w-4 h-4" /> Footer & Social Links
              </span>
            ),
            content: (
              <Card className="p-6 space-y-6 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-amber-600" />
                      Footer Columns & Contact Information
                    </h3>
                    <p className="text-xs text-slate-500">Manage footer link hierarchy, social handles, and contact details.</p>
                  </div>
                  <Button variant="gold" size="sm" onClick={handleSaveFooter} leftIcon={<Save className="w-4 h-4" />}>
                    Save Footer Configuration
                  </Button>
                </div>

                <div className="space-y-6">
                  {(footerData.columns || []).map((col, cIdx) => (
                    <div key={cIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <Input
                          label={`Column #${cIdx + 1} Title`}
                          value={col.title}
                          onChange={(e) => {
                            const updated = [...(footerData.columns || [])];
                            updated[cIdx].title = e.target.value;
                            setFooterData({ ...footerData, columns: updated });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeFooterColumn(cIdx)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(col.links || []).map((l, lIdx) => (
                          <div key={lIdx} className="flex gap-3">
                            <Input
                              placeholder="Link Text"
                              value={l.text}
                              onChange={(e) => {
                                const updated = [...(footerData.columns || [])];
                                updated[cIdx].links[lIdx].text = e.target.value;
                                setFooterData({ ...footerData, columns: updated });
                              }}
                            />
                            <Input
                              placeholder="URL Path"
                              value={l.url}
                              onChange={(e) => {
                                const updated = [...(footerData.columns || [])];
                                updated[cIdx].links[lIdx].url = e.target.value;
                                setFooterData({ ...footerData, columns: updated });
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeFooterLink(cIdx, lIdx)}
                              className="p-1 text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <Button type="button" variant="ghost" size="sm" onClick={() => addFooterLink(cIdx)}>
                          + Add Link to Column
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addFooterColumn} leftIcon={<Plus className="w-4 h-4" />}>
                    Add Footer Column
                  </Button>
                </div>
              </Card>
            ),
          },
          {
            id: 'announcement',
            label: (
              <span className="flex items-center gap-2 font-medium">
                <Bell className="w-4 h-4" /> Top Announcement Bar
              </span>
            ),
            content: (
              <Card className="p-6 space-y-6 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-600" />
                      Top Announcement Bar
                    </h3>
                    <p className="text-xs text-slate-500">Toggle live ticker message across storefront header.</p>
                  </div>
                  <Button variant="gold" size="sm" onClick={handleSaveAnnouncement} leftIcon={<Save className="w-4 h-4" />}>
                    Save Announcement
                  </Button>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcement.isActive}
                      onChange={(e) => setAnnouncement({ ...announcement, isActive: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="font-bold text-xs text-slate-900">Show Announcement Bar on Header</span>
                  </label>

                  <Input
                    label="Announcement Message Text"
                    value={announcement.text}
                    onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                    placeholder="e.g. Complimentary Worldwide Express Shipping on Orders Over $250"
                  />

                  <Input
                    label="Click Target Link (Optional)"
                    value={announcement.link || ''}
                    onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })}
                    placeholder="e.g. /collections?sale=true"
                  />
                </div>
              </Card>
            ),
          },
          {
            id: 'pages',
            label: (
              <span className="flex items-center gap-2 font-medium">
                <FileText className="w-4 h-4" /> Custom Dynamic CMS Pages ({pages.length})
              </span>
            ),
            content: (
              <Card className="p-6 space-y-6 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-600" />
                      Dynamic Custom Pages & Collections ({pages.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Build custom landing pages, tailor showcases, or promotional collection pages.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search CMS pages..."
                      value={pageSearch}
                      onChange={(e) => setPageSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedCmsPages.map((page) => (
                    <div key={page._id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{page.title}</h4>
                          <span className="font-mono text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            /{page.slug}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            page.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {page.status}
                        </span>
                      </div>

                      {page.selectedProducts && page.selectedProducts.length > 0 && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Attached Products: {page.selectedProducts.length} items
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => {
                            setEditingPage(page);
                            setIsPageModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit Page
                        </button>
                        <button
                          onClick={() => handleDeletePage(page._id!, page.title)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination
                  currentPage={cmsPageCurrentPage}
                  totalPages={totalCmsPages}
                  onPageChange={setCmsPageCurrentPage}
                />
              </Card>
            ),
          },
          {
            id: 'faq_config',
            label: (
              <span className="flex items-center gap-2 font-medium">
                <HelpCircle className="w-4 h-4 text-amber-600" /> Tailoring Process & FAQ
              </span>
            ),
            content: (
              <Card className="p-6 space-y-6 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-amber-600" />
                      Tailoring Process & FAQ Configurator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage question & answer items displayed in the Homepage FAQ section.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={addFaqItem} leftIcon={<Plus className="w-4 h-4" />}>
                      Add Question
                    </Button>
                    <Button variant="gold" size="sm" onClick={handleSaveFaqs} leftIcon={<Save className="w-4 h-4" />}>
                      Save FAQ Items
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {faqItems.map((faq, idx) => (
                    <div
                      key={faq.id || idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 transition-all hover:border-amber-300"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                          Question #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveFaqUp(idx)}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-amber-600 disabled:opacity-30 rounded-lg hover:bg-slate-200/60"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFaqDown(idx)}
                            disabled={idx === faqItems.length - 1}
                            className="p-1 text-slate-400 hover:text-amber-600 disabled:opacity-30 rounded-lg hover:bg-slate-200/60"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFaqItem(faq.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 ml-2"
                            title="Delete FAQ Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Input
                          label="Question Title *"
                          value={faq.question}
                          onChange={(e) => {
                            const updated = [...faqItems];
                            updated[idx].question = e.target.value;
                            setFaqItems(updated);
                          }}
                          placeholder="e.g. How accurate is the digital measurement system?"
                        />
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Detailed Answer *
                          </label>
                          <textarea
                            rows={3}
                            value={faq.answer}
                            onChange={(e) => {
                              const updated = [...faqItems];
                              updated[idx].answer = e.target.value;
                              setFaqItems(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                            placeholder="Provide a detailed answer for patrons..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {faqItems.length === 0 && (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                      No FAQ questions found. Click "Add Question" to create one.
                    </div>
                  )}
                </div>
              </Card>
            ),
          },
          {
            id: 'testimonials_config',
            label: (
              <span className="flex items-center gap-2 font-medium">
                <MessageSquare className="w-4 h-4 text-amber-600" /> Words From Clientele
              </span>
            ),
            content: (
              <Card className="p-6 space-y-6 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-amber-600" />
                      Words From Our Bespoke Clientele Configurator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Add, edit, or remove client quotes and reviews featured on the Homepage.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={addTestimonialItem} leftIcon={<Plus className="w-4 h-4" />}>
                      Add Testimonial
                    </Button>
                    <Button variant="gold" size="sm" onClick={handleSaveTestimonials} leftIcon={<Save className="w-4 h-4" />}>
                      Save Testimonials
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {testimonialsItems.map((test, idx) => (
                    <div
                      key={test.id || idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 transition-all hover:border-amber-300"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                          Testimonial #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveTestimonialUp(idx)}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-amber-600 disabled:opacity-30 rounded-lg hover:bg-slate-200/60"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveTestimonialDown(idx)}
                            disabled={idx === testimonialsItems.length - 1}
                            className="p-1 text-slate-400 hover:text-amber-600 disabled:opacity-30 rounded-lg hover:bg-slate-200/60"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTestimonialItem(test.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 ml-2"
                            title="Delete Testimonial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                          label="Patron Name *"
                          value={test.author}
                          onChange={(e) => {
                            const updated = [...testimonialsItems];
                            updated[idx].author = e.target.value;
                            setTestimonialsItems(updated);
                          }}
                          placeholder="e.g. Alexander V."
                        />
                        <Input
                          label="Client Role / Title"
                          value={test.role}
                          onChange={(e) => {
                            const updated = [...testimonialsItems];
                            updated[idx].role = e.target.value;
                            setTestimonialsItems(updated);
                          }}
                          placeholder="e.g. Managing Partner, Finance"
                        />
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Rating (1 - 5 Stars)
                          </label>
                          <select
                            value={test.rating || 5}
                            onChange={(e) => {
                              const updated = [...testimonialsItems];
                              updated[idx].rating = Number(e.target.value);
                              setTestimonialsItems(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                            <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                            <option value={3}>⭐⭐⭐ (3 Stars)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Client Quote / Endorsement *
                        </label>
                        <textarea
                          rows={3}
                          value={test.quote}
                          onChange={(e) => {
                            const updated = [...testimonialsItems];
                            updated[idx].quote = e.target.value;
                            setTestimonialsItems(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                          placeholder="Quote text..."
                        />
                      </div>
                    </div>
                  ))}
                  {testimonialsItems.length === 0 && (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                      No testimonials found. Click "Add Testimonial" to create one.
                    </div>
                  )}
                </div>
              </Card>
            ),
          },
        ]}
      />

      {/* SHOWCASE SECTION MODAL */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" />
                {editingSection ? 'Edit Showcase Section Tab' : 'Create Showcase Section Tab'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSectionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShowcaseSection} className="space-y-4">
              <Input
                label="Section Title (e.g. Diwali Sale) *"
                value={sectionForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const code = name.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
                  setSectionForm({
                    ...sectionForm,
                    name,
                    code: editingSection ? sectionForm.code : code,
                    badgeText: editingSection ? sectionForm.badgeText : name,
                  });
                }}
                placeholder="e.g. Diwali Sale"
                required
              />

              <Input
                label="System Code / Tag Code *"
                value={sectionForm.code}
                onChange={(e) =>
                  setSectionForm({
                    ...sectionForm,
                    code: e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, '_'),
                  })
                }
                placeholder="e.g. diwali_sale"
                required
              />

              <Input
                label="Product Badge Text *"
                value={sectionForm.badgeText}
                onChange={(e) => setSectionForm({ ...sectionForm, badgeText: e.target.value })}
                placeholder="e.g. Diwali Special"
                required
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                  placeholder="e.g. Festive promotional offers & discounts"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsSectionModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" size="sm" leftIcon={<Save className="w-4 h-4" />}>
                  {editingSection ? 'Update Section' : 'Create Section'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HOMEPAGE LAYOUT SECTION MODAL */}
      {isLayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-amber-600" />
                {editingLayoutSection ? 'Edit Homepage Layout Section' : 'Add New Homepage Layout Section'}
              </h3>
              <button
                type="button"
                onClick={() => setIsLayoutModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLayoutSection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Section Type *
                </label>
                <select
                  value={layoutForm.type}
                  onChange={(e) => setLayoutForm({ ...layoutForm, type: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="custom_promo">Custom Promo / Spotlight Banner</option>
                  <option value="custom_html">Custom HTML Content Block</option>
                  <option value="blog">Atelier Journal & Blogs Section</option>
                  <option value="hero">Hero Banner Slider</option>
                  <option value="showcase_tabs">Product Showcase Tabs</option>
                  <option value="categories">Signature Categories Grid</option>
                  <option value="faq">FAQ Accordion</option>
                  <option value="testimonials">Testimonials</option>
                  <option value="newsletter">Privé Circle Newsletter</option>
                </select>
              </div>

              <Input
                label="Section Internal Title *"
                value={layoutForm.title}
                onChange={(e) => setLayoutForm({ ...layoutForm, title: e.target.value })}
                placeholder="e.g. Festive Spotlight Banner"
                required
              />

              <Input
                label="Subtitle Tagline"
                value={layoutForm.subtitle}
                onChange={(e) => setLayoutForm({ ...layoutForm, subtitle: e.target.value })}
                placeholder="e.g. Exclusive Seasonal Discounts"
              />

              {layoutForm.type === 'custom_promo' && (
                <>
                  <ImageUploader
                    label="Banner Background Image"
                    value={{ url: layoutForm.bannerImage, altText: layoutForm.bannerAlt }}
                    onChange={({ url, altText }) =>
                      setLayoutForm({ ...layoutForm, bannerImage: url, bannerAlt: altText })
                    }
                    folder="cms/promos"
                  />

                  <Input
                    label="Heading Text"
                    value={layoutForm.heading}
                    onChange={(e) => setLayoutForm({ ...layoutForm, heading: e.target.value })}
                    placeholder="e.g. Royal Diwali Suit Showcase"
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Subtext Description
                    </label>
                    <textarea
                      rows={2}
                      value={layoutForm.subtext}
                      onChange={(e) => setLayoutForm({ ...layoutForm, subtext: e.target.value })}
                      placeholder="e.g. Handcrafted bespoke wool garments engineered for timeless elegance."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="CTA Button Text"
                      value={layoutForm.ctaText}
                      onChange={(e) => setLayoutForm({ ...layoutForm, ctaText: e.target.value })}
                      placeholder="e.g. Shop Diwali Collection"
                    />
                    <Input
                      label="CTA Target Link"
                      value={layoutForm.ctaLink}
                      onChange={(e) => setLayoutForm({ ...layoutForm, ctaLink: e.target.value })}
                      placeholder="e.g. /collections?tag=diwali_sale"
                    />
                  </div>
                </>
              )}

              {layoutForm.type === 'custom_html' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Custom HTML Content
                  </label>
                  <textarea
                    rows={5}
                    value={layoutForm.customHtml}
                    onChange={(e) => setLayoutForm({ ...layoutForm, customHtml: e.target.value })}
                    placeholder="<div>Custom banner HTML or iframe video...</div>"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsLayoutModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" size="sm" leftIcon={<Save className="w-4 h-4" />}>
                  {editingLayoutSection ? 'Update Section' : 'Add Section'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT/CREATE CMS PAGE MODAL */}
      <Modal
        isOpen={isPageModalOpen}
        onClose={() => setIsPageModalOpen(false)}
        title={editingPage?._id ? 'Edit CMS Page & Attached Products' : 'Create New CMS Custom Page'}
        maxWidth="2xl"
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Page Title *"
            value={editingPage?.title || ''}
            onChange={(e) => {
              const title = e.target.value;
              const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              setEditingPage({
                ...editingPage,
                title,
                slug: editingPage?._id ? editingPage.slug : slug,
              });
            }}
            placeholder="e.g. Custom Bespoke Atelier"
            required
          />

          <Input
            label="URL Slug *"
            value={editingPage?.slug || ''}
            onChange={(e) =>
              setEditingPage({
                ...editingPage,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              })
            }
            placeholder="e.g. bespoke-atelier"
            required
          />

          <RichTextEditor
            label="Page Body Content & Narrative"
            value={editingPage?.body || ''}
            onChange={(val) => setEditingPage({ ...editingPage, body: val })}
            placeholder="Enter page content, promotional text, or luxury brand story..."
            minHeight="200px"
          />

          {/* Select Products to Feature on this Page */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Attached Products Showcase ({editingPage?.selectedProducts?.length || 0} Selected)
                </label>
                <span className="text-[11px] text-slate-500">
                  Optional: Attach catalog products to display as a featured buyable grid at the bottom of this page.
                </span>
              </div>
            </div>

            {/* Selected Products Badges */}
            {editingPage?.selectedProducts && editingPage.selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-slate-200">
                {editingPage.selectedProducts.map((pId) => {
                  const prod = allProducts.find(
                    (p) => (p.id || (p as any)._id) === pId || p.slug === pId
                  );
                  return (
                    <span
                      key={pId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-semibold"
                    >
                      <span>{prod?.name || pId}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingPage.selectedProducts || []).filter((id) => id !== pId);
                          setEditingPage({ ...editingPage, selectedProducts: updated });
                        }}
                        className="text-amber-600 hover:text-amber-900 font-bold ml-0.5 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products to attach to this page..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>

            <div className="max-h-44 overflow-y-auto space-y-1 pr-1 border border-slate-200 rounded-xl p-2 bg-white">
              {(() => {
                const query = productSearch.toLowerCase().trim();
                const matches = allProducts.filter((prod) => {
                  if (!query) return true;
                  const nameMatch = prod.name?.toLowerCase().includes(query);
                  const catMatch = typeof prod.category === 'string'
                    ? prod.category.toLowerCase().includes(query)
                    : (prod.category as any)?.name?.toLowerCase().includes(query);
                  const skuMatch = prod.sku?.toLowerCase().includes(query);
                  const slugMatch = prod.slug?.toLowerCase().includes(query);
                  return nameMatch || catMatch || skuMatch || slugMatch;
                });

                if (matches.length === 0) {
                  return (
                    <p className="text-center py-4 text-xs text-slate-400 font-medium">
                      {allProducts.length === 0 ? 'Loading catalog products...' : 'No matching products found'}
                    </p>
                  );
                }

                return matches.map((prod) => {
                  const pId = prod.id || (prod as any)._id || prod.slug;
                  const isChecked = editingPage?.selectedProducts?.some(
                    (id) => id === prod.id || id === (prod as any)._id || id === prod.slug
                  );

                  return (
                    <label
                      key={pId}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-colors text-xs ${
                        isChecked
                          ? 'bg-amber-50/60 border-amber-200 text-amber-950 font-semibold'
                          : 'hover:bg-slate-50 border-transparent text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={!!isChecked}
                          onChange={(e) => {
                            const current = editingPage?.selectedProducts || [];
                            const updated = e.target.checked
                              ? [...current, pId]
                              : current.filter(
                                  (id) => id !== prod.id && id !== (prod as any)._id && id !== prod.slug
                                );
                            setEditingPage({ ...editingPage, selectedProducts: updated });
                          }}
                          className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                        />
                        {prod.images?.[0] && (
                          <img
                            src={typeof prod.images[0] === 'string' ? prod.images[0] : (prod.images[0] as any)?.url}
                            alt={prod.name}
                            className="w-7 h-7 rounded-md object-cover border border-slate-200"
                          />
                        )}
                        <span className="text-slate-900">{prod.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">${prod.basePrice}</span>
                    </label>
                  );
                });
              })()}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="ghost" onClick={() => setIsPageModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleSavePage} leftIcon={<Save className="w-4 h-4" />}>
              Save Page Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
