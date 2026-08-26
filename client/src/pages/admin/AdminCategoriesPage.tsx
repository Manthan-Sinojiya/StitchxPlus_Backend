import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Folder, Check, X, ArrowUpDown, ArrowLeft, Save, Globe, Sparkles } from 'lucide-react';
import { Button, Input, Select, ImageUploader, useToast, Loader, Pagination } from '../../components/ui';
import { adminService } from '../../services/adminService';
import { Category } from '@stitchx/shared';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    imageAlt: '',
    parentCategory: '',
    sortOrder: 0,
    isActive: true,
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: '',
    },
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCategories();
      setCategories(data || []);
    } catch (_err) {
      toast('error', 'Error', 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddEditor = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Custom Bespoke Suit Category Banner',
      parentCategory: '',
      sortOrder: categories.length + 1,
      isActive: true,
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: 'bespoke suits, custom menswear, luxury tailoring, custom tuxedos',
      },
    });
    setViewMode('editor');
  };

  const openEditEditor = (cat: Category) => {
    setEditingCategory(cat);
    const parentId =
      typeof cat.parentCategory === 'string'
        ? cat.parentCategory
        : cat.parentCategory?.id || (cat.parentCategory as any)?._id || '';

    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || '',
      imageAlt: (cat as any).imageAlt || cat.name || '',
      parentCategory: parentId,
      sortOrder: cat.sortOrder || 0,
      isActive: cat.isActive ?? true,
      seo: {
        metaTitle: cat.seo?.metaTitle || '',
        metaDescription: cat.seo?.metaDescription || '',
        keywords: (cat.seo as any)?.keywords || '',
      },
    });
    setViewMode('editor');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast('error', 'Validation Error', 'Category name is required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        parentCategory: formData.parentCategory || null,
        slug:
          formData.slug ||
          formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, ''),
      };

      if (editingCategory) {
        const id = editingCategory.id || (editingCategory as any)._id;
        await adminService.updateCategory(id, payload);
        toast('success', 'Category Updated', `"${formData.name}" updated successfully.`);
      } else {
        await adminService.createCategory(payload);
        toast('success', 'Category Created', `"${formData.name}" created successfully.`);
      }
      window.dispatchEvent(new CustomEvent('cms-nav-updated'));
      setViewMode('list');
      fetchCategories();
    } catch (err: any) {
      toast('error', 'Save Error', err?.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await adminService.deleteCategory(id);
      window.dispatchEvent(new CustomEvent('cms-nav-updated'));
      toast('info', 'Category Deleted', `"${name}" removed.`);
      fetchCategories();
    } catch (err: any) {
      toast(
        'error',
        'Deletion Guard Blocked',
        err?.message || 'Cannot delete category with active assigned products.',
      );
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // If viewMode === 'editor', render dedicated Full Page Category Editor!
  if (viewMode === 'editor') {
    return (
      <div className="space-y-6 font-sans pb-12">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs sticky top-4 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Categories</span>
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                <Folder className="w-5 h-5 text-amber-600" />
                {editingCategory ? `Edit Category: ${formData.name}` : 'Create New Category'}
              </h2>
              <p className="text-xs text-slate-500">Define garment category taxonomy, media & SEO keywords</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end w-full sm:w-auto">
            <Button variant="ghost" size="sm" onClick={() => setViewMode('list')}>
              Cancel
            </Button>
            <Button variant="gold" size="sm" isLoading={submitting} onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
              Save Category
            </Button>
          </div>
        </div>

        {/* Editor Card */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-8 space-y-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Category Name *"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                setFormData({
                  ...formData,
                  name,
                  slug: editingCategory ? formData.slug : slug,
                });
              }}
              placeholder="e.g. Custom Blazers & Jackets"
              required
            />

            <Input
              label="URL Slug (Identifier)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
              placeholder="custom-blazers-jackets"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Parent Category (Taxonomy Hierarchy)"
              value={formData.parentCategory}
              onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
              options={[
                { value: '', label: 'Root Category (No Parent)' },
                ...categories
                  .filter((c) => (c.id || (c as any)._id) !== (editingCategory?.id || (editingCategory as any)?._id))
                  .map((c) => ({
                    value: c.id || (c as any)._id,
                    label: c.name,
                  })),
              ]}
            />

            <Input
              label="Display Sort Order"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category Description (Storefront Highlight)
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the suit category, occasions, fit profiles, and fabrics..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Cloudinary & Image Upload with Alt Text */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" /> Category Banner Media (Cloudinary Hosted)
            </h4>

            <ImageUploader
              label="Banner / Swatch Image Asset"
              value={{ url: formData.image, altText: formData.imageAlt }}
              onChange={(res) => setFormData({ ...formData, image: res.url, imageAlt: res.altText })}
              folder="stitchx_categories"
            />
          </div>

          {/* SEO & Search Engine Keywords */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-600" /> Category SEO & Search Engine Keywords
            </h4>

            <Input
              label="SEO Meta Title"
              value={formData.seo.metaTitle}
              onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })}
              placeholder="e.g. Bespoke Custom Blazers & Jackets | Stitchx Plus"
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                SEO Meta Description
              </label>
              <textarea
                rows={3}
                value={formData.seo.metaDescription}
                onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })}
                placeholder="Explore custom tailored blazers crafted from fine European wool..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <Input
              label="SEO Keywords (Comma Separated)"
              value={formData.seo.keywords}
              onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, keywords: e.target.value } })}
              placeholder="blazer, custom coat, bespoke jacket, tailored sports coat"
            />
          </div>

          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 text-amber-600 rounded"
            />
            <div>
              <span className="font-bold text-xs text-slate-900 block">Category Active on Storefront</span>
              <span className="text-[11px] text-slate-500">Visible in main header navigation and shop category filters.</span>
            </div>
          </label>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Button type="button" variant="ghost" size="sm" onClick={() => setViewMode('list')}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={submitting} leftIcon={<Save className="w-4 h-4" />}>
              Save Category
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Otherwise list mode
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <Folder className="w-6 h-6 text-amber-600" />
            Category & Navigation Management
          </h2>
          <p className="text-xs text-slate-500">
            Organize suit and accessory hierarchy with subcategories, ordering, and deletion safety.
          </p>
        </div>
        <button
          onClick={openAddEditor}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-xs transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Category
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Category Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader size="lg" />
          <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
            Loading Categories...
          </span>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Parent Category</th>
                <th className="py-3.5 px-4">Sort Order</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 bg-white">
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map((c) => {
                  const id = c.id || (c as any)._id;
                  const parentName =
                    typeof c.parentCategory === 'object' && c.parentCategory?.name
                      ? c.parentCategory.name
                      : categories.find(
                          (parent) => (parent.id || (parent as any)._id) === c.parentCategory,
                        )?.name || 'Root Category';

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img
                          src={
                            c.image ||
                            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={c.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200/80 shrink-0 shadow-2xs"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                          <span className="text-[11px] text-slate-500 block">
                            {c.description || 'No description'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{c.slug}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{parentName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 flex items-center gap-1">
                        <ArrowUpDown className="w-3 h-3 text-slate-400" /> #{c.sortOrder || 0}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.isActive !== false ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
                            <X className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEditEditor(c)}
                          className="p-1.5 text-slate-500 hover:text-amber-700 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(id, c.name)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No categories found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-600 mt-4 shadow-2xs">
            <span className="font-medium">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCategories.length)} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} categories
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </>
      )}
    </div>
  );
}
