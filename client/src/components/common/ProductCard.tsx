import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Sparkles, Eye, ShoppingBag, Star, Heart, Check } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useToast } from '../ui';

export interface ProductCardProps {
  product: {
    _id?: string;
    id?: string;
    name: string;
    slug?: string;
    basePrice: number;
    compareAtPrice?: number;
    currency?: string;
    images?: Array<string | { url: string; altText?: string; isPrimary?: boolean }>;
    isCustomizable?: boolean;
    isFeatured?: boolean;
    isNew?: boolean;
    isOnSale?: boolean;
    isSale?: boolean;
    isTrend?: boolean;
    tickerText?: string;
    countdownTimer?: string;
    inStock?: boolean;
    category?: any;
    shortDescription?: string;
    colors?: Array<{ name: string; hex: string; image?: string } | string>;
    rating?: number;
  };
  onWishlistToggle?: (productId: string) => void;
  isWishlisted?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onWishlistToggle,
  isWishlisted = false,
  className = '',
}) => {
  const { toast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const productId = product._id || product.id || '';
  const productSlug = product.slug || productId;

  // Extract primary image and hover (secondary) image
  const rawImages = product.images || [];
  const primaryImgObj = rawImages.find((img) => typeof img === 'object' && img.isPrimary) || rawImages[0];
  const primaryUrl = typeof primaryImgObj === 'string'
    ? primaryImgObj
    : primaryImgObj?.url || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80';
  
  const secondaryImgObj = rawImages.length > 1 ? rawImages[1] : null;
  const secondaryUrl = secondaryImgObj
    ? typeof secondaryImgObj === 'string'
      ? secondaryImgObj
      : secondaryImgObj?.url
    : null;

  // Price calculations
  const comparePrice = product.compareAtPrice || (product.basePrice * 1.25);
  const hasDiscount = Boolean(product.isOnSale || product.isSale || (product.compareAtPrice && product.compareAtPrice > product.basePrice));
  const discountPercent = hasDiscount && comparePrice > product.basePrice
    ? Math.round(((comparePrice - product.basePrice) / comparePrice) * 100)
    : 20;

  const currencySymbol = product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : '$';

  // Parse color swatches mapping
  const colorList: Array<{ name: string; hex: string; image?: string }> = (
    product.colors && product.colors.length > 0
      ? product.colors
      : [
          { name: 'Khaki', hex: '#8c7b6c' },
          { name: 'Navy', hex: '#1c2536' },
          { name: 'White', hex: '#ffffff' },
        ]
  ).map((c, i) =>
    typeof c === 'string'
      ? {
          name: c,
          hex: c.startsWith('#')
            ? c
            : i === 0
            ? '#1c2536'
            : i === 1
            ? '#8c7b6c'
            : i === 2
            ? '#ffffff'
            : '#4a5568',
        }
      : c,
  );

  const [activeColorIndex, setActiveColorIndex] = useState(0);

  // Active image based on selected color swatch (if swatch has an image or images array has matching index)
  const activeSwatch = colorList[activeColorIndex];
  const colorSpecificImage = activeSwatch?.image || (rawImages[activeColorIndex] ? (typeof rawImages[activeColorIndex] === 'string' ? (rawImages[activeColorIndex] as string) : (rawImages[activeColorIndex] as any)?.url) : null);
  const displayedPrimaryUrl = colorSpecificImage || primaryUrl;

  // Determine badge flags
  const showNew = product.isNew ?? true;
  const showSale = hasDiscount;
  const showTrend = product.isTrend ?? (product.name.length % 2 === 0);

  // Quick Add To Cart Handler
  const handleQuickAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) {
      toast('error', 'Error', 'Product ID not available');
      return;
    }

    try {
      setAddingToCart(true);
      await addItem({
        productId,
        quantity: 1,
      });
      setAddedSuccess(true);
      toast('success', 'Added to Shopping Bag', `${product.name} added to your cart.`);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err: any) {
      toast('error', 'Failed to Add', err?.message || 'Could not add item to bag.');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-subtle hover:shadow-card transition-all duration-300 ${className}`}>
      {/* Off-White Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f4f4f4] rounded-2xl p-3 flex items-center justify-center">
        <RouterLink to={`/products/${productSlug}`} className="block w-full h-full relative">
          {/* Main Displayed Image */}
          <img
            src={displayedPrimaryUrl}
            alt={product.name}
            className={`w-full h-full object-contain mix-blend-multiply transition-all duration-500 ease-out group-hover:scale-105 ${
              secondaryUrl && !colorSpecificImage ? 'group-hover:opacity-0' : ''
            }`}
          />
          {/* Secondary Hover Image (if present and no color swatch override) */}
          {secondaryUrl && !colorSpecificImage && (
            <img
              src={secondaryUrl}
              alt={`${product.name} alternate view`}
              className="absolute inset-0 w-full h-full object-contain mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out group-hover:scale-105"
            />
          )}
        </RouterLink>

        {/* Top Badges (Pills) */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
          {showSale && (
            <span className="bg-[#ff3b30] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              SALE -{discountPercent}%
            </span>
          )}
          {showNew && (
            <span className="bg-[#4caf50] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              NEW
            </span>
          )}
          {showTrend && (
            <span className="bg-[#ff9500] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              TREND
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        {onWishlistToggle && (
          <button
            type="button"
            onClick={() => onWishlistToggle(productId)}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-full shadow-subtle text-charcoal-700 hover:text-rose-500 hover:scale-110 transition-all z-10"
            aria-label="Save to wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        )}

        {/* Bottom Ticker Pill */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-10 pointer-events-none">
          {product.countdownTimer ? (
            <div className="flex items-center justify-center">
              <span className="bg-white text-red-500 border border-red-200 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wide">
                {product.countdownTimer}
              </span>
            </div>
          ) : product.tickerText ? (
            <div className="bg-black text-white text-[10px] font-extrabold py-1 px-3 rounded-full overflow-hidden whitespace-nowrap opacity-95 flex items-center justify-center gap-2">
              <span className="truncate">{product.tickerText}</span>
            </div>
          ) : (
            showSale && (
              <div className="bg-black text-white text-[9px] font-extrabold py-1 px-3 rounded-full overflow-hidden whitespace-nowrap opacity-95 flex items-center justify-center gap-1 uppercase tracking-wider">
                <span>✦ LIMITED TIME SALE - SAVE {discountPercent}% ✦</span>
              </div>
            )
          )}
        </div>

        {/* Quick Action Hover Overlay */}
        <div className="absolute inset-x-3 bottom-12 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex gap-2 z-20">
          <button
            type="button"
            onClick={handleQuickAddToCart}
            disabled={addingToCart}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all ${
              addedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-black hover:bg-neutral-800 text-white'
            }`}
          >
            {addingToCart ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : addedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add To Cart
              </>
            )}
          </button>

          {product.isCustomizable && (
            <RouterLink
              to={`/product/${productSlug}?customize=true`}
              className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md flex items-center justify-center transition-colors"
              title="3D Bespoke Customization"
            >
              <Sparkles className="w-4 h-4 fill-white" />
            </RouterLink>
          )}

          <RouterLink
            to={`/product/${productSlug}`}
            className="p-2 bg-white hover:bg-neutral-100 text-charcoal-800 rounded-xl shadow-md flex items-center justify-center transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </RouterLink>
        </div>
      </div>

      {/* Content Meta Below Image */}
      <div className="pt-3 pb-2 px-2 flex flex-col gap-1.5">
        {/* Title */}
        <RouterLink to={`/product/${productSlug}`} className="block">
          <h3 className="text-sm font-medium text-neutral-900 hover:text-red-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </RouterLink>

        {/* 5-Star Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-[11px] text-neutral-400 font-semibold">
            ({product.rating ? product.rating.toFixed(1) : '5.0'})
          </span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-bold text-[#d9381e]">
            {currencySymbol}{product.basePrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">
              {currencySymbol}{comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Color Swatches */}
        <div className="flex items-center gap-1.5 pt-1">
          {colorList.map((color, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveColorIndex(idx);
              }}
              onMouseEnter={() => setActiveColorIndex(idx)}
              className={`w-4 h-4 rounded-full transition-all relative ${
                color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#fff'
                  ? 'border border-gray-300'
                  : ''
              } ${
                activeColorIndex === idx
                  ? 'ring-2 ring-black ring-offset-1 scale-110 shadow-xs z-10'
                  : 'hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: color.hex }}
              title={`${color.name}${color.image ? ' (Click to view image)' : ''}`}
            />
          ))}
          {colorList.length > 0 && (
            <span className="text-[10px] text-neutral-500 font-medium ml-1">
              {colorList[activeColorIndex]?.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


