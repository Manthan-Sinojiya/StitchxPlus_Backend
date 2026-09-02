import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  ShoppingBag,
  Edit3,
  ShieldCheck,
  Ruler,
  Plus,
  Scissors,
} from 'lucide-react';
import { Button, Badge, useToast } from '../components/ui';
import { useCustomizationEngine } from '../features/customization/useCustomizationEngine';
import { SEOHead } from '../components/seo/SEOHead';
import { MeasurementFormModal } from '../components/patterns/MeasurementFormModal';

export function CustomizePage() {
  const [searchParams] = useSearchParams();
  const productSlugParam = searchParams.get('product') || undefined;
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    groups,
    targetProduct,
    userPatterns,
    isLoadingGroups,
    isErrorGroups,
    currentStepIndex,
    totalSteps,
    isMeasurementStep,
    isReviewStep,
    currentGroup,
    selectedOptions,
    selectedPatternSnapshot,
    priceData,
    validationData,
    isCalculatingPrice,
    selectOption,
    selectPatternSnapshot,
    nextStep,
    prevStep,
    goToStep,
  } = useCustomizationEngine(productSlugParam);

  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isInlineModalOpen, setIsInlineModalOpen] = useState(false);

  const handleAddToCart = async () => {
    if (validationData && !validationData.valid) {
      toast(
        'error',
        'Incompatible Configuration',
        'Please resolve configuration conflicts before adding to bag.',
      );
      return;
    }

    if (!selectedPatternSnapshot) {
      toast('info', 'Measurements Required', 'Please select or enter a measurement pattern profile.');
      return;
    }

    try {
      const { useCartStore } = await import('../store/useCartStore');
      await useCartStore.getState().addItem({
        productId: targetProduct?.id || targetProduct?._id || '68c1ce6a009685dfdb05204',
        quantity: 1,
        customization: {
          selectedOptions,
        },
        measurementProfile: selectedPatternSnapshot,
      });

      setIsAddedToCart(true);
      toast(
        'success',
        'Bespoke Suit Added to Bag',
        `Custom suit with pattern "${selectedPatternSnapshot.name}" snapshot added to bag!`,
      );
    } catch (err: any) {
      toast('error', 'Failed to Add Item', err.message || 'Could not add bespoke suit to cart.');
    }
  };

  if (isLoadingGroups) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-navy-100 rounded-lg" />
        <div className="h-12 w-full bg-navy-100 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-navy-100 rounded-3xl" />
            ))}
          </div>
          <div className="h-96 bg-navy-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isErrorGroups || groups.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-heading text-navy-900">
          Unable to Load Customization Options
        </h1>
        <p className="text-navy-600 text-sm">
          We encountered an issue communicating with our master tailoring studio database.
        </p>
        <Link to="/collections">
          <Button variant="navy">Browse Ready-to-Wear Collections</Button>
        </Link>
      </div>
    );
  }

  const productName = targetProduct?.name || 'Bespoke Custom Suit';
  const totalPrice = priceData?.totalPrice || targetProduct?.basePrice || 899;

  return (
    <div className="min-h-screen bg-navy-50/40 pb-24">
      <SEOHead
        title={`Customize ${productName}`}
        description="Design your custom suit with our interactive 3D tailoring studio."
      />

      {/* Header Banner */}
      <header className="bg-navy-950 text-white border-b border-navy-800 py-4 px-4 shadow-lg sticky top-20 z-30 backdrop-blur-md bg-navy-950/95">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {targetProduct?.images && targetProduct.images.length > 0 && (
              <img
                src={
                  typeof targetProduct.images[0] === 'string'
                    ? targetProduct.images[0]
                    : (targetProduct.images[0] as any)?.url
                }
                alt={productName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-gold-500/40 shadow-md flex-shrink-0"
              />
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gold" size="sm">
                  Custom Tailoring Studio
                </Badge>
                {targetProduct?.fitType && (
                  <span className="text-[11px] font-semibold text-gold-300 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/30">
                    Model Fit: {targetProduct.fitType}
                  </span>
                )}
                {targetProduct && (
                  <span className="text-xs text-navy-300 font-mono">
                    Base Price: ${targetProduct.basePrice}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
                <span>{productName}</span>
                <Sparkles className="w-5 h-5 text-gold-400 fill-gold-400" />
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-navy-400 block font-bold">
                Authoritative Calculated Price
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-heading text-gold-400 flex items-center justify-end gap-1">
                ${totalPrice.toLocaleString()}
                {isCalculatingPrice && (
                  <span className="text-xs text-navy-400 animate-pulse font-sans">
                    (updating...)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-6 py-4 sm:py-6">
        {/* Step Indicator Bar */}
        <div className="bg-white border border-navy-100 rounded-3xl p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-bold uppercase tracking-wider text-gold-600 font-heading">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span className="font-heading font-semibold text-navy-900 text-base">
              {isReviewStep
                ? 'Final Review & Order Summary'
                : isMeasurementStep
                ? 'Select Measurement Pattern'
                : currentGroup?.group}
            </span>
          </div>

          {/* Stepper Buttons */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 pt-2">
            {groups.map((grp, idx) => {
              const isSelected = Boolean(selectedOptions[grp.groupCode]);
              const isActive = currentStepIndex === idx;
              const isCompleted = idx < currentStepIndex && isSelected;

              return (
                <button
                  key={grp.groupCode}
                  type="button"
                  onClick={() => goToStep(idx)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-gold-500/10 border-2 border-gold-500 text-gold-700 shadow-sm'
                      : isCompleted
                      ? 'bg-navy-50 text-navy-800 border border-navy-200 hover:bg-navy-100'
                      : 'bg-navy-50/50 text-navy-400 border border-transparent hover:border-navy-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      isActive
                        ? 'bg-gold-500 text-navy-950'
                        : isCompleted
                        ? 'bg-navy-900 text-white'
                        : 'bg-navy-200 text-navy-600'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span className="text-[10px] font-medium truncate w-full text-center hidden sm:block">
                    {grp.group}
                  </span>
                </button>
              );
            })}

            {/* Measurement Step Dot */}
            <button
              type="button"
              onClick={() => goToStep(groups.length)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${
                isMeasurementStep
                  ? 'bg-gold-500/10 border-2 border-gold-500 text-gold-700 shadow-sm'
                  : selectedPatternSnapshot
                  ? 'bg-navy-50 text-navy-800 border border-navy-200'
                  : 'bg-navy-50/50 text-navy-400 border border-transparent hover:border-navy-200'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  isMeasurementStep
                    ? 'bg-gold-500 text-navy-950'
                    : selectedPatternSnapshot
                    ? 'bg-navy-900 text-white'
                    : 'bg-navy-200 text-navy-600'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-medium truncate w-full text-center hidden sm:block">
                Fit Pattern
              </span>
            </button>

            {/* Review Step Dot */}
            <button
              type="button"
              onClick={() => goToStep(groups.length + 1)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${
                isReviewStep
                  ? 'bg-gold-500/10 border-2 border-gold-500 text-gold-700 shadow-sm'
                  : 'bg-navy-50/50 text-navy-400 border border-transparent hover:border-navy-200'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  isReviewStep ? 'bg-gold-500 text-navy-950' : 'bg-navy-200 text-navy-600'
                }`}
              >
                ✓
              </div>
              <span className="text-[10px] font-medium truncate w-full text-center hidden sm:block">
                Review
              </span>
            </button>
          </div>
        </div>

        {/* Validation Errors Alert Box */}
        {validationData && !validationData.valid && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 sm:p-6 space-y-2 text-amber-900 text-xs sm:text-sm animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Configuration Attention Required</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {validationData.errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Customization Options Step */}
            {!isMeasurementStep && !isReviewStep && currentGroup && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-navy-900">
                    Select Your {currentGroup.group}
                  </h2>
                  <p className="text-xs text-navy-500 mt-1">
                    Choose from our master-tailored options for {currentGroup.group.toLowerCase()}.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentGroup.options.map((opt) => {
                    const isSelected = selectedOptions[currentGroup.groupCode] === opt.code;
                    const priceBadge =
                      opt.priceAdjustment > 0 ? `+$${opt.priceAdjustment}` : 'Included';

                    return (
                      <div
                        key={opt.code}
                        onClick={() => selectOption(currentGroup.groupCode, opt.code)}
                        className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                          isSelected
                            ? 'bg-white border-gold-500 shadow-xl ring-2 ring-gold-500/20'
                            : 'bg-white border-navy-100 hover:border-navy-300 hover:shadow-card'
                        }`}
                      >
                        {opt.image && (
                          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-navy-900">
                            <img
                              src={opt.image}
                              alt={opt.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}

                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-heading font-bold text-navy-900 text-base leading-snug">
                              {opt.name}
                            </h3>
                            <Badge variant={opt.priceAdjustment > 0 ? 'gold' : 'navy'}>
                              {priceBadge}
                            </Badge>
                          </div>
                          {opt.description && (
                            <p className="text-xs text-navy-600 leading-relaxed">
                              {opt.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-navy-100/60">
                          <span className="text-[11px] font-semibold text-navy-400 uppercase tracking-wider">
                            {isSelected ? 'Selected Option' : 'Select Choice'}
                          </span>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-gold-500 text-navy-950'
                                : 'border-2 border-navy-200 bg-navy-50'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Measurement Pattern Selection Step */}
            {isMeasurementStep && (
              <div className="bg-white border border-navy-100 rounded-3xl p-6 sm:p-8 shadow-card space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-navy-100 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold font-heading text-navy-900 flex items-center gap-2">
                      <Ruler className="w-6 h-6 text-gold-600" />
                      <span>Select Tailoring Measurement Profile</span>
                    </h2>
                    <p className="text-xs text-navy-500 mt-1">
                      Choose an existing fit pattern or create a new profile for laser-guided cutting.
                    </p>
                  </div>

                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => setIsInlineModalOpen(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    New Fit Profile
                  </Button>
                </div>

                {/* Pattern Selection Cards */}
                {userPatterns.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userPatterns.map((pat) => {
                      const isSelected = selectedPatternSnapshot?.id === pat.id;
                      return (
                        <div
                          key={pat.id}
                          onClick={() => selectPatternSnapshot(pat)}
                          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                            isSelected
                              ? 'bg-gold-50/40 border-gold-500 shadow-md ring-2 ring-gold-500/20'
                              : 'bg-navy-50/40 border-navy-100 hover:border-navy-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-heading font-bold text-navy-900 text-base">
                              {pat.name}
                            </h3>
                            {pat.isDefault && <Badge variant="gold">Default</Badge>}
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs text-navy-600 bg-white/80 p-3 rounded-xl border border-navy-100">
                            <div>
                              <span className="text-[10px] text-navy-400 block">Chest</span>
                              <span className="font-bold">{pat.chest}"</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-navy-400 block">Waist</span>
                              <span className="font-bold">{pat.waist}"</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-navy-400 block">Inseam</span>
                              <span className="font-bold">{pat.inseam}"</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="capitalize text-navy-500">
                              {pat.fitPreference} Fit
                            </span>
                            <span className="font-bold text-gold-600">
                              {isSelected ? '✓ Selected' : 'Select'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 bg-navy-50 rounded-2xl text-center space-y-3">
                    <p className="text-xs text-navy-600">
                      No saved measurement profiles found. Create one now for custom tailoring.
                    </p>
                    <Button variant="navy" size="sm" onClick={() => setIsInlineModalOpen(true)}>
                      Create Measurement Pattern
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* 3. Final Order Review Step */}
            {isReviewStep && (
              <div className="bg-white border border-navy-100 rounded-3xl p-6 sm:p-8 shadow-card space-y-6 animate-fadeIn">
                {/* Garment Hero & Model Type Banner */}
                <div className="p-5 bg-navy-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-navy-800 shadow-md">
                  <div className="flex items-center gap-4">
                    {targetProduct?.images && targetProduct.images.length > 0 && (
                      <img
                        src={
                          typeof targetProduct.images[0] === 'string'
                            ? targetProduct.images[0]
                            : (targetProduct.images[0] as any)?.url
                        }
                        alt={productName}
                        className="w-16 h-20 rounded-xl object-cover border border-gold-500/40 shadow-sm flex-shrink-0"
                      />
                    )}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                          Bespoke Garment Overview
                        </span>
                        {targetProduct?.fitType && (
                          <span className="text-[10px] font-bold text-gold-300 bg-gold-500/20 px-2 py-0.5 rounded-full border border-gold-500/30">
                            Model Fit: {targetProduct.fitType}
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading font-bold text-xl text-white">
                        {productName}
                      </h3>
                      <p className="text-xs text-navy-300">
                        {groups.length} bespoke customization options configured with master tailor swatches.
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] uppercase text-navy-400 block font-bold">Base Price</span>
                    <span className="text-lg font-bold font-heading text-gold-400">${targetProduct?.basePrice || 899}</span>
                  </div>
                </div>

                {/* Selected Pattern Snapshot Summary */}
                {selectedPatternSnapshot && (
                  <div className="p-5 bg-gold-50/50 border border-gold-300/60 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-5 h-5 text-gold-600" />
                        <h3 className="font-heading font-bold text-navy-900 text-base">
                          Fit Profile Snapshot: {selectedPatternSnapshot.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => goToStep(groups.length)}
                        className="text-xs text-gold-700 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Fit Profile
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-xl border border-gold-200">
                      <div>
                        <span className="text-navy-400 text-[10px] block">Chest</span>
                        <span className="font-bold text-navy-900">{selectedPatternSnapshot.chest}"</span>
                      </div>
                      <div>
                        <span className="text-navy-400 text-[10px] block">Waist</span>
                        <span className="font-bold text-navy-900">{selectedPatternSnapshot.waist}"</span>
                      </div>
                      <div>
                        <span className="text-navy-400 text-[10px] block">Shoulder</span>
                        <span className="font-bold text-navy-900">{selectedPatternSnapshot.shoulder}"</span>
                      </div>
                      <div>
                        <span className="text-navy-400 text-[10px] block">Inseam</span>
                        <span className="font-bold text-navy-900">{selectedPatternSnapshot.inseam}"</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customization Groups Visual Swatch Grid */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold font-heading text-navy-900 uppercase tracking-wider">
                    Selected Swatches & Customizations
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {groups.map((grp, idx) => {
                      const selectedCode = selectedOptions[grp.groupCode];
                      const selectedChoice = grp.options.find((o) => o.code === selectedCode);

                      return (
                        <div
                          key={grp.groupCode}
                          className="p-4 bg-navy-50/60 border border-navy-100 rounded-2xl flex items-center justify-between gap-3 group hover:border-gold-500/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {selectedChoice?.image ? (
                              <img
                                src={selectedChoice.image}
                                alt={selectedChoice.name}
                                className="w-12 h-12 rounded-xl object-cover border border-gold-500/30 flex-shrink-0 shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-navy-900 text-gold-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {grp.group.substring(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div className="space-y-0.5 min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 block truncate">
                                {grp.group}
                              </span>
                              <span className="font-heading font-bold text-navy-900 text-sm block truncate">
                                {selectedChoice?.name || 'Not Selected'}
                              </span>
                              {selectedChoice && selectedChoice.priceAdjustment > 0 ? (
                                <span className="text-xs text-gold-700 font-semibold block">
                                  +${selectedChoice.priceAdjustment}
                                </span>
                              ) : (
                                <span className="text-[10px] text-navy-400 block font-mono">
                                  Standard
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => goToStep(idx)}
                            className="p-2 text-navy-400 hover:text-gold-600 hover:bg-white rounded-xl transition-colors flex-shrink-0"
                            title={`Edit ${grp.group}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-navy-950 text-white rounded-2xl flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-gold-400 flex-shrink-0" />
                  <p className="text-xs text-navy-200 leading-relaxed">
                    Backed by our <strong>100% Perfect Fit Guarantee</strong>. Includes free remote fitting consultation and up to $75 local alteration credit.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Price Summary & Order Actions */}
          <div className="space-y-6 lg:sticky lg:top-36">
            <div className="bg-white border border-navy-100 rounded-3xl p-6 shadow-card space-y-6">
              <h3 className="text-lg font-bold font-heading text-navy-900 pb-3 border-b border-navy-100 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-gold-600" />
                <span>Price Calculation</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-navy-600">
                  <span>Base Suit Construction</span>
                  <span className="font-bold text-navy-900">
                    ${(priceData?.basePrice || 899).toLocaleString()}
                  </span>
                </div>

                {priceData?.optionAdjustments.map((adj, idx) => (
                  <div key={idx} className="flex items-center justify-between text-navy-600">
                    <span className="truncate max-w-[180px]">
                      {adj.group}: {adj.optionName}
                    </span>
                    <span className="font-semibold text-gold-700">
                      +{adj.priceAdjustment > 0 ? `$${adj.priceAdjustment}` : 'Included'}
                    </span>
                  </div>
                ))}

                <div className="pt-4 border-t border-navy-100 flex items-center justify-between">
                  <span className="font-heading font-bold text-navy-900 text-base">
                    Authoritative Total Price
                  </span>
                  <span className="font-heading font-bold text-2xl text-navy-900">
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {isReviewStep ? (
                  <Button
                    variant="gold"
                    size="lg"
                    fullWidth
                    onClick={handleAddToCart}
                    disabled={isAddedToCart || (validationData ? !validationData.valid : false)}
                    leftIcon={<ShoppingBag className="w-5 h-5" />}
                  >
                    {isAddedToCart ? 'Added to Bag!' : 'Add Bespoke Suit to Bag'}
                  </Button>
                ) : (
                  <Button
                    variant="gold"
                    size="lg"
                    fullWidth
                    onClick={nextStep}
                    rightIcon={<ChevronRight className="w-5 h-5" />}
                  >
                    {currentStepIndex === totalSteps - 2
                      ? 'Review Final Order'
                      : 'Next Step'}
                  </Button>
                )}

                {isAddedToCart && (
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => navigate('/cart')}
                  >
                    Proceed to Shopping Bag
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-navy-100 py-3 px-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          <div className="text-center font-heading text-xs sm:text-sm font-bold text-navy-900">
            Total: <span className="text-gold-600">${totalPrice.toLocaleString()}</span>
          </div>

          <Button
            variant="gold"
            size="sm"
            onClick={isReviewStep ? handleAddToCart : nextStep}
            rightIcon={isReviewStep ? <ShoppingBag className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          >
            {isReviewStep ? 'Add to Bag' : 'Next'}
          </Button>
        </div>
      </div>

      {/* Inline Measurement Form Modal */}
      <MeasurementFormModal
        isOpen={isInlineModalOpen}
        onClose={() => setIsInlineModalOpen(false)}
        onSuccess={(newPattern) => {
          selectPatternSnapshot(newPattern);
        }}
      />
    </div>
  );
}
