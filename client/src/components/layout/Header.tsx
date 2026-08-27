import React, { useState, useEffect, useCallback } from 'react';
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
  ChevronDown,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { authService } from '../../services/authService';
import { contentService, CMSNavItem, CMSAnnouncement } from '../../services/contentService';
import { categoryService } from '../../services/categoryService';
import { Category } from '@stitchx/shared';
import { Drawer, Badge } from '../ui';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, openCart, fetchCart } = useCartStore();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [cmsNavItems, setCmsNavItems] = useState<CMSNavItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [announcement, setAnnouncement] = useState<CMSAnnouncement | null>(null);

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
      setIsMobileMenuOpen(false);
    }
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

      <div className="max-w-7xl mx-auto px-[8px] h-20 flex items-center justify-between gap-4 relative">
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

        {/* IN-BUILT INLINE SEARCH BAR IN NAVBAR */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden sm:flex items-center flex-1 max-w-xs md:max-w-sm lg:max-w-md relative"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search garments, suits, fabrics..."
            className="w-full bg-cream-100/80 hover:bg-cream-100 focus:bg-white border border-charcoal-200/80 focus:border-bronze-500 rounded-full text-xs py-2 pl-9 pr-8 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-bronze-500/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

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

          {/* Cart Trigger */}
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

          {/* Account Icon / Badge & LogOut */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <Link
                to="/account"
                className="flex items-center gap-2 p-2 px-3 text-charcoal-800 hover:text-charcoal-950 bg-cream-50 hover:bg-cream-100 rounded-xl border border-charcoal-200 transition-all text-xs font-semibold"
              >
                <UserIcon className="w-4 h-4 text-bronze-600" />
                <span className="hidden sm:inline max-w-[100px] truncate">{user?.name.split(' ')[0]}</span>
              </Link>
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

            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl hover:bg-cream-100 font-semibold text-charcoal-900 text-base flex items-center justify-between"
                >
                  <span>My Account ({user?.name})</span>
                  <Badge variant="gold">{user?.role}</Badge>
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl bg-charcoal-950 text-white font-bold text-sm"
                  >
                    Admin Portal
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
