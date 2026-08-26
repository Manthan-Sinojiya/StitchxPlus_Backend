import { useState, useEffect } from 'react';
import {
  contentService,
  CMSNavItem,
  CMSFooterData,
  CMSAnnouncement,
  CMSHomeData,
  CMSPage,
} from '../../services/contentService';
import { adminService } from '../../services/adminService';
import { Product } from '@stitchx/shared';
import {
  Card,
  Button,
  Input,
  Select,
  Tabs,
  Modal,
  ImageUploader,
  useToast,
  Pagination,
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
} from 'lucide-react';

export function AdminContentPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('nav');
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
      const [n, f, a, h, p, prods] = await Promise.all([
        contentService.getBlockContent('nav').catch(() => []),
        contentService.getBlockContent('footer').catch(() => ({ columns: [], socialLinks: {}, contact: {} })),
        contentService.getBlockContent('announcement').catch(() => ({ text: '', link: '', isActive: false })),
        contentService.getBlockContent('home').catch(() => ({ hero: {}, newsletter: {} })),
        contentService.getAdminPages().catch(() => []),
        adminService.getProducts({ limit: 1000 }).catch(() => []),
      ]);

      setNavItems(Array.isArray(n) ? n : []);
      setFooterData(f || { columns: [], socialLinks: {}, contact: {} });
      setAnnouncement(a || { text: '', link: '', isActive: false });
      setHomeData(h || { hero: { headline: '', subtext: '' } });
      setPages(Array.isArray(p) ? p : []);
      setAllProducts(Array.isArray(prods) ? prods : []);
    } catch (_err) {
      toast('error', 'Load Error', 'Failed to load CMS content from server');
    } finally {
      setLoading(false);
    }
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
    if (!window.confirm(`Are you sure you want to delete the page "${title}"?`)) return;
    try {
      await contentService.deletePage(id);
      window.dispatchEvent(new CustomEvent('cms-nav-updated'));
      toast('success', 'Page Deleted', `Page "${title}" deleted.`);
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
            <span className="text-xs text-slate-400 font-mono">Site Content Engine</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-slate-900 mt-1">
            Site Content & Dynamic Pages Manager
          </h1>
        </div>
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
                      className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                          <span className="text-xs font-bold text-slate-900 uppercase">Main Link</span>
                        </div>
                        <button
                          onClick={() => removeNavItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove Main Menu Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Link Label"
                          value={item.label}
                          onChange={(e) => {
                            const updated = [...(navItems || [])];
                            updated[idx].label = e.target.value;
                            setNavItems(updated);
                          }}
                        />
                        <Input
                          label="Link Target URL"
                          value={item.link}
                          onChange={(e) => {
                            const updated = [...(navItems || [])];
                            updated[idx].link = e.target.value;
                            setNavItems(updated);
                          }}
                        />
                      </div>

                      {/* Sub-Menu Configurator */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-amber-600" />
                            Dropdown Sub-Menu Links ({item.children?.length || 0})
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
                                  className="p-1 text-slate-400 hover:text-red-600 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic block">
                            No sub-menu items configured for this link. Click "+ Add Sub-Menu Child Link" to create a hover dropdown menu.
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={addNavItem} leftIcon={<Plus className="w-4 h-4" />}>
                    Add Top-Level Menu Item
                  </Button>
                </div>
              </Card>
            ),
          },
          {
            id: 'footer',
            label: (
              <span className="flex items-center gap-2 font-medium">
                <Globe className="w-4 h-4" /> Footer & Social
              </span>
            ),
            content: (
              <Card className="p-6 space-y-6 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900">
                      Footer Columns & Social Links
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure dynamic footer columns, social handles, and concierge contact details.
                    </p>
                  </div>
                  <Button variant="gold" size="sm" onClick={handleSaveFooter} leftIcon={<Save className="w-4 h-4" />}>
                    Save Footer
                  </Button>
                </div>

                <div className="space-y-6">
                  {(footerData?.columns || []).map((col, colIdx) => (
                    <div key={colIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <Input
                          label={`Column #${colIdx + 1} Title`}
                          value={col.title}
                          onChange={(e) => {
                            const updated = [...(footerData.columns || [])];
                            updated[colIdx].title = e.target.value;
                            setFooterData({ ...footerData, columns: updated });
                          }}
                          className="font-bold text-slate-900 max-w-xs"
                        />
                        <button
                          onClick={() => removeFooterColumn(colIdx)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Remove Column
                        </button>
                      </div>

                      <div className="space-y-2 pl-4 border-l-2 border-amber-500">
                        {(col?.links || []).map((link, lIdx) => (
                          <div key={lIdx} className="flex items-center gap-3">
                            <Input
                              placeholder="Text"
                              value={link.text}
                              onChange={(e) => {
                                const updated = [...footerData.columns];
                                updated[colIdx].links[lIdx].text = e.target.value;
                                setFooterData({ ...footerData, columns: updated });
                              }}
                            />
                            <Input
                              placeholder="URL"
                              value={link.url}
                              onChange={(e) => {
                                const updated = [...footerData.columns];
                                updated[colIdx].links[lIdx].url = e.target.value;
                                setFooterData({ ...footerData, columns: updated });
                              }}
                            />
                            <button
                              onClick={() => removeFooterLink(colIdx, lIdx)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" onClick={() => addFooterLink(colIdx)} className="text-xs">
                          + Add Link
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={addFooterColumn} leftIcon={<Plus className="w-4 h-4" />}>
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
                <Bell className="w-4 h-4" /> Announcement Bar
              </span>
            ),
            content: (
              <Card className="p-6 space-y-6 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900">
                      Announcement Bar Settings
                    </h3>
                    <p className="text-xs text-slate-500">
                      Control top banner broadcast text and link.
                    </p>
                  </div>
                  <Button variant="gold" size="sm" onClick={handleSaveAnnouncement} leftIcon={<Save className="w-4 h-4" />}>
                    Save Announcement
                  </Button>
                </div>

                <div className="space-y-4 max-w-xl">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      id="announcement-active"
                      checked={announcement.isActive}
                      onChange={(e) => setAnnouncement({ ...announcement, isActive: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded cursor-pointer border-slate-300"
                    />
                    <label htmlFor="announcement-active" className="text-xs font-bold text-slate-900 cursor-pointer">
                      Enable Top Announcement Banner
                    </label>
                  </div>

                  <Input
                    label="Banner Text"
                    value={announcement.text}
                    onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                  />

                  <Input
                    label="Target Link (optional)"
                    value={announcement.link || ''}
                    onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })}
                  />
                </div>
              </Card>
            ),
          },
          {
            id: 'home',
            label: (
              <span className="flex items-center gap-2 font-medium">
                <Home className="w-4 h-4" /> Homepage Hero Section
              </span>
            ),
            content: (
              <Card className="p-6 space-y-6 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      Homepage Hero Section & Media Manager
                    </h3>
                    <p className="text-xs text-slate-500">
                      Update main hero headline, subtext, CTA links, and hero background media.
                    </p>
                  </div>
                  <Button variant="gold" size="sm" onClick={handleSaveHome} leftIcon={<Save className="w-4 h-4" />}>
                    Save Homepage Hero
                  </Button>
                </div>

                <div className="space-y-6 max-w-3xl">
                  <Input
                    label="Hero Headline (optional)"
                    value={homeData.hero?.headline || ''}
                    placeholder="e.g. Bespoke Tailoring Redefined"
                    onChange={(e) =>
                      setHomeData({
                        ...homeData,
                        hero: { ...homeData.hero, headline: e.target.value },
                      })
                    }
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Hero Subtext
                    </label>
                    <textarea
                      rows={3}
                      value={homeData.hero?.subtext || ''}
                      placeholder="e.g. Experience bespoke custom menswear, 3D digital suit customization..."
                      onChange={(e) =>
                        setHomeData({
                          ...homeData,
                          hero: { ...homeData.hero, subtext: e.target.value },
                        })
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-sans"
                    />
                  </div>

                  <ImageUploader
                    label="Hero Background Banner Media (Upload Image or Enter URL)"
                    value={{ url: homeData.hero?.image || '', altText: homeData.hero?.altText || 'Stitchx Plus Homepage Hero Banner' }}
                    onChange={(res) =>
                      setHomeData({
                        ...homeData,
                        hero: { ...homeData.hero, image: res.url, altText: res.altText },
                      })
                    }
                    folder="stitchx_hero"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="CTA Button Text"
                      value={homeData.hero?.ctaText || ''}
                      placeholder="Shop Collection"
                      onChange={(e) =>
                        setHomeData({
                          ...homeData,
                          hero: { ...homeData.hero, ctaText: e.target.value },
                        })
                      }
                    />
                    <Input
                      label="CTA Target Link"
                      value={homeData.hero?.ctaLink || ''}
                      placeholder="/collections"
                      onChange={(e) =>
                        setHomeData({
                          ...homeData,
                          hero: { ...homeData.hero, ctaLink: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-600" /> Hero Section SEO Meta Tags
                    </h4>
                    <Input
                      label="SEO Meta Title"
                      value={homeData.hero?.seoTitle || ''}
                      placeholder="Custom Menswear & Bespoke Suits | Stitchx Plus Atelier"
                      onChange={(e) =>
                        setHomeData({
                          ...homeData,
                          hero: { ...homeData.hero, seoTitle: e.target.value },
                        })
                      }
                    />
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        SEO Meta Description
                      </label>
                      <textarea
                        rows={2}
                        value={homeData.hero?.seoDescription || ''}
                        placeholder="Experience bespoke custom menswear, 3D digital suit customization..."
                        onChange={(e) =>
                          setHomeData({
                            ...homeData,
                            hero: { ...homeData.hero, seoDescription: e.target.value },
                          })
                        }
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ),
          },
          {
            id: 'pages',
            label: (
              <span className="flex items-center gap-2 font-medium">
                <FileText className="w-4 h-4" /> Dynamic CMS Pages
              </span>
            ),
            content: (
              <Card className="p-6 space-y-6 bg-white border border-slate-200/80 shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900">
                      Dynamic Custom CMS Pages
                    </h3>
                    <p className="text-xs text-slate-500">
                      Create and manage custom landing pages, sizing guides, and about us content.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search pages by title or slug..."
                    value={pageSearch}
                    onChange={(e) => setPageSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80">
                      <tr>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Slug</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {paginatedCmsPages.length > 0 ? (
                        paginatedCmsPages.map((page) => (
                          <tr key={page._id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">{page.title}</td>
                            <td className="py-3 px-4 font-mono text-slate-600">/{page.slug}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  page.status === 'published'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {page.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setEditingPage(page);
                                  setIsPageModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-amber-700 rounded hover:bg-slate-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePage(page._id!, page.title)}
                                className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                            No custom pages found matching query. Click "Create New CMS Page" above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalCmsPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-600">
                    <span className="font-medium">
                      Showing {Math.min((cmsPageCurrentPage - 1) * pagesPerPage + 1, filteredCmsPages.length)} to{' '}
                      {Math.min(cmsPageCurrentPage * pagesPerPage, filteredCmsPages.length)} of {filteredCmsPages.length} pages
                    </span>
                    <Pagination
                      currentPage={cmsPageCurrentPage}
                      totalPages={totalCmsPages}
                      onPageChange={setCmsPageCurrentPage}
                    />
                  </div>
                )}
              </Card>
            ),
          },
        ]}
      />

      {/* CMS Page Create/Edit Modal */}
      <Modal
        isOpen={isPageModalOpen}
        onClose={() => setIsPageModalOpen(false)}
        title={editingPage?._id ? `Edit Page: ${editingPage.title}` : 'Create New CMS Page'}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <Input
            label="Page Title *"
            value={editingPage?.title || ''}
            onChange={(e) => {
              const title = e.target.value;
              const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
              setEditingPage({
                ...editingPage,
                title,
                slug: editingPage?._id ? editingPage.slug : slug,
              });
            }}
            placeholder="e.g. Master Atelier Bespoke Guide"
          />

          <Input
            label="URL Slug *"
            value={editingPage?.slug || ''}
            onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase() })}
            placeholder="master-atelier-bespoke-guide"
          />

          <Select
            label="Publication Status"
            value={editingPage?.status || 'published'}
            onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value as any })}
            options={[
              { value: 'published', label: 'Published (Public Access)' },
              { value: 'draft', label: 'Draft (Internal Preview Only)' },
            ]}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Page Content (HTML / Markdown Supported)
            </label>
            <textarea
              rows={6}
              value={editingPage?.body || ''}
              onChange={(e) => setEditingPage({ ...editingPage, body: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
            />
          </div>

          {/* Select Products to Feature on this Page */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Attached Products Showcase ({editingPage?.selectedProducts?.length || 0} Selected)
              </label>
              <span className="text-[11px] text-slate-500">Only selected products display on page</span>
            </div>

            <input
              type="text"
              placeholder="Search products to attach..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-xl p-2 bg-white">
              {allProducts
                .filter((prod) => prod.name.toLowerCase().includes(productSearch.toLowerCase()))
                .map((prod) => {
                  const pId = prod.id || (prod as any)._id;
                  const isChecked = editingPage?.selectedProducts?.includes(pId);

                  return (
                    <label
                      key={pId}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!isChecked}
                          onChange={(e) => {
                            const current = editingPage?.selectedProducts || [];
                            const updated = e.target.checked
                              ? [...current, pId]
                              : current.filter((id) => id !== pId);
                            setEditingPage({ ...editingPage, selectedProducts: updated });
                          }}
                          className="w-4 h-4 text-amber-600 rounded"
                        />
                        <span className="font-medium text-slate-900">{prod.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">${prod.basePrice}</span>
                    </label>
                  );
                })}
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
