import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Menu,
  Sparkles,
  Scissors,
  LogOut,
  ShieldAlert,
  Shield,
  ChevronDown,
  X,
  Tag,
  Palette,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { authService } from '../../services/authService';
import { contentService, CMSNavItem, CMSAnnouncement } from '../../services/contentService';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { Category } from '@stitchx/shared';
import { Drawer, Badge } from '../ui';

// Master data lists for fabric and color suggestions
const KNOWN_FABRICS = [
  { name: 'Italian Super 150s Wool', composition: '100% Fine Wool', origin: 'Biella, Italy' },
  { name: 'Pure Mulberry Silk', composition: '100% Silk Satin', origin: 'Como, Italy' },
  { name: 'Mongolian Cashmere', composition: '100% Cashmere', origin: 'Ulaanbaatar' },
  { name: 'Irish Linen', composition: '100% Pure Linen', origin: 'Belfast, Ireland' },
  { name: 'Royal Silk-Velvet', composition: '80% Silk, 20% Rayon', origin: 'Lyons, France' },
  { name: 'Harris Tweed', composition: '100% Virgin Wool', origin: 'Scotland' },
];

const KNOWN_COLORS = [
  { name: 'Navy Blue', hex: '#1B2A4A' },
  { name: 'Midnight Black', hex: '#0F172A' },
  { name: 'Charcoal Grey', hex: '#334155' },
  { name: 'Emerald Green', hex: '#064E3B' },
  { name: 'Burgundy Wine', hex: '#881337' },
  { name: 'Ivory Cream', hex: '#FEF3C7' },
  { name: 'Royal Sapphire', hex: '#1E3A8A' },
];

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, openCart, fetchCart } = useCartStore();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Multi-category search suggestion states
  const [productResults, setProductResults] = useState<any[]>([]);
  const [categoryResults, setCategoryResults] = useState<any[]>([]);
  const [fabricResults, setFabricResults] = useState<any[]>([]);
  const [colorResults, setColorResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'categories' | 'fabrics' | 'colors'>('all');

  const [cmsNavItems, setCmsNavItems] = useState<CMSNavItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [announcement, setAnnouncement] = useState<CMSAnnouncement | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Click outside to close search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-Category Live Autocomplete Search logic
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setProductResults([]);
      setCategoryResults([]);
      setFabricResults([]);
      setColorResults([]);
      return;
    }

    const matchedCats = categories.filter(
      (c: any) => c.name?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q)
    );

    const matchedFabrics = KNOWN_FABRICS.filter(
      (f) => f.name.toLowerCase().includes(q) || f.composition.toLowerCase().includes(q)
    );

    const matchedColors = KNOWN_COLORS.filter(
      (c) => c.name.toLowerCase().includes(q)
    );

    setCategoryResults(matchedCats);
    setFabricResults(matchedFabrics);
    setColorResults(matchedColors);

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await productService.getProducts({ search: searchQuery.trim(), limit: 6 });
        const list = Array.isArray(res.data?.products)
          ? res.data.products
          : Array.isArray(res.data)
          ? res.data
          : Array.isArray(res)
          ? (res as any)
          : [];
        setProductResults(list);
      } catch (_err) {
        setProductResults([]);
      } finally {
        setSearching(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery, categories]);

  const totalResultsCount =
    productResults.length + categoryResults.length + fabricResults.length + colorResults.length;

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const fetchNavData = useCallback(async () => {
    try {
      const [items, catRes, annData] = await Promise.all([
        contentService.getNavContent().catch(() => []),
        categoryService.getCategories().catch(() => ({ data: [] } as any)),
        contentService.getAnnouncementContent().catch(() => null),
      ]);

      const catList = Array.isArray(catRes?.data)
        ? catRes.data
        : Array.isArray(catRes)
          ? catRes
          : [];

      setCategories(catList.filter((c: any) => c.isActive !== false));

      if (Array.isArray(items)) {
        setCmsNavItems(items);
      }
      if (annData) {
        setAnnouncement(annData);
      }
    } catch (_err) {
      // Ignore navigation fetch errors
    }
  }, []);

  useEffect(() => {
    fetchNavData();
  }, [fetchNavData, location.pathname]);

  useEffect(() => {
    const handleCmsUpdate = () => {
      fetchNavData();
    };
    window.addEventListener('cms-nav-updated', handleCmsUpdate);
    return () => {
      window.removeEventListener('cms-nav-updated', handleCmsUpdate);
    };
  }, [fetchNavData]);

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleCategoryClick = (catSlug: string) => {
    navigate(`/collections?category=${encodeURIComponent(catSlug)}`);
    setIsSearchFocused(false);
    setIsMobileMenuOpen(false);
    setSearchQuery('');
  };

  const handleFabricClick = (fabricName: string) => {
    navigate(`/collections?search=${encodeURIComponent(fabricName)}`);
    setIsSearchFocused(false);
    setIsMobileMenuOpen(false);
    setSearchQuery('');
  };

  const handleColorClick = (colorName: string) => {
    navigate(`/collections?search=${encodeURIComponent(colorName)}`);
    setIsSearchFocused(false);
    setIsMobileMenuOpen(false);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (_err) {
      // Ignore API logout errors
    } finally {
      clearAuth();
      setIsMobileMenuOpen(false);
      navigate('/login');
    }
  };

  // Build dynamic department & category navigation structure from DB
  const departments = categories.filter(
    (c: any) => (c.isTopLevel || c.type === 'department' || !c.parentCategory) && c.isActive !== false
  );
  const subCategories = categories.filter(
    (c: any) => (!c.isTopLevel && c.type !== 'department' && !!c.parentCategory) && c.isActive !== false
  );

  const departmentNavItems = departments.map((dept) => {
    const deptId = dept.id || (dept as any)._id;
    const children = subCategories
      .filter((c: any) => {
        const parentId = typeof c.parentCategory === 'object' ? (c.parentCategory?.id || (c.parentCategory as any)?._id) : c.parentCategory;
        return parentId === deptId;
      })
      .map((c) => ({
        id: c.id || (c as any)._id,
        label: c.name,
        link: `/collections?department=${dept.slug}&category=${c.slug || c.name.toLowerCase()}`,
      }));

    return {
      id: `dept-${dept.slug}`,
      label: dept.name,
      link: `/collections?department=${dept.slug}`,
      children: children.length > 0 ? children : undefined,
    };
  });

  const categorySubItems = (subCategories.length > 0 ? subCategories : categories).map((cat) => ({
    id: cat.id || (cat as any)._id,
    label: cat.name,
    link: `/collections?category=${cat.slug || cat.name.toLowerCase()}`,
  }));

  let navItems: CMSNavItem[] = [];

  if (cmsNavItems && cmsNavItems.length > 0) {
    // Render EXACTLY what the admin configured in the CMS Navigation Panel
    navItems = cmsNavItems.map((item) => {
      const isCollectionsLink =
        item.link === '/collections' ||
        item.label.toLowerCase().includes('collection') ||
        item.label.toLowerCase().includes('department') ||
        item.label.toLowerCase().includes('category');

      if (isCollectionsLink && (!item.children || item.children.length === 0)) {
        const dynamicChildren = departmentNavItems.length > 0
          ? departmentNavItems.flatMap(d => d.children || [{ id: d.id, label: d.label, link: d.link }])
          : categorySubItems;

        if (dynamicChildren.length > 0) {
          return {
            ...item,
            children: dynamicChildren,
          };
        }
      }
      return item;
    });
  } else {
    // If no custom CMS navigation configured, dynamically render Home, active DB departments/categories, & core studio links
    navItems = [
      { id: 'n-home', label: 'Home', link: '/' },
      ...(departmentNavItems.length > 0
        ? departmentNavItems
        : [
            {
              id: 'n-collections',
              label: 'Collections',
              link: '/collections',
              children: categorySubItems.length > 0 ? categorySubItems : undefined,
            },
          ]),
      { id: 'n-customize', label: 'Customize Studio', link: '/customize' },
      { id: 'n-blog', label: 'Journal', link: '/blog' },
    ];
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-charcoal-200/80 text-charcoal-950 transition-all shadow-subtle">
      {/* Top Announcement Bar */}
      {announcement?.isActive && announcement?.text && (
        <div className="bg-cream-100 border-b border-charcoal-200/50 text-charcoal-800 text-xs py-2 px-4 text-center font-medium tracking-wider uppercase flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-bronze-600 animate-pulse" />
          {announcement.link ? (
            <Link to={announcement.link} className="hover:text-bronze-600 hover:underline flex items-center gap-1 transition-colors">
              <span>{announcement.text}</span>
            </Link>
          ) : (
            <span>{announcement.text}</span>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 relative">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden text-charcoal-700 hover:text-charcoal-950 p-2 rounded-xl hover:bg-cream-100 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-charcoal-950 flex items-center justify-center text-bronze-400 shadow-card group-hover:scale-105 transition-transform">
            <Scissors className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-xl tracking-tight text-charcoal-950 flex items-center gap-1">
              Stitchx<span className="text-bronze-600 font-normal">Plus</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-charcoal-500 font-semibold -mt-1">
              Bespoke Menswear
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-charcoal-700 h-20">
          {navItems.map((item) => {
            const hasColumns = item.columns && item.columns.length > 0;
            const hasChildren = (item.children && item.children.length > 0) || hasColumns;
            const isMega = item.isMegaMenu || hasColumns;
            const isCustomize = item.link === '/customize';

            return (
              <div
                key={item.id || item.link}
                className={`${isMega ? 'static' : 'relative'} group h-20 flex items-center`}
              >
                <Link
                  to={item.link}
                  className={`hover:text-bronze-600 transition-colors py-2 flex items-center gap-1.5 font-semibold text-sm ${
                    isCustomize ? 'text-bronze-600 hover:text-bronze-700 font-bold' : ''
                  }`}
                >
                  {isCustomize && <Sparkles className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                  {hasChildren && (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-bronze-600 group-hover:rotate-180 transition-transform" />
                  )}
                </Link>

                {/* Sub-menu Dropdown on Hover */}
                {hasChildren &&
                  (isMega ? (
                    /* Mega Menu Multi-Column Dropdown */
                    <div className="absolute left-0 right-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto px-4">
                      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 max-w-6xl mx-auto z-50">
                        {/* Multi-Column Headings & Links */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                          {(item.columns && item.columns.length > 0
                            ? item.columns
                            : [
                                {
                                  id: 'col_fallback',
                                  title: 'CATEGORIES',
                                  links: (item.children || []).map((c, i) => ({
                                    id: c.id || `sub_${i}`,
                                    label: c.label,
                                    link: c.link,
                                    badge: (c as any).badge,
                                  })),
                                },
                              ]
                          ).map((col, cIdx) => (
                            <div key={(col as any).id || cIdx} className="space-y-4">
                              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2.5">
                                {col.title}
                              </h4>
                              <ul className="space-y-2.5">
                                {col.links.map((sub, sIdx) => (
                                  <li key={(sub as any).id || sIdx}>
                                    <Link
                                      to={sub.link}
                                      className="group/link flex items-center justify-between text-xs sm:text-sm font-medium text-slate-700 hover:text-amber-600 transition-colors"
                                    >
                                      <span className="group-hover/link:translate-x-1 transition-transform inline-block">
                                        {sub.label}
                                      </span>
                                      {sub.badge && (
                                        <span
                                          className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                            sub.badge.toLowerCase().includes('hot')
                                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                                              : sub.badge.toLowerCase().includes('new')
                                              ? 'bg-purple-50 text-purple-600 border-purple-200'
                                              : 'bg-amber-50 text-amber-700 border-amber-200'
                                          }`}
                                        >
                                          {sub.badge}
                                        </span>
                                      )}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Featured Promo Banner Card */}
                        {item.megaImage && (
                          <div className="w-full md:w-[260px] lg:w-[290px] shrink-0">
                            <Link
                              to={item.megaImageLink || item.link}
                              className="group/banner relative block rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[3/4] border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-500 bg-slate-950"
                            >
                              <img
                                src={item.megaImage}
                                alt={item.megaImageTitle || item.label}
                                className="absolute inset-0 w-full h-full object-cover object-center group-hover/banner:scale-105 transition-transform duration-700 ease-out opacity-90"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                              <div className="absolute bottom-4 left-4 right-4 z-10 text-white space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                                  Featured
                                </span>
                                <h5 className="text-lg sm:text-xl font-bold font-serif leading-tight text-white drop-shadow-sm">
                                  {item.megaImageTitle || `Shop ${item.label}`}
                                </h5>
                              </div>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Simple Dropdown */
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[230px]">
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 space-y-1">
                        {item.children!.map((child) => (
                          <Link
                            key={child.id || child.link}
                            to={child.link}
                            className="block px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 hover:text-amber-800 hover:bg-amber-50/80 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            );
          })}
        </nav>

        {/* IN-BUILT INLINE SEARCH BAR IN NAVBAR WITH AUTOCOMPLETE POPOVER */}
        <div ref={searchContainerRef} className="hidden sm:block flex-1 max-w-xs md:max-w-sm lg:max-w-md relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              placeholder="Search garments, suits, fabrics..."
              className="w-full bg-cream-100/80 hover:bg-cream-100 focus:bg-white border border-charcoal-200/80 focus:border-bronze-500 rounded-full text-xs py-2 pl-9 pr-8 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-bronze-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown Popover */}
          {isSearchFocused && (
            <div className="absolute left-0 right-0 top-11 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3.5 z-50 animate-fade-in space-y-3 min-w-[340px]">
              {/* Filter Tabs when query is active */}
              {searchQuery.trim() && (
                <div className="flex items-center gap-1 border-b border-slate-100 pb-2 overflow-x-auto text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-slate-950 text-amber-400'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    All ({totalResultsCount})
                  </button>
                  {productResults.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        activeTab === 'products'
                          ? 'bg-slate-950 text-amber-400'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      Products ({productResults.length})
                    </button>
                  )}
                  {categoryResults.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('categories')}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        activeTab === 'categories'
                          ? 'bg-slate-950 text-amber-400'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      Categories ({categoryResults.length})
                    </button>
                  )}
                  {fabricResults.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('fabrics')}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        activeTab === 'fabrics'
                          ? 'bg-slate-950 text-amber-400'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      Fabrics ({fabricResults.length})
                    </button>
                  )}
                  {colorResults.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('colors')}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        activeTab === 'colors'
                          ? 'bg-slate-950 text-amber-400'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      Colors ({colorResults.length})
                    </button>
                  )}
                </div>
              )}

              {/* Autocomplete Results Container */}
              {searching ? (
                <div className="py-5 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  Searching atelier catalog...
                </div>
              ) : totalResultsCount > 0 && searchQuery.trim() ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {/* CATEGORIES */}
                  {(activeTab === 'all' || activeTab === 'categories') && categoryResults.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-amber-600" />
                        Categories ({categoryResults.length})
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {categoryResults.map((cat: any) => (
                          <button
                            key={cat.slug || cat.id || cat._id}
                            type="button"
                            onClick={() => handleCategoryClick(cat.slug)}
                            className="w-full text-left flex items-center justify-between p-2 hover:bg-amber-50/70 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-amber-200/60"
                          >
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                                {cat.name}
                              </h5>
                              {cat.description && (
                                <p className="text-[10px] text-slate-500 truncate">{cat.description}</p>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full shrink-0">
                              Category →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FABRICS */}
                  {(activeTab === 'all' || activeTab === 'fabrics') && fabricResults.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-1.5">
                        <Scissors className="w-3 h-3 text-amber-600" />
                        Fabrics & Composition ({fabricResults.length})
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {fabricResults.map((fab) => (
                          <button
                            key={fab.name}
                            type="button"
                            onClick={() => handleFabricClick(fab.name)}
                            className="w-full text-left flex items-center justify-between p-2 hover:bg-amber-50/70 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-amber-200/60"
                          >
                            <div>
                              <h5 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                                {fab.name}
                              </h5>
                              <span className="text-[10px] text-slate-500 font-medium">{fab.composition} • {fab.origin}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                              Fabric →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COLORS */}
                  {(activeTab === 'all' || activeTab === 'colors') && colorResults.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-1.5">
                        <Palette className="w-3 h-3 text-amber-600" />
                        Color Shades ({colorResults.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5 px-1 pt-1">
                        {colorResults.map((col) => (
                          <button
                            key={col.name}
                            type="button"
                            onClick={() => handleColorClick(col.name)}
                            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-amber-100/70 border border-slate-200 rounded-xl transition-colors cursor-pointer text-xs font-bold text-slate-800"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span>{col.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PRODUCTS */}
                  {(activeTab === 'all' || activeTab === 'products') && productResults.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-1.5">
                        <ShoppingBag className="w-3 h-3 text-amber-600" />
                        Products & Garments ({productResults.length})
                      </div>
                      <div className="space-y-1">
                        {productResults.map((prod) => {
                          const prodId = prod._id || prod.id;
                          const prodSlug = prod.slug || prodId;
                          const imgUrl = (Array.isArray(prod.images) ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0]?.url) : null) || '/images/hero/suit1.jpg';
                          const catName = typeof prod.category === 'object' ? prod.category?.name : prod.category;

                          return (
                            <Link
                              key={prodId}
                              to={`/products/${prodSlug}`}
                              onClick={() => {
                                setIsSearchFocused(false);
                                setSearchQuery('');
                              }}
                              className="flex items-center gap-3 p-2 hover:bg-amber-50/70 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-amber-200/60"
                            >
                              <div className="w-10 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200/80">
                                <img
                                  src={imgUrl}
                                  alt={prod.name}
                                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                {catName && (
                                  <span className="text-[9px] font-mono font-bold uppercase text-amber-700 block">
                                    {catName}
                                  </span>
                                )}
                                <h4 className="text-xs font-bold font-serif text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                                  {prod.name}
                                </h4>
                                <span className="text-[11px] font-bold text-slate-950">
                                  ${prod.basePrice?.toFixed(2)}
                                </span>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full text-center text-xs font-bold text-amber-700 hover:text-amber-800 py-2.5 bg-amber-50/80 rounded-xl transition-colors cursor-pointer mt-2 border border-amber-200/60"
                  >
                    View All Search Results for &ldquo;{searchQuery}&rdquo; →
                  </button>
                </div>
              ) : searchQuery.trim() ? (
                <div className="py-4 text-center text-xs text-slate-500 font-medium">
                  No matching products, categories, fabrics, or colors found for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <div className="py-2 text-[11px] text-slate-500 font-medium px-1 space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider font-mono">Popular Categories:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(categories.length > 0 ? categories : [
                        { name: 'Bespoke Suits', slug: 'bespoke-suits' },
                        { name: 'Tuxedos & Formal', slug: 'tuxedos-formal' },
                        { name: 'Blazers & Jackets', slug: 'blazers-jackets' },
                        { name: 'Dress Shirts', slug: 'dress-shirts' },
                      ]).slice(0, 4).map((cat: any) => (
                        <button
                          key={cat.slug || cat.name}
                          type="button"
                          onClick={() => handleCategoryClick(cat.slug)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-semibold rounded-lg transition-colors cursor-pointer text-[11px]"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider font-mono">Luxury Fabrics & Colors:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Italian Wool', 'Silk Satin', 'Cashmere', 'Navy Blue', 'Emerald'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setSearchQuery(tag);
                            setIsSearchFocused(true);
                          }}
                          className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-md transition-colors cursor-pointer text-[11px]"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


        {/* Header Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="hidden md:flex items-center gap-1.5 text-bronze-800 font-bold hover:text-bronze-950 text-xs uppercase tracking-wider bg-bronze-50/90 hover:bg-bronze-100 px-3 py-2 rounded-xl border border-bronze-200/90 transition-all shadow-xs"
            >
              <ShieldAlert className="w-4 h-4 text-bronze-600" />
              <span>Admin Portal</span>
            </Link>
          )}

          {/* Cart Trigger (Hidden for Admin users) */}
          {user?.role !== 'ADMIN' && (
            <button
              onClick={openCart}
              className="relative p-2.5 bg-charcoal-950 hover:bg-charcoal-800 text-white rounded-xl font-bold transition-all shadow-card flex items-center gap-2"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-bronze-400" />
              <span className="hidden sm:inline text-xs uppercase font-extrabold tracking-wider">
                Cart
              </span>
              {cartCount > 0 && (
                <span className="bg-bronze-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Account Icon / Badge & LogOut */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              {user?.role === 'ADMIN' ? (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 p-2 px-3.5 text-white bg-gold-600 hover:bg-gold-500 rounded-xl transition-all text-xs font-bold shadow-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin Portal</span>
                </Link>
              ) : (
                <Link
                  to="/account"
                  className="flex items-center gap-2 p-2 px-3 text-charcoal-800 hover:text-charcoal-950 bg-cream-50 hover:bg-cream-100 rounded-xl border border-charcoal-200 transition-all text-xs font-semibold"
                >
                  <UserIcon className="w-4 h-4 text-bronze-600" />
                  <span className="hidden sm:inline max-w-[100px] truncate">{user?.name.split(' ')[0]}</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-charcoal-500 hover:text-rose-600 rounded-xl hover:bg-cream-100 transition-colors cursor-pointer flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 p-2 px-3.5 text-charcoal-800 hover:text-charcoal-950 bg-cream-50 hover:bg-cream-100 rounded-xl border border-charcoal-200 transition-all text-xs font-semibold"
              aria-label="User Account"
            >
              <UserIcon className="w-4 h-4 text-bronze-600" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        position="left"
        width="sm"
        title={
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-bronze-600" />
            <span>Navigation Menu</span>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Built-in Search in Mobile Drawer */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garments, suits..."
              className="w-full bg-slate-100 border border-slate-200 rounded-full text-xs py-2.5 pl-9 pr-8 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-bronze-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <div className="flex flex-col gap-3">
            {navItems.map((item) => {
              const hasColumns = item.columns && item.columns.length > 0;
              const hasChildren = (item.children && item.children.length > 0) || hasColumns;
              return (
                <div key={item.id || item.link} className="space-y-1">
                  <Link
                    to={item.link}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl hover:bg-cream-100 font-semibold text-charcoal-900 text-base block"
                  >
                    {item.label}
                  </Link>

                  {hasColumns ? (
                    <div className="pl-4 space-y-3 border-l-2 border-amber-500 ml-4 my-2">
                      {item.columns!.map((col, cIdx) => (
                        <div key={col.id || cIdx} className="space-y-1.5">
                          <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 pt-1">
                            {col.title}
                          </h5>
                          <div className="pl-2 space-y-1">
                            {col.links.map((sub, sIdx) => (
                              <Link
                                key={sub.id || sIdx}
                                to={sub.link}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-2 py-1.5 rounded text-xs font-medium text-slate-600 hover:text-amber-800 flex items-center justify-between"
                              >
                                <span>{sub.label}</span>
                                {sub.badge && (
                                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                                    {sub.badge}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    hasChildren && (
                      <div className="pl-6 space-y-1 border-l-2 border-amber-500 ml-4">
                        {item.children!.map((child) => (
                          <Link
                            key={child.id || child.link}
                            to={child.link}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:text-amber-800 block"
                          >
                            • {child.label}
                          </Link>
                        ))}
                      </div>
                    )
                  )}
                </div>
              );
            })}

            {user?.role !== 'ADMIN' && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openCart();
                }}
                className="px-4 py-3 rounded-xl hover:bg-cream-100 font-semibold text-charcoal-900 text-base flex items-center justify-between w-full text-left"
              >
                <span>Shopping Cart</span>
                <Badge variant="gold">{cartCount}</Badge>
              </button>
            )}

            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' ? (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl bg-gold-600 text-white font-bold text-sm flex items-center justify-between"
                  >
                    <span>Admin Portal</span>
                    <Shield className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    to="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl hover:bg-cream-100 font-semibold text-charcoal-900 text-base flex items-center justify-between"
                  >
                    <span>My Account ({user?.name})</span>
                    <Badge variant="gold">{user?.role}</Badge>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 rounded-xl text-left font-semibold text-rose-600 hover:bg-rose-50 text-base flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl hover:bg-cream-100 font-semibold text-charcoal-900 text-base"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl bg-bronze-500 text-white font-bold text-base text-center"
                >
                  Create Bespoke Account
                </Link>
              </>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
}
