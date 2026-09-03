import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Sliders,
  Tag,
  ImageIcon,
  Sparkles,
  ArrowLeft,
  Globe,
  PackageCheck,
  Save,
  Shirt,
  Layers,
  Upload,
  X,
} from 'lucide-react';
import { Button, Input, Select, ImageUploader, useToast, Loader, Pagination, RichTextEditor } from '../../components/ui';
import { adminService } from '../../services/adminService';
import { contentService } from '../../services/contentService';
import { Product, Category, Fabric } from '@stitchx/shared';

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [customizationGroups, setCustomizationGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // View Mode: 'list' table vs 'editor' full page view
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<
    'basic' | 'images' | 'customization' | 'inventory' | 'seo' | 'shipping'
  >('basic');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Dynamic Custom Showcase Sections State
  const [customSections, setCustomSections] = useState<any[]>([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [sectionForm, setSectionForm] = useState({
    name: '',
    code: '',
    badgeText: '',
    description: '',
    badgeColor: 'amber',
    isActive: true,
  });

  // Form State for Products
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    sku: '',
    basePrice: 0,
    compareAtPrice: 0,
    currency: 'USD',
    category: '',
    fabricRef: '',
    isCustomizable: true,
    customizationGroups: [] as string[],
    isMadeToOrder: true,
    stockQuantity: 0,
    lowStockThreshold: 5,
    status: 'active' as 'active' | 'draft' | 'out_of_stock' | 'archived',
    isFeatured: false,
    isNew: true,
    isOnSale: false,
    isDeal: false,
    tags: [] as string[],
    sizes: [] as string[],
    showSizeChart: true,
    sizeChartType: 'suits' as 'suits' | 'shirts' | 'trousers',
    returnPolicy: '30-Day Hassle-Free Returns & Perfect Fit Guarantee',
    guaranteeDetails: 'Every garment is backed by our 100% Fit Guarantee. Free alterations within 30 days.',
    productDetailsSections: [] as Array<{ id?: string; title: string; content: string }>,
    simpleVariants: [] as Array<{ name?: string; colorName?: string; sizeName?: string; sku?: string; stockQuantity: number; inStock: boolean }>,
    colors: [] as Array<{ name: string; hex: string; image?: string; images?: Array<string | { url: string; altText?: string }> }>,
    images: [] as { url: string; altText?: string; isPrimary?: boolean; isHover?: boolean }[],
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      canonicalSlug: '',
    },
    shipping: {
      weight: 1.5,
      dimensions: { length: 40, width: 30, height: 10 },
      shippingClass: 'Standard Tailored',
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodsRes, catsRes, fabsRes, groupsRes] = await Promise.all([
        adminService.getProducts({ limit: 1000 }),
        adminService.getCategories(),
        adminService.getFabrics(),
        adminService.getCustomizationGroups(),
      ]);

      setProducts(prodsRes.products || []);
      setCategories(catsRes || []);
      setFabrics(fabsRes || []);
      setCustomizationGroups(groupsRes || []);

      const secs = await contentService.getCustomSections().catch(() => []);
      setCustomSections(secs || []);
    } catch (_err) {
      toast('error', 'Error', 'Failed to load catalog data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddEditor = () => {
    setEditingProduct(null);
    setActiveTab('basic');
    setFormData({
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      sku: '',
      basePrice: 890,
      compareAtPrice: 1100,
      currency: 'USD',
      category: categories[0]?.id || (categories[0] as any)?._id || '',
      fabricRef: fabrics[0]?.id || (fabrics[0] as any)?._id || '',
      isCustomizable: true,
      customizationGroups: customizationGroups.map((g) => g.groupCode || g.id || ''),
      isMadeToOrder: true,
      stockQuantity: 15,
      lowStockThreshold: 5,
      status: 'active',
      isFeatured: true,
      isNew: true,
      isOnSale: true,
      isDeal: false,
      tags: [],
      sizes: ['S', 'M', 'L', 'XL'],
      showSizeChart: true,
      sizeChartType: 'suits',
      returnPolicy: '30-Day Hassle-Free Returns & Perfect Fit Guarantee',
      guaranteeDetails: 'Every garment is backed by our 100% Fit Guarantee. Free alterations within 30 days.',
      productDetailsSections: [],
      simpleVariants: [],
      colors: [
        { name: 'Navy Blue', hex: '#1c2536', image: '' },
        { name: 'Classic Khaki', hex: '#8c7b6c', image: '' },
        { name: 'Pure White', hex: '#ffffff', image: '' },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
          altText: 'Bespoke Suit Front View',
          isPrimary: true,
        },
      ],
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: 'bespoke suit, tailored suit, luxury suit, custom menswear',
        canonicalSlug: '',
      },
      shipping: {
        weight: 1.5,
        dimensions: { length: 40, width: 30, height: 10 },
        shippingClass: 'Standard Tailored',
      },
    });
    setViewMode('editor');
  };

  const openEditEditor = (product: Product) => {
    setEditingProduct(product);
    setActiveTab('basic');
    const catId =
      typeof product.category === 'object'
        ? (product.category as any)?._id || (product.category as any)?.id
        : product.category;

    const parsedColors = Array.isArray(product.colors) && product.colors.length > 0
      ? product.colors.map((c: any) =>
          typeof c === 'string'
            ? { name: c, hex: c.startsWith('#') ? c : '#1c2536', image: '' }
            : { name: c.name || 'Color', hex: c.hex || '#1c2536', image: c.image || '' }
        )
      : [
          { name: 'Navy Blue', hex: '#1c2536', image: '' },
          { name: 'Classic Khaki', hex: '#8c7b6c', image: '' },
        ];

    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      sku: product.sku || '',
      basePrice: product.basePrice || 0,
      compareAtPrice: product.compareAtPrice || 0,
      currency: product.currency || 'USD',
      category: catId || '',
      fabricRef: (product as any).fabricRef || '',
      isCustomizable: product.isCustomizable ?? true,
      customizationGroups: product.customizationGroups || [],
      isMadeToOrder: product.isMadeToOrder ?? true,
      stockQuantity: product.stockQuantity || 0,
      lowStockThreshold: product.lowStockThreshold || 5,
      status: product.status || 'active',
      isFeatured: product.isFeatured || false,
      isNew: product.isNew ?? true,
      isOnSale: product.isOnSale ?? Boolean(product.compareAtPrice && product.compareAtPrice > product.basePrice),
      isDeal: (product as any).isDeal || false,
      tags: (product as any).tags || (product as any).customSections || [],
      sizes: (product as any).sizes || ['S', 'M', 'L', 'XL'],
      showSizeChart: product.showSizeChart ?? true,
      sizeChartType: (product.sizeChartType as any) || 'suits',
      returnPolicy: product.returnPolicy || '30-Day Hassle-Free Returns & Perfect Fit Guarantee',
      guaranteeDetails: product.guaranteeDetails || 'Every garment is backed by our 100% Fit Guarantee. Free alterations within 30 days.',
      productDetailsSections: (product as any).productDetailsSections || [],
      simpleVariants: (product as any).simpleVariants || [],
      colors: parsedColors,
      images:
        product.images && product.images.length > 0
          ? product.images.map((img: any, i: number) =>
              typeof img === 'string'
                ? { url: img, altText: product.name, isPrimary: i === 0, isHover: i === 1 }
                : {
                    url: img.url || '',
                    altText: img.altText || product.name,
                    isPrimary: img.isPrimary ?? (i === 0),
                    isHover: img.isHover ?? (i === 1),
                  }
            )
          : [
              {
                url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
                altText: product.name,
                isPrimary: true,
                isHover: false,
              },
            ],
      seo: {
        metaTitle: product.seo?.metaTitle || '',
        metaDescription: product.seo?.metaDescription || '',
        keywords: (product.seo as any)?.keywords || '',
        canonicalSlug: product.seo?.canonicalSlug || '',
      },
      shipping: {
        weight: product.shipping?.weight || 1.5,
        dimensions: {
          length: product.shipping?.dimensions?.length || 40,
          width: product.shipping?.dimensions?.width || 30,
          height: product.shipping?.dimensions?.height || 10,
        },
        shippingClass: product.shipping?.shippingClass || 'Standard Tailored',
      },
    });
    setViewMode('editor');
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.name.trim()) return;

    const code =
      sectionForm.code.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_') ||
      sectionForm.name.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
    const badgeText = sectionForm.badgeText.trim() || sectionForm.name.trim();

    let updated = [...customSections];
    if (editingSection) {
      updated = updated.map((s) =>
        s.id === editingSection.id ? { ...s, ...sectionForm, code, badgeText } : s,
      );
    } else {
      updated.push({
        id: `sec-${Date.now()}`,
        ...sectionForm,
        code,
        badgeText,
      });
    }

    setCustomSections(updated);
    await contentService.saveCustomSections(updated);
    setShowSectionModal(false);
    setEditingSection(null);
    toast('success', 'Section Saved', `Showcase section "${sectionForm.name}" saved.`);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast('error', 'Validation Error', 'Garment name is required.');
      return;
    }

    try {
      setSubmitting(true);
      const generatedSlug =
        formData.slug.trim() ||
        formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const payload = {
        ...formData,
        slug: generatedSlug,
      };

      if (editingProduct) {
        const id = editingProduct.id || (editingProduct as any)._id;
        await adminService.updateProduct(id, payload);
        toast('success', 'Garment Saved', `Updated ${formData.name}.`);
      } else {
        await adminService.createProduct(payload);
        toast('success', 'Garment Created', `Published ${formData.name} to catalog.`);
      }

      setViewMode('list');
      fetchData();
    } catch (err: any) {
      toast('error', 'Save Error', err?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    try {
      await adminService.deleteProduct(id);
      toast('info', 'Garment Removed', `${name} deleted from catalog.`);
      fetchData();
    } catch (err: any) {
      toast('error', 'Error', err?.message || 'Failed to delete product.');
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter]);

  // Filter & Pagination calculations
  const filteredProducts = products.filter((p) => {
    const s = search.toLowerCase().trim();

    const pCatObj = typeof p.category === 'object' && p.category !== null ? (p.category as any) : null;
    const pCatName = pCatObj?.name || '';
    const pCatId = pCatObj ? String(pCatObj._id || pCatObj.id || '') : String(p.category || '');

    const pFabObj = typeof p.fabricRef === 'object' && p.fabricRef !== null ? (p.fabricRef as any) : null;
    const pFabName = pFabObj?.name || '';

    const matchesSearch =
      !s ||
      p.name.toLowerCase().includes(s) ||
      (p.sku && p.sku.toLowerCase().includes(s)) ||
      (p.description && p.description.toLowerCase().includes(s)) ||
      pCatName.toLowerCase().includes(s) ||
      pFabName.toLowerCase().includes(s) ||
      (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(s)));

    const matchesCategory = categoryFilter === 'all' || pCatId === String(categoryFilter);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // If viewMode === 'editor', render dedicated Full Page Editor View!
  if (viewMode === 'editor') {
    return (
      <div className="space-y-6 font-sans pb-12">
        {/* Top Sticky Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs sticky top-4 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Catalog</span>
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                <Shirt className="w-5 h-5 text-amber-600" />
                {editingProduct ? `Edit Garment: ${formData.name}` : 'Create New Custom Garment'}
              </h2>
              <p className="text-xs text-slate-500">
                Full bespoke catalog editor & media manager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button variant="ghost" size="sm" onClick={() => setViewMode('list')}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={submitting}
              onClick={handleSaveProduct}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Garment Record
            </Button>
          </div>
        </div>

        {/* Editor Form Card */}
        <form onSubmit={handleSaveProduct} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Editor Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200/80 bg-slate-50/80 px-6 overflow-x-auto">
            {[
              { id: 'basic', label: '1. Basic & Pricing', icon: Tag },
              { id: 'images', label: '2. Multi-Media & Images', icon: ImageIcon },
              { id: 'customization', label: '3. Bespoke Options', icon: Sliders },
              { id: 'inventory', label: '4. Inventory & Stock', icon: Layers },
              { id: 'seo', label: '5. SEO & Search Meta', icon: Globe },
              { id: 'shipping', label: '6. Shipping Specs', icon: PackageCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'border-amber-600 text-amber-900 bg-white shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-8 space-y-6">
            {/* TAB 1: BASIC & PRICING */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Garment Product Name *"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                      setFormData({
                        ...formData,
                        name,
                        slug: editingProduct ? formData.slug : slug,
                      });
                    }}
                    placeholder="e.g. Royal Navy Italian Wool Suit"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="URL Slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                      placeholder="royal-navy-italian-wool-suit"
                    />
                    <Input
                      label="SKU Code"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                      placeholder="SUIT-NAV-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Base Price ($ USD) *"
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                    required
                  />
                  <Input
                    label="Compare-At Price ($ USD)"
                    type="number"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: parseFloat(e.target.value) || 0 })}
                  />
                  <Select
                    label="Currency Code"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    options={[
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'EUR', label: 'EUR (€)' },
                      { value: 'GBP', label: 'GBP (£)' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Product Category *"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    options={categories.map((c) => ({
                      value: c.id || (c as any)._id,
                      label: c.name,
                    }))}
                  />

                  <Select
                    label="Default Primary Fabric"
                    value={formData.fabricRef}
                    onChange={(e) => setFormData({ ...formData, fabricRef: e.target.value })}
                    options={[
                      { value: '', label: 'None Selected' },
                      ...fabrics.map((f) => ({
                        value: f.id || (f as any)._id,
                        label: `${f.name} (${f.composition || 'Luxury Fabric'})`,
                      })),
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Short Description (Storefront Highlight)
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="e.g. Crafted from Super 150s Italian Merino Wool with full canvas construction."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <RichTextEditor
                  label="Full Craftsmanship Narrative & Specifications"
                  value={formData.description}
                  onChange={(val) => setFormData({ ...formData, description: val })}
                  placeholder="Provide full sartorial details, lapel design, lining materials, and button details..."
                  minHeight="220px"
                />
              </div>
            )}

            {/* TAB 2: MULTI-MEDIA & IMAGES */}
            {activeTab === 'images' && (
              <div className="space-y-6">
                <div className="p-4 bg-amber-500/10 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Cloudinary Asset Gallery</h4>
                      <p className="text-[11px] text-slate-600">
                        Upload high-resolution photography directly or enter Cloudinary image URLs. Alt tags are required for SEO indexing.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        images: [
                          ...formData.images,
                          {
                            url: '',
                            altText: `${formData.name || 'Garment'} Image ${formData.images.length + 1}`,
                            isPrimary: formData.images.length === 0,
                          },
                        ],
                      })
                    }
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Image Slot
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3 relative">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-amber-600" />
                            Image {idx + 1}
                          </span>
                          {img.isPrimary && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold border border-amber-300">
                              PRIMARY COVER
                            </span>
                          )}
                          {img.isHover && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold border border-indigo-300">
                              HOVER IMAGE
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.images.map((im, i) => ({
                                  ...im,
                                  isPrimary: i === idx,
                                  isHover: i === idx ? false : im.isHover,
                                }));
                                setFormData({ ...formData, images: updated });
                              }}
                              className="text-[11px] font-bold text-amber-700 hover:underline"
                              title="Set as Main Cover Image"
                            >
                              Set Primary
                            </button>
                          )}
                          {!img.isHover && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.images.map((im, i) => ({
                                  ...im,
                                  isHover: i === idx,
                                  isPrimary: i === idx ? false : im.isPrimary,
                                }));
                                setFormData({ ...formData, images: updated });
                              }}
                              className="text-[11px] font-bold text-indigo-700 hover:underline"
                              title="Set as Card Hover View"
                            >
                              Set Hover Image
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.images.filter((_, i) => i !== idx);
                              setFormData({ ...formData, images: updated });
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Remove Image Slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <ImageUploader
                        label=""
                        value={{ url: img.url, altText: img.altText || '' }}
                        onChange={(res) => {
                          const updated = [...formData.images];
                          updated[idx] = {
                            ...updated[idx],
                            url: res.url,
                            altText: res.altText,
                          };
                          setFormData({ ...formData, images: updated });
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* COLOR VARIANTS MANAGEMENT */}
                <div className="pt-6 border-t border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Color Swatches & Color-Specific Garment Imagery
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Add color swatches and attach specific photos. Upload image files or paste direct URLs, with SEO alt tags for each photo!
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          colors: [
                            ...formData.colors,
                            { name: `Color ${formData.colors.length + 1}`, hex: '#1c2536', image: '', images: [] },
                          ],
                        })
                      }
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Add Color Variant
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.colors.map((clr, cIdx) => {
                      const colorImages = clr.images && clr.images.length > 0 ? clr.images : (clr.image ? [clr.image] : []);

                      const handleFileUploadForColor = async (e: React.ChangeEvent<HTMLInputElement>, targetImgIdx?: number) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        let uploadedUrl = '';
                        try {
                          const sig = await adminService.getCloudinarySignature('stitchx_uploads');
                          if (sig?.signature && sig?.cloudName && sig?.apiKey) {
                            const data = new FormData();
                            data.append('file', file);
                            data.append('api_key', sig.apiKey);
                            data.append('timestamp', String(sig.timestamp));
                            data.append('signature', sig.signature);
                            data.append('folder', sig.folder || 'stitchx_uploads');

                            const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
                              method: 'POST',
                              body: data,
                            });
                            if (res.ok) {
                              const json = await res.json();
                              if (json.secure_url) uploadedUrl = json.secure_url;
                            }
                          }
                        } catch (_err) {}

                        if (!uploadedUrl) {
                          uploadedUrl = await new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve((reader.result as string) || '');
                            reader.readAsDataURL(file);
                          });
                        }

                        if (!uploadedUrl) return;

                        const defaultAlt = `${clr.name || 'Garment'} Suit View`;
                        const updated = [...formData.colors];
                        const currentImgs = updated[cIdx].images && updated[cIdx].images.length > 0
                          ? [...updated[cIdx].images]
                          : (updated[cIdx].image ? [updated[cIdx].image] : []);

                        if (typeof targetImgIdx === 'number') {
                          const existing = currentImgs[targetImgIdx];
                          const prevAlt = typeof existing === 'string' ? defaultAlt : existing?.altText || defaultAlt;
                          currentImgs[targetImgIdx] = { url: uploadedUrl, altText: prevAlt };
                        } else {
                          currentImgs.push({ url: uploadedUrl, altText: defaultAlt });
                        }

                        const firstUrl = typeof currentImgs[0] === 'string' ? currentImgs[0] : currentImgs[0]?.url || '';

                        updated[cIdx] = {
                          ...updated[cIdx],
                          image: firstUrl,
                          images: currentImgs,
                        };
                        setFormData({ ...formData, colors: updated });
                        e.target.value = '';
                      };

                      return (
                        <div key={cIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-5 h-5 rounded-full border border-slate-300 shadow-2xs"
                                style={{ backgroundColor: clr.hex }}
                              />
                              <span className="text-xs font-bold text-slate-900">Color Swatch #{cIdx + 1}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.colors.filter((_, i) => i !== cIdx);
                                setFormData({ ...formData, colors: updated });
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded"
                              title="Remove Color Variant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              label="Color Name"
                              value={clr.name}
                              onChange={(e) => {
                                const updated = [...formData.colors];
                                updated[cIdx] = { ...updated[cIdx], name: e.target.value };
                                setFormData({ ...formData, colors: updated });
                              }}
                              placeholder="e.g. Royal Navy"
                            />
                            <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Hex Code
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={clr.hex.startsWith('#') ? clr.hex : '#1c2536'}
                                  onChange={(e) => {
                                    const updated = [...formData.colors];
                                    updated[cIdx] = { ...updated[cIdx], hex: e.target.value };
                                    setFormData({ ...formData, colors: updated });
                                  }}
                                  className="w-9 h-9 p-0.5 rounded-xl border border-slate-200 cursor-pointer bg-white"
                                />
                                <input
                                  type="text"
                                  value={clr.hex}
                                  onChange={(e) => {
                                    const updated = [...formData.colors];
                                    updated[cIdx] = { ...updated[cIdx], hex: e.target.value };
                                    setFormData({ ...formData, colors: updated });
                                  }}
                                  placeholder="#1c2536"
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>

                          {/* COLOR PHOTOS MANAGEMENT: UPLOAD & URL BOTH WITH SEO ALT TAG */}
                          <div className="space-y-3 pt-2 border-t border-slate-200/80">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                Photos for "{clr.name || `Color ${cIdx + 1}`}" ({colorImages.length})
                              </label>

                              <div className="flex items-center gap-2">
                                {/* Direct File Upload Button */}
                                <label className="text-[10px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs">
                                  <Upload className="w-3 h-3" />
                                  <span>Upload Image File</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUploadForColor(e)}
                                    className="hidden"
                                  />
                                </label>

                                {/* Direct URL Add Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...formData.colors];
                                    const currentImgs = updated[cIdx].images && updated[cIdx].images.length > 0
                                      ? updated[cIdx].images
                                      : (updated[cIdx].image ? [updated[cIdx].image] : []);
                                    updated[cIdx] = {
                                      ...updated[cIdx],
                                      images: [...currentImgs, { url: '', altText: `${clr.name || 'Color'} Garment View` }],
                                    };
                                    setFormData({ ...formData, colors: updated });
                                  }}
                                  className="text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Add Image URL
                                </button>
                              </div>
                            </div>

                            {/* List of Photo Inputs with URL + Upload File button + SEO Alt Tag */}
                            {colorImages.length === 0 ? (
                              <p className="text-[11px] text-slate-400 italic bg-white p-3 rounded-xl border border-dashed border-slate-200 text-center">
                                No photos added for this color yet. Click "Upload Image File" or "Add Image URL" above to add garment photos!
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {colorImages.map((imgItem, imgIdx) => {
                                  const imgObj = typeof imgItem === 'string'
                                    ? { url: imgItem, altText: '' }
                                    : { url: imgItem?.url || '', altText: imgItem?.altText || '' };

                                  const updatePhotoUrl = (newUrl: string) => {
                                    const updated = [...formData.colors];
                                    const currentImgs = updated[cIdx].images && updated[cIdx].images.length > 0
                                      ? [...updated[cIdx].images]
                                      : (updated[cIdx].image ? [updated[cIdx].image] : []);
                                    currentImgs[imgIdx] = { url: newUrl, altText: imgObj.altText };

                                    const firstUrl = typeof currentImgs[0] === 'string' ? currentImgs[0] : currentImgs[0]?.url || '';

                                    updated[cIdx] = {
                                      ...updated[cIdx],
                                      image: firstUrl,
                                      images: currentImgs,
                                    };
                                    setFormData({ ...formData, colors: updated });
                                  };

                                  const updatePhotoAlt = (newAlt: string) => {
                                    const updated = [...formData.colors];
                                    const currentImgs = updated[cIdx].images && updated[cIdx].images.length > 0
                                      ? [...updated[cIdx].images]
                                      : (updated[cIdx].image ? [updated[cIdx].image] : []);
                                    currentImgs[imgIdx] = { url: imgObj.url, altText: newAlt };

                                    const firstUrl = typeof currentImgs[0] === 'string' ? currentImgs[0] : currentImgs[0]?.url || '';

                                    updated[cIdx] = {
                                      ...updated[cIdx],
                                      image: firstUrl,
                                      images: currentImgs,
                                    };
                                    setFormData({ ...formData, colors: updated });
                                  };

                                  return (
                                    <div key={imgIdx} className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                          Photo #{imgIdx + 1}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...formData.colors];
                                            const currentImgs = (updated[cIdx].images || []).filter((_: any, i: number) => i !== imgIdx);
                                            const firstUrl = typeof currentImgs[0] === 'string' ? currentImgs[0] : currentImgs[0]?.url || '';
                                            updated[cIdx] = {
                                              ...updated[cIdx],
                                              image: firstUrl,
                                              images: currentImgs,
                                            };
                                            setFormData({ ...formData, colors: updated });
                                          }}
                                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                          title="Delete Photo"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      {/* Image URL + Inline Upload File Button */}
                                      <div className="flex items-center gap-2">
                                        {imgObj.url ? (
                                          <img
                                            src={imgObj.url}
                                            alt={imgObj.altText || 'Color thumbnail'}
                                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                            onError={(e) => {
                                              (e.target as HTMLElement).style.display = 'none';
                                            }}
                                          />
                                        ) : (
                                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 shrink-0 font-mono">
                                            #{imgIdx + 1}
                                          </div>
                                        )}

                                        <input
                                          type="text"
                                          value={imgObj.url}
                                          onChange={(e) => updatePhotoUrl(e.target.value)}
                                          placeholder="https://images.unsplash.com/... or upload file"
                                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none"
                                        />

                                        <label
                                          className="px-2.5 py-1.5 text-[11px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg cursor-pointer transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
                                          title="Upload image file for this photo slot"
                                        >
                                          <Upload className="w-3.5 h-3.5" />
                                          <span>Upload</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUploadForColor(e, imgIdx)}
                                            className="hidden"
                                          />
                                        </label>
                                      </div>

                                      {/* SEO Alt Tag Input */}
                                      <div className="space-y-1 pt-1.5 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                                            <Sparkles className="w-3 h-3 text-amber-500" /> SEO Image Alt Tag
                                          </span>
                                        </div>
                                        <input
                                          type="text"
                                          value={imgObj.altText}
                                          onChange={(e) => updatePhotoAlt(e.target.value)}
                                          placeholder={`e.g. ${clr.name || 'Garment'} Italian Wool Suit Front View`}
                                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BESPOKE & VARIANT OPTIONS */}
            {activeTab === 'customization' && (
              <div className="space-y-6">
                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCustomizable}
                    onChange={(e) => setFormData({ ...formData, isCustomizable: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Enable 3D Customization Engine</span>
                    <span className="text-[11px] text-slate-500">
                      When enabled, product is treated as a bespoke garment with customizer options (lapels, monograms, linings).
                      When disabled, product displays as a simple ready-to-wear item with color & size variant matrix.
                    </span>
                  </div>
                </label>

                {formData.isCustomizable ? (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Attach Customization Option Groups
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {customizationGroups.map((g) => {
                        const code = g.groupCode || g.id || (g as any)._id;
                        const isChecked = formData.customizationGroups.includes(code);
                        return (
                          <label
                            key={code}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isChecked
                                ? 'bg-amber-50/60 border-amber-500/80 shadow-2xs'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...formData.customizationGroups, code]
                                  : formData.customizationGroups.filter((c) => c !== code);
                                setFormData({ ...formData, customizationGroups: next });
                              }}
                              className="mt-0.5 rounded text-amber-600"
                            />
                            <div>
                              <span className="font-bold text-xs text-slate-900 block">{g.title || g.groupCode}</span>
                              <span className="text-[11px] text-slate-500">{g.options?.length || 0} Choices Configured</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* SIMPLE PRODUCT VARIANT MATRIX MANAGEMENT UI */
                  <div className="space-y-6 bg-slate-50/80 p-6 rounded-2xl border border-slate-200/90">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-amber-600" />
                          Simple Product Variants (Color & Size Matrix)
                        </h4>
                        <p className="text-xs text-slate-500">
                          Define size options and manage inventory quantities per color and size combination.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newV = {
                              name: 'New Variant',
                              colorName: formData.colors[0]?.name || 'Default',
                              sizeName: formData.sizes[0] || 'One Size',
                              sku: `${(formData.sku || 'SKU').toUpperCase()}-VAR-${formData.simpleVariants.length + 1}`,
                              stockQuantity: 10,
                              inStock: true,
                            };
                            setFormData({ ...formData, simpleVariants: [...formData.simpleVariants, newV] });
                            toast('info', 'Variant Added', 'Added a new custom variant row.');
                          }}
                          className="px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Add Single Variant
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const activeColors = formData.colors.length > 0 ? formData.colors.map(c => c.name) : ['Default Color'];
                            const activeSizes = formData.sizes.length > 0 ? formData.sizes : ['One Size'];
                            const newVariants: Array<{ name?: string; colorName?: string; sizeName?: string; sku?: string; stockQuantity: number; inStock: boolean }> = [];

                            activeColors.forEach((colorName) => {
                              activeSizes.forEach((sizeName) => {
                                const existing = formData.simpleVariants.find(
                                  v => (v.colorName === colorName || v.name?.includes(colorName)) &&
                                       (v.sizeName === sizeName || v.name?.includes(sizeName))
                                );

                                const skuPrefix = formData.sku ? formData.sku.toUpperCase() : 'SKU';
                                const colorTag = colorName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
                                const sizeTag = sizeName.toUpperCase().replace(/[^A-Z0-9]/g, '');

                                if (existing) {
                                  newVariants.push({
                                    ...existing,
                                    colorName,
                                    sizeName,
                                    sku: existing.sku || `${skuPrefix}-${colorTag}-${sizeTag}`,
                                  });
                                } else {
                                  newVariants.push({
                                    name: `${colorName} / ${sizeName}`,
                                    colorName,
                                    sizeName,
                                    sku: `${skuPrefix}-${colorTag}-${sizeTag}`,
                                    stockQuantity: 10,
                                    inStock: true,
                                  });
                                }
                              });
                            });

                            setFormData({ ...formData, simpleVariants: newVariants });
                            toast('info', 'Matrix Generated', `Generated ${newVariants.length} color/size combinations.`);
                          }}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4" /> Auto-Generate Matrix
                        </button>
                      </div>
                    </div>

                    {/* Size Options Management */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Garment Sizes (Comma Separated or Pick Presets)
                      </label>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[11px] text-slate-500 font-semibold">Presets:</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] })}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-amber-400 rounded-lg text-[11px] font-bold text-slate-700 transition-colors"
                        >
                          Apparel (XS–XXL)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, sizes: ['36R', '38R', '40R', '42R', '44R', '46R'] })}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-amber-400 rounded-lg text-[11px] font-bold text-slate-700 transition-colors"
                        >
                          Jacket / Suit Chest (36R–46R)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, sizes: ['30', '32', '34', '36', '38', '40'] })}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-amber-400 rounded-lg text-[11px] font-bold text-slate-700 transition-colors"
                        >
                          Trouser Waist (30–40)
                        </button>
                      </div>

                      <Input
                        value={formData.sizes.join(', ')}
                        onChange={(e) => {
                          const val = e.target.value;
                          const splitSizes = val.split(',').map((s) => s.trim()).filter(Boolean);
                          setFormData({ ...formData, sizes: splitSizes });
                        }}
                        placeholder="e.g. S, M, L, XL or 38R, 40R, 42R"
                      />
                    </div>

                    {/* Variant Combinations Table */}
                    {formData.simpleVariants.length > 0 ? (
                      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                        <table className="w-full text-left text-xs min-w-[600px]">
                          <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Color</th>
                              <th className="py-2.5 px-3">Size</th>
                              <th className="py-2.5 px-3">Variant SKU</th>
                              <th className="py-2.5 px-3">Stock Quantity</th>
                              <th className="py-2.5 px-3">In Stock</th>
                              <th className="py-2.5 px-3 text-right">Remove</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {formData.simpleVariants.map((v, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 font-semibold text-slate-900">
                                  {v.colorName || 'Default'}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-amber-700">
                                  {v.sizeName || 'One Size'}
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="text"
                                    value={v.sku || ''}
                                    onChange={(e) => {
                                      const updated = [...formData.simpleVariants];
                                      updated[idx].sku = e.target.value;
                                      setFormData({ ...formData, simpleVariants: updated });
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="number"
                                    value={v.stockQuantity}
                                    onChange={(e) => {
                                      const qty = parseInt(e.target.value, 10) || 0;
                                      const updated = [...formData.simpleVariants];
                                      updated[idx].stockQuantity = qty;
                                      updated[idx].inStock = qty > 0;
                                      setFormData({ ...formData, simpleVariants: updated });
                                    }}
                                    className="w-24 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="checkbox"
                                    checked={v.inStock ?? v.stockQuantity > 0}
                                    onChange={(e) => {
                                      const updated = [...formData.simpleVariants];
                                      updated[idx].inStock = e.target.checked;
                                      setFormData({ ...formData, simpleVariants: updated });
                                    }}
                                    className="w-4 h-4 text-amber-600 rounded"
                                  />
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = formData.simpleVariants.filter((_, i) => i !== idx);
                                      setFormData({ ...formData, simpleVariants: updated });
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-8 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-3 p-6">
                        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">No variant combination matrix built yet.</p>
                          <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                            Type garment sizes above (or click a Preset), then click <strong>Auto-Generate Matrix</strong> to create stock rows for all color & size pairings, or click <strong>Add Single Variant</strong> to add manually.
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const newV = {
                                name: 'New Variant',
                                colorName: formData.colors[0]?.name || 'Default',
                                sizeName: formData.sizes[0] || 'One Size',
                                sku: `${(formData.sku || 'SKU').toUpperCase()}-VAR-1`,
                                stockQuantity: 10,
                                inStock: true,
                              };
                              setFormData({ ...formData, simpleVariants: [newV] });
                              toast('info', 'Variant Added', 'Added a new custom variant row.');
                            }}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" /> + Add Single Variant
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const activeColors = formData.colors.length > 0 ? formData.colors.map(c => c.name) : ['Default Color'];
                              const activeSizes = formData.sizes.length > 0 ? formData.sizes : ['One Size'];
                              const newVariants: Array<{ name?: string; colorName?: string; sizeName?: string; sku?: string; stockQuantity: number; inStock: boolean }> = [];

                              activeColors.forEach((colorName) => {
                                activeSizes.forEach((sizeName) => {
                                  const skuPrefix = formData.sku ? formData.sku.toUpperCase() : 'SKU';
                                  const colorTag = colorName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
                                  const sizeTag = sizeName.toUpperCase().replace(/[^A-Z0-9]/g, '');

                                  newVariants.push({
                                    name: `${colorName} / ${sizeName}`,
                                    colorName,
                                    sizeName,
                                    sku: `${skuPrefix}-${colorTag}-${sizeTag}`,
                                    stockQuantity: 10,
                                    inStock: true,
                                  });
                                });
                              });

                              setFormData({ ...formData, simpleVariants: newVariants });
                              toast('info', 'Matrix Generated', `Generated ${newVariants.length} color/size combinations.`);
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Auto-Generate Matrix Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SIZE CHART & RETURN POLICY CONFIGURATION CARD */}
                <div className="pt-6 border-t border-slate-200 space-y-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200/90">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-serif">
                      <Shirt className="w-4 h-4 text-amber-600" />
                      Size Chart, 30-Day Return Policy & Custom Details Sections
                    </h4>
                    <p className="text-xs text-slate-500">
                      Configure size guide visibility, return policy terms, and custom information tabs for this garment.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showSizeChart}
                        onChange={(e) => setFormData({ ...formData, showSizeChart: e.target.checked })}
                        className="w-5 h-5 text-amber-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">Show Size Chart Button on Product Page</span>
                        <span className="text-[11px] text-slate-500">Exposes the interactive size & measurement modal.</span>
                      </div>
                    </label>

                    <Select
                      label="Size Chart Template Category"
                      value={formData.sizeChartType}
                      onChange={(e) => setFormData({ ...formData, sizeChartType: e.target.value as any })}
                      options={[
                        { value: 'suits', label: 'Suits, Blazers & Tuxedos' },
                        { value: 'shirts', label: 'Dress Shirts & Casual Tops' },
                        { value: 'trousers', label: 'Trousers, Pants & Chinos' },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="30-Day Return Policy Headline"
                      value={formData.returnPolicy}
                      onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                      placeholder="e.g. 30-Day Risk-Free Returns & Exchange"
                    />

                    <Input
                      label="100% Fit Guarantee Details"
                      value={formData.guaranteeDetails}
                      onChange={(e) => setFormData({ ...formData, guaranteeDetails: e.target.value })}
                      placeholder="e.g. Backed by our 100% Fit Guarantee with up to $75 tailoring credit."
                    />
                  </div>

                  {/* Dynamic Product Details Sections Editor */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Custom Garment Information Tabs
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Add custom sections (e.g. "Fabric Origin", "Customization Notes", "Alteration Policy") to appear on the product details page.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            productDetailsSections: [
                              ...formData.productDetailsSections,
                              { title: 'New Garment Section', content: 'Detailed information regarding this garment.' },
                            ],
                          })
                        }
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        Add Custom Section
                      </Button>
                    </div>

                    {formData.productDetailsSections.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border border-dashed border-slate-200 text-center">
                        No custom detail sections added yet. Click "Add Custom Section" above to create product detail tabs.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {formData.productDetailsSections.map((sec, secIdx) => (
                          <div key={secIdx} className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <Input
                                label={`Section #${secIdx + 1} Title`}
                                value={sec.title}
                                onChange={(e) => {
                                  const updated = [...formData.productDetailsSections];
                                  updated[secIdx].title = e.target.value;
                                  setFormData({ ...formData, productDetailsSections: updated });
                                }}
                                placeholder="e.g. Italian Fabric Origin"
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.productDetailsSections.filter((_, i) => i !== secIdx);
                                  setFormData({ ...formData, productDetailsSections: updated });
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition-colors mt-6"
                                title="Delete section"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                Section Content / Body Text
                              </label>
                              <textarea
                                value={sec.content}
                                onChange={(e) => {
                                  const updated = [...formData.productDetailsSections];
                                  updated[secIdx].content = e.target.value;
                                  setFormData({ ...formData, productDetailsSections: updated });
                                }}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none"
                                placeholder="Enter detailed text for this tab section..."
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: INVENTORY & STOCK */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Garment Publication Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    options={[
                      { value: 'active', label: 'Active (Visible in Storefront)' },
                      { value: 'draft', label: 'Draft (Internal Preview Only)' },
                      { value: 'out_of_stock', label: 'Out of Stock' },
                      { value: 'archived', label: 'Archived' },
                    ]}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Available Stock Quantity"
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                    />
                    <Input
                      label="Low Stock Warning Limit"
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value, 10) || 5 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isOnSale}
                      onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Mark as ON SALE</span>
                      <span className="text-[11px] text-slate-500">Shows red SALE pill & discount ticker.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Mark as NEW ARRIVAL</span>
                      <span className="text-[11px] text-slate-500">Shows green NEW pill on Product Card.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Featured Homepage</span>
                      <span className="text-[11px] text-slate-500">Display in top showcase carousels.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isDeal}
                      onChange={(e) => setFormData({ ...formData, isDeal: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Mark as SPECIAL DEALS</span>
                      <span className="text-[11px] text-slate-500">Shows in Deals & Special Sale section.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isMadeToOrder}
                      onChange={(e) => setFormData({ ...formData, isMadeToOrder: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Bespoke Made-to-Order</span>
                      <span className="text-[11px] text-slate-500">Crafted upon order placement.</span>
                    </div>
                  </label>
                </div>

                {/* Dynamic Custom Showcase Sections & Promotional Collections */}
                <div className="pt-6 border-t border-slate-200/80 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" /> Custom Dynamic Showcase Sections (Diwali Sale, Festive Offers, etc.)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Create, edit, or select custom promotional sections for this garment.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSection(null);
                        setSectionForm({ name: '', code: '', badgeText: '', description: '', badgeColor: 'amber', isActive: true });
                        setShowSectionModal(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add / Manage Custom Sections
                    </button>
                  </div>

                  {customSections.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {customSections.map((sec) => {
                        const isSelected = (formData.tags || []).includes(sec.code);
                        return (
                          <div
                            key={sec.id}
                            className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                                : 'bg-slate-50 border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            <label className="flex items-start gap-3 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const currentTags = formData.tags || [];
                                  const newTags = e.target.checked
                                    ? [...currentTags, sec.code]
                                    : currentTags.filter((t: string) => t !== sec.code);
                                  setFormData({ ...formData, tags: newTags });
                                }}
                                className="w-4 h-4 text-amber-600 rounded mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-xs text-slate-900 block">{sec.name}</span>
                                <span className="text-[11px] text-slate-500 block">
                                  {sec.description || `Shows badge: ${sec.badgeText}`}
                                </span>
                                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                  {sec.badgeText}
                                </span>
                              </div>
                            </label>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSection(sec);
                                  setSectionForm({
                                    name: sec.name || '',
                                    code: sec.code || '',
                                    badgeText: sec.badgeText || '',
                                    description: sec.description || '',
                                    badgeColor: sec.badgeColor || 'amber',
                                    isActive: sec.isActive ?? true,
                                  });
                                  setShowSectionModal(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-white rounded-lg transition-colors"
                                title="Edit Section"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const updated = customSections.filter((s) => s.id !== sec.id);
                                  setCustomSections(updated);
                                  await contentService.saveCustomSections(updated);
                                  toast('info', 'Section Deleted', `"${sec.name}" removed.`);
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                                title="Delete Section"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-2">
                      <p className="font-semibold text-slate-700">No custom showcase sections created yet.</p>
                      <p>Click "+ Add / Manage Custom Sections" above to create sections like "Diwali Sale", "Summer Luxury", "Festive Edition", etc.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: SEO & META */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-600" /> Search Engine Optimization (SEO)
                  </h4>

                  <Input
                    label="SEO Meta Title"
                    value={formData.seo.metaTitle}
                    onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })}
                    placeholder="e.g. Royal Navy Bespoke Wool Suit | Stitchx Plus Luxury"
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      SEO Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.seo.metaDescription}
                      onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })}
                      placeholder="Provide a search snippet summarizing the garment craftsmanship and fabrics..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <Input
                    label="SEO Keywords (Comma Separated)"
                    value={formData.seo.keywords}
                    onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, keywords: e.target.value } })}
                    placeholder="bespoke suit, italian wool suit, custom menswear, tailor made tux"
                  />
                </div>
              </div>
            )}

            {/* TAB 6: SHIPPING */}
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Package Weight (kg)"
                    type="number"
                    step="0.1"
                    value={formData.shipping.weight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shipping: { ...formData.shipping, weight: parseFloat(e.target.value) || 0 },
                      })
                    }
                  />

                  <Select
                    label="Shipping Class"
                    value={formData.shipping.shippingClass}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shipping: { ...formData.shipping, shippingClass: e.target.value },
                      })
                    }
                    options={[
                      { value: 'Standard Tailored', label: 'Standard Tailored Box' },
                      { value: 'Garment Bag Courier', label: 'Garment Bag Express Courier' },
                      { value: 'Heavyweight Coat Box', label: 'Heavyweight Coat Box' },
                    ]}
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h5 className="text-xs font-bold text-slate-900 uppercase">Package Dimensions (cm)</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Length (L)"
                      type="number"
                      value={formData.shipping.dimensions.length}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipping: {
                            ...formData.shipping,
                            dimensions: { ...formData.shipping.dimensions, length: parseInt(e.target.value, 10) || 0 },
                          },
                        })
                      }
                    />
                    <Input
                      label="Width (W)"
                      type="number"
                      value={formData.shipping.dimensions.width}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipping: {
                            ...formData.shipping,
                            dimensions: { ...formData.shipping.dimensions, width: parseInt(e.target.value, 10) || 0 },
                          },
                        })
                      }
                    />
                    <Input
                      label="Height (H)"
                      type="number"
                      value={formData.shipping.dimensions.height}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipping: {
                            ...formData.shipping,
                            dimensions: { ...formData.shipping.dimensions, height: parseInt(e.target.value, 10) || 0 },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Editor Footer Action Bar */}
          <div className="p-6 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Section: <strong className="uppercase text-slate-900">{activeTab}</strong>
            </span>
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => setViewMode('list')}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" size="sm" isLoading={submitting} leftIcon={<Save className="w-4 h-4" />}>
                Save Garment Record
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // Otherwise render 'list' Catalog View
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <Shirt className="w-6 h-6 text-amber-600" />
            Product Catalog Management
          </h2>
          <p className="text-xs text-slate-500">
            Full control over bespoke suits, shirts, tuxedos, fabrics, pricing, and 3D customization profiles.
          </p>
        </div>
        <button
          onClick={openAddEditor}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-xs transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Custom Garment
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog by garment name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-48">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.map((c) => ({
                  value: String(c.id || (c as any)._id || ''),
                  label: c.name,
                })),
              ]}
            />
          </div>

          <div className="w-full sm:w-40">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'draft', label: 'Draft' },
                { value: 'out_of_stock', label: 'Out of Stock' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Product Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader size="lg" />
          <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
            Loading Catalog Items...
          </span>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Garment</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock & Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 bg-white">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((p) => {
                    const id = p.id || (p as any)._id;
                    const catName =
                      typeof p.category === 'object' ? (p.category as any)?.name : 'Bespoke Garment';
                    const firstImg = p.images?.[0];
                    const imgUrl = (typeof firstImg === 'string' ? firstImg : firstImg?.url) || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80';

                    return (
                      <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img src={imgUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                            <div>
                              <span className="font-bold text-slate-900 block">{p.name}</span>
                              <span className="text-[11px] font-mono text-slate-400">SKU: {p.sku || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{catName}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">${p.basePrice?.toFixed(2)} USD</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            p.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => openEditEditor(p)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit Garment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(id, p.name)}
                            className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Garment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      No products matching criteria.
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
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} garments
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

      {/* Modal for Creating / Editing Dynamic Showcase Sections */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                {editingSection ? 'Edit Showcase Section' : 'Create New Showcase Section'}
              </h3>
              <button
                type="button"
                onClick={() => setShowSectionModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4">
              <Input
                label="Section Title (e.g. Diwali Sale) *"
                value={sectionForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const code = name.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
                  setSectionForm({
                    ...sectionForm,
                    name,
                    code: editingSection ? sectionForm.code : code,
                    badgeText: editingSection ? sectionForm.badgeText : name,
                  });
                }}
                placeholder="e.g. Diwali Sale"
                required
              />

              <Input
                label="System Identifier / Tag Code *"
                value={sectionForm.code}
                onChange={(e) =>
                  setSectionForm({
                    ...sectionForm,
                    code: e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, '_'),
                  })
                }
                placeholder="e.g. diwali_sale"
                required
              />

              <Input
                label="Product Card Badge Text *"
                value={sectionForm.badgeText}
                onChange={(e) => setSectionForm({ ...sectionForm, badgeText: e.target.value })}
                placeholder="e.g. Diwali Special"
                required
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Section Description
                </label>
                <textarea
                  rows={2}
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                  placeholder="e.g. Festive promotional deals and exclusive bespoke tailoring"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowSectionModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" size="sm" leftIcon={<Save className="w-4 h-4" />}>
                  {editingSection ? 'Update Section' : 'Create Section'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
