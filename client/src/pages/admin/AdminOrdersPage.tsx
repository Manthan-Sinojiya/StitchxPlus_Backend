import { useState, useEffect } from 'react';
import { Search, Eye, Filter, ShoppingBag } from 'lucide-react';
import { Button, Input, Select, Modal, useToast, Loader, Pagination } from '../../components/ui';
import { adminService } from '../../services/adminService';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('PROCESSING');
  const [trackingNumber, setTrackingNumber] = useState('');
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOrders({ status: statusFilter, search, limit: 50 });
      setOrders(res.orders || []);
    } catch (_err) {
      toast('error', 'Error', 'Failed to load order pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    setCurrentPage(1);
  }, [statusFilter, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const openOrderDetail = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      setUpdatingStatus(true);
      const updated = await adminService.updateOrderStatus(
        selectedOrder._id || selectedOrder.id,
        newStatus,
        trackingNumber,
      );
      toast('success', 'Order Status Updated', `Order #${updated.orderNumber} status changed to ${newStatus}.`);
      setSelectedOrder(updated);
      fetchOrders();
    } catch (_err) {
      toast('error', 'Error', 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };



  const totalPages = Math.ceil((orders || []).length / itemsPerPage) || 1;
  const paginatedOrders = (orders || []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-600" />
            Tailoring Order Pipeline & Fulfillment
          </h2>
          <p className="text-xs text-slate-500">
            Track bespoke suit commissions, update production statuses, and add logistics tracking numbers.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar with Custom Select */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order # or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-60">
          <Filter className="w-4 h-4 text-amber-600 shrink-0" />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
              { value: 'PAID', label: 'Paid' },
              { value: 'PROCESSING', label: 'Processing' },
              { value: 'IN_PRODUCTION', label: 'In Production' },
              { value: 'SHIPPED', label: 'Shipped' },
              { value: 'DELIVERED', label: 'Delivered' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
          />
        </div>
      </div>

      {/* Order Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader size="lg" />
          <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
            Loading Order Pipeline...
          </span>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Garments</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Production Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 bg-white">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((o) => {
                    const id = o._id || o.id;
                    return (
                      <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {o.shippingAddress?.firstName} {o.shippingAddress?.lastName}
                          <span className="block text-[11px] text-slate-500 font-normal">{o.shippingAddress?.email}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {o.items?.map((it: any) => it.product?.name).join(', ') || 'Custom Suit'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">${o.totalAmount?.toFixed(2)} USD</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openOrderDetail(o)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            View / Manage
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No orders found matching status criteria.
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
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, orders.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, orders.length)} of {orders.length} orders
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

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Manage Order #${selectedOrder?.orderNumber}`}
        maxWidth="2xl"
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs text-slate-900 font-sans max-h-[80vh] overflow-y-auto pr-1">
            {/* Status Update Control Box with Custom Select */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-amber-800 uppercase tracking-wider text-[11px]">
                Production & Tracking Controller
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <Select
                  label="Production Status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  options={[
                    { value: 'PENDING_PAYMENT', label: 'PENDING_PAYMENT' },
                    { value: 'PAID', label: 'PAID' },
                    { value: 'PROCESSING', label: 'PROCESSING' },
                    { value: 'IN_PRODUCTION', label: 'IN_PRODUCTION' },
                    { value: 'SHIPPED', label: 'SHIPPED' },
                    { value: 'DELIVERED', label: 'DELIVERED' },
                    { value: 'CANCELLED', label: 'CANCELLED' },
                  ]}
                />

                <Input
                  label="Courier Tracking Number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. DHL-9988776655"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="gold" size="sm" isLoading={updatingStatus} onClick={handleUpdateStatus}>
                  Update Order Status & Dispatch Email
                </Button>
              </div>
            </div>

            {/* Customer & Shipping Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <h5 className="font-bold text-slate-900">Shipping Address</h5>
                <p>
                  {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}
                </p>
                <p>
                  {selectedOrder.shippingAddress?.street} {selectedOrder.shippingAddress?.apartment}
                </p>
                <p>
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{' '}
                  {selectedOrder.shippingAddress?.zipCode}
                </p>
                <p className="text-slate-500">Phone: {selectedOrder.shippingAddress?.phone}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <h5 className="font-bold text-slate-900">Payment & Summary</h5>
                <p>
                  Payment Provider: <strong className="text-amber-800">{selectedOrder.paymentMethod || 'Stripe'}</strong>
                </p>
                <p>
                  Payment Status: <strong className="text-emerald-700">{selectedOrder.paymentStatus}</strong>
                </p>
                <p>
                  Total Paid: <strong className="text-slate-900">${selectedOrder.totalAmount?.toFixed(2)} USD</strong>
                </p>
              </div>
            </div>

            {/* Order Items Breakdown */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 text-sm font-serif">Commissions & Line Items Breakdown</h5>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
                {selectedOrder.items?.map((item: any, idx: number) => {
                  const prodName = item.product?.name || item.name || 'Bespoke Garment';
                  const isCustom = !!item.customization || !!item.measurementProfile;
                  const unitPx = item.unitPrice || item.price || item.priceAtAddition || 0;
                  const totalPx = item.totalPrice || unitPx * (item.quantity || 1);
                  const colorName = item.selectedColor?.name || (typeof item.selectedColor === 'string' ? item.selectedColor : null);

                  return (
                    <div key={idx} className="p-4 bg-white space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{prodName}</span>
                            {isCustom ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                ✨ Bespoke Customized
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                Standard Off-the-Rack
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">
                            SKU: {item.product?.sku || item.sku || 'STX-GARMENT'}
                            {colorName ? ` | Color: ${colorName}` : ''}
                            {item.selectedSize ? ` | Size: ${item.selectedSize}` : ''}
                            {` | Qty: ${item.quantity || 1} × $${unitPx.toFixed(2)}`}
                          </p>
                        </div>

                        <span className="font-bold font-mono text-slate-900 text-sm">${totalPx.toFixed(2)} USD</span>
                      </div>

                      {/* Bespoke Customization Options Breakdown */}
                      {item.customization && (
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-950">
                          <strong className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                            ✂️ Admin Customization Selections:
                          </strong>
                          {item.customization.optionAdjustments && item.customization.optionAdjustments.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {item.customization.optionAdjustments.map((opt: any, oIdx: number) => (
                                <div key={oIdx} className="bg-white p-2 rounded-lg border border-amber-200/80 flex items-center justify-between text-[11px]">
                                  <span>
                                    <strong className="text-amber-900">{opt.group}:</strong> {opt.optionName}
                                  </span>
                                  <span className="font-mono text-amber-700 font-semibold">
                                    {opt.priceAdjustment > 0 ? `+$${opt.priceAdjustment}` : 'Incl.'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : item.customization.selectedOptions ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {Object.entries(item.customization.selectedOptions).map(([grp, val]: [string, any], oIdx: number) => (
                                <div key={oIdx} className="bg-white p-2 rounded-lg border border-amber-200/80 text-[11px]">
                                  <strong className="text-amber-900">{grp}:</strong> {val}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* Measurement Profile Breakdown */}
                      {item.measurementProfile && (
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-950">
                          <strong className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                            📏 Customer Measurement Profile ({item.measurementProfile.name || 'Fit Profile'}):
                          </strong>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                            {item.measurementProfile.chest && (
                              <div className="p-1.5 bg-white rounded border border-emerald-200">
                                Chest: <strong>{item.measurementProfile.chest} {item.measurementProfile.unit || 'in'}</strong>
                              </div>
                            )}
                            {item.measurementProfile.waist && (
                              <div className="p-1.5 bg-white rounded border border-emerald-200">
                                Waist: <strong>{item.measurementProfile.waist} {item.measurementProfile.unit || 'in'}</strong>
                              </div>
                            )}
                            {item.measurementProfile.shoulder && (
                              <div className="p-1.5 bg-white rounded border border-emerald-200">
                                Shoulder: <strong>{item.measurementProfile.shoulder} {item.measurementProfile.unit || 'in'}</strong>
                              </div>
                            )}
                            {item.measurementProfile.sleeve && (
                              <div className="p-1.5 bg-white rounded border border-emerald-200">
                                Sleeve: <strong>{item.measurementProfile.sleeve} {item.measurementProfile.unit || 'in'}</strong>
                              </div>
                            )}
                            {item.measurementProfile.jacketLength && (
                              <div className="p-1.5 bg-white rounded border border-emerald-200">
                                Length: <strong>{item.measurementProfile.jacketLength} {item.measurementProfile.unit || 'in'}</strong>
                              </div>
                            )}
                            {item.measurementProfile.trouserWaist && (
                              <div className="p-1.5 bg-white rounded border border-emerald-200">
                                Pants Waist: <strong>{item.measurementProfile.trouserWaist} {item.measurementProfile.unit || 'in'}</strong>
                              </div>
                            )}
                            {item.measurementProfile.inseam && (
                              <div className="p-1.5 bg-white rounded border border-emerald-200">
                                Inseam: <strong>{item.measurementProfile.inseam} {item.measurementProfile.unit || 'in'}</strong>
                              </div>
                            )}
                            {item.measurementProfile.fitPreference && (
                              <div className="p-1.5 bg-white rounded border border-emerald-200">
                                Fit: <strong>{item.measurementProfile.fitPreference.toUpperCase()}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
