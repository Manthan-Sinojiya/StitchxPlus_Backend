import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Share2, Tag, BookOpen, Check } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { Badge, Skeleton } from '../components/ui';
import { blogService } from '../services/blogService';
import { BlogPost } from '@stitchx/shared';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (slug) {
      fetchBlogDetails(slug);
    }
  }, [slug]);

  const fetchBlogDetails = async (articleSlug: string) => {
    try {
      setLoading(true);
      const data = await blogService.getBlogBySlug(articleSlug);
      setBlog(data);

      // Fetch related blogs in same category
      const allBlogs = await blogService.getBlogs();
      setRelatedBlogs(allBlogs.filter((b) => b.slug !== articleSlug).slice(0, 3));
    } catch (err) {
      console.error('Failed to load blog detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-12 w-3/4 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-bronze-600 opacity-60" />
        <h2 className="text-2xl font-bold font-serif text-charcoal-950">Article Not Found</h2>
        <p className="text-sm text-charcoal-500 max-w-md">
          The requested journal article could not be located. It may have been archived or moved.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal-950 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Atelier Journal</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${blog.title} | The Atelier Journal | Stitchx Plus`}
        description={blog.excerpt || blog.title}
        ogImage={blog.image}
      />

      <SEOHead
        title={`${blog.title} | The Atelier Journal | Stitchx Plus`}
        description={blog.excerpt || blog.title}
        ogImage={blog.image}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Standardized Header & Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-200/70 pb-5">
          <nav className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider flex items-center gap-2">
            <Link to="/" className="hover:text-bronze-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-bronze-600 transition-colors">
              Journal
            </Link>
            <span>/</span>
            <span className="text-charcoal-950 truncate max-w-[200px] sm:max-w-[300px]">
              {blog.title}
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-charcoal-200/80 text-xs font-bold text-charcoal-700 hover:bg-cream-100 hover:text-bronze-700 transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Journal</span>
            </Link>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-charcoal-950 text-white text-xs font-semibold hover:bg-charcoal-800 transition-all shadow-xs cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-bronze-300" />
              )}
              <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
            </button>
          </div>
        </div>

        {/* Main Article Content */}
        <article className="space-y-8">
          {/* Article Header */}
          <header className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="gold" className="px-3.5 py-1 text-xs uppercase tracking-wider font-semibold">
                {blog.category || 'Style & Heritage'}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-charcoal-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-bronze-600" />
                <span>{blog.readTime || '5 min read'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-charcoal-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-bronze-600" />
                <span>
                  {blog.publishedAt
                    ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                    : 'Published'}
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-charcoal-950 tracking-tight leading-tight">
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p className="text-lg sm:text-xl text-charcoal-600 font-serif italic leading-relaxed pt-1">
                "{blog.excerpt}"
              </p>
            )}

            {/* Author Byline */}
            <div className="pt-4 flex items-center gap-3.5 border-t border-charcoal-200/60">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-charcoal-900 to-charcoal-950 text-gold-400 border border-gold-500/30 flex items-center justify-center font-serif font-bold text-base shadow-xs">
                {(blog.author || 'A')[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-charcoal-950">{blog.author || 'Stitchx Plus Atelier'}</p>
                <p className="text-xs text-bronze-700 font-medium">Master Bespoke Contributor & Atelier Craftsman</p>
              </div>
            </div>
          </header>

          {/* Cover Banner Image */}
          {blog.image && (
            <div className="rounded-3xl overflow-hidden shadow-sm border border-charcoal-200/80 bg-charcoal-950">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full max-h-[520px] object-cover"
              />
            </div>
          )}

          {/* Article HTML Content Box with article-body typography */}
          <div className="bg-white p-8 sm:p-12 lg:p-16 rounded-3xl border border-charcoal-200/80 shadow-xs space-y-8">
            <div
              className="article-body font-sans"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Article Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="pt-8 border-t border-charcoal-200/60 flex items-center flex-wrap gap-2">
                <Tag className="w-4 h-4 text-bronze-600 mr-1" />
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3.5 py-1 rounded-full bg-cream-100 text-charcoal-800 text-xs font-semibold border border-charcoal-200/80"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Bio Box */}
            <div className="mt-10 p-6 rounded-2xl bg-cream-50 border border-charcoal-200/70 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-charcoal-950 text-gold-400 flex items-center justify-center font-serif font-bold text-lg shrink-0">
                {(blog.author || 'A')[0]}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold font-serif text-charcoal-950">
                  Written by {blog.author || 'Stitchx Plus Atelier'}
                </h4>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Crafting bespoke menswear narratives and masterclass guides on sartorial precision, Neapolitan pattern engineering, and luxury fabrics.
                </p>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <section className="pt-8 space-y-6">
              <div className="flex items-center justify-between border-b border-charcoal-200/80 pb-3">
                <h3 className="text-2xl font-serif font-bold text-charcoal-950">
                  More Articles from the Atelier
                </h3>
                <Link to="/blog" className="text-xs font-bold text-bronze-700 hover:text-bronze-800 flex items-center gap-1">
                  View All Journal Stories &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {relatedBlogs.map((rel) => (
                  <Link
                    key={rel.id || rel._id}
                    to={`/blog/${rel.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-charcoal-200/80 p-4 space-y-3 hover:shadow-md hover:border-bronze-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {rel.image && (
                        <div className="h-40 overflow-hidden rounded-xl bg-charcoal-900 mb-3">
                          <img
                            src={rel.image}
                            alt={rel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <h4 className="text-sm font-bold font-serif text-charcoal-950 group-hover:text-bronze-700 line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-bronze-700 flex items-center gap-1 pt-2">
                      Read Story &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  );
};
