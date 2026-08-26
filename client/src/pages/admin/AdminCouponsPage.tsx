import { useState, useEffect } from 'react';
import { Plus, Ticket, Edit2, Trash2, Calendar, Search } from 'lucide-react';
import { Button, Input, Select, Modal, useToast, Loader, Pagination } from '../../components/ui';
import { adminService } from '../../services/adminService';
import { Coupon } from '@stitchx/shared';

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: 'BESPOKE15',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 15,
    minOrderValue: 500,
    maxDiscountAmount: 200,
    startDate: new Date().toISOString().split('T')[0],
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 100,
    perUserLimit: 1,
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCoupons();
      setCoupons(data || []);
    } catch (_err) {
      toast('error', 'Error', 'Failed to load coupon codes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: `VIP${Math.floor(100 + Math.random() * 900)}`,
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 300,
      maxDiscountAmount: 150,
      startDate: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: 50,
      perUserLimit: 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code || '',
      discountType: c.discountType || 'percentage',
      discountValue: c.discountValue || 10,
      minOrderValue: c.minOrderValue || 0,
      maxDiscountAmount: c.maxDiscountAmount || 0,
      startDate: c.startDate ? c.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '',
      usageLimit: c.usageLimit || 0,
      perUserLimit: c.perUserLimit || 1,
      isActive: c.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast('error', 'Validation Error', 'Coupon code is required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCoupon) {
        const id = editingCoupon.id || (editingCoupon as any)._id;
        await adminService.updateCoupon(id, formData);
        toast('success', 'Coupon Updated', `Code ${formData.code} updated.`);
      } else {
        await adminService.createCoupon(formData);
        toast('success', 'Coupon Created', `Code ${formData.code} created.`);
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      toast('error', 'Save Error', err?.message || 'Failed to save coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    try {
      await adminService.deleteCoupon(id);
      toast('info', 'Coupon Deleted', `${code} deleted.`);
      fetchCoupons();
    } catch (err: any) {
      toast('error', 'Error', err?.message || 'Failed to delete coupon.');
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredCoupons = (coupons || []).filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage) || 1;
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-amber-600" />
            Promotional Coupon & Discount Engine
          </h2>
          <p className="text-xs text-slate-500">
            Configure percentage or fixed discounts, start/expiry dates, usage caps, and spend thresholds.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-xs transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Coupon Code
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search coupons by promo code..."
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
            Loading Promo Codes...
          </span>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Min. Spend & Cap</th>
                  <th className="py-3.5 px-4">Validity Period</th>
                  <th className="py-3.5 px-4">Usage Stats</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 bg-white">
                {paginatedCoupons.length > 0 ? (
                  paginatedCoupons.map((c) => {
                    const id = c.id || (c as any)._id;
                    const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();

                    return (
                      <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-amber-600" />
                          {c.code}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {c.discountType === 'percentage'
                            ? `${c.discountValue}% OFF`
                            : `$${c.discountValue} OFF`}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-900 font-semibold block">${c.minOrderValue || 0} USD</span>
                          {c.maxDiscountAmount ? (
                            <span className="text-[11px] text-slate-500">Max Cap: ${c.maxDiscountAmount}</span>
                          ) : null}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <div className="flex items-center gap-1.5 text-[11px] font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'No Expiry'}
                          </div>
                          {isExpired && (
                            <span className="text-[10px] font-bold text-red-600 block uppercase tracking-wider">
                              Expired
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700 font-medium">
                          {c.usageCount || 0} / {c.usageLimit || '∞'} uses
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(id, c.code)}
                            className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Coupon"
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
                      No active promotional coupons found matching query.
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
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCoupons.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredCoupons.length)} of {filteredCoupons.length} coupons
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

      {/* Modal Form with Custom Select */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? 'Edit Coupon Code' : 'Create New Coupon'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 font-sans max-h-[80vh] overflow-y-auto pr-1">
          {/* Header Context Banner */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-xs">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Promotional Voucher Generator</h4>
                <p className="text-[11px] text-slate-500">Define discount rules, caps, and redemption limits.</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-700 font-mono">
              PROMO
            </span>
          </div>

          <Input
            label="Coupon Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="e.g. BESPOKE15"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Discount Type"
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
              options={[
                { value: 'percentage', label: 'Percentage (%)' },
                { value: 'fixed', label: 'Fixed Amount ($ USD)' },
              ]}
            />

            <Input
              label="Discount Value"
              type="number"
              value={formData.discountValue}
              onChange={(e) =>
                setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Minimum Order Spend ($ USD)"
              type="number"
              value={formData.minOrderValue}
              onChange={(e) =>
                setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })
              }
            />
            <Input
              label="Max Discount Amount Cap ($)"
              type="number"
              value={formData.maxDiscountAmount}
              onChange={(e) =>
                setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) || 0 })
              }
              placeholder="0 for unlimited"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="Expiry Date"
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Total Redemptions Limit"
              type="number"
              value={formData.usageLimit}
              onChange={(e) =>
                setFormData({ ...formData, usageLimit: parseInt(e.target.value, 10) || 0 })
              }
              placeholder="0 for unlimited"
            />
            <Input
              label="Per-User Usage Limit"
              type="number"
              value={formData.perUserLimit}
              onChange={(e) =>
                setFormData({ ...formData, perUserLimit: parseInt(e.target.value, 10) || 1 })
              }
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded cursor-pointer border-slate-300"
            />
            Coupon active and redeemable in checkout
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={submitting}>
              Save Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
