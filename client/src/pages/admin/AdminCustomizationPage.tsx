import { useState, useEffect } from 'react';
import { Plus, Sliders, Edit2, Trash2, ArrowLeft, Save, Sparkles, Image as ImageIcon, Search } from 'lucide-react';
import { Button, Input, ImageUploader, useToast, Loader, Pagination } from '../../components/ui';
import { adminService } from '../../services/adminService';

export function AdminCustomizationPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    group: '',
    groupCode: '',
    isRequired: true,
    sortOrder: 1,
    isActive: true,
    options: [
      {
        code: '',
        name: '',
        priceAdjustment: 0,
        image: '',
        imageAlt: '',
        description: '',
      },
    ],
  });

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCustomizationGroups();
      setGroups(data || []);
    } catch (_err) {
      toast('error', 'Error', 'Failed to load customization options.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const openAddEditor = () => {
    setEditingGroup(null);
    setFormData({
      group: '',
      groupCode: '',
      isRequired: true,
      sortOrder: groups.length + 1,
      isActive: true,
      options: [
        {
          code: '',
          name: '',
          priceAdjustment: 0,
          image: '',
          imageAlt: '',
          description: '',
        },
      ],
    });
    setViewMode('editor');
  };

  const openEditEditor = (group: any) => {
    setEditingGroup(group);
    setFormData({
      group: group.group || '',
      groupCode: group.groupCode || '',
      isRequired: group.isRequired ?? true,
      sortOrder: group.sortOrder || 1,
      isActive: group.isActive ?? true,
      options: (group.options || []).map((opt: any) => ({
        code: opt.code || '',
        name: opt.name || '',
        priceAdjustment: opt.priceAdjustment || 0,
        image: opt.image || '',
        imageAlt: opt.imageAlt || opt.name || '',
        description: opt.description || '',
      })),
    });
    setViewMode('editor');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingImage = formData.options.find((opt) => !opt.image || !opt.image.trim());
    if (missingImage) {
      toast(
        'error',
        'Image Required',
        `Choice "${missingImage.name || missingImage.code}" requires a valid image swatch/preview URL. Text-only options are forbidden.`,
      );
      return;
    }

    try {
      setSubmitting(true);
      if (editingGroup) {
        const id = editingGroup._id || editingGroup.id;
        await adminService.updateCustomizationGroup(id, formData);
        toast('success', 'Option Group Updated', `${formData.group} saved successfully.`);
      } else {
        await adminService.createCustomizationGroup(formData);
        toast('success', 'Option Group Created', `${formData.group} created successfully.`);
      }
      setViewMode('list');
      fetchGroups();
    } catch (_err) {
      toast('error', 'Error', 'Failed to save customization option group.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete customization group "${groupName}"?`)) return;
    try {
      await adminService.deleteCustomizationGroup(id);
      toast('info', 'Group Deleted', `${groupName} removed.`);
      fetchGroups();
    } catch (_err) {
      toast('error', 'Error', 'Failed to delete customization group.');
    }
  };

  const addOptionField = () => {
    setFormData({
      ...formData,
      options: [
        ...formData.options,
        {
          code: '',
          name: '',
          priceAdjustment: 0,
          image: '',
          imageAlt: '',
          description: '',
        },
      ],
    });
  };

  const removeOptionField = (idx: number) => {
    const updated = [...formData.options];
    updated.splice(idx, 1);
    setFormData({ ...formData, options: updated });
  };

  // Dedicated Full-Page Customization Group Editor
  if (viewMode === 'editor') {
    return (
      <div className="space-y-6 font-sans pb-12">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs sticky top-4 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Customization Groups</span>
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                {editingGroup ? `Edit Customization Group: ${formData.group}` : 'Add Customization Group'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure 3D option choices, swatches & price surcharges for suit customization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end w-full sm:w-auto">
            <Button variant="ghost" size="sm" onClick={() => setViewMode('list')}>
              Cancel
            </Button>
            <Button variant="gold" size="sm" isLoading={submitting} onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
              Save Option Group
            </Button>
          </div>
        </div>

        {/* Editor Form Card */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-8 space-y-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Group Name *"
              value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              placeholder="e.g. Jacket Lapel Styles"
              required
            />

            <Input
              label="Group Code *"
              value={formData.groupCode}
              onChange={(e) => setFormData({ ...formData, groupCode: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
              placeholder="lapel_styles"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Sort Order"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
            />

            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900">
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                  className="rounded text-amber-600"
                />
                Required Choice in 3D Studio
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-amber-600"
                />
                Active Group
              </label>
            </div>
          </div>

          {/* Option Choices with Cloudinary Swatch Image & Alt Text */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" /> Group Option Swatches & Visual Choices
                </h4>
                <p className="text-[11px] text-slate-500">Every option requires a visual image preview (Cloudinary supported).</p>
              </div>

              <Button type="button" variant="outline" size="sm" onClick={addOptionField} leftIcon={<Plus className="w-4 h-4" />}>
                Add Choice Option
              </Button>
            </div>

            <div className="space-y-4">
              {formData.options.map((opt, idx) => (
                <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      Option #{idx + 1}: {opt.name || opt.code || 'New Option'}
                    </span>
                    {formData.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOptionField(idx)}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Remove Choice
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Choice Name *"
                      value={opt.name}
                      onChange={(e) => {
                        const updated = [...formData.options];
                        updated[idx].name = e.target.value;
                        if (!updated[idx].code) {
                          updated[idx].code = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                        }
                        setFormData({ ...formData, options: updated });
                      }}
                      placeholder="e.g. Peak Lapel"
                      required
                    />

                    <Input
                      label="Code Identifier *"
                      value={opt.code}
                      onChange={(e) => {
                        const updated = [...formData.options];
                        updated[idx].code = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                        setFormData({ ...formData, options: updated });
                      }}
                      placeholder="peak_lapel"
                      required
                    />

                    <Input
                      label="Price Surcharge ($ USD)"
                      type="number"
                      value={opt.priceAdjustment}
                      onChange={(e) => {
                        const updated = [...formData.options];
                        updated[idx].priceAdjustment = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, options: updated });
                      }}
                    />
                  </div>

                  <ImageUploader
                    label="Choice Image Swatch (Cloudinary Upload)"
                    value={{ url: opt.image, altText: opt.imageAlt || '' }}
                    onChange={(res) => {
                      const updated = [...formData.options];
                      updated[idx].image = res.url;
                      updated[idx].imageAlt = res.altText;
                      setFormData({ ...formData, options: updated });
                    }}
                    folder="stitchx_customization"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Button type="button" variant="ghost" size="sm" onClick={() => setViewMode('list')}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={submitting} leftIcon={<Save className="w-4 h-4" />}>
              Save Option Group
            </Button>
          </div>
        </form>
      </div>
    );
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredGroups = (groups || []).filter(
    (grp) =>
      grp.group?.toLowerCase().includes(search.toLowerCase()) ||
      grp.groupCode?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage) || 1;
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // List View
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-amber-600" />
            Bespoke Customization Engine Options
          </h2>
          <p className="text-xs text-slate-500">
            Configure suit lapels, buttons, linings, vents and price adjustments with mandatory visual swatches.
          </p>
        </div>
        <button
          onClick={openAddEditor}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-xs transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Option Group
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search option groups by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader size="lg" />
          <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
            Loading Customization Options...
          </span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedGroups.length > 0 ? (
              paginatedGroups.map((grp) => {
                const id = grp._id || grp.id;
                return (
                  <div
                    key={id}
                    className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 relative hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-amber-600" />
                          {grp.group}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">Code: {grp.groupCode}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {grp.isActive !== false ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            Inactive
                          </span>
                        )}
                        <button
                          onClick={() => openEditEditor(grp)}
                          className="p-1.5 text-slate-500 hover:text-amber-700 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit Group"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(id, grp.group)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Required</span>
                        <span className="font-semibold">{grp.isRequired ? 'Yes' : 'Optional'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Choices Configured</span>
                        <span className="font-semibold">{grp.options?.length || 0} Options</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Swatches & Options
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(grp.options || []).map((opt: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-1.5 pr-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                          >
                            {opt.image ? (
                                <img
                                  src={opt.image}
                                  alt={opt.name}
                                  className="w-6 h-6 rounded-md object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-md bg-slate-200 border border-slate-300 flex items-center justify-center">
                                  <ImageIcon className="w-3 h-3 text-slate-400" />
                                </div>
                              )}
                            <span className="font-semibold text-slate-800">{opt.name}</span>
                            {opt.priceAdjustment > 0 && (
                              <span className="text-[10px] font-bold text-amber-700">
                                +${opt.priceAdjustment}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-12 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-200">
                No customization option groups found matching criteria.
              </div>
            )}
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-600 mt-4 shadow-2xs">
              <span className="font-medium">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredGroups.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredGroups.length)} of {filteredGroups.length} option groups
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
