import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ShoppingBag, Trash2, Plus, Minus, Tag, Sparkles } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { cart, isOpen, closeCart, fetchCart, updateItem, removeItem, applyCoupon, removeCoupon, isLoading } =
    useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !cart) {
      fetchCart();
    }
  }, [isOpen, cart, fetchCart]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError(null);
    setCouponSuccess(null);
    try {
      await applyCoupon(couponCode);
      setCouponSuccess(`Coupon '${couponCode.toUpperCase()}' applied successfully!`);
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
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Drawer isOpen={isOpen} onClose={closeCart} title={`Shopping Cart (${itemCount})`} width="md">
      <div className="flex flex-col h-[calc(100vh-140px)] justify-between">
        {/* Cart Line Items List */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-navy-50 flex items-center justify-center text-navy-600">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-serif text-slate-900">Your cart is empty</h3>
              <p className="text-sm text-slate-500 max-w-xs">
                Explore our bespoke collection and customize your perfect suit.
              </p>
            </div>
            <Link to="/collections" onClick={closeCart}>
              <Button variant="outline" className="mt-2">
                Browse Collections
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 divide-y divide-slate-100">
            {items.map((item) => {
              const selectedOpts = item.customization?.selectedOptions || {};
              const optionsSummary = Object.entries(selectedOpts)
                .map(([_, v]) => v)
                .slice(0, 3)
                .join(' • ');

              return (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    <img
                      src={
                        typeof item.product?.images?.[0] === 'string'
                          ? item.product.images[0]
                          : (item.product?.images?.[0] as any)?.url ||
                            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={item.product?.name || 'Suit'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {item.product?.name || 'Custom Suit'}
                      </h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Customization & Variant Badges */}
                    {optionsSummary && (
                      <p className="text-xs text-amber-700 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{optionsSummary}</span>
                      </p>
                    )}

                    {(item.selectedColor || item.selectedSize) && (
                      <p className="text-xs text-slate-600 font-medium">
                        {item.selectedColor && (
                          <span>
                            Color:{' '}
                            <strong className="text-slate-800">
                              {typeof item.selectedColor === 'string'
                                ? item.selectedColor
                                : item.selectedColor?.name}
                            </strong>
                          </span>
                        )}
                        {item.selectedColor && item.selectedSize && <span> • </span>}
                        {item.selectedSize && <span>Size: <strong className="text-slate-800">{item.selectedSize}</strong></span>}
                      </p>
                    )}

                    {item.measurementProfile && (
                      <p className="text-xs text-slate-500 truncate">
                        Pattern: <span className="font-medium text-slate-700">{item.measurementProfile.name}</span>
                      </p>
                    )}

                    {/* Price and Quantity Stepper */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-slate-200 rounded-md">
                        <button
                          onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-semibold text-navy-900">${item.totalPrice}</span>
                        {item.quantity > 1 && (
                          <span className="block text-[10px] text-slate-400">${item.unitPrice} each</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer & Order Summary */}
        {items.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-3 bg-white">
            {/* Coupon Code Input */}
            <div>
              {cart?.couponCode ? (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-800 font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon: <strong>{cart.couponCode}</strong> (-${cart.discount})</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-slate-500 hover:text-red-600 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <Input
                    placeholder="Promo / Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="text-xs h-9"
                  />
                  <Button type="submit" variant="outline" size="sm" isLoading={isLoading}>
                    Apply
                  </Button>
                </form>
              )}
              {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
              {couponSuccess && <p className="text-xs text-emerald-600 mt-1">{couponSuccess}</p>}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
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
                <span>{cart?.shipping === 0 ? <span className="text-emerald-600 font-semibold">Free</span> : `$${cart?.shipping}`}</span>
              </div>
              <div className="flex justify-between text-sm font-serif font-bold text-navy-900 pt-2 border-t border-slate-100">
                <span>Total</span>
                <span>${cart?.total || 0}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2">
              <Link to="/checkout" onClick={closeCart} className="block w-full">
                <Button className="w-full bg-navy-900 hover:bg-navy-800 text-gold-400 font-medium py-2.5">
                  Proceed to Checkout
                </Button>
              </Link>
              <Link to="/cart" onClick={closeCart} className="block w-full text-center">
                <span className="text-xs font-semibold text-slate-600 hover:text-navy-900 underline">
                  View Detailed Cart Page
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
