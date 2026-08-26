import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Star,
  Info,
  ArrowLeft,
  Check,
  RotateCcw,
  X,
  ChevronRight,
  ChevronLeft,
  Edit3,
  ZoomIn,
} from 'lucide-react';
import { Button, Badge, Tabs, useToast } from '../components/ui';
import { useProductBySlug } from '../features/products/useProductQueries';
import { ProductImageGallery } from '../features/products/ProductImageGallery';
import { ShippingReturnInfo } from '../features/products/ShippingReturnInfo';
import { RelatedProductsSection } from '../features/products/RelatedProductsSection';
import { SEOHead } from '../components/seo/SEOHead';
import { customizationService } from '../services/customizationService';
import { Fabric, CustomizationOptionGroup } from '@stitchx/shared';



export function ProductDetailPage() {
  const { id: slug } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [selectedSize, setSelectedSize] = useState('custom');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotified, setIsNotified] = useState(false);

  // In-Page Customization Mode States
  const initialCustomizing = searchParams.get('customize') === 'true';
  const [isCustomizing, setIsCustomizing] = useState(initialCustomizing);
  
  // Step-by-Step Wizard State (One-by-One Group Display)
  // 0 to customizationGroups.length - 1 = Customization Groups
  // customizationGroups.length = Final Review & Summary Step!
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const [customizationGroups, setCustomizationGroups] = useState<CustomizationOptionGroup[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [monogramText, setMonogramText] = useState<string>('');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<Array<{ group: string; optionName: string; priceAdjustment: number }>>([]);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [isLoadingCustomData, setIsLoadingCustomData] = useState(false);

  const { data: product, isLoading, isError, error } = useProductBySlug(slug);

  // Fetch customization options added by admin for this product
  const loadCustomizationOptions = useCallback(async () => {
    if (!product) return;
    setIsLoadingCustomData(true);
    try {
      const res = await customizationService.getCustomizationOptions(product.slug || product.id);
      if (res.success && res.data?.groups) {
        setCustomizationGroups(res.data.groups);
      } else {
        setCustomizationGroups([]);
      }
    } catch (err) {
      console.warn('Failed to load customization groups:', err);
      setCustomizationGroups([]);
    } finally {
      setIsLoadingCustomData(false);
    }
  }, [product]);

  // Initialize selectedOptions defaults when groups are loaded (kept empty initially so customer explicitly chooses)
  useEffect(() => {
    // Left empty initially so no option is pre-selected by default
  }, [customizationGroups]);

  // Load options when customization mode is activated
  useEffect(() => {
    if (isCustomizing && product) {
      loadCustomizationOptions();
    }
  }, [isCustomizing, product, loadCustomizationOptions]);

  // Debounced calculate live price when options change
  useEffect(() => {
    if (!isCustomizing || !product || Object.keys(selectedOptions).length === 0) return;

    setIsCalculatingPrice(true);
    const timer = setTimeout(async () => {
      try {
        const res = await customizationService.calculatePrice({
          productId: product.id,
          productSlug: product.slug,
          basePrice: product.basePrice,
          selectedOptions,
        });

        if (res.success && res.data) {
          setCalculatedPrice(res.data.totalPrice);
          setPriceBreakdown(
            res.data.optionAdjustments.map((a) => ({
              group: a.group,
              optionName: a.optionName,
              priceAdjustment: a.priceAdjustment,
            })),
          );
        }
      } catch (err) {
        console.error('Failed to calculate live price:', err);
      } finally {
        setIsCalculatingPrice(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedOptions, isCustomizing, product]);

  // Toggle in-page customization mode
  const handleToggleCustomizeMode = (enable: boolean) => {
    setIsCustomizing(enable);
    if (enable) {
      setCurrentStepIndex(0);
      setSearchParams({ customize: 'true' }, { replace: true });
      toast('info', 'In-Page Step-by-Step Bespoke Studio', 'Select options step-by-step to customize your garment.');
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  // Option Selection Handler (Toggle Select / Unselect)
  const handleSelectOption = (groupCode: string, optionCode: string) => {
    setSelectedOptions((prev) => {
      if (prev[groupCode] === optionCode) {
        const next = { ...prev };
        delete next[groupCode];
        return next;
      }
      return {
        ...prev,
        [groupCode]: optionCode,
      };
    });
  };

  // Step Wizard Navigation Handlers
  const handleNextStep = () => {
    if (currentStepIndex < customizationGroups.length) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Standard Add To Bag
  const handleAddToCart = async () => {
    if (!product || !product.inStock) return;
    try {
      const { useCartStore } = await import('../store/useCartStore');
      await useCartStore.getState().addItem({
        productId: product.id || (product as any)._id,
        quantity: 1,
      });
      toast('success', 'Added to Shopping Bag', `${product.name} added to your bag.`);
    } catch (err: any) {
      toast('error', 'Failed to Add Item', err.message || 'Could not add item to bag.');
    }
  };

  // Add Customized Suit To Bag
  const handleAddCustomSuitToBag = async () => {
    if (!product) return;
    try {
      const { useCartStore } = await import('../store/useCartStore');
      await useCartStore.getState().addItem({
        productId: product.id || (product as any)._id,
        quantity: 1,
        customization: {
          selectedOptions,
          basePrice: product.basePrice,
          totalPrice: calculatedPrice || product.basePrice,
        },
      });
      toast(
        'success',
        'Bespoke Suit Added to Bag',
        `Your custom ${product.name} with bespoke options was added to your bag.`,
      );
    } catch (err: any) {
      toast('error', 'Failed to Add Bespoke Suit', err.message || 'Could not add customized suit to bag.');
    }
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setIsNotified(true);
    toast('info', 'Stock Alert Registered', 'We will notify you immediately when back in stock.');
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-pulse">
        <div className="h-4 w-48 bg-charcoal-100 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-charcoal-100 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-6 w-32 bg-charcoal-100 rounded-full" />
            <div className="h-10 w-3/4 bg-charcoal-100 rounded" />
            <div className="h-8 w-1/3 bg-charcoal-100 rounded" />
            <div className="h-24 bg-charcoal-100 rounded-xl" />
            <div className="h-12 bg-charcoal-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Product Not Found State (404)
  if (isError || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <SEOHead
          title="Product Not Found"
          description="The requested bespoke garment could not be found in our catalog."
        />
        <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold font-serif text-charcoal-950">Garment Not Found</h1>
        <p className="text-charcoal-600 max-w-md mx-auto text-sm leading-relaxed">
          {error instanceof Error ? error.message : 'The suit or accessory you requested is no longer active in our catalog.'}
        </p>
        <div className="pt-4">
          <Link to="/collections">
            <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Explore Full Collection
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryName =
    typeof product.category === 'object' && product.category
      ? product.category.name
      : 'Custom Suiting';

  const fabrics: Fabric[] = (product.availableFabrics || []).filter(
    (f): f is Fabric => typeof f === 'object' && f !== null,
  );

  const primaryFabric = fabrics.length > 0 ? fabrics[0] : null;

  const COLOR_HEX_MAP: Record<string, string> = {
    black: '#121212',
    charcoal: '#2b2d31',
    navy: '#1b263b',
    blue: '#2563eb',
    tan: '#a8947d',
    brown: '#5c4033',
    grey: '#6b7280',
    gray: '#6b7280',
    beige: '#d1c7b7',
    white: '#ffffff',
    burgundy: '#800020',
    olive: '#556b2f',
    green: '#166534',
  };

  const colorList: Array<{ name: string; hex: string; image?: string; images?: string[] }> =
    product?.colors && product.colors.length > 0
      ? product.colors.map((c: any, i: number) => {
          if (typeof c === 'object' && c !== null) {
            const rawImgs = Array.isArray(c.images)
              ? c.images.filter((u: any) => typeof u === 'string' && u.trim())
              : [];
            return {
              name: c.name || `Color ${i + 1}`,
              hex: c.hex || COLOR_HEX_MAP[c.name?.toLowerCase()] || '#2b2d31',
              image: c.image || rawImgs[0] || '',
              images: rawImgs.length > 0 ? rawImgs : (c.image ? [c.image] : []),
            };
          }
          if (typeof c === 'string') {
            const isHex = c.startsWith('#');
            return {
              name: isHex ? `Color ${i + 1}` : c,
              hex: isHex ? c : COLOR_HEX_MAP[c.toLowerCase()] || '#2b2d31',
              image: '',
              images: [],
            };
          }
          return { name: `Color ${i + 1}`, hex: '#2b2d31', image: '', images: [] };
        })
      : [];

  const activeColorSwatch = colorList[selectedColorIndex];

  // Extract all photos associated with the chosen color variant
  const selectedColorPhotos: string[] =
    activeColorSwatch?.images && activeColorSwatch.images.length > 0
      ? activeColorSwatch.images
      : activeColorSwatch?.image
        ? [activeColorSwatch.image]
        : [];

  // When a color with specific photos is chosen, display ALL photos of that color in the gallery!
  const galleryImages =
    selectedColorPhotos.length > 0
      ? selectedColorPhotos
      : product?.images && product.images.length > 0
        ? product.images
        : [];

  const normalizedImages: string[] = (product.images || []).map((img) =>
    typeof img === 'string' ? img : img.url,
  );
  const primaryImage =
    normalizedImages.length > 0
      ? normalizedImages[0]
      : 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80';

  const displayedPrice = calculatedPrice || product.basePrice;

  // Total Steps Count (All Option Groups + 1 Final Review Step)
  const totalSteps = customizationGroups.length + 1;
  const isReviewStep = currentStepIndex === customizationGroups.length;
  const activeGroup = !isReviewStep ? customizationGroups[currentStepIndex] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* SEO & Structured Data */}
      <SEOHead
        title={isCustomizing ? `Customize ${product.name}` : product.name}
        description={product.description || `Custom tailored ${product.name} by Stitchx Plus LLC.`}
        ogImage={primaryImage}
        product={product}
        breadcrumbs={[
          { name: 'Home', url: 'https://stitchxplus.com/' },
          { name: 'Collections', url: 'https://stitchxplus.com/collections' },
          { name: categoryName, url: 'https://stitchxplus.com/collections' },
          { name: product.name, url: `https://stitchxplus.com/product/${product.slug}` },
        ]}
      />

      {/* Top Banner Notice when Customizing Mode is Active */}
      {isCustomizing && (
        <div className="bg-navy-950 text-white rounded-3xl p-5 border border-gold-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500 text-navy-950 flex items-center justify-center flex-shrink-0 font-bold font-serif text-lg shadow-md">
              <Sparkles className="w-5 h-5 fill-navy-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                  Step-by-Step Bespoke Studio
                </span>
                <span className="text-[10px] bg-gold-500/20 text-gold-300 border border-gold-500/30 px-2 py-0.5 rounded-full font-mono">
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
              </div>
              <h2 className="text-lg font-bold font-serif text-white">
                {isReviewStep ? 'Review Final Bespoke Outfit' : `Step ${currentStepIndex + 1}: Select ${activeGroup?.group}`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-navy-400 uppercase font-bold block">
                Live Total Price
              </span>
              <span className="text-xl font-bold font-serif text-gold-400">
                ${displayedPrice.toLocaleString()}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleCustomizeMode(false)}
              leftIcon={<X className="w-4 h-4" />}
              className="border-navy-700 text-navy-200 hover:bg-navy-900"
            >
              Exit Studio
            </Button>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider flex items-center gap-2 overflow-x-auto">
        <Link to="/" className="hover:text-bronze-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/collections" className="hover:text-bronze-600 transition-colors">
          Collections
        </Link>
        <span>/</span>
        <span className="text-charcoal-400">{categoryName}</span>
        <span>/</span>
        <span className="text-charcoal-950 truncate max-w-[200px]">{product.name}</span>
        {isCustomizing && (
          <>
            <span>/</span>
            <span className="text-gold-600 font-bold">Customizing Step {currentStepIndex + 1}</span>
          </>
        )}
      </nav>

      {/* Main Interactive Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Image Stage / Customized Preview / Compare Slider */}
        <div className="space-y-4 lg:sticky lg:top-24">
          {/* Mode Switcher Tabs (Shown when customizing) - Commented Out
          {isCustomizing && (
            <div className="flex items-center justify-between bg-navy-950 p-1.5 rounded-2xl border border-navy-800 shadow-md">
              <button
                type="button"
                onClick={() => setActivePreviewTab('compare')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activePreviewTab === 'compare'
                    ? 'bg-gold-500 text-navy-950 shadow-md'
                    : 'text-navy-300 hover:text-white hover:bg-navy-900'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>↔️ Compare Split View</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePreviewTab('preview')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activePreviewTab === 'preview'
                    ? 'bg-gold-500 text-navy-950 shadow-md'
                    : 'text-navy-300 hover:text-white hover:bg-navy-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ Custom Outfit</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePreviewTab('gallery')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activePreviewTab === 'gallery'
                    ? 'bg-gold-500 text-navy-950 shadow-md'
                    : 'text-navy-300 hover:text-white hover:bg-navy-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>📸 Standard Gallery</span>
              </button>
            </div>
          )}
          */}

          {/* Render Active Left View */}
          {/* COMPARE SLIDER MODE - Commented Out
          isCustomizing && activePreviewTab === 'compare' ? (
            <CompareSlider
              originalImage={primaryImage}
              customImage={primaryImage}
              productName={product.name}
              selectedOptions={selectedOptions}
              groups={customizationGroups}
            />
          ) :
          */}
          {/* LIVE CUSTOM PREVIEW MODE - Commented Out
          isCustomizing && activePreviewTab === 'preview' ? (
            <div className="relative aspect-[4/5] bg-navy-950 rounded-3xl overflow-hidden border-2 border-gold-500/40 shadow-2xl group">
              <img
                src={primaryImage}
                alt={`${product.name} Custom Outfit`}
                className="w-full h-full object-cover filter saturate-110 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-transparent pointer-events-none" />

              <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 pointer-events-none">
                {customizationGroups.map((grp) => {
                  const selectedCode = selectedOptions[grp.groupCode];
                  const opt = grp.options.find((o) => o.code === selectedCode);
                  if (!opt) return null;
                  return (
                    <div
                      key={grp.groupCode}
                      className="bg-navy-950/90 backdrop-blur-md border border-gold-500/30 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-gold-400" />
                      <span className="text-gold-300">{grp.group}:</span>
                      <span>{opt.name}</span>
                    </div>
                  );
                })}
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-navy-950/90 backdrop-blur-md border border-navy-800 p-3.5 rounded-2xl text-white space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Bespoke Customized Outfit
                  </span>
                  <span className="font-mono text-gold-300 font-bold">
                    ${displayedPrice.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-navy-300">
                  Reflecting all chosen swatches & options configured in step {currentStepIndex + 1}.
                </p>
              </div>
            </div>
          ) :
          */}
          {/* STANDARD GALLERY MODE */}
          <ProductImageGallery
            images={galleryImages}
            productName={product.name}
          />
        </div>

        {/* Right Column: Garment Specs OR In-Page Step-by-Step Customization Panel */}
        <div className="space-y-8">
          {/* Header & Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="navy">{categoryName}</Badge>
              {primaryFabric && <Badge variant="gold">{primaryFabric.name}</Badge>}
              {product.inStock ? (
                <Badge variant="success">In Stock</Badge>
              ) : (
                <Badge variant="danger">Out of Stock</Badge>
              )}
              {isCustomizing && <Badge variant="gold">Bespoke Studio Active</Badge>}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-charcoal-950 leading-tight">
              {product.name}
            </h1>

            {/* Price & Rating */}
            <div className="flex flex-wrap items-baseline gap-4 pt-1">
              <span className="text-3xl font-bold font-serif text-charcoal-950">
                ${displayedPrice.toLocaleString()}
              </span>
              {isCalculatingPrice && (
                <span className="text-xs text-bronze-600 animate-pulse font-sans font-semibold">
                  (updating price...)
                </span>
              )}
              {product.rating > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-charcoal-700 bg-cream-50 px-3 py-1 rounded-full border border-charcoal-200">
                  <Star className="w-4 h-4 text-bronze-500 fill-bronze-400" />
                  <span className="font-bold text-charcoal-950">{product.rating.toFixed(1)}</span>
                  <span>({product.numReviews} bespoke reviews)</span>
                </div>
              )}
            </div>
            <p className="text-xs text-charcoal-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-bronze-600" />
              Price includes digital 3D measurement scan, custom fitting, and expedited delivery.
            </p>
          </div>

          {/* IF CUSTOMIZING MODE IS ACTIVE: SHOW STEP-BY-STEP WIZARD (ONE GROUP AT A TIME) */}
          {isCustomizing ? (
            <div className="space-y-6 bg-white border border-charcoal-200/80 rounded-3xl p-6 sm:p-8 shadow-card animate-fadeIn">
              {/* Stepper Progress Bar Header */}
              <div className="space-y-3 border-b border-charcoal-200 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-bronze-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                      {currentStepIndex + 1}
                    </span>
                    <div>
                      <span className="text-[10px] text-bronze-700 font-bold uppercase tracking-wider block">
                        Step {currentStepIndex + 1} of {totalSteps}
                      </span>
                      <h3 className="text-base font-bold font-serif text-charcoal-950">
                        {isReviewStep ? 'Review & Final Summary' : activeGroup?.group}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOptions({});
                      toast('info', 'Options Reset', 'Cleared all selected choices.');
                    }}
                    className="text-xs text-charcoal-500 hover:text-bronze-600 flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>

                {/* Visual Step Pills Navigation (Clickable) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {customizationGroups.map((grp, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isActive = idx === currentStepIndex;
                    const selectedCode = selectedOptions[grp.groupCode];
                    const selectedOpt = grp.options.find((o) => o.code === selectedCode);

                    return (
                      <button
                        key={grp.groupCode}
                        type="button"
                        onClick={() => setCurrentStepIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                          isActive
                            ? 'bg-charcoal-950 text-white border-charcoal-950 shadow-sm'
                            : isCompleted
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-cream-50 text-charcoal-600 border-charcoal-200 hover:bg-cream-100'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-charcoal-200/60 text-charcoal-800 text-[10px] flex items-center justify-center font-mono font-bold">
                            {idx + 1}
                          </span>
                        )}
                        <span>{grp.group}</span>
                        {selectedOpt && !isActive && (
                          <span className="text-[10px] text-charcoal-400 font-normal truncate max-w-[70px]">
                            ({selectedOpt.name.split(' ')[0]})
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Final Review Step Pill */}
                  <button
                    type="button"
                    onClick={() => setCurrentStepIndex(customizationGroups.length)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                      isReviewStep
                        ? 'bg-gold-500 text-navy-950 border-gold-500 font-bold shadow-sm'
                        : 'bg-cream-50 text-charcoal-600 border-charcoal-200 hover:bg-cream-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold-600" />
                    <span>Summary</span>
                  </button>
                </div>
              </div>

              {/* Wizard Content: Renders ONLY the Active Group (One by One) */}
              {isLoadingCustomData ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-gold-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-charcoal-500 font-semibold">
                    Loading bespoke swatch options...
                  </p>
                </div>
              ) : !isReviewStep && activeGroup ? (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-charcoal-950">
                        Choose your preferred {activeGroup.group}
                      </h4>
                      <p className="text-xs text-charcoal-500 mt-0.5">
                        Selected option will update live on your customized garment preview.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-charcoal-600 bg-cream-100 px-3 py-1 rounded-full">
                      Selected:{' '}
                      <strong className="text-charcoal-950">
                        {activeGroup.options.find(
                          (o) => o.code === selectedOptions[activeGroup.groupCode],
                        )?.name || 'Not Selected'}
                      </strong>
                    </span>
                  </div>

                  {/* 2-Column Option Cards Grid with High Quality Swatch Images */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeGroup.options.map((opt) => {
                      const isSelected = selectedOptions[activeGroup.groupCode] === opt.code;
                      return (
                        <div
                          key={opt.code}
                          onClick={() => handleSelectOption(activeGroup.groupCode, opt.code)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 relative group ${
                            isSelected
                              ? 'bg-amber-50/50 border-bronze-500 shadow-md ring-2 ring-bronze-500/20'
                              : 'bg-white border-charcoal-200 hover:border-charcoal-400 hover:shadow-subtle'
                          }`}
                        >
                          {/* Image & Main Info */}
                          <div className="flex items-start gap-3">
                            {opt.image ? (
                              <div className="relative group/img flex-shrink-0">
                                <img
                                  src={opt.image}
                                  alt={opt.name}
                                  className="w-16 h-16 rounded-xl object-cover border border-charcoal-200 group-hover/img:scale-105 transition-transform shadow-sm cursor-zoom-in"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 rounded-xl transition-opacity flex items-center justify-center pointer-events-none">
                                  <ZoomIn className="w-4 h-4 text-white drop-shadow-md" />
                                </div>

                                {/* Floating Enlarged High-Res Hover Zoom Window */}
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden group-hover/img:flex flex-col items-center z-50 pointer-events-none animate-fadeIn">
                                  <div className="bg-navy-950 p-3 rounded-2xl border-2 border-gold-400/80 shadow-2xl space-y-2 w-64 text-white text-center">
                                    <img
                                      src={opt.image}
                                      alt={opt.name}
                                      className="w-full h-52 rounded-xl object-cover border border-navy-800 shadow-md"
                                    />
                                    <div className="space-y-1">
                                      <p className="text-xs font-bold font-serif text-gold-300">{opt.name}</p>
                                      {opt.description && (
                                        <p className="text-[11px] text-slate-300 leading-snug">
                                          {opt.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="w-3 h-3 bg-navy-950 rotate-45 border-r-2 border-b-2 border-gold-400/80 -mt-1.5" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-navy-950 text-gold-400 flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                                {activeGroup.group.substring(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1">
                                <h5 className="font-bold text-charcoal-950 text-sm leading-snug">
                                  {opt.name}
                                </h5>
                              </div>
                              {opt.description && (
                                <p className="text-[11px] text-charcoal-600 leading-tight">
                                  {opt.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Card Footer: Price Adjustment Badge & Select Radio */}
                          <div className="pt-2 border-t border-charcoal-100 flex items-center justify-between">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                opt.priceAdjustment > 0
                                  ? 'bg-bronze-100 text-bronze-900 border border-bronze-200'
                                  : 'bg-charcoal-100 text-charcoal-700'
                              }`}
                            >
                              {opt.priceAdjustment > 0
                                ? `+$${opt.priceAdjustment}`
                                : 'Included'}
                            </span>

                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-bronze-600 text-white shadow-sm'
                                  : 'border-2 border-charcoal-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Monogram Input if current step is Monogram / Optional */}
                  {activeGroup.groupCode.includes('monogram') && (
                    <div className="pt-4 border-t border-charcoal-200 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
                        Custom Initials Monogram (Optional)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. S.P."
                        value={monogramText}
                        onChange={(e) => setMonogramText(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 rounded-xl border border-charcoal-300 text-sm focus:outline-none focus:ring-2 focus:ring-bronze-500 font-mono tracking-widest uppercase"
                      />
                      <span className="text-[11px] text-charcoal-500 block">
                        Embroidered in gold metallic thread inside the jacket lining.
                      </span>
                    </div>
                  )}

                  {/* Step Navigation Controls (Previous / Next) */}
                  <div className="flex items-center justify-between pt-6 border-t border-charcoal-200 gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handlePrevStep}
                      disabled={currentStepIndex === 0}
                      leftIcon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Previous Step
                    </Button>

                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleNextStep}
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                      {currentStepIndex === customizationGroups.length - 1
                        ? 'Review Final Summary 🚀'
                        : `Next: ${customizationGroups[currentStepIndex + 1]?.group}`}
                    </Button>
                  </div>
                </div>
              ) : (
                /* FINAL STEP: BESPOKE OUTFIT SUMMARY & REVIEW */
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-4 bg-navy-950 text-white rounded-2xl space-y-1">
                    <h4 className="text-base font-bold font-serif text-gold-400 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 fill-gold-400" />
                      <span>Bespoke Custom Outfit Summary</span>
                    </h4>
                    <p className="text-xs text-navy-200">
                      Review all options selected before adding your customized garment to bag.
                    </p>
                  </div>

                  {/* Summary List of All Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customizationGroups.map((grp, idx) => {
                      const selectedCode = selectedOptions[grp.groupCode];
                      const selectedOpt = grp.options.find((o) => o.code === selectedCode);
                      return (
                        <div
                          key={grp.groupCode}
                          className="p-3 bg-cream-50 rounded-xl border border-charcoal-200 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5 truncate">
                            <span className="text-[10px] uppercase font-bold text-bronze-700 block">
                              {grp.group}
                            </span>
                            <span className="font-semibold text-charcoal-950 block truncate">
                              {selectedOpt?.name || 'Default'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setCurrentStepIndex(idx)}
                            className="p-1.5 text-charcoal-400 hover:text-bronze-600 transition-colors"
                            title={`Edit ${grp.group}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Price Calculation Box */}
                  <div className="p-4 bg-white border border-charcoal-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-charcoal-700">
                      <span>Base Suit Construction</span>
                      <span className="text-charcoal-950 font-bold">
                        ${product.basePrice.toLocaleString()}
                      </span>
                    </div>

                    {priceBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-charcoal-600">
                        <span>
                          {item.group}: {item.optionName}
                        </span>
                        <span className="font-semibold text-bronze-700">
                          +{item.priceAdjustment > 0 ? `$${item.priceAdjustment}` : 'Included'}
                        </span>
                      </div>
                    ))}

                    <div className="pt-3 border-t border-charcoal-200 flex items-center justify-between">
                      <span className="font-bold text-charcoal-950 text-sm font-serif">
                        Authoritative Calculated Price
                      </span>
                      <span className="font-bold text-2xl text-charcoal-950 font-serif">
                        ${displayedPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Final Review Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleAddCustomSuitToBag}
                      leftIcon={<ShoppingBag className="w-5 h-5 text-bronze-400" />}
                    >
                      Add Custom Suit to Bag
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handlePrevStep}
                      leftIcon={<ChevronLeft className="w-5 h-5" />}
                    >
                      Back to Options
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STANDARD Garment Specs & Purchase CTA Box */
            <>
              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                  Master Tailor Description
                </h3>
                {product.description && /<[a-z][\s\S]*>/i.test(product.description) ? (
                  <div
                    className="text-sm text-charcoal-800 leading-relaxed bg-cream-50/70 p-4 sm:p-5 rounded-2xl border border-charcoal-200/80 space-y-3 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_strong]:text-charcoal-950"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="text-sm text-charcoal-800 leading-relaxed bg-cream-50/70 p-4 sm:p-5 rounded-2xl border border-charcoal-200/80">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Style Attributes Chips */}
              {(product.colors?.length || product.tags?.length || primaryFabric) && (
                <div className="space-y-3 border-t border-charcoal-200/80 pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                    Garment Attributes
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {primaryFabric && (
                      <div className="p-3 bg-white border border-charcoal-200 rounded-xl space-y-1 shadow-subtle">
                        <span className="text-charcoal-400 block text-[10px] uppercase font-bold">
                          Fabric Origin
                        </span>
                        <span className="font-semibold text-charcoal-950 block truncate">
                          {primaryFabric.composition}
                        </span>
                      </div>
                    )}
                    {product.colors && product.colors.length > 0 && (
                      <div className="p-3 bg-white border border-charcoal-200 rounded-xl space-y-1 shadow-subtle">
                        <span className="text-charcoal-400 block text-[10px] uppercase font-bold">
                          Color Palette
                        </span>
                        <span className="font-semibold text-charcoal-950 block capitalize truncate">
                          {product.colors.join(', ')}
                        </span>
                      </div>
                    )}
                    <div className="p-3 bg-white border border-charcoal-200 rounded-xl space-y-1 shadow-subtle">
                      <span className="text-charcoal-400 block text-[10px] uppercase font-bold">
                        SKU Reference
                      </span>
                      <span className="font-mono text-charcoal-950 font-medium block truncate">
                        {product.sku}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Box: Size Selection & CTAs */}
              <div className="space-y-5 p-6 bg-white border border-charcoal-200/80 rounded-3xl shadow-card">
                {/* Available Color Selector */}
                {colorList.length > 0 && (
                  <div className="space-y-2.5 pb-2 border-b border-charcoal-100">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-charcoal-700">
                      <span>Available Colors</span>
                      <span className="text-bronze-700 font-bold capitalize font-serif text-sm">
                        {activeColorSwatch?.name}
                      </span>
                    </div>
                    <div className="flex items-center flex-wrap gap-2.5">
                      {colorList.map((col, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedColorIndex(idx)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 transition-all cursor-pointer ${
                            selectedColorIndex === idx
                              ? 'border-navy-950 bg-navy-950 text-white shadow-md scale-[1.02]'
                              : 'border-charcoal-200 hover:border-charcoal-400 bg-cream-50/50 text-charcoal-900'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/20 shadow-xs flex-shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className="text-xs font-bold capitalize">{col.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.inStock ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
                        Size & Fit Profile
                      </label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-bronze-500 bg-white"
                      >
                        <option value="custom">Use My Digital Fit Profile (Recommended)</option>
                        <option value="38r">38 Regular (US/UK)</option>
                        <option value="40r">40 Regular (US/UK)</option>
                        <option value="42r">42 Regular (US/UK)</option>
                        <option value="44r">44 Regular (US/UK)</option>
                        <option value="46r">46 Regular (US/UK)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <Button
                        variant="accent"
                        size="lg"
                        onClick={handleAddToCart}
                        leftIcon={<ShoppingBag className="w-5 h-5" />}
                      >
                        Add to Bag
                      </Button>

                      {/* Customize Button opens In-Page Step-by-Step Customization Mode */}
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => handleToggleCustomizeMode(true)}
                        leftIcon={<Sparkles className="w-5 h-5 text-bronze-400" />}
                      >
                        Customize This Suit
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Out of Stock State */
                  <div className="space-y-4 pt-1">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block">Currently Unavailable in Stock</strong>
                        This garment fabric is currently in weave production in Italy. Register below to be notified when available.
                      </div>
                    </div>

                    {!isNotified ? (
                      <form onSubmit={handleNotifySubmit} className="space-y-3">
                        <label className="text-xs font-semibold text-charcoal-700 block">
                          Notify Me When Back in Stock
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            required
                            placeholder="Enter your email"
                            value={notifyEmail}
                            onChange={(e) => setNotifyEmail(e.target.value)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-bronze-500"
                          />
                          <Button variant="primary" type="submit" leftIcon={<Bell className="w-4 h-4" />}>
                            Notify Me
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Alert registered for {notifyEmail}. We will email you once restocked.</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        variant="accent"
                        size="lg"
                        fullWidth
                        onClick={() => handleToggleCustomizeMode(true)}
                        leftIcon={<Scissors className="w-5 h-5" />}
                      >
                        Customize from Raw Fabric Studio
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping & Returns Accordion */}
              <ShippingReturnInfo />
            </>
          )}
        </div>
      </div>

      {/* Tabs Detail Spec Section */}
      <div className="bg-white border border-charcoal-200/80 rounded-3xl p-6 sm:p-8 shadow-card">
        <Tabs
          items={[
            {
              id: 'specs',
              label: 'Garment Construction',
              content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs sm:text-sm text-charcoal-700">
                  <div className="space-y-1.5">
                    <p className="font-bold text-charcoal-950 uppercase text-[11px] tracking-wider text-bronze-700">
                      Canvas Construction
                    </p>
                    <p>Full Floating Canvas Construction with hand-stitched horsehair chest piece for ergonomic drape.</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-bold text-charcoal-950 uppercase text-[11px] tracking-wider text-bronze-700">
                      Linings & Trims
                    </p>
                    <p>100% Breathable Cupro Bemberg lining with hand-sewn pick stitching along lapels and pockets.</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-bold text-charcoal-950 uppercase text-[11px] tracking-wider text-bronze-700">
                      Buttons & Hardware
                    </p>
                    <p>Authentic Australian Mother-of-Pearl or natural Buffalo Horn buttons with cross-stitched thread anchor.</p>
                  </div>
                </div>
              ),
            },
            {
              id: 'care',
              label: 'Care & Maintenance',
              content: (
                <div className="pt-4 text-xs sm:text-sm text-charcoal-600 space-y-2">
                  <p className="font-semibold text-charcoal-950">Professional Dry Clean Only</p>
                  <p>
                    Hang on wide-shoulder cedar hangers between wearings. Steam gently to remove wrinkles; avoid pressing direct iron heat on virgin wool fibers.
                  </p>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Related Products Carousel */}
      <RelatedProductsSection currentProductIdOrSlug={product.id || product.slug} />
    </div>
  );
}
