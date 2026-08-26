import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { useRelatedProducts } from './useProductQueries';
import { Badge, Button } from '../../components/ui';

interface RelatedProductsSectionProps {
  currentProductIdOrSlug: string;
}

export function RelatedProductsSection({ currentProductIdOrSlug }: RelatedProductsSectionProps) {
  const { data: relatedProducts = [], isLoading } = useRelatedProducts(currentProductIdOrSlug);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pt-8 border-t border-navy-100">
        <div className="h-8 w-64 bg-navy-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3 bg-white p-4 rounded-2xl border border-navy-100 shadow-card">
              <div className="aspect-[4/5] bg-navy-100 rounded-xl animate-pulse" />
              <div className="h-4 w-3/4 bg-navy-100 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-navy-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 pt-12 border-t border-navy-100">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="gold" className="mb-2">
            Curated Complements
          </Badge>
          <h2 className="text-2xl font-bold font-heading text-navy-900 flex items-center gap-2">
            <span>You May Also Admire</span>
            <Sparkles className="w-5 h-5 text-gold-500 fill-gold-400" />
          </h2>
        </div>

        {/* Carousel Nav Controls */}
        {relatedProducts.length > 3 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="p-2.5 rounded-full border border-navy-200 text-navy-700 hover:border-gold-500 hover:text-gold-600 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="p-2.5 rounded-full border border-navy-200 text-navy-700 hover:border-gold-500 hover:text-gold-600 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 pt-2 scrollbar-none snap-x snap-mandatory"
      >
        {relatedProducts.map((prod) => {
          const categoryName =
            typeof prod.category === 'object' && prod.category
              ? prod.category.name
              : 'Suiting';

          const primaryImage =
            prod.images && prod.images.length > 0
              ? typeof prod.images[0] === 'string'
                ? prod.images[0]
                : (prod.images[0] as any).url || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80'
              : 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80';

          return (
            <div
              key={prod.id || (prod as any)._id}
              className="min-w-[260px] sm:min-w-[280px] max-w-[300px] flex-shrink-0 snap-start bg-white border border-navy-100 rounded-3xl overflow-hidden shadow-card hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <Link to={`/products/${prod.slug}`} className="block relative aspect-[4/5] bg-navy-900 overflow-hidden">
                <img
                  src={primaryImage}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="navy">{categoryName}</Badge>
                </div>
                {!prod.inStock && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="danger">Out of Stock</Badge>
                  </div>
                )}
              </Link>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-bold text-navy-900 group-hover:text-gold-600 transition-colors line-clamp-1">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-navy-500 line-clamp-2 mt-1">
                    {prod.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-navy-100">
                  <span className="font-heading font-bold text-navy-900 text-lg">
                    ${prod.basePrice.toLocaleString()}
                  </span>
                  <Link to={`/products/${prod.slug}`}>
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
