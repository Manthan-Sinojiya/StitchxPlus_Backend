import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  BookOpen,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button, Input, Modal, Badge, Pagination, ImageUploader, RichTextEditor, useToast } from '../../components/ui';
import { blogService } from '../../services/blogService';
import { BlogPost } from '@stitchx/shared';

export const AdminBlogsPage: React.FC = () => {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [deleteBlogId, setDeleteBlogId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    author: string;
    category: string;
    tags: string;
    readTime: string;
    isPublished: boolean;
  }>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    author: 'Stitchx Plus Atelier',
    category: 'Style & Heritage',
    tags: '',
    readTime: '5 min read',
    isPublished: true,
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogService.getBlogs({ isPublished: false });
      setBlogs(data);
    } catch (err: any) {
      toast('error', 'Failed to load blog posts', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      author: 'Stitchx Plus Atelier',
      category: 'Style & Heritage',
      tags: '',
      readTime: '5 min read',
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (blog: BlogPost) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      image: blog.image || '',
      author: blog.author || 'Stitchx Plus Atelier',
      category: blog.category || 'Style & Heritage',
      tags: blog.tags ? blog.tags.join(', ') : '',
      readTime: blog.readTime || '5 min read',
      isPublished: blog.isPublished !== undefined ? blog.isPublished : true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast('error', 'Validation Error', 'Article title is required');
      return;
    }
    if (!formData.content.trim()) {
      toast('error', 'Validation Error', 'Article content description is required');
      return;
    }

    try {
      setSubmitting(true);
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: Partial<BlogPost> = {
        ...formData,
        tags: tagsArray,
      };

      if (editingBlog && (editingBlog.id || editingBlog._id)) {
        const id = editingBlog.id || editingBlog._id!;
        await blogService.updateBlog(id, payload);
        toast('success', 'Blog Updated', 'Journal article updated successfully');
      } else {
        await blogService.createBlog(payload);
        toast('success', 'Blog Created', 'New journal article published successfully');
      }

      setIsModalOpen(false);
      fetchBlogs();
    } catch (err: any) {
      toast('error', 'Action Failed', err.message || 'Error saving blog post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteBlogId) return;
    try {
      await blogService.deleteBlog(deleteBlogId);
      toast('success', 'Blog Deleted', 'Journal article deleted');
      setDeleteBlogId(null);
      fetchBlogs();
    } catch (err: any) {
      toast('error', 'Delete Failed', err.message);
    }
  };

  // Filter & Search Logic
  const filteredBlogs = blogs.filter((blog) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      blog.title.toLowerCase().includes(q) ||
      (blog.excerpt && blog.excerpt.toLowerCase().includes(q)) ||
      (blog.category && blog.category.toLowerCase().includes(q)) ||
      (blog.author && blog.author.toLowerCase().includes(q)) ||
      (blog.content && blog.content.toLowerCase().includes(q)) ||
      (blog.tags && blog.tags.some((t) => t.toLowerCase().includes(q)));
    const matchesCat = selectedCategory === 'All' || blog.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const categoriesList = ['All', ...Array.from(new Set(blogs.map((b) => b.category).filter(Boolean)))];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-charcoal-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-bronze-600" />
            <h1 className="text-2xl font-bold font-serif text-charcoal-950">Journal & Blog Management</h1>
          </div>
          <p className="text-xs text-charcoal-500">
            Publish and manage luxury editorial articles, fabric guides, and styling journal posts.
          </p>
        </div>

        <Button onClick={handleOpenCreateModal} variant="gold" leftIcon={<Plus className="w-4 h-4" />}>
          Create New Article
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cream-50/70 p-4 rounded-2xl border border-charcoal-200/60">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search blog articles by title or tag..."
            className="w-full bg-white border border-charcoal-200/80 focus:border-bronze-500 rounded-xl text-xs py-2.5 pl-9 pr-4 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-bronze-500/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-charcoal-700">Category:</span>
          {categoriesList.map((cat) => (
            <button
              key={cat as string}
              onClick={() => {
                setSelectedCategory(cat as string);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-charcoal-950 text-white'
                  : 'bg-white text-charcoal-700 border border-charcoal-200 hover:bg-cream-100'
              }`}
            >
              {cat as string}
            </button>
          ))}
        </div>
      </div>

      {/* Blogs Data Table */}
      <div className="bg-white rounded-3xl border border-charcoal-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-charcoal-500">Loading journal articles...</div>
        ) : paginatedBlogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-bronze-500 mx-auto opacity-60" />
            <p className="text-sm font-bold text-charcoal-800">No blog posts found</p>
            <p className="text-xs text-charcoal-500">Create your first blog post using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-50/80 border-b border-charcoal-200/70 text-[11px] font-extrabold text-charcoal-700 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Article</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-xs">
                {paginatedBlogs.map((blog) => (
                  <tr key={blog.id || blog._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 max-w-md">
                        {blog.image ? (
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-12 h-12 rounded-xl object-cover border border-charcoal-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-charcoal-100 flex items-center justify-center text-charcoal-400 shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-charcoal-950 line-clamp-1">{blog.title}</p>
                          <p className="text-[11px] text-charcoal-500 font-mono mt-0.5">/blog/{blog.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant="gold" size="sm">
                        {blog.category || 'General'}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 font-medium text-charcoal-700">
                      {blog.author || 'Stitchx Atelier'}
                    </td>

                    <td className="py-4 px-4">
                      {blog.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          <XCircle className="w-3 h-3 text-amber-600" /> Draft
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-charcoal-500">
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 hover:bg-cream-100 text-charcoal-600 rounded-lg transition-colors"
                          title="Preview Article"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleOpenEditModal(blog)}
                          className="p-1.5 hover:bg-bronze-50 text-bronze-700 rounded-lg transition-colors cursor-pointer"
                          title="Edit Article"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteBlogId(blog.id || blog._id!)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-charcoal-100 flex justify-end">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBlog ? 'Edit Journal Article' : 'Create New Journal Article'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Article Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. The Heritage of Italian Bespoke Tailoring"
              required
            />

            <Input
              label="URL Slug (Optional)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. art-of-italian-bespoke-tailoring"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Style & Heritage"
            />

            <Input
              label="Author Name"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="e.g. Master Tailor Alexander"
            />

            <Input
              label="Estimated Read Time"
              value={formData.readTime}
              onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
              placeholder="e.g. 5 min read"
            />
          </div>

          {/* Cover Image Uploader */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-charcoal-800 tracking-wide uppercase">
              Cover Image
            </label>
            <ImageUploader
              value={formData.image}
              onChange={(val) => setFormData({ ...formData, image: val.url })}
              label="Upload Cover Image"
            />
          </div>

          {/* Short Excerpt */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-charcoal-800 tracking-wide uppercase">
              Short Summary / Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full bg-white border border-charcoal-200 rounded-2xl p-3 text-xs text-charcoal-900 focus:border-bronze-500 focus:outline-none"
              placeholder="Brief 1-2 sentence overview for cards and meta descriptions..."
            />
          </div>

          {/* Main Description Content with RichTextEditor Component */}
          <RichTextEditor
            label="Article Full Description / Content"
            value={formData.content}
            onChange={(val) => setFormData({ ...formData, content: val })}
            placeholder="Compose article body with headings, bullet points, images, and quotes..."
            minHeight="280px"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Tags (Comma Separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Tailoring, Italian Wool, Style Guide"
            />

            <div className="flex items-center gap-3 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-charcoal-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-charcoal-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bronze-600"></div>
                <span className="ml-3 text-xs font-bold text-charcoal-950">
                  {formData.isPublished ? 'Published Instantly' : 'Save as Draft'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-charcoal-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" disabled={submitting}>
              {submitting ? 'Saving Article...' : editingBlog ? 'Update Article' : 'Publish Article'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteBlogId)}
        onClose={() => setDeleteBlogId(null)}
        title="Confirm Delete Article"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-charcoal-700">
            Are you sure you want to permanently delete this journal article? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteBlogId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
