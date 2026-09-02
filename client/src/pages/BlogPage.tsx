import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Calendar, Clock, User, ArrowRight, BookOpen, X } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { Badge, Skeleton } from '../components/ui';
import { blogService } from '../services/blogService';
import { BlogPost } from '@stitchx/shared';

const BLOG_CATEGORIES = ['All', 'Style & Heritage', 'Fabric Science', 'Formalwear', 'Tailoring'];

export const BlogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  // Sync state if URL query params change
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogService.getBlogs({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
      });
      setBlogs(data);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('search', val.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const filteredBlogs = blogs.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      b.title.toLowerCase().includes(q) ||
      (b.excerpt && b.excerpt.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.content && b.content.toLowerCase().includes(q)) ||
      (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  const featuredBlog = filteredBlogs.length > 0 ? filteredBlogs[0] : null;
  const remainingBlogs = filteredBlogs.length > 0 ? filteredBlogs.slice(1) : [];

  return (
    <>
      <SEOHead
        title="The Atelier Journal | Sartorial Style & Heritage | Stitchx Plus"
        description="Explore bespoke tailoring guides, Italian fabric masterclasses, and formal eveningwear style insights from Stitchx Plus."
      />

      <div className="space-y-6 sm:space-y-8">
        {/* Header & Breadcrumbs */}
        <div className="space-y-4">
          <nav className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider flex items-center gap-2">
            <Link to="/" className="hover:text-bronze-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-charcoal-950">Atelier Journal</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <Badge variant="gold" size="sm" className="inline-flex items-center gap-1.5 px-3 py-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Sartorial Masterclasses</span>
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold font-serif text-charcoal-950">
                The Atelier Journal
              </h1>
              <p className="text-sm text-charcoal-600 max-w-2xl leading-relaxed font-light">
                Curated insights on bespoke tailoring, Italian wool craftsmanship, formal eveningwear, and modern elegance.
              </p>
            </div>

            {/* Live Search */}
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search articles, fabric guides, tags..."
                className="w-full bg-white border border-charcoal-200/80 focus:border-bronze-500 rounded-full text-xs py-2.5 pl-10 pr-9 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-bronze-500/20 shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="bg-white border border-charcoal-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-charcoal-700 mr-2">Category:</span>
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-charcoal-950 text-white shadow-xs'
                    : 'bg-cream-50 text-charcoal-700 border border-charcoal-200/80 hover:bg-cream-100 hover:text-charcoal-950'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4 bg-white p-6 rounded-3xl border border-charcoal-200/60">
                  <Skeleton className="h-48 w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-charcoal-200/80 p-8">
              <BookOpen className="w-12 h-12 text-bronze-500 mx-auto opacity-70" />
              <h3 className="text-xl font-bold font-serif text-charcoal-900">No Journal Articles Found</h3>
              <p className="text-sm text-charcoal-500 max-w-md mx-auto">
                No blog posts matched your search criteria. Try choosing another category or clearing your query.
              </p>
            </div>
          ) : (
            <>
              {/* Featured Article Card */}
              {featuredBlog && (
                <div className="group relative rounded-3xl overflow-hidden bg-white border border-charcoal-200/80 shadow-lg hover:shadow-2xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-7 relative h-72 lg:h-auto min-h-[340px] overflow-hidden bg-charcoal-900">
                    <img
                      src={
                        featuredBlog.image ||
                        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80'
                      }
                      alt={featuredBlog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent lg:hidden" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-bronze-600 text-white shadow-xs">
                        Featured Article
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs text-bronze-700 font-semibold">
                        <span className="bg-bronze-50 px-2.5 py-1 rounded-full border border-bronze-200/80">
                          {featuredBlog.category || 'Style & Heritage'}
                        </span>
                        <div className="flex items-center gap-1 text-charcoal-500">
                          <Clock className="w-3.5 h-3.5 text-bronze-600" />
                          <span>{featuredBlog.readTime || '5 min read'}</span>
                        </div>
                      </div>

                      <Link to={`/blog/${featuredBlog.slug}`}>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-950 group-hover:text-bronze-700 transition-colors leading-snug">
                          {featuredBlog.title}
                        </h2>
                      </Link>

                      <p className="text-sm text-charcoal-600 line-clamp-3 leading-relaxed font-light">
                        {featuredBlog.excerpt}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-charcoal-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-charcoal-700 font-medium">
                        <User className="w-4 h-4 text-bronze-600" />
                        <span>{featuredBlog.author || 'Stitchx Atelier'}</span>
                      </div>

                      <Link
                        to={`/blog/${featuredBlog.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-bronze-700 hover:text-bronze-600 group-hover:translate-x-1 transition-all"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Remaining Articles Grid */}
              {remainingBlogs.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-bold text-charcoal-950 border-b border-charcoal-200/80 pb-3">
                    Recent Articles
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {remainingBlogs.map((post) => (
                      <Link
                        key={post.id || post._id}
                        to={`/blog/${post.slug}`}
                        className="group flex flex-col justify-between rounded-3xl overflow-hidden bg-white border border-charcoal-200/80 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div>
                          <div className="relative h-56 w-full overflow-hidden bg-charcoal-900">
                            <img
                              src={
                                post.image ||
                                'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'
                              }
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-charcoal-950 border border-white/40">
                                {post.category || 'Atelier'}
                              </span>
                            </div>
                          </div>

                          <div className="p-6 space-y-3">
                            <div className="flex items-center justify-between text-xs text-charcoal-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-bronze-600" />
                                <span>
                                  {post.publishedAt
                                    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })
                                    : 'Recent'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-bronze-600" />
                                <span>{post.readTime || '5 min read'}</span>
                              </div>
                            </div>

                            <h3 className="text-xl font-serif font-bold text-charcoal-950 group-hover:text-bronze-700 transition-colors line-clamp-2 leading-snug">
                              {post.title}
                            </h3>

                            <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed font-light">
                              {post.excerpt}
                            </p>
                          </div>
                        </div>

                        <div className="px-6 py-4 bg-cream-50/80 border-t border-charcoal-100 flex items-center justify-between group-hover:bg-cream-100 transition-colors">
                          <span className="text-xs font-semibold text-charcoal-700">
                            {post.author || 'Stitchx Atelier'}
                          </span>
                          <div className="text-xs font-bold text-bronze-700 group-hover:text-bronze-600 flex items-center gap-1">
                            <span>Read Article</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
