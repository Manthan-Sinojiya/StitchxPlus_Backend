import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShieldCheck,
  Lock,
  Truck,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SEOHead } from '../components/seo/SEOHead';
import { useCartStore } from '../store/useCartStore';
import { checkoutService, orderService } from '../services/checkoutService';
import { StripePaymentElement } from '../components/checkout/StripePaymentElement';
import { Address, CheckoutValidateResult, CreatePaymentResult } from '@stitchx/shared';

const addressFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  street: z.string().min(1, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Valid email address is required'),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCartStore();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [isValidating, setIsValidating] = useState(true);
  const [_validationResult, setValidationResult] = useState<CheckoutValidateResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [shippingMethod, setShippingMethod] = useState('Standard Express (3-5 Days)');
  const [paymentResult, setPaymentResult] = useState<CreatePaymentResult | null>(null);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);

  // Form hooks for Shipping and Billing
  const shippingForm = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      firstName: 'Charles',
      lastName: 'Bespoke',
      street: '742 Evergreen Terrace',
      apartment: 'Suite 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 212-555-0199',
      email: 'charles@stitchx.com',
    },
  });

  const billingForm = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      firstName: 'Charles',
      lastName: 'Bespoke',
      street: '742 Evergreen Terrace',
      apartment: 'Suite 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 212-555-0199',
      email: 'charles@stitchx.com',
    },
  });

  useEffect(() => {
    const initCheckout = async () => {
      setIsValidating(true);
      setValidationError(null);
      try {
        await fetchCart();
        const res = await checkoutService.validateCheckout();
        setValidationResult(res);
        if (!res.isValid) {
          setValidationError(
            `Some items in your bag are out of stock: ${res.unavailableItems?.join(', ')}`,
          );
        }
      } catch (err: any) {
        setValidationError(err.message || 'Failed to validate checkout session.');
      } finally {
        setIsValidating(false);
      }
    };

    initCheckout();
  }, [fetchCart]);

  const handleShippingSubmit = (data: AddressFormData) => {
    setShippingAddress(data);
    if (sameAsShipping) {
      setBillingAddress(data);
      setActiveStep(3); // Skip step 2 if same as shipping
    } else {
      setActiveStep(2);
    }
  };

  const handleBillingSubmit = (data: AddressFormData) => {
    setBillingAddress(data);
    setActiveStep(3);
  };

  const handleShippingMethodSubmit = async () => {
    if (!shippingAddress || !billingAddress) return;
    setIsInitializingPayment(true);
    try {
      const result = await checkoutService.createPayment({
        shippingAddress,
        billingAddress,
        shippingMethod,
      });
      setPaymentResult(result);
      setActiveStep(4);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to initialize payment gateway.');
    } finally {
      setIsInitializingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!shippingAddress || !billingAddress || !paymentResult) return;

    try {
      const finalOrder = await orderService.createOrder({
        orderNumber: paymentResult.orderNumber,
        shippingAddress,
        billingAddress,
        shippingMethod,
        paymentMethod: 'Stripe',
        paymentIntentId,
      });

      // Clear local cart store
      await fetchCart();

      // Navigate to order confirmation
      navigate(`/order-confirmation/${finalOrder.orderNumber}`);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to finalize order.');
    }
  };

  if (isValidating) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold font-heading text-navy-900">
          Validating Bespoke Order & Tailoring Availability...
        </h2>
      </div>
    );
  }

  const items = cart?.items || [];
  if (items.length === 0 && !paymentResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <SEOHead title="Checkout | Stitchx Plus LLC" description="Secure Bespoke Suit Checkout" />
        <div className="w-20 h-20 rounded-full bg-navy-50 flex items-center justify-center mx-auto text-navy-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold font-heading text-navy-900">Your Bag is Empty</h1>
        <p className="text-navy-600 text-sm">
          Please add a bespoke garment or accessory before proceeding to checkout.
        </p>
        <Link to="/collections">
          <Button variant="navy">Explore Collections</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SEOHead title="Checkout | Stitchx Plus LLC" description="Secure Bespoke Suit Checkout" />

      {/* Header & Steps Breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-heading text-navy-900">Bespoke Checkout</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-navy-500 bg-navy-50 px-3 py-1.5 rounded-full border border-navy-100">
            <Lock className="w-3.5 h-3.5 text-gold-600" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 border-b border-navy-100 pb-4">
          {[
            { step: 1, title: '1. Shipping' },
            { step: 2, title: '2. Billing' },
            { step: 3, title: '3. Method' },
            { step: 4, title: '4. Payment' },
          ].map((s) => (
            <div
              key={s.step}
              className={`text-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                activeStep === s.step
                  ? 'bg-navy-900 text-gold-400 shadow-md'
                  : activeStep > s.step
                    ? 'bg-gold-50 text-navy-900 border border-gold-200'
                    : 'bg-navy-50 text-navy-400'
              }`}
            >
              {s.title}
            </div>
          ))}
        </div>
      </div>

      {validationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Checkout Alert</strong>
            {validationError}
          </div>
        </div>
      )}

      {/* Main Grid: Forms Left / Order Summary Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-step Forms */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Shipping Address Form */}
          {activeStep === 1 && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-navy-100 pb-4">
                <h3 className="text-lg font-bold text-navy-900 font-heading">
                  Shipping & Delivery Address
                </h3>
                <span className="text-xs text-navy-400">Step 1 of 4</span>
              </div>

              <form
                onSubmit={shippingForm.handleSubmit(handleShippingSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    {...shippingForm.register('firstName')}
                    error={shippingForm.formState.errors.firstName?.message}
                  />
                  <Input
                    label="Last Name"
                    {...shippingForm.register('lastName')}
                    error={shippingForm.formState.errors.lastName?.message}
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  {...shippingForm.register('email')}
                  error={shippingForm.formState.errors.email?.message}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  {...shippingForm.register('phone')}
                  error={shippingForm.formState.errors.phone?.message}
                />

                <Input
                  label="Street Address"
                  {...shippingForm.register('street')}
                  error={shippingForm.formState.errors.street?.message}
                />

                <Input
                  label="Apartment, Suite, Unit (Optional)"
                  {...shippingForm.register('apartment')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    {...shippingForm.register('city')}
                    error={shippingForm.formState.errors.city?.message}
                  />
                  <Input
                    label="State / Province"
                    {...shippingForm.register('state')}
                    error={shippingForm.formState.errors.state?.message}
                  />
                  <Input
                    label="ZIP / Postal Code"
                    {...shippingForm.register('zipCode')}
                    error={shippingForm.formState.errors.zipCode?.message}
                  />
                </div>

                <Input
                  label="Country"
                  {...shippingForm.register('country')}
                  error={shippingForm.formState.errors.country?.message}
                />

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-navy-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="w-4 h-4 text-navy-900 rounded border-navy-300 focus:ring-gold-500"
                    />
                    <span>Billing address is the same as shipping address</span>
                  </label>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="navy"
                    size="lg"
                    fullWidth
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to {sameAsShipping ? 'Shipping Method' : 'Billing Address'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* STEP 2: Billing Address Form (if different) */}
          {activeStep === 2 && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-navy-100 pb-4">
                <h3 className="text-lg font-bold text-navy-900 font-heading">Billing Address</h3>
                <span className="text-xs text-navy-400">Step 2 of 4</span>
              </div>

              <form
                onSubmit={billingForm.handleSubmit(handleBillingSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    {...billingForm.register('firstName')}
                    error={billingForm.formState.errors.firstName?.message}
                  />
                  <Input
                    label="Last Name"
                    {...billingForm.register('lastName')}
                    error={billingForm.formState.errors.lastName?.message}
                  />
                </div>

                <Input
                  label="Street Address"
                  {...billingForm.register('street')}
                  error={billingForm.formState.errors.street?.message}
                />

                <Input
                  label="Apartment, Suite, Unit (Optional)"
                  {...billingForm.register('apartment')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    {...billingForm.register('city')}
                    error={billingForm.formState.errors.city?.message}
                  />
                  <Input
                    label="State"
                    {...billingForm.register('state')}
                    error={billingForm.formState.errors.state?.message}
                  />
                  <Input
                    label="ZIP Code"
                    {...billingForm.register('zipCode')}
                    error={billingForm.formState.errors.zipCode?.message}
                  />
                </div>

                <Input
                  label="Country"
                  {...billingForm.register('country')}
                  error={billingForm.formState.errors.country?.message}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveStep(1)}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="navy"
                    className="flex-1"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Shipping Method
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* STEP 3: Shipping Method Selection */}
          {activeStep === 3 && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-navy-100 pb-4">
                <h3 className="text-lg font-bold text-navy-900 font-heading">
                  Select Delivery & Fitting Method
                </h3>
                <span className="text-xs text-navy-400">Step 3 of 4</span>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: 'Standard Express (3-5 Days)',
                    title: 'Insured Bespoke Express Delivery',
                    desc: 'Fully insured garment bag shipment directly to your door.',
                    price: cart?.subtotal && cart.subtotal > 500 ? 'Complimentary' : '$25.00',
                  },
                  {
                    id: 'White-Glove Tailor Delivery',
                    title: 'White-Glove Concierge Fitting ($75)',
                    desc: 'Master tailor delivers in-person for immediate final adjustments.',
                    price: '$75.00',
                  },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setShippingMethod(m.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                      shippingMethod === m.id
                        ? 'bg-gold-50/50 border-gold-500 ring-2 ring-gold-400/20'
                        : 'bg-white border-navy-100 hover:border-navy-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Truck
                        className={`w-5 h-5 mt-0.5 ${
                          shippingMethod === m.id ? 'text-gold-600' : 'text-navy-400'
                        }`}
                      />
                      <div>
                        <strong className="text-sm font-bold text-navy-900 block font-heading">
                          {m.title}
                        </strong>
                        <span className="text-xs text-navy-600">{m.desc}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-navy-900 whitespace-nowrap">
                      {m.price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveStep(sameAsShipping ? 1 : 2)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="navy"
                  className="flex-1"
                  isLoading={isInitializingPayment}
                  onClick={handleShippingMethodSubmit}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Order Review & Payment
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4: Order Review & Hosted Payment Element */}
          {activeStep === 4 && paymentResult && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-navy-100 pb-4">
                <h3 className="text-lg font-bold text-navy-900 font-heading">
                  Order Review & Payment
                </h3>
                <span className="text-xs text-navy-400">Step 4 of 4</span>
              </div>

              {/* Delivery Address Summary Box */}
              <div className="p-4 bg-navy-50/60 rounded-2xl border border-navy-100 space-y-2 text-xs text-navy-800">
                <div className="flex justify-between font-bold text-navy-900 border-b border-navy-200/60 pb-2">
                  <span>Shipping To:</span>
                  <button
                    onClick={() => setActiveStep(1)}
                    className="text-gold-600 hover:underline text-xs"
                  >
                    Edit Address
                  </button>
                </div>
                <p>
                  {shippingAddress?.firstName} {shippingAddress?.lastName}
                </p>
                <p>{shippingAddress?.street}, {shippingAddress?.apartment}</p>
                <p>
                  {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.zipCode},{' '}
                  {shippingAddress?.country}
                </p>
                <p>Phone: {shippingAddress?.phone}</p>
              </div>

              {/* Payment Element */}
              <StripePaymentElement
                clientSecret={paymentResult.clientSecret}
                orderNumber={paymentResult.orderNumber}
                totalAmount={paymentResult.totalAmount}
                onSuccess={handlePaymentSuccess}
              />
            </Card>
          )}
        </div>

        {/* Right Column: Order Items Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-6 sticky top-24">
            <h3 className="text-lg font-bold text-navy-900 font-heading border-b border-navy-100 pb-4">
              Bespoke Order Summary ({items.length} Items)
            </h3>

            {/* Line Items List */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-20 bg-navy-50 rounded-xl overflow-hidden flex-shrink-0 border border-navy-100">
                    <img
                      src={
                        typeof item.product?.images?.[0] === 'string'
                          ? item.product.images[0]
                          : (item.product?.images?.[0] as any)?.url ||
                            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=400'
                      }
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-navy-900 font-heading">
                      {item.product?.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge variant="navy">Qty: {item.quantity}</Badge>
                      {item.measurementProfile && (
                        <Badge variant="gold">
                          <Sparkles className="w-2.5 h-2.5 mr-0.5 inline" />
                          {item.measurementProfile.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-navy-900">
                    ${(item.unitPrice * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2 border-t border-navy-100 pt-4 text-xs">
              <div className="flex justify-between text-navy-600">
                <span>Subtotal</span>
                <span>${(cart?.subtotal || 0).toLocaleString()}</span>
              </div>
              {(cart?.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-${cart?.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-navy-600">
                <span>Shipping</span>
                <span>
                  {cart?.shipping === 0 ? 'Complimentary' : `$${cart?.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-navy-900 font-heading border-t border-navy-200 pt-3">
                <span>Total</span>
                <span>${(cart?.total || 0).toLocaleString()} USD</span>
              </div>
            </div>

            {/* Guarantee Footer */}
            <div className="p-3 bg-cream-50 rounded-xl border border-navy-100 flex items-center gap-2 text-xs text-navy-700">
              <ShieldCheck className="w-4 h-4 text-gold-600 flex-shrink-0" />
              <span>Includes 100% Tailoring Fit Guarantee & Free Alterations</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
