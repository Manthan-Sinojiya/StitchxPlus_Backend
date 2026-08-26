import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SEOHead } from '../components/seo/SEOHead';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  Sparkles,
  Sliders,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, fetchCart, updateItem, removeItem, applyCoupon, removeCoupon, isLoading } =
    useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError(null);
    setCouponSuccess(null);
    try {
      await applyCoupon(couponCode);
      setCouponSuccess(`Coupon '${couponCode.toUpperCase()}' applied!`);
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid or expired coupon code');
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponError(null);
    setCouponSuccess(null);
    try {
      await removeCoupon();
    } catch (err: any) {
      setCouponError(err.message || 'Failed to remove coupon');
    }
  };

  const items = cart?.items || [];

  return (
    <>
      <SEOHead
        title="Shopping Cart | Stitchx Plus LLC"
        description="Review your bespoke suit order, customized options, and measurement profiles."
      />

      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-navy-900">Your Bespoke Cart</h1>
            <p className="text-sm text-slate-500 mt-1">
              Review your customized suit configurations and measurement profiles before checkout.
            </p>
          </div>

          {items.length === 0 ? (
            /* Empty Cart View */
            <Card className="p-12 text-center max-w-lg mx-auto bg-white shadow-sm border-slate-200">
              <div className="w-20 h-20 rounded-full bg-navy-50 text-navy-700 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-serif font-semibold text-slate-900">Your Cart is Empty</h2>
              <p className="text-sm text-slate-500 mt-2">
                You haven't added any custom suits or accessories to your cart yet.
              </p>
              <div className="mt-6">
                <Link to="/collections">
                  <Button className="bg-navy-900 hover:bg-navy-800 text-gold-400 font-medium px-8 py-3">
                    Explore Collections
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            /* Main 2-Column Cart Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Items List */}
              <div className="lg:col-span-8 space-y-4">
                {items.map((item) => {
                  const selectedOpts = item.customization?.selectedOptions || {};
                  const optEntries = Object.entries(selectedOpts);

                  return (
                    <Card
                      key={item.id}
                      className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Image */}
                        <div className="w-full sm:w-32 h-40 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 relative">
                          <img
                            src={
                              typeof item.product?.images?.[0] === 'string'
                                ? item.product.images[0]
                                : (item.product?.images?.[0] as any)?.url ||
                                  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80'
                            }
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Line Item Details */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-serif font-semibold text-slate-900">
                                {item.product?.name || 'Custom Bespoke Suit'}
                              </h3>
                              <p className="text-xs text-slate-400">SKU: {item.product?.sku || 'SUIT-BESPOKE'}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Customization Summary Tags */}
                          {optEntries.length > 0 && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-navy-900 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                                  Custom Specifications
                                </span>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/customize?productId=${item.productId}&editItemId=${item.id}`,
                                    )
                                  }
                                  className="text-[11px] text-amber-700 hover:text-amber-900 font-medium flex items-center gap-0.5"
                                >
                                  <Sliders className="w-3 h-3" />
                                  Edit Configuration
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {optEntries.map(([group, optCode]) => (
                                  <Badge
                                    key={group}
                                    variant="outline"
                                    className="text-[11px] bg-white border-slate-200 text-slate-700 capitalize"
                                  >
                                    {group}: <span className="font-semibold text-navy-800 ml-1">{optCode}</span>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Measurement Profile Snapshot Badge */}
                          {item.measurementProfile && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Badge className="bg-navy-900 text-gold-400 text-[10px]">Fit Pattern</Badge>
                              <span className="font-medium text-slate-800">
                                {item.measurementProfile.name}
                              </span>
                              {item.measurementProfile.chest && (
                                <span className="text-slate-400">
                                  (Chest: {item.measurementProfile.chest}", Waist:{' '}
                                  {item.measurementProfile.waist}")
                                </span>
                              )}
                            </div>
                          )}

                          {/* Stepper and Price Row */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            {/* Quantity Stepper */}
                            <div className="flex items-center border border-slate-300 rounded-lg">
                              <button
                                onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-l-lg transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 text-sm font-semibold text-slate-900">{item.quantity}</span>
                              <button
                                onClick={() => updateItem(item.id, item.quantity + 1)}
                                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-r-lg transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Total Line Price */}
                            <div className="text-right">
                              <span className="text-xl font-bold font-serif text-navy-900">
                                ${item.totalPrice}
                              </span>
                              {item.quantity > 1 && (
                                <span className="block text-xs text-slate-400">
                                  (${item.unitPrice} each)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {/* Trust Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 text-slate-700">
                    <Truck className="w-6 h-6 text-gold-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Complimentary Shipping</h4>
                      <p className="text-[11px] text-slate-500">On all orders over $500</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 text-slate-700">
                    <ShieldCheck className="w-6 h-6 text-gold-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Perfect Fit Guarantee</h4>
                      <p className="text-[11px] text-slate-500">Free alterations within 30 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 text-slate-700">
                    <RotateCcw className="w-6 h-6 text-gold-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Master Craftsmanship</h4>
                      <p className="text-[11px] text-slate-500">Tailored to your exact specs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Coupon */}
              <div className="lg:col-span-4 space-y-6">
                {/* Order Summary Card */}
                <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl space-y-6">
                  <h2 className="text-lg font-serif font-bold text-navy-900 border-b border-slate-100 pb-3">
                    Order Summary
                  </h2>

                  {/* Promo / Coupon Form */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-700">Have a promo code?</label>
                    {cart?.couponCode ? (
                      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                          <Tag className="w-4 h-4 text-amber-600" />
                          <span>
                            Coupon <strong>{cart.couponCode}</strong> applied (-${cart.discount})
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-xs text-red-600 hover:text-red-800 font-medium underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <Input
                          placeholder="Enter promo code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="text-xs"
                        />
                        <Button type="submit" variant="outline" isLoading={isLoading}>
                          Apply
                        </Button>
                      </form>
                    )}
                    {couponError && <p className="text-xs text-red-600">{couponError}</p>}
                    {couponSuccess && <p className="text-xs text-emerald-600">{couponSuccess}</p>}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="space-y-3 text-sm text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900">${cart?.subtotal || 0}</span>
                    </div>

                    {cart && cart.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount</span>
                        <span>-${cart.discount}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Estimated Shipping</span>
                      <span>
                        {cart?.shipping === 0 ? (
                          <span className="text-emerald-600 font-semibold">Free</span>
                        ) : (
                          `$${cart?.shipping}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-lg font-serif font-bold text-navy-900 pt-4 border-t border-slate-200">
                      <span>Total</span>
                      <span>${cart?.total || 0}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <div className="pt-2">
                    <Link to="/checkout" className="block w-full">
                      <Button className="w-full bg-navy-900 hover:bg-navy-800 text-gold-400 font-medium py-3.5 text-base flex items-center justify-center gap-2">
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
