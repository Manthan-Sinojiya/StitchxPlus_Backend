import React, { useState } from 'react';
import { X, Ruler, Check, Info, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: 'suits' | 'shirts' | 'trousers' | string;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'suits',
}) => {
  const [activeTab, setActiveTab] = useState<'suits' | 'shirts' | 'trousers'>(
    defaultCategory.includes('shirt') ? 'shirts' : defaultCategory.includes('trouser') || defaultCategory.includes('pant') ? 'trousers' : 'suits'
  );
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  if (!isOpen) return null;

  // Conversion helper: 1 inch = 2.54 cm
  const fmt = (valInches: number) => {
    if (unit === 'cm') {
      return (valInches * 2.54).toFixed(1);
    }
    return valInches.toFixed(1);
  };

  const suitSizes = [
    { size: '36R (S)', chest: 37.5, shoulder: 17.5, length: 29.0, sleeve: 24.5, waist: 31.0 },
    { size: '38R (M)', chest: 39.5, shoulder: 18.0, length: 29.5, sleeve: 25.0, waist: 33.0 },
    { size: '40R (L)', chest: 41.5, shoulder: 18.5, length: 30.0, sleeve: 25.5, waist: 35.0 },
    { size: '42R (XL)', chest: 43.5, shoulder: 19.0, length: 30.5, sleeve: 26.0, waist: 37.0 },
    { size: '44R (XXL)', chest: 45.5, shoulder: 19.5, length: 31.0, sleeve: 26.5, waist: 39.0 },
    { size: '46R (3XL)', chest: 47.5, shoulder: 20.0, length: 31.5, sleeve: 27.0, waist: 41.0 },
  ];

  const shirtSizes = [
    { size: 'S (14.5)', neck: 14.5, chest: 38.0, waist: 34.0, sleeve: 33.0 },
    { size: 'M (15.5)', neck: 15.5, chest: 41.0, waist: 37.0, sleeve: 34.0 },
    { size: 'L (16.5)', neck: 16.5, chest: 44.0, waist: 40.0, sleeve: 35.0 },
    { size: 'XL (17.5)', neck: 17.5, chest: 47.0, waist: 43.0, sleeve: 36.0 },
    { size: 'XXL (18.5)', neck: 18.5, chest: 50.0, waist: 46.0, sleeve: 36.5 },
  ];

  const trouserSizes = [
    { size: '30W', waist: 30.0, hip: 38.0, thigh: 24.0, inseam: 32.0 },
    { size: '32W', waist: 32.0, hip: 40.0, thigh: 25.0, inseam: 32.5 },
    { size: '34W', waist: 34.0, hip: 42.0, thigh: 26.0, inseam: 33.0 },
    { size: '36W', waist: 36.0, hip: 44.0, thigh: 27.0, inseam: 33.5 },
    { size: '38W', waist: 38.0, hip: 46.0, thigh: 28.0, inseam: 34.0 },
    { size: '40W', waist: 40.0, hip: 48.0, thigh: 29.0, inseam: 34.0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-charcoal-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 bg-navy-950 text-white flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-400/40 flex items-center justify-center text-gold-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400 block">
                Bespoke Fit Advisory
              </span>
              <h2 className="text-xl font-bold font-serif">Size & Measurement Chart</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-navy-900 text-slate-300 hover:text-white hover:bg-navy-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Category Switcher & Unit Toggle */}
        <div className="p-4 bg-cream-50/80 border-b border-charcoal-200 flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-charcoal-200">
            <button
              type="button"
              onClick={() => setActiveTab('suits')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'suits'
                  ? 'bg-navy-950 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-950'
              }`}
            >
              Suits & Blazers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shirts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'shirts'
                  ? 'bg-navy-950 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-950'
              }`}
            >
              Dress Shirts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('trousers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'trousers'
                  ? 'bg-navy-950 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-950'
              }`}
            >
              Trousers & Slacks
            </button>
          </div>

          {/* Inches / CM Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-charcoal-600 uppercase tracking-wider">Unit:</span>
            <div className="flex items-center bg-white p-1 rounded-xl border border-charcoal-200">
              <button
                type="button"
                onClick={() => setUnit('in')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  unit === 'in' ? 'bg-bronze-600 text-white' : 'text-charcoal-600 hover:text-charcoal-950'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  unit === 'cm' ? 'bg-bronze-600 text-white' : 'text-charcoal-600 hover:text-charcoal-950'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Table View */}
          <div className="overflow-x-auto rounded-2xl border border-charcoal-200 bg-white">
            {activeTab === 'suits' && (
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-navy-950 text-gold-300 font-serif text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 font-bold">Standard Size</th>
                    <th className="p-3.5 font-bold">Chest Circumference ({unit})</th>
                    <th className="p-3.5 font-bold">Shoulder Width ({unit})</th>
                    <th className="p-3.5 font-bold">Jacket Length ({unit})</th>
                    <th className="p-3.5 font-bold">Sleeve Length ({unit})</th>
                    <th className="p-3.5 font-bold">Trouser Waist ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100 text-charcoal-800">
                  {suitSizes.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-cream-50/50'}>
                      <td className="p-3.5 font-bold font-serif text-navy-950 text-sm">{row.size}</td>
                      <td className="p-3.5 font-mono">{fmt(row.chest)}</td>
                      <td className="p-3.5 font-mono">{fmt(row.shoulder)}</td>
                      <td className="p-3.5 font-mono">{fmt(row.length)}</td>
                      <td className="p-3.5 font-mono">{fmt(row.sleeve)}</td>
                      <td className="p-3.5 font-mono font-semibold text-bronze-700">{fmt(row.waist)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'shirts' && (
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-navy-950 text-gold-300 font-serif text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 font-bold">Shirt Size</th>
                    <th className="p-3.5 font-bold">Collar/Neck ({unit})</th>
                    <th className="p-3.5 font-bold">Chest Circumference ({unit})</th>
                    <th className="p-3.5 font-bold">Waist ({unit})</th>
                    <th className="p-3.5 font-bold">Sleeve Length ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100 text-charcoal-800">
                  {shirtSizes.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-cream-50/50'}>
                      <td className="p-3.5 font-bold font-serif text-navy-950 text-sm">{row.size}</td>
                      <td className="p-3.5 font-mono">{fmt(row.neck)}</td>
                      <td className="p-3.5 font-mono">{fmt(row.chest)}</td>
                      <td className="p-3.5 font-mono">{fmt(row.waist)}</td>
                      <td className="p-3.5 font-mono font-semibold text-bronze-700">{fmt(row.sleeve)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'trousers' && (
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-navy-950 text-gold-300 font-serif text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 font-bold">Waist Size</th>
                    <th className="p-3.5 font-bold">Natural Waist ({unit})</th>
                    <th className="p-3.5 font-bold">Seat / Hips ({unit})</th>
                    <th className="p-3.5 font-bold">Thigh Width ({unit})</th>
                    <th className="p-3.5 font-bold">Standard Inseam ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100 text-charcoal-800">
                  {trouserSizes.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-cream-50/50'}>
                      <td className="p-3.5 font-bold font-serif text-navy-950 text-sm">{row.size}</td>
                      <td className="p-3.5 font-mono font-semibold text-bronze-700">{fmt(row.waist)}</td>
                      <td className="p-3.5 font-mono">{fmt(row.hip)}</td>
                      <td className="p-3.5 font-mono">{fmt(row.thigh)}</td>
                      <td className="p-3.5 font-mono">{fmt(row.inseam)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* How to Measure Guide Instructions */}
          <div className="bg-cream-50 border border-charcoal-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold font-serif text-charcoal-950 flex items-center gap-2">
              <Info className="w-4 h-4 text-bronze-600" />
              <span>How to Take Accurate Garment Measurements</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-white border border-charcoal-200 rounded-xl space-y-1">
                <span className="w-5 h-5 rounded-full bg-bronze-600 text-white font-mono font-bold text-[10px] inline-flex items-center justify-center mr-1">
                  1
                </span>
                <strong className="text-charcoal-950 font-bold">Chest / Bust</strong>
                <p className="text-charcoal-600 leading-snug">
                  Measure around the fullest part of your chest, under arms, keeping tape parallel to ground.
                </p>
              </div>

              <div className="p-3 bg-white border border-charcoal-200 rounded-xl space-y-1">
                <span className="w-5 h-5 rounded-full bg-bronze-600 text-white font-mono font-bold text-[10px] inline-flex items-center justify-center mr-1">
                  2
                </span>
                <strong className="text-charcoal-950 font-bold">Natural Waist</strong>
                <p className="text-charcoal-600 leading-snug">
                  Measure around waistline where you comfortably wear trousers (typically at navel level).
                </p>
              </div>

              <div className="p-3 bg-white border border-charcoal-200 rounded-xl space-y-1">
                <span className="w-5 h-5 rounded-full bg-bronze-600 text-white font-mono font-bold text-[10px] inline-flex items-center justify-center mr-1">
                  3
                </span>
                <strong className="text-charcoal-950 font-bold">Sleeve & Inseam</strong>
                <p className="text-charcoal-600 leading-snug">
                  From shoulder seam down to wrist bone. For pants, measure inner leg seam down to ankle.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-navy-950 text-white border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>Backed by our 30-Day Perfect Fit Guarantee & Free Master Alterations.</span>
          </div>

          <Button
            variant="accent"
            size="md"
            onClick={onClose}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Close Guide
          </Button>
        </div>
      </div>
    </div>
  );
};
