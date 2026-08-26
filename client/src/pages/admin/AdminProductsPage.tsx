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
} from 'lucide-react';
import { Button, Input, Select, ImageUploader, useToast, Loader, Pagination } from '../../components/ui';
import { adminService } from '../../services/adminService';
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
    colors: [] as Array<{ name: string; hex: string; image?: string }>,
    images: [] as { url: string; altText?: string; isPrimary?: boolean }[],
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
      colors: parsedColors,
      images:
        product.images && product.images.length > 0
          ? product.images.map((img: any) =>
              typeof img === 'string'
                ? { url: img, altText: product.name, isPrimary: false }
                : { url: img.url || '', altText: img.altText || product.name, isPrimary: img.isPrimary || false }
            )
          : [
              {
                url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
                altText: product.name,
                isPrimary: true,
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
    if (!confirm(`Are you sure you want to delete "${name}" from catalog?`)) return;
    try {
      await adminService.deleteProduct(id);
      toast('info', 'Garment Removed', `${name} deleted.`);
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
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());

    const pCatId =
      typeof p.category === 'object' && p.category !== null
        ? String((p.category as any)._id || (p.category as any).id || '')
        : String(p.category || '');

    const matchesCategory =
      categoryFilter === 'all' || pCatId === String(categoryFilter);

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

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Craftsmanship Narrative & Specifications
                  </label>
                  <textarea
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide full sartorial details, lapel design, lining materials, and button details..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
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
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-amber-600" />
                          Image {idx + 1} {img.isPrimary && <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">PRIMARY COVER</span>}
                        </span>

                        <div className="flex items-center gap-2">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.images.map((im, i) => ({
                                  ...im,
                                  isPrimary: i === idx,
                                }));
                                setFormData({ ...formData, images: updated });
                              }}
                              className="text-[11px] font-bold text-amber-700 hover:underline"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.images.filter((_, i) => i !== idx);
                              setFormData({ ...formData, images: updated });
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
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
                        Add color swatches for this garment. Selecting a swatch on the Product Card automatically displays that color's image!
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
                            { name: `Color ${formData.colors.length + 1}`, hex: '#1c2536', image: '' },
                          ],
                        })
                      }
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Add Color Variant
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.colors.map((clr, cIdx) => (
                      <div key={cIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
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

                        <Input
                          label="Color Specific Garment Image URL (Optional)"
                          value={clr.image || ''}
                          onChange={(e) => {
                            const updated = [...formData.colors];
                            updated[cIdx] = { ...updated[cIdx], image: e.target.value };
                            setFormData({ ...formData, colors: updated });
                          }}
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BESPOKE OPTIONS */}
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
                    <span className="text-[11px] text-slate-500">Allows customers to customize lapels, buttons, linings, and monograms.</span>
                  </div>
                </label>

                {formData.isCustomizable && (
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
                )}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
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

                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
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

                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
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

                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
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
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
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
    </div>
  );
}
