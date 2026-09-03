import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar, Clock, User } from 'lucide-react';
import { blogService } from '../../services/blogService';
import { BlogPost } from '@stitchx/shared';

interface BlogSectionProps {
  title?: string;
  subtitle?: string;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ title, subtitle }) => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogService.getBlogs({ isPublished: true });
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch blogs for homepage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();

    const handleBlogsUpdate = () => fetchBlogs();
    window.addEventListener('cms-blogs-updated', handleBlogsUpdate);
    window.addEventListener('cms-nav-updated', handleBlogsUpdate);

    return () => {
      window.removeEventListener('cms-blogs-updated', handleBlogsUpdate);
      window.removeEventListener('cms-nav-updated', handleBlogsUpdate);
    };
  }, []);

  if (!loading && blogs.length === 0) {
    return null;
  }

  const displayBlogs = blogs.slice(0, 3);

  return (
    <section className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/20 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-amber-600 inline mr-1.5 -mt-0.5" />
            Sartorial Journal & Style Guides
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-950 tracking-tight">
            {title && title !== 'Atelier Journal & Sartorial Guides' ? title : 'The Atelier Journal'}
          </h2>
          <p className="text-sm text-slate-600 max-w-xl font-sans">
            {subtitle || 'Discover masterclass tailoring guides, Italian fabric insights, and dress code rules from our master tailors.'}
          </p>
        </div>

        <Link
          to="/blog"
          className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-all duration-300 shadow-sm hover:scale-[1.02] cursor-pointer shrink-0 self-start md:self-auto"
        >
          <span>View All Articles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-3xl h-80 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {displayBlogs.map((post) => (
            <Link
              key={post.id || post._id}
              to={`/blog/${post.slug}`}
              className="group flex flex-col justify-between rounded-3xl overflow-hidden bg-slate-50/70 border border-slate-200/80 shadow-2xs hover:shadow-xl hover:border-amber-400/80 transition-all duration-300 transform hover:-translate-y-1.5"
            >
              <div>
                {/* Article Cover Image */}
                <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-950">
                  <img
                    src={
                      post.image ||
                      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 backdrop-blur-md text-slate-950 border border-white/60 shadow-xs">
                      {post.category || 'Atelier'}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
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
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{post.readTime || '5 min read'}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-slate-950 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans font-normal">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Footer Meta & Action */}
              <div className="px-6 py-4 bg-white border-t border-slate-200/80 flex items-center justify-between group-hover:bg-amber-50/50 transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 truncate max-w-[160px]">
                  <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{post.author || 'Stitchx Atelier'}</span>
                </div>
                <div className="text-xs font-bold text-amber-600 group-hover:text-amber-700 flex items-center gap-1 shrink-0">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
