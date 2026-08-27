import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Tag as TagIcon, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Badge, Accordion, Pagination } from '../components/ui';
import { ProductCard } from '../components/common/ProductCard';
import { SEOHead } from '../components/seo/SEOHead';
import { contentService, CMSHomeData, CMSFAQItem, CMSTestimonial } from '../services/contentService';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Product, Category, CustomSection, HomeLayoutSection } from '@stitchx/shared';
import { CuratedCollectionsSection } from '../components/home/CuratedCollectionsSection';

const HERO_SLIDES = [
  {
    subtitle: 'DISCOVER THE ART OF MODERN DRESSING',
    title: 'Find Your Signature Style',
    subtext: 'Experience bespoke custom menswear, 3D digital suit customization, and Italian wool fabrics tailored precisely to your silhouette.',
    ctaText: 'Shop Collection',
    ctaLink: '/collections',
    image: '/images/hero/suit1.jpg',
    altText: 'Stitchx Plus Double Breasted Italian Bespoke Navy Suit',
  },
  {
    subtitle: 'ITALIAN WOOL CRAFTSMANSHIP',
    title: 'Masterfully Tailored Bespoke Suits',
    subtext: 'Hand-cut pattern engineering crafted from premier mills in Biella & Como, Italy.',
    ctaText: 'Design Your Suit',
    ctaLink: '/customize',
    image: '/images/hero/suit2.jpg',
    altText: 'Stitchx Plus Atelier Tailoring Studio Italian Fabrics',
  },
  {
    subtitle: 'THE TUXEDO ATELIER',
    title: 'Black Tie Luxury Collection',
    subtext: 'Elevate your formal wardrobe with velvet lapels, satin trimmings, and anatomical precision fit.',
    ctaText: 'Explore Eveningwear',
    ctaLink: '/collections?category=tuxedos',
    image: '/images/hero/suit3.jpg',
    altText: 'Stitchx Plus Bespoke Evening Tuxedo Satin Lapel',
  },
];

const SAMPLE_PRODUCTS = [
  {
    id: 'sample-1',
    name: 'Bespoke Navy Wool Suit',
    slug: 'bespoke-navy-wool-suit',
    basePrice: 699,
    compareAtPrice: 850,
    images: [{ url: '/images/hero/suit1.jpg', alt: 'Navy Suit', isPrimary: true }],
    category: 'Suits',
    rating: 4.9,
    numReviews: 24,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 'sample-2',
    name: 'Charcoal Italian Wool Blazer',
    slug: 'charcoal-italian-wool-blazer',
    basePrice: 499,
    compareAtPrice: 599,
    images: [{ url: '/images/hero/suit2.jpg', alt: 'Charcoal Blazer', isPrimary: true }],
    category: 'Blazers',
    rating: 4.8,
    numReviews: 18,
    isNew: true,
    isFeatured: true,
  },
];

export function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('new');
  const [showcasePage, setShowcasePage] = useState(1);
  const showcaseItemsPerPage = 8;

  const [homeData, setHomeData] = useState<CMSHomeData | null>(null);
  const [faqItems, setFaqItems] = useState<CMSFAQItem[]>([]);
  const [testimonialsItems, setTestimonialsItems] = useState<CMSTestimonial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [homeLayoutSections, setHomeLayoutSections] = useState<HomeLayoutSection[]>([]);

  const testimonialsScrollRef = useRef<HTMLDivElement>(null);

  const scrollTestimonials = (direction: 'left' | 'right') => {
    if (testimonialsScrollRef.current) {
      const scrollAmount = 420;
      testimonialsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Hero Slider Autoplay
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const loadPageData = () => {
    Promise.all([
      contentService.getHomeContent().catch(() => null),
      contentService.getFaqContent().catch(() => []),
      contentService.getTestimonialsContent().catch(() => []),
      categoryService.getCategories().catch(() => ({ success: false, data: [] })),
      productService.getProducts({ limit: 1000 }).catch(() => ({ success: false, data: null })),
      contentService.getCustomSections().catch(() => []),
      contentService.getHomeLayout().catch(() => []),
    ]).then(([homeRes, faqRes, testRes, catRes, prodRes, secRes, layoutRes]) => {
      if (homeRes) setHomeData(homeRes);
      if (Array.isArray(faqRes)) setFaqItems(faqRes);
      if (Array.isArray(testRes)) setTestimonialsItems(testRes);

      if (catRes && catRes.success && Array.isArray(catRes.data)) {
        setAllCategories(catRes.data);
        const rootCats = catRes.data.filter((c: any) => !c.parentCategory || c.isTopLevel || c.type === 'department');
        setCategories(rootCats);
      }

      if (prodRes && prodRes.success && prodRes.data) {
        const list = Array.isArray(prodRes.data.products)
          ? prodRes.data.products
          : Array.isArray(prodRes.data)
            ? (prodRes.data as any)
            : [];
        if (list.length > 0) {
          setAllProducts(list);
          setFetchedProducts(list);
        }
      }

      if (Array.isArray(secRes) && secRes.length > 0) {
        setCustomSections(secRes);
        const activeSecs = secRes.filter((s) => s.isActive !== false);
        if (activeSecs.length > 0) {
          setActiveTab(activeSecs[0].code);
        }
      }

      if (Array.isArray(layoutRes)) {
        setHomeLayoutSections(layoutRes);
      }
    });
  };

  useEffect(() => {
    loadPageData();

    const handleSectionsUpdate = () => {
      contentService
        .getCustomSections()
        .then((secs) => {
          if (Array.isArray(secs)) {
            setCustomSections(secs);
            const activeSecs = secs.filter((s) => s.isActive !== false);
            if (activeSecs.length > 0 && !activeSecs.some((s) => s.code === activeTab)) {
              setActiveTab(activeSecs[0].code);
            }
          }
        })
        .catch(() => { });
    };
    const handleLayoutUpdate = () => {
      contentService.getHomeLayout().then((layout) => setHomeLayoutSections(layout || [])).catch(() => { });
    };
    const handleFaqUpdate = () => {
      contentService.getFaqContent().then((items) => setFaqItems(items || [])).catch(() => { });
    };
    const handleTestimonialsUpdate = () => {
      contentService.getTestimonialsContent().then((items) => setTestimonialsItems(items || [])).catch(() => { });
    };

    window.addEventListener('custom-sections-updated', handleSectionsUpdate);
    window.addEventListener('home-layout-updated', handleLayoutUpdate);
    window.addEventListener('cms-faq-updated', handleFaqUpdate);
    window.addEventListener('cms-testimonials-updated', handleTestimonialsUpdate);

    return () => {
      window.removeEventListener('custom-sections-updated', handleSectionsUpdate);
      window.removeEventListener('home-layout-updated', handleLayoutUpdate);
      window.removeEventListener('cms-faq-updated', handleFaqUpdate);
      window.removeEventListener('cms-testimonials-updated', handleTestimonialsUpdate);
    };
  }, []);

  // Helper to compute exact product count for a root category/department
  const getCategoryProductCount = (rootCat: Category): number => {
    if (typeof (rootCat as any).productCount === 'number') {
      return (rootCat as any).productCount;
    }
    if (!allProducts || allProducts.length === 0) return 0;
    const rootId = String((rootCat as any)._id || rootCat.id || '').toLowerCase();
    const rootSlug = (rootCat.slug || '').toLowerCase();

    // Collect all subcategory IDs & slugs under this root category
    const matchingCatIds = new Set<string>();
    const matchingCatSlugs = new Set<string>();
    if (rootId) matchingCatIds.add(rootId);
    if (rootSlug) matchingCatSlugs.add(rootSlug);

    allCategories.forEach((c: any) => {
      const catId = String(c._id || c.id || '').toLowerCase();
      const catSlug = (c.slug || '').toLowerCase();
      const parentId = String(
        typeof c.parentCategory === 'object' && c.parentCategory
          ? c.parentCategory._id || c.parentCategory.id
          : c.parentCategory || '',
      ).toLowerCase();
      const parentSlug = (
        typeof c.parentCategory === 'object' && c.parentCategory ? c.parentCategory.slug : ''
      ).toLowerCase();

      if ((parentId && parentId === rootId) || (parentSlug && parentSlug === rootSlug)) {
        if (catId) matchingCatIds.add(catId);
        if (catSlug) matchingCatSlugs.add(catSlug);
      }
    });

    return allProducts.filter((p: any) => {
      const pCatObj = typeof p.category === 'object' && p.category ? p.category : null;
      const pCatId = String(pCatObj ? pCatObj._id || pCatObj.id : p.category || '').toLowerCase();
      const pCatSlug = (pCatObj ? pCatObj.slug : p.categorySlug || '').toLowerCase();
      const pParentCatId = pCatObj
        ? String(
            typeof pCatObj.parentCategory === 'object' && pCatObj.parentCategory
              ? pCatObj.parentCategory._id || pCatObj.parentCategory.id
              : pCatObj.parentCategory || '',
          ).toLowerCase()
        : '';
      const pParentCatSlug = (
        pCatObj && typeof pCatObj.parentCategory === 'object' && pCatObj.parentCategory
          ? pCatObj.parentCategory.slug
          : ''
      ).toLowerCase();

      return (
        (pCatId && matchingCatIds.has(pCatId)) ||
        (pCatSlug && matchingCatSlugs.has(pCatSlug)) ||
        (pParentCatId && matchingCatIds.has(pParentCatId)) ||
        (pParentCatSlug && matchingCatSlugs.has(pParentCatSlug))
      );
    }).length;
  };

  // Filter product cards based on active tab - STRICT ADMIN SELECTION ONLY
  const rawProducts = fetchedProducts.length > 0 ? fetchedProducts : SAMPLE_PRODUCTS;
  const filteredShowcaseProducts = rawProducts.filter((p: any) => {
    if (p.status && p.status !== 'active') return false;

    const tags = Array.isArray(p.tags) ? p.tags : (Array.isArray(p.customSections) ? p.customSections : []);
    const collections = Array.isArray(p.collections) ? p.collections : [];

    if (activeTab === 'new') {
      return p.isNew === true || tags.includes('new') || tags.includes('new-arrivals') || collections.includes('new');
    }
    if (activeTab === 'bestsellers') {
      return p.isFeatured === true || tags.includes('bestseller') || tags.includes('bestsellers') || collections.includes('bestsellers');
    }
    if (activeTab === 'sale') {
      return p.isOnSale === true || p.isSale === true || (typeof p.compareAtPrice === 'number' && p.compareAtPrice > p.basePrice) || tags.includes('sale') || collections.includes('sale');
    }
    if (activeTab === 'deals') {
      return p.isDeal === true || tags.includes('deal') || tags.includes('deals') || collections.includes('deals');
    }

    // Filter by custom section code or tag (EXPLICIT ADMIN SELECTION ONLY)
    return tags.includes(activeTab) || collections.includes(activeTab);
  });

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const totalShowcasePages = Math.ceil(filteredShowcaseProducts.length / showcaseItemsPerPage);
  const displayProducts = filteredShowcaseProducts.slice(
    (showcasePage - 1) * showcaseItemsPerPage,
    showcasePage * showcaseItemsPerPage
  );

  const handleTabChange = (code: string) => {
    setActiveTab(code);
    setShowcasePage(1);
  };

  // Priority: 1. homeData.slides if present; 2. homeData.hero if image is valid non-legacy; 3. HERO_SLIDES
  const isLegacyUnsplashImg = (url?: string) =>
    !url || url.includes('photo-1594938298603') || url.includes('photo-1617137984095');

  const activeHeroSlides =
    homeData?.slides && homeData.slides.length > 0
      ? homeData.slides.map((s) => ({
        ...s,
        image: isLegacyUnsplashImg(s.image) ? '/images/hero/suit1.jpg' : s.image,
      }))
      : homeData?.hero?.image && !isLegacyUnsplashImg(homeData.hero.image)
        ? [
          {
            subtitle: homeData.hero.headline ? 'STITCHX PLUS BESPOKE' : 'DISCOVER THE ART OF MODERN DRESSING',
            title: homeData.hero.headline || 'Find Your Signature Style',
            subtext: homeData.hero.subtext || 'Experience bespoke custom menswear, 3D digital suit customization, and Italian wool fabrics.',
            ctaText: homeData.hero.ctaText || 'Shop Collection',
            ctaLink: homeData.hero.ctaLink || '/collections',
            image: homeData.hero.image,
            altText: homeData.hero.altText || 'Stitchx Plus Homepage Hero Banner',
          },
        ]
        : HERO_SLIDES;

  const currentSlide = activeHeroSlides[activeSlide % activeHeroSlides.length] || HERO_SLIDES[0];

  // Active showcase tabs configured by admin
  const activeShowcaseTabs = (customSections.length > 0
    ? customSections
    : [
      { id: 'tab-new', name: 'New Arrivals', code: 'new', isActive: true },
      { id: 'tab-bestsellers', name: 'Best Sellers', code: 'bestsellers', isActive: true },
      { id: 'tab-sale', name: 'On Sale', code: 'sale', isActive: true },
      { id: 'tab-deals', name: 'Special Deals', code: 'deals', isActive: true },
    ]
  ).filter((s) => s.isActive !== false);

  // Active homepage layout sections
  const activeLayoutSections = homeLayoutSections.length > 0
    ? homeLayoutSections.filter((sec) => sec.isActive !== false)
    : [
      { id: 'sec_hero', type: 'hero', title: 'Hero Banner', isActive: true, sortOrder: 1 },
      { id: 'sec_showcase', type: 'showcase_tabs', title: 'Product Showcase', isActive: true, sortOrder: 2 },
      { id: 'sec_categories', type: 'categories', title: 'Categories Grid', isActive: true, sortOrder: 3 },
      { id: 'sec_curated', type: 'curated_collections' as any, title: 'Curated Collections', isActive: true, sortOrder: 4 },
      { id: 'sec_faq', type: 'faq', title: 'FAQ', isActive: true, sortOrder: 5 },
      { id: 'sec_testimonials', type: 'testimonials', title: 'Testimonials', isActive: true, sortOrder: 6 },
      { id: 'sec_newsletter', type: 'newsletter', title: 'Newsletter', isActive: true, sortOrder: 7 },
    ];

  // Render individual homepage section by type
  const renderSection = (sectionItem: HomeLayoutSection) => {
    switch (sectionItem.type) {
      case 'hero':
        return (
          <section key={sectionItem.id} className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[510px] sm:min-h-[570px] lg:min-h-[610px] max-h-[680px] flex flex-col justify-between">
            <div className="absolute inset-0 z-0">
              <img
                src={currentSlide.image}
                alt={currentSlide.altText || currentSlide.title || 'Stitchx Plus Hero'}
                className="w-full h-full object-cover object-[center_20%] sm:object-[center_15%] transition-all duration-1000 ease-in-out scale-100 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/20 sm:w-4/5" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 pointer-events-none" />
            </div>

            <div className="max-w-7xl mx-auto px-[8px] w-full my-auto py-12 sm:py-16 lg:py-18 relative z-10">
              <div className="max-w-2xl space-y-6">
                {currentSlide.subtitle && (
                  <span className="inline-block px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold tracking-[0.2em] uppercase border border-amber-500/30 backdrop-blur-md shadow-xs">
                    {currentSlide.subtitle}
                  </span>
                )}

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-white tracking-tight leading-[1.1] drop-shadow-md">
                  {currentSlide.title}
                </h1>

                {currentSlide.subtext && (
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-lg font-sans drop-shadow-xs">
                    {currentSlide.subtext}
                  </p>
                )}

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <Link to={currentSlide.ctaLink || '/collections'}>
                    <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm sm:text-base px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-amber-500/25 flex items-center gap-2">
                      <span>{currentSlide.ctaText || 'Shop Collection'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>

                  <Link to="/customize">
                    <button className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 hover:border-amber-400/50">
                      Custom 3D Suit Studio
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative z-20 pb-4 sm:pb-6 flex justify-center items-center gap-2">
              {activeHeroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide % activeHeroSlides.length === idx
                    ? 'w-12 bg-amber-400 shadow-xs'
                    : 'w-8 bg-white/40 hover:bg-white/70'
                    }`}
                  aria-label={`Go to hero slide ${idx + 1}`}
                />
              ))}
            </div>
          </section>
        );

      case 'showcase_tabs':
        return (
          <section key={sectionItem.id} className="space-y-8 max-w-7xl mx-auto px-[8px] pt-10 pb-4">
            {/* Showcase Tabs Bar with Admin Sequence */}
            <div className="flex items-center justify-center border-b border-neutral-200 gap-6 sm:gap-10 pb-1 overflow-x-auto">
              {activeShowcaseTabs.map((sec) => (
                <button
                  key={sec.id || sec.code}
                  onClick={() => handleTabChange(sec.code)}
                  className={`text-base sm:text-lg pb-3 transition-colors shrink-0 ${activeTab === sec.code
                    ? 'font-bold text-neutral-950 border-b-2 border-black -mb-[2px]'
                    : 'font-normal text-neutral-500 hover:text-neutral-900'
                    }`}
                >
                  {sec.name}
                </button>
              ))}
            </div>

            {/* Product Cards Grid */}
            {displayProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {displayProducts.map((prod: any, idx: number) => (
                  <ProductCard
                    key={prod.id || prod._id || idx}
                    product={{
                      ...prod,
                      basePrice: typeof prod.basePrice === 'number' ? prod.basePrice : 49.99,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 px-4 text-center bg-slate-50 border border-slate-200/80 rounded-2xl max-w-xl mx-auto space-y-3">
                <TagIcon className="w-8 h-8 text-amber-500 mx-auto opacity-70" />
                <h4 className="text-base font-bold text-slate-800">No products assigned to this section</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Only products explicitly marked as <strong>{activeShowcaseTabs.find((t) => t.code === activeTab)?.name || activeTab}</strong> by the admin in the Products Panel will appear here.
                </p>
              </div>
            )}

            {/* Showcase Pagination */}
            {totalShowcasePages > 1 && (
              <div className="pt-4 flex justify-center">
                <Pagination
                  currentPage={showcasePage}
                  totalPages={totalShowcasePages}
                  onPageChange={(page) => setShowcasePage(page)}
                />
              </div>
            )}
          </section>
        );

      case 'categories':
        const isScrollableCategories = categories.length > 4;
        return (
          <section key={sectionItem.id} className="space-y-6 max-w-7xl mx-auto px-[8px] pt-10 pb-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 pb-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/20 mb-2">
                  Departments & Collections
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-950">
                  {sectionItem.title || 'Explore Departments'}
                </h2>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                <p className="text-sm text-slate-600 max-w-md hidden sm:block">
                  Browse our luxury departments and tailored collections. Click any card to explore all products.
                </p>
                {isScrollableCategories && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => scrollCategories('left')}
                      className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-100 hover:border-amber-500 text-slate-700 transition-colors shadow-xs cursor-pointer"
                      aria-label="Scroll categories left"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCategories('right')}
                      className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-100 hover:border-amber-500 text-slate-700 transition-colors shadow-xs cursor-pointer"
                      aria-label="Scroll categories right"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Category Cards Layout: Grid if <= 4, Scrollable Slider if > 4 */}
            {categories.length > 0 ? (
              <div
                ref={categoryScrollRef}
                className={
                  isScrollableCategories
                    ? 'flex overflow-x-auto gap-6 sm:gap-8 pb-4 scroll-smooth no-scrollbar scrollbar-none snap-x snap-mandatory'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8'
                }
              >
                {categories.map((cat) => {
                  const catImg =
                    cat.image ||
                    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80';
                  const count = getCategoryProductCount(cat);
                  return (
                    <Link
                      key={cat.id || (cat as any)._id}
                      to={`/collections?category=${cat.slug}`}
                      className={`group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1.5 cursor-pointer border border-slate-200/80 aspect-[4/5] flex flex-col justify-end bg-slate-950 ${
                        isScrollableCategories
                          ? 'w-[280px] sm:w-[300px] lg:w-[310px] shrink-0 snap-start'
                          : ''
                      }`}
                    >
                      {/* Full-bleed Background Image */}
                      <img
                        src={catImg}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />

                      {/* Vignette Shadow Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                      {/* Floating Bottom Pill Box */}
                      <div className="relative z-10 m-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between border border-white/60 transition-all duration-300 group-hover:bg-white group-hover:shadow-2xl">
                        <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-950 tracking-tight group-hover:text-amber-600 transition-colors truncate">
                          {cat.name}
                        </h3>
                        <span className="text-sm font-medium text-slate-500 shrink-0 ml-3">
                          {count} {count === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-sm">No active departments or categories available.</p>
              </div>
            )}
          </section>
        );

      case 'curated_collections' as any:
        return <CuratedCollectionsSection key={sectionItem.id} />;

      case 'custom_promo':
        return (
          <section key={sectionItem.id} className="max-w-7xl mx-auto px-[8px] py-6">
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[320px] flex flex-col justify-center p-8 sm:p-12 border border-amber-500/20 shadow-xl">
              {sectionItem.bannerImage && (
                <img
                  src={sectionItem.bannerImage}
                  alt={sectionItem.bannerAlt || sectionItem.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
              <div className="relative z-10 max-w-xl space-y-4">
                {sectionItem.subtitle && (
                  <Badge variant="gold" size="sm">
                    {sectionItem.subtitle}
                  </Badge>
                )}
                <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">
                  {sectionItem.heading || sectionItem.title}
                </h2>
                {sectionItem.subtext && (
                  <p className="text-sm text-slate-200 leading-relaxed font-sans">{sectionItem.subtext}</p>
                )}
                {sectionItem.ctaText && (
                  <div className="pt-2">
                    <Link to={sectionItem.ctaLink || '/collections'}>
                      <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm px-6 py-3 rounded-full transition-all flex items-center gap-2">
                        <span>{sectionItem.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      case 'custom_html':
        return (
          <section
            key={sectionItem.id}
            className="max-w-7xl mx-auto px-[8px] py-6"
            dangerouslySetInnerHTML={{ __html: sectionItem.customHtml || '' }}
          />
        );

      case 'faq':
        return (
          <section key={sectionItem.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-xs space-y-8">
              <div className="space-y-2 border-b border-slate-100 pb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase bg-amber-50 text-amber-800 border border-amber-200/80">
                  FAQ & TAILORING GUIDANCE
                </span>
                <h2 className="text-3xl font-bold font-serif text-slate-950">
                  {sectionItem.title && sectionItem.title !== 'Tailoring Process & FAQ'
                    ? sectionItem.title
                    : 'Tailoring Process & FAQ'}
                </h2>
                <p className="text-sm text-slate-500">
                  {sectionItem.subtitle || 'Learn more about our digital measurement patterns, Italian wool sourcing, and fitting guarantee.'}
                </p>
              </div>

              <Accordion
                items={
                  faqItems && Array.isArray(faqItems) && faqItems.length > 0
                    ? faqItems.map((item) => ({
                        id: item.id,
                        title: item.question,
                        content: item.answer,
                      }))
                    : [
                        {
                          id: 'faq-1',
                          title: 'How accurate is the digital pattern measurement system?',
                          content:
                            'Our digital fit algorithm asks 6 key physical metrics and calculates over 30 micro-body variables with 99.4% tailor accuracy.',
                        },
                        {
                          id: 'faq-2',
                          title: 'What fabrics do you source?',
                          content:
                            'We exclusively partner with heritage mills in Biella and Como, Italy including Loro Piana, Vitale Barberis Canonico, and Dormeuil.',
                        },
                        {
                          id: 'faq-3',
                          title: 'What if my suit needs minor adjustments?',
                          content:
                            'We cover up to $75 in local tailoring credits or provide a complete free remake if your garment falls outside our Fit Guarantee.',
                        },
                      ]
                }
              />
            </div>
          </section>
        );

      case 'testimonials': {
        const displayList = testimonialsItems.length > 0 ? testimonialsItems : homeData?.testimonials || [];
        if (!displayList || displayList.length === 0) return null;
        return (
          <section key={sectionItem.id} className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 sm:mb-10">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase bg-amber-50 text-amber-800 border border-amber-200/80">
                  <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                  Patron Endorsements
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-950 tracking-tight">
                  {sectionItem.title && sectionItem.title !== 'Patron Endorsements'
                    ? sectionItem.title
                    : 'Words From Our Bespoke Clientele'}
                </h2>
                <p className="text-sm text-slate-500 max-w-lg">
                  {sectionItem.subtitle || 'Endorsements from distinguished patrons, executives, and sartorial connoisseurs.'}
                </p>
              </div>

              {/* Slider Navigation Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => scrollTestimonials('left')}
                  className="w-11 h-11 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:bg-amber-500 hover:text-slate-950 text-slate-700 flex items-center justify-center transition-all duration-300 shadow-xs cursor-pointer active:scale-95"
                  aria-label="Scroll testimonials left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTestimonials('right')}
                  className="w-11 h-11 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:bg-amber-500 hover:text-slate-950 text-slate-700 flex items-center justify-center transition-all duration-300 shadow-xs cursor-pointer active:scale-95"
                  aria-label="Scroll testimonials right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Track */}
            <div
              ref={testimonialsScrollRef}
              className="flex overflow-x-auto gap-6 pb-6 pt-2 scroll-smooth snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayList.map((t, idx) => (
                <div
                  key={t.id || idx}
                  className="w-[300px] sm:w-[380px] md:w-[420px] shrink-0 snap-start relative bg-white border border-slate-200/90 rounded-3xl p-7 lg:p-8 shadow-xs hover:shadow-xl hover:border-amber-400/80 transition-all duration-300 flex flex-col justify-between group"
                >
                  <Quote className="absolute top-6 right-6 w-10 h-10 text-amber-500/10 group-hover:text-amber-500/20 transition-colors pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 italic text-sm sm:text-base leading-relaxed font-sans min-h-[72px]">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-serif font-bold text-xs shadow-xs">
                        {t.author ? t.author.charAt(0) : 'P'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-950 text-sm">{t.author}</div>
                        <div className="text-slate-500 text-xs font-medium">{t.role}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-amber-800 bg-amber-50/90 px-2.5 py-1 rounded-full border border-amber-200/70 font-semibold">
                      Verified Patron
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'newsletter':
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      <SEOHead
        title={homeData?.hero?.seoTitle || "Custom Menswear & Bespoke Suits | Stitchx Plus Atelier"}
        description={homeData?.hero?.seoDescription || "Experience bespoke custom menswear, 3D digital suit customization, Italian wool fabrics, and precision measurements tailored to your silhouette."}
      />

      {/* Render all Homepage sections dynamically in sequence configured by Admin */}
      {activeLayoutSections.map((sec) => renderSection(sec as HomeLayoutSection))}
    </div>
  );
}
