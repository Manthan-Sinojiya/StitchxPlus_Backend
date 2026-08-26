import React, { useState } from 'react';
import { CreditCard, Lock, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface StripePaymentElementProps {
  clientSecret: string;
  orderNumber: string;
  totalAmount: number;
  onSuccess: (paymentIntentId: string) => Promise<void>;
  onError?: (errorMessage: string) => void;
}

export const StripePaymentElement: React.FC<StripePaymentElementProps> = ({
  orderNumber,
  totalAmount,
  onSuccess,
}) => {
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [cardHolder, setCardHolder] = useState('Charles Bespoke');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(val || '');
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setExpiry(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      // Simulate network request to Stripe Gateway
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (simulateFailure) {
        throw new Error('Your card was declined. Please verify your card details or try a different payment method.');
      }

      const mockPaymentIntentId = `pi_stitchx_${Math.random().toString(36).substring(2, 10)}`;
      await onSuccess(mockPaymentIntentId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encryption Header */}
      <div className="p-4 bg-navy-950 text-white rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-navy-800 rounded-xl text-gold-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">
              256-Bit Encrypted Payment
            </h4>
            <p className="text-xs text-navy-300">Stripe Payment Gateway Integration</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-800/40">
          <ShieldCheck className="w-4 h-4" />
          <span>PCI-DSS Level 1</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900 text-xs sm:text-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Payment Failed</strong>
            {errorMsg}
          </div>
        </div>
      )}

      {/* Credit Card Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">
            Cardholder Name
          </label>
          <Input
            type="text"
            required
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            placeholder="Name on card"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">
            Card Number
          </label>
          <div className="relative">
            <Input
              type="text"
              required
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="4242 4242 4242 4242"
              className="pr-12"
            />
            <CreditCard className="w-5 h-5 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">
              Expiration Date
            </label>
            <Input
              type="text"
              required
              value={expiry}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block">
              CVC / CVV
            </label>
            <Input
              type="text"
              required
              maxLength={4}
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
              placeholder="123"
            />
          </div>
        </div>

        {/* Development / Demo Mode Simulator Toggle */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <span>Simulate Card Failure Mode (Testing)</span>
          </div>
          <input
            type="checkbox"
            checked={simulateFailure}
            onChange={(e) => setSimulateFailure(e.target.checked)}
            className="w-4 h-4 rounded text-navy-900 focus:ring-gold-500"
          />
        </div>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          fullWidth
          isLoading={isProcessing}
          disabled={isProcessing}
        >
          Pay ${totalAmount.toLocaleString()} USD (Order #{orderNumber})
        </Button>
      </form>
    </div>
  );
};
