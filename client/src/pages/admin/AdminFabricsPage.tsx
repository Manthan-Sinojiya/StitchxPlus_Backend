import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Scissors, Check, X, ArrowLeft, Save, Sparkles, Globe } from 'lucide-react';
import { Button, Input, Select, ImageUploader, useToast, Loader, Pagination } from '../../components/ui';
import { adminService } from '../../services/adminService';
import { Fabric } from '@stitchx/shared';

export function AdminFabricsPage() {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [editingFabric, setEditingFabric] = useState<Fabric | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    composition: '',
    weight: 270,
    weave: 'Twill',
    origin: 'Biella, Italy',
    priceAdjustment: 0,
    swatchImage: '',
    swatchAlt: '',
    color: '',
    pattern: '',
    season: 'All-Season',
    isAvailable: true,
    seoKeywords: 'custom suit fabric, bespoke wool, luxury textile',
  });

  const fetchFabrics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getFabrics();
      setFabrics(data || []);
    } catch (_err) {
      toast('error', 'Error', 'Failed to load fabric library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFabrics();
  }, []);

  const openAddEditor = () => {
    setEditingFabric(null);
    setFormData({
      name: '',
      code: `FAB-${Math.floor(100 + Math.random() * 900)}`,
      composition: '',
      weight: 260,
      weave: 'Twill',
      origin: '',
      priceAdjustment: 0,
      swatchImage: '',
      swatchAlt: '',
      color: '',
      pattern: '',
      season: 'All-Season',
      isAvailable: true,
      seoKeywords: 'custom suit fabric, bespoke wool, luxury textile',
    });
    setViewMode('editor');
  };

  const openEditEditor = (fabric: Fabric) => {
    setEditingFabric(fabric);
    setFormData({
      name: fabric.name || '',
      code: fabric.code || '',
      composition: fabric.composition || '',
      weight: fabric.weight || 0,
      weave: fabric.weave || '',
      origin: fabric.origin || '',
      priceAdjustment: fabric.priceAdjustment || 0,
      swatchImage: fabric.swatchImage || '',
      swatchAlt: (fabric as any).swatchAlt || fabric.name || '',
      color: fabric.color || '',
      pattern: fabric.pattern || '',
      season: fabric.season || '',
      isAvailable: fabric.isAvailable ?? true,
      seoKeywords: (fabric as any).seoKeywords || 'bespoke suit fabric, italian wool',
    });
    setViewMode('editor');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast('error', 'Validation Error', 'Fabric name and code are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingFabric) {
        const id = editingFabric.id || (editingFabric as any)._id;
        await adminService.updateFabric(id, formData);
        toast('success', 'Fabric Updated', `"${formData.name}" updated successfully.`);
      } else {
        await adminService.createFabric(formData);
        toast('success', 'Fabric Created', `"${formData.name}" added to luxury library.`);
      }
      setViewMode('list');
      fetchFabrics();
    } catch (err: any) {
      toast('error', 'Save Error', err?.message || 'Failed to save fabric.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await adminService.deleteFabric(id);
      toast('info', 'Fabric Deleted', `"${name}" removed.`);
      fetchFabrics();
    } catch (err: any) {
      toast('error', 'Error', err?.message || 'Failed to delete fabric.');
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredFabrics = fabrics.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.code.toLowerCase().includes(search.toLowerCase()) ||
      f.composition.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredFabrics.length / itemsPerPage) || 1;
  const paginatedFabrics = filteredFabrics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Dedicated Full-Page Fabric Editor View
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
              <span>Back to Fabric Library</span>
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-600" />
                {editingFabric ? `Edit Fabric: ${formData.name}` : 'Add Luxury Fabric'}
              </h2>
              <p className="text-xs text-slate-500">Configure textile composition, origin, weight & swatches</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end w-full sm:w-auto">
            <Button variant="ghost" size="sm" onClick={() => setViewMode('list')}>
              Cancel
            </Button>
            <Button variant="gold" size="sm" isLoading={submitting} onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
              Save Fabric
            </Button>
          </div>
        </div>

        {/* Editor Form Card */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-8 space-y-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Fabric Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Super 150s Midnight Navy Wool"
              required
            />

            <Input
              label="Fabric Code (SKU) *"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="FAB-WOOL-150"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Composition *"
              value={formData.composition}
              onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
              placeholder="100% Super 150s Merino Wool"
              required
            />

            <Input
              label="Weight (g/m²)"
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value, 10) || 0 })}
            />

            <Input
              label="Mill / Origin Country"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              placeholder="Biella, Italy"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Select
              label="Weave Type"
              value={formData.weave}
              onChange={(e) => setFormData({ ...formData, weave: e.target.value })}
              options={[
                { value: 'Twill', label: 'Twill' },
                { value: 'Herringbone', label: 'Herringbone' },
                { value: 'Birdseye', label: 'Birdseye' },
                { value: 'Houndstooth', label: 'Houndstooth' },
                { value: 'Plain Weave', label: 'Plain Weave' },
                { value: 'Velvet', label: 'Velvet' },
              ]}
            />

            <Input
              label="Primary Color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="Midnight Navy"
            />

            <Input
              label="Pattern"
              value={formData.pattern}
              onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
              placeholder="Solid / Pinstripe"
            />

            <Input
              label="Price Surcharge ($ USD)"
              type="number"
              value={formData.priceAdjustment}
              onChange={(e) => setFormData({ ...formData, priceAdjustment: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Cloudinary Swatch Media with Alt Tag */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" /> Fabric Swatch Media & Upload
            </h4>

            <ImageUploader
              label="High-Res Textile Swatch Image"
              value={{ url: formData.swatchImage, altText: formData.swatchAlt }}
              onChange={(res) => setFormData({ ...formData, swatchImage: res.url, swatchAlt: res.altText })}
              folder="stitchx_fabrics"
            />
          </div>

          {/* SEO Keywords for Fabric Search */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-600" /> Fabric SEO Keywords & Search Identifiers
            </h4>

            <Input
              label="SEO Keywords (Comma Separated)"
              value={formData.seoKeywords}
              onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
              placeholder="italian wool, merino wool, super 150s, Loro Piana style"
            />
          </div>

          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="w-5 h-5 text-amber-600 rounded"
            />
            <div>
              <span className="font-bold text-xs text-slate-900 block">Fabric Available for Bespoke Orders</span>
              <span className="text-[11px] text-slate-500">Allow customers to choose this fabric in the 3D Customizer.</span>
            </div>
          </label>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Button type="button" variant="ghost" size="sm" onClick={() => setViewMode('list')}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={submitting} leftIcon={<Save className="w-4 h-4" />}>
              Save Fabric
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <Scissors className="w-6 h-6 text-amber-600" />
            Luxury Fabric & Swatch Repository
          </h2>
          <p className="text-xs text-slate-500">
            Manage premium textiles from Biella & Huddersfield, weights, compositions & pricing surcharges.
          </p>
        </div>
        <button
          onClick={openAddEditor}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-xs transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Luxury Fabric
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search fabrics by name, code or composition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Fabric Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader size="lg" />
          <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
            Loading Fabric Library...
          </span>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Fabric</th>
                  <th className="py-3.5 px-4">Code & Origin</th>
                  <th className="py-3.5 px-4">Composition & Weight</th>
                  <th className="py-3.5 px-4">Surcharge</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 bg-white">
                {paginatedFabrics.length > 0 ? (
                  paginatedFabrics.map((f) => {
                    const id = f.id || (f as any)._id;
                    return (
                      <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                        {f.swatchImage ? (
                            <img
                              src={f.swatchImage}
                              alt={f.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200/80 shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                              <Scissors className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{f.name}</p>
                            <span className="text-[11px] text-slate-500 block">
                              {f.color ? `${f.color} • ${f.pattern}` : 'All Season'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-900 block">{f.code}</span>
                          <span className="text-[11px] text-slate-500 font-medium">{f.origin || 'Imported'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-800">
                          <span className="font-semibold block">{f.composition}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{f.weight ? `${f.weight}g/m²` : 'Super 130s'}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-800">
                          {f.priceAdjustment && f.priceAdjustment > 0
                            ? `+$${f.priceAdjustment.toFixed(2)} USD`
                            : 'Standard Tier ($0)'}
                        </td>
                        <td className="py-3.5 px-4">
                          {f.isAvailable !== false ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                              <Check className="w-3 h-3" /> In Stock
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
                              <X className="w-3 h-3" /> Depleted
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => openEditEditor(f)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit Fabric"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(id, f.name)}
                            className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Fabric"
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
                      No fabrics found in repository.
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
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredFabrics.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredFabrics.length)} of {filteredFabrics.length} fabrics
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
