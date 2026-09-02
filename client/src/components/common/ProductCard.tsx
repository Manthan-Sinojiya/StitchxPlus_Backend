import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Eye, Star, Heart, Plus, Minus, Sparkles, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useToast, Modal } from '../ui';


export interface ProductCardProps {
  product: {
    _id?: string;
    id?: string;
    name: string;
    slug?: string;
    basePrice: number;
    compareAtPrice?: number;
    currency?: string;
    images?: Array<string | { url: string; altText?: string; isPrimary?: boolean; isHover?: boolean }>;
    isCustomizable?: boolean;
    isFeatured?: boolean;
    isNew?: boolean;
    isOnSale?: boolean;
    isSale?: boolean;
    isDeal?: boolean;
    isTrend?: boolean;
    tickerText?: string;
    countdownTimer?: string;
    inStock?: boolean;
    category?: any;
    shortDescription?: string;
    colors?: Array<{ name: string; hex: string; image?: string } | string>;
    rating?: number;
    fabricComposition?: string;
  };
  onWishlistToggle?: (productId: string) => void;
  isWishlisted?: boolean;
  className?: string;
}

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

function parseColors(colors?: any[]): Array<{ name: string; hex: string; image?: string; images?: string[] }> {
  if (!colors || !Array.isArray(colors) || colors.length === 0) {
    return [];
  }

  return colors.map((c, i) => {
    if (typeof c === 'object' && c !== null) {
      const rawImgs = Array.isArray(c.images) ? c.images.filter((u: any) => typeof u === 'string' && u.trim()) : [];
      return {
        name: c.name || `Color ${i + 1}`,
        hex: c.hex || COLOR_HEX_MAP[c.name?.toLowerCase()] || '#2b2d31',
        image: c.image || rawImgs[0] || '',
        images: rawImgs.length > 0 ? rawImgs : (c.image ? [c.image] : []),
      };
    }
    if (typeof c === 'string') {
      const isHex = c.startsWith('#');
      const name = isHex ? `Color ${i + 1}` : c;
      const hex = isHex ? c : COLOR_HEX_MAP[c.toLowerCase()] || '#2b2d31';
      return { name, hex, image: '', images: [] };
    }
    return { name: `Color ${i + 1}`, hex: '#2b2d31', image: '', images: [] };
  });
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onWishlistToggle,
  isWishlisted = false,
  className = '',
}) => {
  const { toast } = useToast();
  const cart = useCartStore((state) => state.cart);
  const addItem = useCartStore((state) => state.addItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const openCart = useCartStore((state) => state.openCart);

  const [addingToCart, setAddingToCart] = useState(false);
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [localWishlisted, setLocalWishlisted] = useState(isWishlisted);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('40R');
  const [quickViewImageIdx, setQuickViewImageIdx] = useState(0);

  const productId = String(product._id || product.id || '');
  const productSlug = product.slug || productId;
  const targetUrl = `/products/${productSlug}`;

  // Find if current product is already in shopping bag
  const cartItem = cart?.items?.find((item: any) => {
    if (!item) return false;
    const itemProd = item.product;
    const itemProdId = typeof itemProd === 'object' && itemProd !== null
      ? (itemProd._id || itemProd.id)
      : itemProd;
    return String(itemProdId || '') === productId;
  });

  const cartQuantity = cartItem?.quantity || 0;
  const cartItemId = (cartItem as any)?._id?.toString() || (cartItem as any)?.id?.toString();

  // Extract primary image and secondary hover image
  const rawImages = product.images || [];
  const primaryImgObj = rawImages.find((img) => typeof img === 'object' && img.isPrimary) || rawImages[0];
  const primaryUrl = typeof primaryImgObj === 'string'
    ? primaryImgObj
    : primaryImgObj?.url || '';

  const secondaryImgObj =
    rawImages.find((img) => typeof img === 'object' && img.isHover) ||
    (rawImages.length > 1 ? rawImages[1] : null);
  const secondaryUrl = secondaryImgObj
    ? typeof secondaryImgObj === 'string'
      ? secondaryImgObj
      : secondaryImgObj?.url
    : null;

  // Colors array parsing
  const colorList = parseColors(product.colors);
  const activeSwatch = colorList[activeColorIndex];

  const colorSpecificImage = activeSwatch?.image || activeSwatch?.images?.[0] || (
    rawImages[activeColorIndex]
      ? (typeof rawImages[activeColorIndex] === 'string'
          ? (rawImages[activeColorIndex] as string)
          : (rawImages[activeColorIndex] as any)?.url)
      : null
  );

  // Price calculations
  const comparePrice = product.compareAtPrice || (product.basePrice * 1.25);
  const hasDiscount = Boolean(product.isOnSale || product.isSale || (product.compareAtPrice && product.compareAtPrice > product.basePrice));
  const discountPercent = hasDiscount && comparePrice > product.basePrice
    ? Math.round(((comparePrice - product.basePrice) / comparePrice) * 100)
    : 25;

  const currencySymbol = product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : '$';
  const showSale = hasDiscount;

  // Handlers
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalWishlisted(!localWishlisted);
    if (onWishlistToggle) {
      onWishlistToggle(productId);
    } else {
      toast('info', localWishlisted ? 'Removed from Wishlist' : 'Saved to Wishlist', product.name);
    }
  };

  const handleQuickAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) {
      toast('error', 'Error', 'Product ID not available');
      return;
    }

    try {
      setAddingToCart(true);
      await addItem({ productId, quantity: 1 });
      toast('success', 'Added to Cart', `${product.name} added to bag.`, {
        label: 'View Bag',
        onClick: openCart,
      });
    } catch (err: any) {
      toast('error', 'Failed to Add', err?.message || 'Could not add item to bag.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAddingToCart(true);
      if (cartItemId) {
        await updateItem(cartItemId, cartQuantity + 1);
      } else {
        await addItem({ productId, quantity: 1 });
      }
    } catch (err: any) {
      toast('error', 'Update Failed', err?.message || 'Could not update quantity.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAddingToCart(true);
      if (cartQuantity > 1 && cartItemId) {
        await updateItem(cartItemId, cartQuantity - 1);
      } else if (cartItemId) {
        await removeItem(cartItemId);
        toast('info', 'Removed', `${product.name} removed from cart.`);
      }
    } catch (err: any) {
      toast('error', 'Update Failed', err?.message || 'Could not update quantity.');
    } finally {
      setAddingToCart(false);
    }
  };

  const fallbackImages = [
    '/images/hero/suit1.jpg',
    '/images/hero/suit2.jpg',
    '/images/hero/suit3.jpg',
  ];
  const defaultFallbackIndex = Math.abs(
    (product.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % fallbackImages.length;
  const fallbackImgUrl = fallbackImages[defaultFallbackIndex];

  const displayedPrimaryUrl = (!imgError && colorSpecificImage) || (!imgError && primaryUrl) ? (colorSpecificImage || primaryUrl) : fallbackImgUrl;

  const allProductImgUrls = rawImages.map((img) => typeof img === 'string' ? img : img.url).filter(Boolean);
  const galleryList = allProductImgUrls.length > 0 ? allProductImgUrls : [displayedPrimaryUrl, fallbackImages[0], fallbackImages[1]];

  const isCustomizable = product.isCustomizable === true;

  return (
    <div className={`group relative flex flex-col font-sans transition-all duration-500 ${className}`}>
      {/* 3D Depth Card Container */}
      <div className="relative aspect-[3/4] w-full rounded-[28px] bg-gradient-to-b from-[#f6f7fa] to-[#e9ecf2] overflow-hidden p-3.5 sm:p-4 flex flex-col justify-between border border-slate-200/90 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.06),0_4px_10px_-4px_rgba(0,0,0,0.04)] group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2),0_10px_20px_-5px_rgba(0,0,0,0.12)] group-hover:-translate-y-2 transform-gpu transition-all duration-500 ease-out">
        {/* Subtle 3D Glass Light Sheen Sweep Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-15" />

        {/* Top Floating Overlay Row */}
        <div className="flex items-start justify-between w-full z-20 pointer-events-none">
          {/* Top Left Discount Badge */}
          {showSale ? (
            <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md shadow-rose-500/20 backdrop-blur-md border border-white/20 tracking-tight pointer-events-auto flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              -{discountPercent}%
            </span>
          ) : product.isNew ? (
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[11px] font-bold px-3 py-1 rounded-full shadow-md shadow-amber-500/20 backdrop-blur-md border border-white/20 tracking-tight pointer-events-auto">
              NEW
            </span>
          ) : (
            <div />
          )}

          {/* Top Right Floating Circular 3D Glass Actions */}
          <div className="flex flex-col gap-2.5 z-30 pointer-events-auto transition-all duration-300 transform sm:opacity-0 sm:group-hover:opacity-100 opacity-100 sm:translate-x-2 sm:group-hover:translate-x-0">
            {/* Wishlist Heart */}
            <button
              type="button"
              onClick={handleWishlistClick}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-xl border border-white shadow-md hover:shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center text-slate-700 hover:text-rose-500 transition-all cursor-pointer"
              title="Save to Wishlist"
            >
              <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${localWishlisted ? 'fill-rose-500 text-rose-500' : 'stroke-[2.2]'}`} />
            </button>

            {/* Customize Studio (ONLY SHOWN IF CUSTOMIZATION IS ENABLED BY ADMIN) */}
            {isCustomizable && (
              <RouterLink
                to={`${targetUrl}?customize=true`}
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-xl border border-white shadow-md hover:shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center text-amber-600 hover:text-amber-500 transition-all cursor-pointer"
                title="Customize Studio 3D"
              >
                <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
              </RouterLink>
            )}

            {/* Quick View Eye Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-xl border border-white shadow-md hover:shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center text-slate-700 hover:text-amber-700 transition-all cursor-pointer"
              title="Quick View Modal"
            >
              <Eye className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Center Product Image Link */}
        <RouterLink to={targetUrl} className="absolute inset-0 block w-full h-full z-10 overflow-hidden">
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={displayedPrimaryUrl}
              alt={product.name}
              className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-108 ${
                secondaryUrl && !colorSpecificImage ? 'group-hover:opacity-0' : ''
              }`}
              onError={() => setImgError(true)}
            />
            {secondaryUrl && !colorSpecificImage && (
              <img
                src={secondaryUrl}
                alt={`${product.name} alternate view`}
                className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-108"
              />
            )}
            {/* Subtle bottom shadow vignette for depth */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </RouterLink>

        {/* Bottom Floating 3D Add to Cart Button Container */}
        <div className="w-full z-20 pt-2 transition-all duration-300 transform sm:opacity-95 opacity-100 sm:translate-y-1 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          {cartQuantity > 0 ? (
            <div className="w-full bg-slate-950 text-white rounded-full py-2.5 px-4 shadow-xl flex items-center justify-between border border-slate-800/80 backdrop-blur-md">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={addingToCart}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-xs"
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span className="text-xs font-bold tracking-wide px-2 text-amber-400">
                {addingToCart ? 'Updating...' : `${cartQuantity} in Bag`}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={addingToCart}
                className="w-7 h-7 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center font-bold transition-transform active:scale-90 cursor-pointer shadow-xs"
                title="Increase"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickAddToCart}
              disabled={addingToCart}
              className="w-full py-3.5 px-6 rounded-full bg-white/95 backdrop-blur-md text-slate-950 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl hover:bg-slate-950 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-white/80 active:scale-[0.98] transform-gpu"
            >
              {addingToCart ? (
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                'Add to Cart'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Bottom Product Meta Details */}
      <div className="pt-3 px-1 flex flex-col gap-1.5">
        {/* Category Tag */}
        {product.category && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 font-mono">
            {typeof product.category === 'object' ? product.category.name : String(product.category)}
          </span>
        )}

        {/* Product Title */}
        <RouterLink to={targetUrl} className="block group/title">
          <h3 className="text-sm sm:text-base font-bold font-serif text-slate-900 line-clamp-1 group-hover/title:text-amber-700 transition-colors">
            {product.name}
          </h3>
        </RouterLink>

        {/* Rating Stars Row */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-500 font-sans">
            {product.rating || '4.9'}
          </span>
        </div>

        {/* Price Row (Sale Price in Red, Original Price Strikethrough) */}
        <div className="flex items-center gap-2.5 mt-0.5">
          <span className="text-base sm:text-lg font-bold text-[#e53935] tracking-tight">
            {currencySymbol}{product.basePrice.toFixed(2).replace('.', ',')}
          </span>
          {hasDiscount && (
            <span className="text-xs sm:text-sm text-slate-400 line-through font-normal">
              {currencySymbol}{comparePrice.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>

        {/* Color Swatches */}
        {colorList.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {colorList.slice(0, 5).map((color, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveColorIndex(idx);
                  setImgError(false);
                }}
                onMouseEnter={() => {
                  setActiveColorIndex(idx);
                  setImgError(false);
                }}
                className={`w-4 h-4 rounded-full transition-all relative cursor-pointer shadow-xs ${
                  color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#fff'
                    ? 'border border-gray-300'
                    : ''
                } ${
                  activeColorIndex === idx
                    ? 'ring-2 ring-amber-600 ring-offset-2 scale-110 shadow-sm z-10'
                    : 'hover:scale-110 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {colorList.length > 5 && (
              <span className="text-[10px] text-slate-400 font-semibold">
                +{colorList.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Inline Quick View Modal */}
      <Modal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        maxWidth="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left Column: Gallery Slider */}
          <div className="space-y-3">
            <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs relative">
              <img
                src={galleryList[quickViewImageIdx] || displayedPrimaryUrl}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                Quick Inspection
              </div>
            </div>
            {/* Gallery Thumbnails */}
            {galleryList.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {galleryList.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuickViewImageIdx(idx)}
                    className={`w-14 h-18 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      quickViewImageIdx === idx ? 'border-amber-600 ring-2 ring-amber-600/30 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Breakdown & Instant Actions */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700 font-mono">
                {typeof product.category === 'object' ? product.category.name : product.category || 'Atelier Collection'}
              </span>
              <h2 className="text-2xl font-serif font-bold text-slate-950 mt-1">{product.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-600">{product.rating || '4.9'} (128 Reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-slate-950">
                {currencySymbol}{product.basePrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-base text-slate-400 line-through">
                  {currencySymbol}{comparePrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Fabric Composition & Fit */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Fabric & Tailoring Specifications
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {product.fabricComposition || 'Crafted from 100% Super 150s Italian Merino Wool sourced from heritage Biella mills. Tailored silhouette with anatomical shoulder canvas.'}
              </p>
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">Select Jacket Size:</label>
              <div className="flex items-center gap-2">
                {['38R', '40R', '42R', '44R', '46R'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedSize === size
                        ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={async (e) => {
                  await handleQuickAddToCart(e);
                  setIsQuickViewOpen(false);
                }}
                disabled={addingToCart}
                className="w-full py-3.5 px-6 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{addingToCart ? 'Adding to Bag...' : 'Add to Shopping Bag'}</span>
              </button>

              <RouterLink
                to={targetUrl}
                onClick={() => setIsQuickViewOpen(false)}
                className="w-full py-3 px-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center block transition-colors cursor-pointer"
              >
                {isCustomizable ? 'View Complete Product Details & 3D Customizer →' : 'View Complete Details →'}
              </RouterLink>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};


