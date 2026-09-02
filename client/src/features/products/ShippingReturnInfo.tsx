import { useState } from 'react';
import { Truck, ShieldCheck, RefreshCw, ChevronDown, Scissors } from 'lucide-react';

interface ShippingReturnInfoProps {
  returnPolicy?: string;
  guaranteeDetails?: string;
}

export function ShippingReturnInfo({ returnPolicy, guaranteeDetails }: ShippingReturnInfoProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const sections = [
    {
      id: 'fit-guarantee',
      icon: <Scissors className="w-5 h-5 text-gold-500" />,
      title: '100% Perfect Fit Guarantee',
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-navy-600 leading-relaxed pt-2">
          <p>
            {guaranteeDetails ||
              'Every Stitchx Plus garment is hand-crafted to your individual digital body measurement profile.'}
          </p>
          <p>
            If your garment requires minor adjustments upon arrival, we provide up to{' '}
            <strong>$75 in local tailoring credits</strong> or will recreate your garment from scratch at zero cost to you.
          </p>
        </div>
      ),
    },
    {
      id: 'shipping',
      icon: <Truck className="w-5 h-5 text-gold-500" />,
      title: 'Complimentary Express Worldwide Shipping',
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-navy-600 leading-relaxed pt-2">
          <p>
            Custom garments are tailored in 10-14 business days and delivered via DHL Express worldwide tracking.
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>US & Canada: 2-3 business days express shipping</li>
            <li>Europe & UK: 2-4 business days express shipping</li>
            <li>Rest of World: 3-5 business days express shipping</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'returns',
      icon: <RefreshCw className="w-5 h-5 text-gold-500" />,
      title: returnPolicy || '30-Day Risk-Free Returns & Exchange',
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-navy-600 leading-relaxed pt-2">
          <p>
            {returnPolicy
              ? returnPolicy
              : 'Unworn, unaltered off-the-rack accessories or standard fitting suits can be returned within 30 days of receipt.'}
          </p>
          <p>
            We provide pre-paid return shipping labels and full refunds processed within 3 business days of return receipt.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white border border-navy-100 rounded-3xl p-6 shadow-card space-y-4">
      <h3 className="text-lg font-bold font-heading text-navy-900 flex items-center gap-2 border-b border-navy-100 pb-3">
        <ShieldCheck className="w-5 h-5 text-gold-600" />
        <span>Stitchx Bespoke Commitment</span>
      </h3>

      <div className="divide-y divide-navy-100">
        {sections.map((sec, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={sec.id} className="py-3.5">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between text-left font-semibold text-navy-900 hover:text-gold-600 transition-colors py-1 group"
              >
                <div className="flex items-center gap-3">
                  {sec.icon}
                  <span className="text-sm font-heading">{sec.title}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-navy-400 group-hover:text-gold-600 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-gold-600' : ''
                  }`}
                />
              </button>
              {isOpen && <div className="animate-fadeIn">{sec.content}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
