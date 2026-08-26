import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SEOHead } from '../components/seo/SEOHead';
import { orderService } from '../services/checkoutService';
import { Order } from '@stitchx/shared';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) return;
      setIsLoading(true);
      try {
        const data = await orderService.getOrderByNumber(orderNumber);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Unable to retrieve order details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold font-heading text-navy-900">
          Generating Bespoke Order Receipt...
        </h2>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <SEOHead title="Order Confirmation | Stitchx Plus LLC" description="Bespoke Order Confirmation" />
        <h2 className="text-2xl font-bold font-heading text-navy-900">Order Not Found</h2>
        <p className="text-navy-600 text-sm">{error || "We couldn't locate this order."}</p>
        <Link to="/collections">
          <Button variant="navy">Return to Storefront</Button>
        </Link>
      </div>
    );
  }

  const estimatedDelivery = new Date(
    new Date(order.createdAt || Date.now()).getTime() + 14 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <SEOHead
        title={`Order #${order.orderNumber} Confirmed | Stitchx Plus LLC`}
        description="Your bespoke garment has entered master tailoring production."
      />

      {/* Confirmation Header Banner */}
      <div className="bg-navy-950 text-white rounded-3xl p-8 text-center space-y-4 relative overflow-hidden shadow-2xl border border-navy-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="w-16 h-16 bg-gold-500/20 text-gold-400 rounded-2xl flex items-center justify-center mx-auto border border-gold-500/40 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <Badge variant="gold" className="uppercase tracking-widest px-3 py-1 text-xs">
            Payment Confirmed & Order Placed
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading">
            Thank You For Your Bespoke Order
          </h1>
          <p className="text-navy-200 text-sm max-w-lg mx-auto">
            Order <strong className="text-gold-400 font-mono">#{order.orderNumber}</strong> has been transmitted to our master tailors.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4 text-gold-400" />}
            className="text-white border-navy-700 hover:bg-navy-800"
          >
            Print Receipt
          </Button>
          <Link to="/account">
            <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View Order History
            </Button>
          </Link>
        </div>
      </div>

      {/* Timeline Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-gold-50 text-gold-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-navy-400 block font-semibold">STATUS</span>
            <strong className="text-sm font-bold text-navy-900 capitalize">
              {order.status} ({order.paymentStatus})
            </strong>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-navy-50 text-navy-900 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-navy-400 block font-semibold">EST. FITTING DELIVERY</span>
            <strong className="text-xs font-bold text-navy-900">{estimatedDelivery}</strong>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-navy-400 block font-semibold">FIT GUARANTEE</span>
            <strong className="text-xs font-bold text-navy-900">Complimentary Alterations</strong>
          </div>
        </Card>
      </div>

      {/* Order Details & Address Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Line Items Column */}
        <div className="md:col-span-7 space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-navy-900 font-heading border-b border-navy-100 pb-3">
              Bespoke Items Snapshot
            </h3>

            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start pb-4 border-b border-navy-50 last:border-0 last:pb-0">
                  <div className="w-16 h-20 bg-navy-50 rounded-xl overflow-hidden flex-shrink-0 border border-navy-100">
                    <img
                      src={
                        item.product?.image ||
                        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=400'
                      }
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-bold text-navy-900 font-heading">
                      {item.product?.name}
                    </h4>
                    <p className="text-xs text-navy-500">SKU: {item.product?.sku}</p>

                    {item.measurementProfile && (
                      <div className="pt-1">
                        <Badge variant="gold" className="text-[10px]">
                          <Sparkles className="w-2.5 h-2.5 mr-0.5 inline" />
                          Pattern: {item.measurementProfile.name || 'Custom Fitting'}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-navy-500 block">Qty: {item.quantity}</span>
                    <strong className="text-sm font-bold text-navy-900">
                      ${item.totalPrice.toLocaleString()}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Pricing & Address Column */}
        <div className="md:col-span-5 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-navy-900 font-heading border-b border-navy-100 pb-3">
              Delivery Details
            </h3>

            <div className="space-y-3 text-xs text-navy-700">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-navy-900 block">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </strong>
                  <p>{order.shippingAddress.street}, {order.shippingAddress.apartment}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                  </p>
                  <p className="text-navy-500 mt-1">Phone: {order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-navy-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-navy-600">
                <span>Subtotal</span>
                <span>${order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-${order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-navy-600">
                <span>Shipping ({order.shippingMethod})</span>
                <span>{order.shipping === 0 ? 'Complimentary' : `$${order.shipping}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-navy-900 font-heading border-t border-navy-200 pt-3">
                <span>Paid Amount</span>
                <span>${order.totalAmount.toLocaleString()} USD</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
