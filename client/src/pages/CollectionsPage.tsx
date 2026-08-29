import { useState, useEffect } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { Search, X, Filter } from 'lucide-react';
import { Button, Select, Badge, Pagination, Input } from '../components/ui';
import { ProductCard } from '../components/common/ProductCard';
import { SEOHead } from '../components/seo/SEOHead';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Product, Category } from '@stitchx/shared';

export function CollectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams<{ slug?: string }>();
  const initialCategory = slug || searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Synchronize URL parameters with component state
  useEffect(() => {
    const cat = slug || searchParams.get('category') || 'all';
    const q = searchParams.get('search') || '';
    setSelectedCategory(cat);
    setSearchQuery(q);
  }, [searchParams, slug]);

  // Load categories
  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    }).catch(() => {});
  }, []);

  // Fetch products based on filters
  useEffect(() => {
    setLoading(true);
    const params: any = {
      page: currentPage,
      limit: 12,
    };

    if (selectedCategory && selectedCategory !== 'all') {
      params.category = selectedCategory;
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    if (sortBy === 'price-low') {
      params.sort = 'price';
    } else if (sortBy === 'price-high') {
      params.sort = '-price';
    } else if (sortBy === 'newest') {
      params.sort = '-createdAt';
    }

    productService
      .getProducts(params)
      .then((res) => {
        if (res.success && res.data) {
          const productList = Array.isArray(res.data.products)
            ? res.data.products
            : Array.isArray(res.data)
            ? (res.data as any)
            : [];
          setProducts(productList);
          setTotalPages(res.data.pagination?.totalPages || 1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery, sortBy, currentPage]);

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (val === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', val);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('search', val.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchChange(searchQuery);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setCurrentPage(1);
    setSearchParams({});
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];

  return (
    <div className="space-y-10">
      <SEOHead
        title="Bespoke Suits & Menswear Collections | Stitchx Plus"
        description="Explore master-tailored garments ready for digital customization in your exact fit and Italian wool fabric preference."
        breadcrumbs={[
          { name: 'Home', url: 'https://stitchxplus.com/' },
          { name: 'Collections', url: 'https://stitchxplus.com/collections' },
        ]}
      />

      {/* Header & Breadcrumb */}
      <div className="space-y-3">
        <nav className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider flex items-center gap-2">
          <Link to="/" className="hover:text-bronze-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-charcoal-950">Collections</span>
          {selectedCategory !== 'all' && (
            <>
              <span>/</span>
              <span className="text-bronze-700 capitalize">{selectedCategory.replace(/-/g, ' ')}</span>
            </>
          )}
        </nav>
        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-charcoal-950">
          {selectedCategory === 'all'
            ? 'Curated Bespoke Collections'
            : categories.find((c) => c.slug === selectedCategory)?.name || 'Category Collection'}
        </h1>
        <p className="text-sm text-charcoal-600 max-w-2xl leading-relaxed">
          {categories.find((c) => c.slug === selectedCategory)?.description ||
            'Explore master-tailored garments ready for digital 3D customization in your exact fit and Italian wool fabric preference.'}
        </p>
      </div>

      {/* Filter & Sorting Bar */}
      <div className="bg-white border border-charcoal-200/80 rounded-2xl p-4 sm:p-6 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-charcoal-400" />
              <Input
                placeholder="Search tuxedos, suits, fabrics, tags..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-8"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-3.5 text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button type="submit" variant="accent" size="md">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-52">
              <Select
                options={categoryOptions}
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={[
                  { value: 'featured', label: 'Sort: Featured' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'newest', label: 'Newest Arrivals' },
                ]}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              />
            </div>
          </div>
        </div>

        {(selectedCategory !== 'all' || searchQuery.trim()) && (
          <div className="flex items-center gap-2 pt-2 border-t border-charcoal-100 text-xs">
            <span className="text-charcoal-500 font-semibold">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <Badge variant="gold" className="gap-1">
                Category: {selectedCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleCategoryChange('all')} />
              </Badge>
            )}
            {searchQuery.trim() && (
              <Badge variant="bronze" className="gap-1">
                Search: &ldquo;{searchQuery}&rdquo;
                <X
                  className="w-3.5 h-3.5 cursor-pointer"
                  onClick={() => {
                    setSearchQuery('');
                    const p = new URLSearchParams(searchParams);
                    p.delete('search');
                    setSearchParams(p);
                  }}
                />
              </Badge>
            )}
            <button
              onClick={clearFilters}
              className="text-bronze-700 font-bold hover:underline ml-auto"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="space-y-4 rounded-3xl bg-cream-50/70 p-4 border border-charcoal-200/60 animate-pulse">
              <div className="aspect-[3/4] w-full rounded-2xl bg-charcoal-200/40" />
              <div className="space-y-2.5 pt-1">
                <div className="h-3 w-1/4 bg-charcoal-200/40 rounded-full" />
                <div className="h-4.5 w-3/4 bg-charcoal-200/40 rounded-full" />
                <div className="h-3.5 w-1/3 bg-charcoal-200/40 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-cream-50 border border-charcoal-200/70 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white border border-charcoal-200 text-charcoal-400 flex items-center justify-center mx-auto">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold font-serif text-charcoal-950">No Data Found</h3>
          <p className="text-charcoal-600 text-sm max-w-md mx-auto">
            We couldn&apos;t find any items matching your active category or search query. Try resetting your search terms.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Show All Collections
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id || (product as any)._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  );
}

