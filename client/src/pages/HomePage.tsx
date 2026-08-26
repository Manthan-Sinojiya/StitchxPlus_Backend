import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { Button, Badge, Card, Accordion } from '../components/ui';
import { ProductCard } from '../components/common/ProductCard';
import { SEOHead } from '../components/seo/SEOHead';
import { contentService, CMSHomeData, CMSFAQItem } from '../services/contentService';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Product, Category } from '@stitchx/shared';

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
    subtitle: 'LUXURY EVENING & FORMALWEAR',
    title: 'Precision Cut Penthouse & Gala Suits',
    subtext: 'Elegance redefined for executive meetings, black-tie galas, weddings, and formal evening affairs.',
    ctaText: 'Explore Collections',
    ctaLink: '/collections?category=tuxedos',
    image: '/images/hero/suit3.jpg',
    altText: 'Stitchx Plus Luxury Charcoal Penthouse Evening Suit',
  },
];

const SAMPLE_PRODUCTS = [
  {
    id: 'prod-1',
    _id: 'prod-1',
    name: 'Cotton Short-Sleeved T-Shirt',
    slug: 'cotton-short-sleeved-t-shirt',
    basePrice: 69.99,
    compareAtPrice: 99.99,
    isNew: true,
    isCustomizable: false,
    tickerText: '✦ HOT SALE 25% OFF ✦ HOT SALE 25% OFF ✦',
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
    colors: [
      { name: 'Brown', hex: '#8c7b6c' },
      { name: 'Navy', hex: '#1c2536' },
      { name: 'White', hex: '#ffffff' },
    ],
  },
  {
    id: 'prod-2',
    _id: 'prod-2',
    name: 'Fabric Shopping Bag',
    slug: 'fabric-shopping-bag',
    basePrice: 29.99,
    compareAtPrice: 49.99,
    isNew: false,
    isCustomizable: true,
    images: ['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80'],
    colors: [
      { name: 'Black', hex: '#1c1c1c' },
      { name: 'Beige', hex: '#d4c5b9' },
    ],
  },
  {
    id: 'prod-3',
    _id: 'prod-3',
    name: 'Embossed Wallet With Logo',
    slug: 'embossed-wallet-with-logo',
    basePrice: 15.99,
    compareAtPrice: 25.99,
    isNew: false,
    isTrend: true,
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80'],
    colors: [
      { name: 'Cream', hex: '#f0ebe1' },
      { name: 'Tan', hex: '#b8977e' },
    ],
  },
  {
    id: 'prod-4',
    _id: 'prod-4',
    name: 'Pendant Crystals Earrings',
    slug: 'pendant-crystals-earrings',
    basePrice: 45.99,
    compareAtPrice: 79.99,
    isNew: true,
    countdownTimer: '12D : 15H : 36M : 01S',
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'],
    colors: [
      { name: 'Crystal', hex: '#e8e8e8' },
      { name: 'Gold', hex: '#d4af37' },
    ],
  },
];

export function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'new' | 'bestsellers' | 'sale'>('new');

  const [homeData, setHomeData] = useState<CMSHomeData | null>(null);
  const [faqItems, setFaqItems] = useState<CMSFAQItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);

  // Hero Slider Autoplay
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.all([
      contentService.getHomeContent().catch(() => null),
      contentService.getFaqContent().catch(() => []),
      categoryService.getCategories().catch(() => ({ success: false, data: [] })),
      productService.getProducts({ limit: 8 }).catch(() => ({ success: false, data: null })),
    ]).then(([homeRes, faqRes, catRes, prodRes]) => {
      if (homeRes) setHomeData(homeRes);
      if (Array.isArray(faqRes)) setFaqItems(faqRes);

      if (catRes && catRes.success && Array.isArray(catRes.data)) {
        setCategories(catRes.data.filter((c) => !c.parentCategory).slice(0, 6));
      }

      if (prodRes && prodRes.success && prodRes.data) {
        const list = Array.isArray(prodRes.data.products)
          ? prodRes.data.products
          : Array.isArray(prodRes.data)
          ? (prodRes.data as any)
          : [];
        if (list.length > 0) {
          setFetchedProducts(list);
        }
      }
    });
  }, []);

  // Filter product cards based on active tab
  const displayProducts = fetchedProducts.length > 0 ? fetchedProducts : SAMPLE_PRODUCTS;

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

  return (
    <div className="w-full">
      <SEOHead
        title={homeData?.hero?.seoTitle || "Custom Menswear & Bespoke Suits | Stitchx Plus Atelier"}
        description={homeData?.hero?.seoDescription || "Experience bespoke custom menswear, 3D digital suit customization, Italian wool fabrics, and precision measurements tailored to your silhouette."}
      />

      {/* FULL BLEED IMMERSIVE HERO SECTION (Touches header navbar) */}
      <section className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] max-h-[580px] flex flex-col justify-between">
        {/* Full Viewport Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentSlide.image}
            alt={currentSlide.altText || currentSlide.title || 'Stitchx Plus Hero'}
            className="w-full h-full object-cover object-[center_20%] sm:object-[center_15%] transition-all duration-1000 ease-in-out scale-100 hover:scale-105"
          />
          {/* Dynamic Gradient Overlay: Crisp text readability on left, radiant imagery on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/20 sm:w-4/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 pointer-events-none" />
        </div>

        {/* Hero Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-10 sm:py-14 lg:py-16 relative z-10">
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

        {/* Bottom Slide Indicators Bar */}
        <div className="relative z-20 pb-4 sm:pb-6 flex justify-center items-center gap-2">
          {activeHeroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeSlide % activeHeroSlides.length === idx
                  ? 'w-12 bg-amber-400 shadow-xs'
                  : 'w-8 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to hero slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* REST OF HOMEPAGE CONTENT WRAPPED IN MAX-WIDTH CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-24 py-12 lg:py-16">
        {/* PRODUCT CARDS SECTION WITH TABS (Matching Image 2) */}
      <section className="space-y-10">
        {/* Tabs Bar: New Arrivals | Best Sellers | On Sale */}
        <div className="flex items-center justify-center border-b border-neutral-200 gap-8 sm:gap-12 pb-1">
          <button
            onClick={() => setActiveTab('new')}
            className={`text-base sm:text-lg pb-3 transition-colors ${
              activeTab === 'new'
                ? 'font-bold text-neutral-950 border-b-2 border-black -mb-[2px]'
                : 'font-normal text-neutral-500 hover:text-neutral-900'
            }`}
          >
            New Arrivals
          </button>
          <button
            onClick={() => setActiveTab('bestsellers')}
            className={`text-base sm:text-lg pb-3 transition-colors ${
              activeTab === 'bestsellers'
                ? 'font-bold text-neutral-950 border-b-2 border-black -mb-[2px]'
                : 'font-normal text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Best Sellers
          </button>
          <button
            onClick={() => setActiveTab('sale')}
            className={`text-base sm:text-lg pb-3 transition-colors ${
              activeTab === 'sale'
                ? 'font-bold text-neutral-950 border-b-2 border-black -mb-[2px]'
                : 'font-normal text-neutral-500 hover:text-neutral-900'
            }`}
          >
            On Sale
          </button>
        </div>

        {/* Product Grid (All Card UI showing matching Image 2) */}
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
      </section>

      {/* Featured Categories Grid */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-charcoal-200/80 pb-4">
          <div>
            <Badge variant="gold" size="sm" className="mb-2">
              Curated Apparel
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-charcoal-950">
              Signature Menswear Categories
            </h2>
          </div>
          <p className="text-sm text-charcoal-600 max-w-md">
            Hand-cut pattern engineering tailored specifically to your unique anatomical measurements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.length > 0 ? (
            categories.map((cat) => {
              const catImg = cat.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80';
              return (
                <Card key={cat.id || (cat as any)._id} hoverable className="relative group overflow-hidden border-charcoal-200/70 flex flex-col justify-between">
                  <div className="h-64 bg-charcoal-950 p-6 flex flex-col justify-between text-white relative">
                    <img
                      src={catImg}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/60 to-charcoal-950/20" />

                    <Badge variant="gold" className="relative z-10 self-start">
                      {cat.name}
                    </Badge>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold font-serif text-white group-hover:text-bronze-300 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-charcoal-300 mt-1 line-clamp-2">{cat.description}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white flex justify-between items-center">
                    <span className="text-xs font-semibold text-charcoal-600">Bespoke Fit</span>
                    <Link
                      to={`/collections?category=${cat.slug}`}
                      className="text-xs font-bold text-bronze-700 hover:text-bronze-600 flex items-center gap-1"
                    >
                      Browse Category <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-charcoal-500 bg-cream-50 border border-charcoal-200/70 rounded-2xl">
              <p className="text-sm">No active categories available. Catalog is currently empty.</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white border border-charcoal-200/80 rounded-3xl p-8 sm:p-12 shadow-card space-y-8">
        <div className="space-y-2 border-b border-charcoal-200/70 pb-6">
          <Badge variant="bronze">Tailoring Process & FAQ</Badge>
          <h2 className="text-3xl font-bold font-serif text-charcoal-950">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-charcoal-600">
            Learn more about our digital measurement patterns, Italian wool sourcing, and fitting guarantee.
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
                    title: 'How accurate is the digital measurement system?',
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
      </section>

      {/* Testimonials Section */}
      {homeData?.testimonials && Array.isArray(homeData.testimonials) && homeData.testimonials.length > 0 && (
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="bronze">Patron Endorsements</Badge>
            <h2 className="text-3xl font-bold font-serif text-charcoal-950">
              Words From Our Bespoke Clientele
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {homeData.testimonials.map((t) => (
              <Card key={t.id} className="p-6 space-y-4 border-charcoal-200/70 bg-white">
                <div className="flex gap-1 text-bronze-500">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-charcoal-700 italic text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="pt-2 border-t border-charcoal-100 flex justify-between items-center text-xs">
                  <span className="font-bold text-charcoal-950">{t.author}</span>
                  <span className="text-charcoal-500 font-medium">{t.role}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Block */}
      <section className="bg-charcoal-950 border border-charcoal-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-4 shadow-card">
        <Badge variant="gold">Privé Circle</Badge>
        <h2 className="text-3xl font-bold font-serif text-white">Join the Stitchx Privé Circle</h2>
        <p className="text-charcoal-300 text-sm max-w-xl mx-auto">
          Receive private trunk show invitations and seasonal Italian fabric releases directly to your inbox.
        </p>
        <div className="pt-2">
          <Link to="/register">
            <Button variant="accent" size="lg">
              Join Exclusive Membership
            </Button>
          </Link>
        </div>
      </section>
    </div>
  </div>
);
}

