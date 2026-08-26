import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentService, CMSPage } from '../services/contentService';
import { productService } from '../services/productService';
import { Product } from '@stitchx/shared';
import { SEOHead } from '../components/seo/SEOHead';
import { ArrowLeft, Clock, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button, Badge, Card, CardContent, CardFooter } from '../components/ui';
import { useAppStore } from '../store/useAppStore';

export function CMSPageDetailView() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CMSPage | null>(null);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const incrementCart = useAppStore((state) => state.incrementCart);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    contentService
      .getPageBySlug(slug)
      .then(async (data) => {
        setPage(data);
        if (data.selectedProducts && data.selectedProducts.length > 0) {
          try {
            const prodRes = await productService.getProducts({ limit: 200 });
            if (prodRes.success && prodRes.data) {
              const all = Array.isArray(prodRes.data.products)
                ? prodRes.data.products
                : Array.isArray(prodRes.data)
                ? (prodRes.data as any)
                : [];
              const matched = all.filter((p: any) =>
                data.selectedProducts!.includes(p.id) ||
                data.selectedProducts!.includes(p._id) ||
                data.selectedProducts!.includes(p.slug),
              );
              setDisplayedProducts(matched);
            }
          } catch (_e) {}
        }
      })
      .catch((err) => {
        setError(err.message || 'Requested page not found');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-navy-500 tracking-wider uppercase font-heading">
            Loading Article...
          </span>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold font-heading text-navy-900">Page Not Found</h1>
        <p className="text-navy-600 text-sm max-w-md mx-auto">
          {error || 'The publication or policy page you are attempting to view could not be retrieved.'}
        </p>
        <Link to="/">
          <Button variant="navy" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Atelier Homepage
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12">
      <SEOHead
        title={page.seo?.title || `${page.title} | Stitchx Plus`}
        description={page.seo?.description || `Read ${page.title} at Stitchx Plus Bespoke Atelier.`}
      />

      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-600 hover:text-gold-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="space-y-4 border-b border-navy-100 pb-6">
        <Badge variant="gold">Bespoke Publication</Badge>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-navy-950 tracking-tight">
          {page.title}
        </h1>
        {page.updatedAt && (
          <div className="flex items-center gap-2 text-xs text-navy-500 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        )}
      </div>

      <div
        className="prose prose-navy max-w-none text-navy-800 leading-relaxed text-base space-y-4 font-sans bg-white p-8 rounded-3xl border border-charcoal-200/80 shadow-xs"
        dangerouslySetInnerHTML={{ __html: page.body }}
      />

      {/* Selected Products Showcase Section */}
      {displayedProducts.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-charcoal-200">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="bronze" size="sm" className="mb-1">
                Featured Selection
              </Badge>
              <h2 className="text-2xl font-bold font-serif text-charcoal-950">
                Showcased Garments
              </h2>
            </div>
            <Link
              to="/collections"
              className="text-xs font-bold text-bronze-700 hover:text-bronze-600 flex items-center gap-1"
            >
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {displayedProducts.map((product) => {
              const rawImg = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
              const primaryImage =
                typeof rawImg === 'string'
                  ? rawImg
                  : typeof rawImg === 'object' && rawImg !== null
                  ? (rawImg as any).url || ''
                  : 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80';

              return (
                <Card key={product.id || (product as any)._id} hoverable className="flex flex-col justify-between border-charcoal-200/70 group">
                  <div>
                    <div className="h-64 bg-charcoal-950 relative overflow-hidden flex flex-col justify-between p-5 text-white">
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-charcoal-950/20 to-transparent" />

                      <Badge variant="gold" className="relative z-10 self-start text-[10px]">
                        Page Feature
                      </Badge>

                      <div className="relative z-10">
                        <h3 className="text-lg font-bold font-serif text-white mt-1 group-hover:text-bronze-300 transition-colors">
                          {product.name}
                        </h3>
                      </div>
                    </div>

                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-charcoal-400 uppercase tracking-wider block font-semibold">
                            Starting at
                          </span>
                          <span className="text-xl font-bold font-serif text-charcoal-950">
                            ${product.basePrice}
                          </span>
                        </div>
                        <Badge variant="bronze">Bespoke Fit</Badge>
                      </div>
                    </CardContent>
                  </div>

                  <CardFooter className="gap-2 pt-0">
                    <Link to={`/product/${product.slug || product.id || (product as any)._id}`} className="w-full">
                      <Button variant="outline" fullWidth size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="accent"
                      size="sm"
                      className="shrink-0"
                      onClick={incrementCart}
                      leftIcon={<ShoppingBag className="w-4 h-4" />}
                    >
                      Add
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
