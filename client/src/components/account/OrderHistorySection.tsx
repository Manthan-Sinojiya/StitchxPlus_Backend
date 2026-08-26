import { useState, useEffect } from 'react';
import { Package, CheckCircle2, XCircle, ChevronRight, Scissors } from 'lucide-react';
import { Button, Badge, Modal, useToast, Loader } from '../ui';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '@stitchx/shared';

const STATUS_STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'PAID' as OrderStatus, label: 'Order Confirmed', description: 'Order & payment verified' },
  { status: 'PROCESSING' as OrderStatus, label: 'Pattern Creation', description: 'Master tailor drafting pattern' },
  { status: 'IN_PRODUCTION' as OrderStatus, label: 'Hand Tailoring', description: 'Cutting & stitching in workshop' },
  { status: 'SHIPPED' as OrderStatus, label: 'Dispatched', description: 'Garment en route with tracking' },
  { status: 'DELIVERED' as OrderStatus, label: 'Delivered', description: 'Delivered to your residence' },
];

function getStatusStepIndex(status: string): number {
  const norm = status.toUpperCase();
  if (norm === 'PENDING_PAYMENT' || norm === 'PENDING') return 0;
  if (norm === 'PAID') return 1;
  if (norm === 'PROCESSING') return 2;
  if (norm === 'IN_PRODUCTION' || norm === 'TAILORING') return 3;
  if (norm === 'SHIPPED') return 4;
  if (norm === 'DELIVERED') return 5;
  return 1;
}

export function OrderHistorySection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getUserOrders();
      setOrders(data);
    } catch (_err) {
      toast('error', 'Error', 'Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    try {
      setCancelling(true);
      const updated = await orderService.cancelOrder(orderId);
      toast('success', 'Order Cancelled', `Order #${updated.orderNumber} has been successfully cancelled.`);
      setSelectedOrder(updated);
      fetchOrders();
    } catch (err: any) {
      toast('error', 'Cancellation Failed', err.response?.data?.error?.message || 'Unable to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col justify-center items-center gap-3">
        <Loader size="lg" />
        <span className="text-xs text-navy-600 font-semibold">Loading bespoke order history...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-navy-50 text-navy-400 mx-auto flex items-center justify-center">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-serif font-bold text-navy-900">No Orders Yet</h3>
        <p className="text-sm text-navy-600 max-w-md mx-auto">
          You have not placed any bespoke suit orders yet. Explore our luxury collection to start your custom fitting.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {(orders || []).map((order) => {
          const isCancelled = order.status.toUpperCase() === 'CANCELLED';

          return (
            <div
              key={order._id || order.id || order.orderNumber}
              className="p-6 border border-navy-100 hover:border-gold-400/40 rounded-2xl bg-white transition-all shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-navy-50">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-navy-950 text-base">#{order.orderNumber}</span>
                    <Badge
                      variant={
                        isCancelled
                          ? 'outline'
                          : order.status.toUpperCase() === 'DELIVERED'
                          ? 'gold'
                          : 'default'
                      }
                      className="uppercase font-semibold text-[10px] tracking-wider"
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-navy-500 mt-1 block">
                    Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-navy-500 block">Total Amount</span>
                    <span className="text-lg font-bold text-navy-900">${order.totalAmount.toFixed(2)} USD</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    View Details
                  </Button>
                </div>
              </div>

              {/* Items Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-navy-50/40 p-3 rounded-xl">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-lg border border-navy-100"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-navy-100 flex items-center justify-center text-navy-400">
                        <Scissors className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-navy-900 truncate">{item.product.name}</h4>
                      <p className="text-xs text-navy-600">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.orderNumber}`}
          maxWidth="xl"
        >
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="p-6 bg-navy-950 rounded-2xl text-white space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
                Tailoring & Delivery Timeline
              </h3>

              {selectedOrder.status.toUpperCase() === 'CANCELLED' ? (
                <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-sm">This order was cancelled. Payment has been refunded.</span>
                </div>
              ) : (
                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
                  {STATUS_STEPS.map((step, idx) => {
                    const currentIdx = getStatusStepIndex(selectedOrder.status);
                    const isCompleted = currentIdx > idx;
                    const isCurrent = currentIdx === idx + 1;

                    return (
                      <div key={step.status} className="flex md:flex-col items-center gap-3 text-center z-10 flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isCompleted || isCurrent
                              ? 'bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/20'
                              : 'bg-navy-800 text-navy-400 border border-navy-700'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div>
                          <span
                            className={`text-xs font-bold block ${
                              isCompleted || isCurrent ? 'text-white' : 'text-navy-400'
                            }`}
                          >
                            {step.label}
                          </span>
                          <span className="text-[10px] text-navy-300 hidden md:block mt-0.5">
                            {step.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Line Items Breakdown */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-navy-900 text-base">Garment Breakdown</h4>
              <div className="space-y-3">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="p-4 border border-navy-100 rounded-xl space-y-3 bg-cream-50/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.product.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded-lg border"
                          />
                        )}
                        <div>
                          <h5 className="font-bold text-navy-900 text-sm">{item.product.name}</h5>
                          <span className="text-xs text-navy-500">SKU: {item.product.sku}</span>
                        </div>
                      </div>
                      <span className="font-bold text-navy-900 text-sm">${item.totalPrice.toFixed(2)}</span>
                    </div>

                    {/* Customization Details */}
                    {item.customization && typeof item.customization === 'object' && Object.keys(item.customization).length > 0 && (
                      <div className="p-3 bg-white rounded-lg border border-navy-100/60 text-xs space-y-1">
                        <span className="font-bold text-navy-900 block mb-1">Customization Specifications:</span>
                        <div className="grid grid-cols-2 gap-2 text-navy-700">
                          {Object.entries(item.customization).map(([k, v]) => (
                            <div key={k}>
                              <span className="text-navy-500 uppercase text-[10px] font-semibold">{k}:</span>{' '}
                              <span>{typeof v === 'object' ? (v as any).name || JSON.stringify(v) : String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Address & Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-navy-50/50 rounded-xl border space-y-1">
                <span className="font-bold text-navy-900 uppercase block tracking-wider text-[10px]">
                  Shipping Address
                </span>
                <p className="font-medium text-navy-900">
                  {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                </p>
                <p className="text-navy-600">{selectedOrder.shippingAddress.street}</p>
                <p className="text-navy-600">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                  {selectedOrder.shippingAddress.zipCode}
                </p>
                <p className="text-navy-600">{selectedOrder.shippingAddress.country}</p>
              </div>

              <div className="p-4 bg-navy-50/50 rounded-xl border space-y-1">
                <span className="font-bold text-navy-900 uppercase block tracking-wider text-[10px]">
                  Payment & Delivery Summary
                </span>
                <p className="text-navy-600">
                  Method: <span className="font-semibold text-navy-900">{selectedOrder.paymentMethod || 'Stripe'}</span>
                </p>
                <p className="text-navy-600">
                  Payment Status: <span className="font-semibold text-emerald-600 uppercase">{selectedOrder.paymentStatus}</span>
                </p>
                <p className="text-navy-600">
                  Shipping Method: <span className="font-semibold text-navy-900">{selectedOrder.shippingMethod}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-navy-100">
              {['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'IN_PRODUCTION', 'PENDING', 'TAILORING'].includes(
                selectedOrder.status.toUpperCase(),
              ) ? (
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={cancelling}
                  onClick={() => handleCancelOrder(selectedOrder._id || selectedOrder.id || '')}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cancel Order
                </Button>
              ) : (
                <span className="text-xs text-navy-500 italic">Order is not eligible for cancellation.</span>
              )}

              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
