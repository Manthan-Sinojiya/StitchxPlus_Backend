import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Trash2, Scissors } from 'lucide-react';
import { Button, useToast, Loader } from '../ui';
import { userService } from '../../services/userService';
import { useCartStore } from '../../store/useCartStore';
import { WishlistItem } from '@stitchx/shared';

export function WishlistSection() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await userService.getWishlist();
      setWishlist(data);
    } catch (_err) {
      toast('error', 'Error', 'Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      setActioningId(productId);
      const updated = await userService.removeFromWishlist(productId);
      setWishlist(updated);
      toast('info', 'Wishlist Updated', 'Item removed from your wishlist.');
    } catch (_err) {
      toast('error', 'Error', 'Failed to remove item from wishlist.');
    } finally {
      setActioningId(null);
    }
  };

  const handleMoveToCart = async (item: any) => {
    const product = item.productId || item.product || item;
    const productId = product._id || product.id;

    try {
      setActioningId(productId);
      // Add product to cart
      await addItem({
        productId,
        quantity: 1,
      });

      // Remove from wishlist
      const updated = await userService.removeFromWishlist(productId);
      setWishlist(updated);
      toast('success', 'Moved to Cart', `${product.name || 'Garment'} added to your shopping cart.`);
    } catch (_err) {
      toast('error', 'Error', 'Failed to move item to cart.');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col justify-center items-center gap-3">
        <Loader size="lg" />
        <span className="text-xs text-navy-600 font-semibold">Loading your bespoke wishlist...</span>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="py-12 text-center space-y-4 border border-dashed border-navy-200 rounded-2xl bg-cream-50/40">
        <div className="w-12 h-12 rounded-full bg-navy-50 text-navy-400 mx-auto flex items-center justify-center">
          <Heart className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-navy-900">Your Wishlist is Empty</h4>
        <p className="text-xs text-navy-600 max-w-sm mx-auto">
          Save your favorite bespoke suits, blazers, and luxury fabrics to keep track of upcoming custom commissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-serif font-bold text-navy-900">Saved Wishlist</h3>
          <p className="text-xs text-navy-600">Curated garments and bespoke creations saved for later.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {wishlist.map((item: any, idx) => {
          const product = item.productId || item.product || {};
          const productId = product._id || product.id || String(idx);

          return (
            <div
              key={productId}
              className="group border border-navy-100 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-[4/5] bg-navy-50 overflow-hidden">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name || 'Bespoke Item'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-navy-300">
                    <Scissors className="w-10 h-10" />
                  </div>
                )}
                <button
                  onClick={() => handleRemove(productId)}
                  className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-navy-600 hover:text-red-600 hover:bg-white transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-navy-900 text-sm font-serif line-clamp-1">
                    {product.name || 'Custom Garment'}
                  </h4>
                  <span className="text-sm font-bold text-gold-600 block mt-1">
                    ${product.basePrice ? product.basePrice.toFixed(2) : '1250.00'} USD
                  </span>
                </div>

                <Button
                  variant="gold"
                  size="sm"
                  fullWidth
                  isLoading={actioningId === productId}
                  onClick={() => handleMoveToCart(item)}
                  leftIcon={<ShoppingBag className="w-4 h-4" />}
                >
                  Move to Cart
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
