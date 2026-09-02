import React, { useState, useEffect } from 'react';
import { X, Ruler, Check, Info, ArrowRight, Sparkles, Scale, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { contentService, CMSSizeGuideData, CMSSizeChartCategory, DEFAULT_SIZE_GUIDE_DATA } from '../../services/contentService';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'suits',
}) => {
  const [guideData, setGuideData] = useState<CMSSizeGuideData>(DEFAULT_SIZE_GUIDE_DATA);
  const [activeTabSlug, setActiveTabSlug] = useState<string>('suits');
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [userChestVal, setUserChestVal] = useState<string>('');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  useEffect(() => {
    loadGuideData();

    const handleUpdate = () => {
      loadGuideData();
    };

    window.addEventListener('cms-size-guide-updated', handleUpdate);
    return () => {
      window.removeEventListener('cms-size-guide-updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (!guideData || !guideData.categories || guideData.categories.length === 0) return;
    const catMatch = guideData.categories.find(
      (c) =>
        c.slug.toLowerCase() === defaultCategory.toLowerCase() ||
        c.name.toLowerCase().includes(defaultCategory.toLowerCase())
    );
    if (catMatch) {
      setActiveTabSlug(catMatch.slug);
    } else if (guideData.categories.length > 0) {
      setActiveTabSlug(guideData.categories[0].slug);
    }
  }, [defaultCategory, guideData]);

  const loadGuideData = async () => {
    try {
      const data = await contentService.getSizeGuideContent();
      if (data && data.categories && data.categories.length > 0) {
        setGuideData(data);
        if (data.defaultUnit) setUnit(data.defaultUnit);
      }
    } catch (_e) {
      setGuideData(DEFAULT_SIZE_GUIDE_DATA);
    }
  };

  if (!isOpen) return null;

  const currentCategory: CMSSizeChartCategory =
    guideData.categories.find((c) => c.slug === activeTabSlug) ||
    guideData.categories[0] ||
    DEFAULT_SIZE_GUIDE_DATA.categories[0];

  // Helper for unit conversion (1 in = 2.54 cm)
  const fmtVal = (val: any) => {
    if (typeof val === 'number') {
      if (unit === 'cm') return (val * 2.54).toFixed(1);
      return val.toFixed(1);
    }
    return val;
  };

  // Interactive Size Estimator logic
  const handleEstimateSize = (chestInput: string) => {
    setUserChestVal(chestInput);
    const num = parseFloat(chestInput);
    if (!num || isNaN(num) || !currentCategory || !currentCategory.rows) {
      setRecommendedSize(null);
      return;
    }

    // Convert to inches for baseline check
    const numInches = unit === 'cm' ? num / 2.54 : num;
    let closestRow = currentCategory.rows[0];
    let minDiff = 999;

    currentCategory.rows.forEach((row) => {
      const chestVal = typeof row.chest === 'number' ? row.chest : parseFloat(row.chest || 0);
      if (chestVal) {
        const diff = Math.abs(chestVal - numInches);
        if (diff < minDiff) {
          minDiff = diff;
          closestRow = row;
        }
      }
    });

    if (closestRow && closestRow.size) {
      setRecommendedSize(String(closestRow.size));
    } else {
      setRecommendedSize(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
                Storefront Size & Measurement Advisory
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-amber-100">
                {guideData.title || 'Bespoke Size & Measurement Advisory'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-all border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Category Selector & Unit Switcher */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
            {guideData.categories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={() => {
                  setActiveTabSlug(cat.slug);
                  setRecommendedSize(null);
                }}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTabSlug === cat.slug
                    ? 'bg-slate-950 text-amber-300 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Inches / CM Unit Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-amber-600" /> Unit:
            </span>
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setUnit('in')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  unit === 'in' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  unit === 'cm' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Category Banner & Summary */}
          {currentCategory && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 text-white shadow-md">
              {currentCategory.bannerImage && (
                <div className="absolute inset-0 z-0 opacity-25 mix-blend-overlay">
                  <img
                    src={currentCategory.bannerImage}
                    alt={currentCategory.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="relative z-10 p-5 sm:p-6 space-y-1.5 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {currentCategory.name} Specification
                </span>
                <h3 className="text-xl font-bold font-serif text-white">{currentCategory.name} Size Chart</h3>
                {currentCategory.description && (
                  <p className="text-xs text-slate-300 max-w-2xl">{currentCategory.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Interactive "Find My Size" Estimator Widget */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Interactive Size Calculator</h4>
                  <p className="text-[11px] text-slate-600">
                    Enter your body measurement to highlight your recommended size.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder={`Chest/Waist (${unit})`}
                  value={userChestVal}
                  onChange={(e) => handleEstimateSize(e.target.value)}
                  className="w-36 text-xs px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-slate-900 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                {userChestVal && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserChestVal('');
                      setRecommendedSize(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 bg-white rounded-lg border border-amber-200"
                    title="Reset"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {recommendedSize && (
              <div className="p-3 bg-slate-950 text-white rounded-xl border border-amber-400/40 flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>
                    Recommended Size for {userChestVal} {unit}:
                  </span>
                  <strong className="text-amber-400 font-serif text-sm px-2 py-0.5 bg-amber-500/20 rounded-md border border-amber-400/30">
                    {recommendedSize}
                  </strong>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:inline font-mono">
                  Highlighted in chart below
                </span>
              </div>
            )}
          </div>

          {/* Size Chart Data Table */}
          {currentCategory && currentCategory.columns && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead className="bg-slate-950 text-amber-300 font-serif text-[11px] uppercase tracking-wider">
                  <tr>
                    {currentCategory.columns.map((col) => (
                      <th key={col.key} className="p-3.5 font-bold border-b border-slate-800">
                        {col.label} {col.key !== 'size' ? `(${unit})` : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {currentCategory.rows.map((row, idx) => {
                    const isSelected = recommendedSize && String(row.size) === recommendedSize;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-amber-100/90 font-bold border-l-4 border-l-amber-600 text-slate-950'
                            : idx % 2 === 0
                            ? 'bg-white'
                            : 'bg-slate-50/60'
                        }`}
                      >
                        {currentCategory.columns.map((col) => (
                          <td
                            key={col.key}
                            className={`p-3.5 ${
                              col.key === 'size'
                                ? 'font-bold font-serif text-slate-950 text-sm'
                                : 'font-mono text-slate-700'
                            }`}
                          >
                            {fmtVal(row[col.key] ?? '-')}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Step-by-Step Visual Measurement Reference Guides */}
          {currentCategory && currentCategory.metrics && currentCategory.metrics.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold font-serif text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Visual Measurement Guide & Diagram Instructions</span>
                </h3>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                  Step-By-Step Parameters
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {currentCategory.metrics.map((metric, idx) => (
                  <div
                    key={metric.id || metric.key || idx}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{metric.label}</h4>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          Parameter: {metric.key}
                        </span>
                      </div>
                    </div>

                    {/* Diagram Image if uploaded by Admin */}
                    {metric.image && (
                      <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 group">
                        <img
                          src={metric.image}
                          alt={metric.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                          <span className="text-[10px] font-bold text-amber-300 bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                            {metric.label} Diagram
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {metric.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Backed by our 30-Day Bespoke Fit Guarantee & Free Atelier Tailoring Adjustments.</span>
          </div>

          <Button
            variant="gold"
            size="md"
            onClick={onClose}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Close Advisory
          </Button>
        </div>
      </div>
    </div>
  );
};
