import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Sparkles, Eye, ShoppingBag, Star, Heart, Plus, Minus, Camera } from 'lucide-react';
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
    isDeal?: boolean;
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

  const [addingToCart, setAddingToCart] = useState(false);
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

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

  const secondaryImgObj = rawImages.length > 1 ? rawImages[1] : null;
  const secondaryUrl = secondaryImgObj
    ? typeof secondaryImgObj === 'string'
      ? secondaryImgObj
      : secondaryImgObj?.url
    : null;

  // Colors array parsing (returns [] if product has no colors)
  const colorList = parseColors(product.colors);
  const activeSwatch = colorList[activeColorIndex];

  // Specific image for selected color swatch
  const colorSpecificImage = activeSwatch?.image || activeSwatch?.images?.[0] || (
    rawImages[activeColorIndex]
      ? (typeof rawImages[activeColorIndex] === 'string'
          ? (rawImages[activeColorIndex] as string)
          : (rawImages[activeColorIndex] as any)?.url)
      : null
  );

  const displayedPrimaryUrl = colorSpecificImage || primaryUrl;
  const isImageMissing = imgError || !displayedPrimaryUrl;

  // Price calculations
  const comparePrice = product.compareAtPrice || (product.basePrice * 1.25);
  const hasDiscount = Boolean(product.isOnSale || product.isSale || (product.compareAtPrice && product.compareAtPrice > product.basePrice));
  const discountPercent = hasDiscount && comparePrice > product.basePrice
    ? Math.round(((comparePrice - product.basePrice) / comparePrice) * 100)
    : 15;

  const currencySymbol = product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : '$';
  const showSale = hasDiscount;

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
      toast('success', 'Added to Shopping Bag', `${product.name} added to cart.`);
    } catch (err: any) {
      toast('error', 'Failed to Add', err?.message || 'Could not add item to bag.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Increment Quantity (+)
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

  // Decrement Quantity (-)
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

  return (
    <div className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${className}`}>
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f7f7f7] flex items-center justify-center">
        <RouterLink to={targetUrl} className="block w-full h-full relative overflow-hidden">
          {isImageMissing ? (
            /* Image Coming Soon Placeholder Stage */
            <div className="w-full h-full bg-[#181a20] flex flex-col items-center justify-center p-6 text-center text-white space-y-2 select-none">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 border border-white/10 shadow-md">
                <Camera className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Image Coming Soon
              </span>
              {activeSwatch && (
                <span className="text-[11px] text-neutral-400">
                  Color: <strong className="text-white capitalize">{activeSwatch.name}</strong>
                </span>
              )}
            </div>
          ) : (
            <>
              {/* Primary Image */}
              <img
                src={displayedPrimaryUrl}
                alt={product.name}
                className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 ${
                  secondaryUrl && !colorSpecificImage ? 'group-hover:opacity-0' : ''
                }`}
                onError={() => setImgError(true)}
              />
              {/* Secondary Hover Image */}
              {secondaryUrl && !colorSpecificImage && (
                <img
                  src={secondaryUrl}
                  alt={`${product.name} alternate view`}
                  className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105"
                />
              )}
            </>
          )}
        </RouterLink>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1 z-10 pointer-events-none">
          {showSale && (
            <span className="bg-navy-950/90 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider backdrop-blur-xs shadow-xs border border-gold-500/20">
              SAVE {discountPercent}%
            </span>
          )}
          {product.isDeal && (
            <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs backdrop-blur-xs">
              Special Deal
            </span>
          )}
          {product.isCustomizable !== false && (
            <span className="bg-white/90 text-navy-900 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs backdrop-blur-xs border border-neutral-200">
              Bespoke
            </span>
          )}
        </div>

        {/* Top Right Buttons: Wishlist & In-Cart Quantity Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {cartQuantity > 0 && (
            <span className="bg-amber-500 text-navy-950 text-xs font-black px-2.5 py-1 rounded-full shadow-md backdrop-blur-md flex items-center gap-1 border border-amber-400">
              <ShoppingBag className="w-3 h-3 fill-navy-950" /> {cartQuantity}
            </span>
          )}
          {onWishlistToggle && (
            <button
              type="button"
              onClick={() => onWishlistToggle(productId)}
              className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-md text-navy-800 hover:text-rose-500 hover:scale-110 transition-all"
              aria-label="Save to wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 flex items-center gap-1.5 z-20">
          {cartQuantity > 0 ? (
            /* Quantity Control Bar (- 1 +) when item is in cart */
            <div className="flex-1 bg-navy-950 text-white rounded-xl shadow-lg p-1 flex items-center justify-between border border-navy-800">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={addingToCart}
                className="w-8 h-8 bg-navy-800 hover:bg-navy-700 text-white rounded-lg flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                title="Decrease Quantity"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>
              <span className="text-xs font-black tracking-wide px-2 text-gold-400">
                {addingToCart ? '...' : `${cartQuantity} in Bag`}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={addingToCart}
                className="w-8 h-8 bg-amber-500 hover:bg-amber-400 text-navy-950 rounded-lg flex items-center justify-center transition-colors active:scale-95 font-bold cursor-pointer"
                title="Increase Quantity"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          ) : (
            /* Add to Bag Button when item is not in cart */
            <button
              type="button"
              onClick={handleQuickAddToCart}
              disabled={addingToCart}
              className="flex-1 py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all bg-navy-950 hover:bg-navy-900 text-white cursor-pointer"
            >
              {addingToCart ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" /> Add To Bag
                </>
              )}
            </button>
          )}

          {product.isCustomizable !== false && (
            <RouterLink
              to={`${targetUrl}?customize=true`}
              className="p-2.5 bg-gold-500 hover:bg-gold-600 text-navy-950 rounded-xl shadow-lg flex items-center justify-center transition-colors shrink-0"
              title="Bespoke Customization Studio"
            >
              <Sparkles className="w-4 h-4 fill-navy-950" />
            </RouterLink>
          )}

          <RouterLink
            to={targetUrl}
            className="p-2.5 bg-white hover:bg-neutral-100 text-navy-900 rounded-xl shadow-lg flex items-center justify-center transition-colors shrink-0 border border-neutral-200"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </RouterLink>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col gap-1.5">
        {/* Category / Sub-label */}
        {product.category?.name && (
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            {product.category.name}
          </span>
        )}

        {/* Product Title */}
        <RouterLink to={targetUrl} className="block group-hover:text-gold-600 transition-colors">
          <h3 className="text-sm font-semibold text-navy-950 line-clamp-1 leading-snug">
            {product.name}
          </h3>
        </RouterLink>

        {/* Rating & Review Stars */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">
            {product.rating ? product.rating.toFixed(1) : '4.8'}
          </span>
        </div>

        {/* Price & Color Swatches Footer Row */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-100 mt-1 min-h-[28px]">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-navy-950">
              {currencySymbol}{product.basePrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through font-normal">
                {currencySymbol}{comparePrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Color Swatches (Renders ONLY if product has colors!) */}
          {colorList.length > 0 && (
            <div className="flex items-center gap-1">
              {colorList.slice(0, 4).map((color, idx) => (
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
                  className={`w-3.5 h-3.5 rounded-full transition-all relative cursor-pointer ${
                    color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#fff'
                      ? 'border border-gray-300'
                      : ''
                  } ${
                    activeColorIndex === idx
                      ? 'ring-2 ring-navy-950 ring-offset-1 scale-110 shadow-xs z-10'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              {colorList.length > 4 && (
                <span className="text-[9px] text-neutral-400 font-medium">
                  +{colorList.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
