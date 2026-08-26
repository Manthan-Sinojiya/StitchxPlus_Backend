import React, { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Expand, ZoomIn } from 'lucide-react';

interface ProductImageGalleryProps {
  images?: (string | { url: string; altText?: string; isPrimary?: boolean })[];
  productName: string;
}

const FALLBACK =
  'https://cdn.shopify.com/s/files/1/0630/8164/4122/files/SUM101-03HERO-TheFoundationBlackHerringboneSuit_1.avif?v=1786386836';

export function ProductImageGallery({ images = [], productName }: ProductImageGalleryProps) {
  const normalized: { url: string; alt: string }[] = images
    .map((img, i) =>
      typeof img === 'string'
        ? { url: img, alt: `${productName} — view ${i + 1}` }
        : { url: img.url, alt: img.altText || `${productName} — view ${i + 1}` },
    )
    .filter((img) => Boolean(img.url));

  const displayImages = normalized.length > 0 ? normalized : [{ url: FALLBACK, alt: productName }];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  // Interactive Hover Auto-Zoom Lens States
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const activeImage = imgError[selectedIndex]
    ? FALLBACK
    : (displayImages[selectedIndex]?.url ?? FALLBACK);

  // Mouse move handler for live cursor zoom position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => setIsZoomed(false);

  const openLightbox = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxIndex(idx);
    setIsLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => setIsLightboxOpen(false), []);

  const lbNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setLightboxIndex((p) => (p + 1) % displayImages.length);
    },
    [displayImages.length],
  );

  const lbPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setLightboxIndex((p) => (p - 1 + displayImages.length) % displayImages.length);
    },
    [displayImages.length],
  );

  return (
    <>
      {/* ─── Gallery Layout ─── */}
      <div className="flex gap-3 sm:gap-4 h-full">
        {/* Thumbnail Strip (Left) */}
        {displayImages.length > 1 && (
          <div className="flex flex-col gap-2.5 w-16 sm:w-20 flex-shrink-0 overflow-y-auto max-h-[620px] scrollbar-thin scrollbar-thumb-neutral-300 pr-1">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                data-testid={`thumbnail-${idx}`}
                onClick={() => setSelectedIndex(idx)}
                className={`relative flex-shrink-0 w-full aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                  selectedIndex === idx
                    ? 'border-gold-500 shadow-md ring-2 ring-gold-400/30 scale-[1.02]'
                    : 'border-neutral-200 opacity-70 hover:opacity-100 hover:border-neutral-400'
                }`}
              >
                <img
                  src={imgError[idx] ? FALLBACK : img.url}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-cover object-top"
                  onError={() => setImgError((prev) => ({ ...prev, [idx]: true }))}
                />
                {selectedIndex === idx && (
                  <div className="absolute inset-0 bg-gold-500/10 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main Image Stage with Interactive Auto Zoom */}
        <div className="flex-1 relative group select-none">
          <div
            ref={containerRef}
            data-testid="main-image-container"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative w-full aspect-[3/4] bg-[#f7f7f7] rounded-3xl overflow-hidden border border-neutral-200/80 shadow-md cursor-crosshair"
          >
            {/* Main Interactive Zoomable Image */}
            <img
              src={activeImage}
              alt={displayImages[selectedIndex]?.alt ?? productName}
              data-testid="main-image"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-top transition-transform duration-200 ease-out"
              style={{
                transform: isZoomed ? 'scale(2.4)' : 'scale(1)',
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              }}
              onError={() => setImgError((prev) => ({ ...prev, [selectedIndex]: true }))}
            />

            {/* Hint overlay badge: Hover to Zoom */}
            <div
              className={`absolute top-3 right-3 bg-navy-950/80 backdrop-blur-md text-gold-400 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-gold-500/20 pointer-events-none transition-opacity duration-300 ${
                isZoomed ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Hover to Zoom</span>
            </div>

            {/* Bottom Expand Button */}
            <button
              type="button"
              onClick={(e) => openLightbox(selectedIndex, e)}
              className="absolute bottom-4 right-4 bg-white/95 hover:bg-gold-500 hover:text-navy-950 text-navy-950 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xl border border-neutral-200/80 transition-all duration-200 cursor-pointer z-30 group/btn active:scale-95"
            >
              <Expand className="w-4 h-4 text-gold-600 group-hover/btn:text-navy-950 transition-colors" />
              <span>Expand</span>
            </button>

            {/* Image Counter Badge */}
            {displayImages.length > 1 && (
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-navy-950 text-xs font-bold px-3 py-1 rounded-full shadow-md border border-neutral-200 pointer-events-none">
                {selectedIndex + 1} / {displayImages.length}
              </div>
            )}
          </div>

          {/* Prev / Next Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((p) => (p - 1 + displayImages.length) % displayImages.length);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-neutral-200 text-navy-950 hover:bg-gold-500 hover:text-navy-950 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 z-30 cursor-pointer active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((p) => (p + 1) % displayImages.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-neutral-200 text-navy-950 hover:bg-gold-500 hover:text-navy-950 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 z-30 cursor-pointer active:scale-95"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ─── Apple iPhone-Style Frosted Glass Lightbox Portal Modal ─── */}
      {isLightboxOpen &&
        createPortal(
          <div
            data-testid="lightbox-modal"
            className="fixed inset-0 z-[9999999] bg-black/75 backdrop-blur-3xl flex items-center justify-center select-none overflow-hidden animate-fadeIn"
            onClick={closeLightbox}
          >
            {/* Apple iPhone Style Ambient Dynamic Glow Background */}
            <img
              src={imgError[lightboxIndex] ? FALLBACK : (displayImages[lightboxIndex]?.url ?? FALLBACK)}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover filter blur-[90px] brightness-[0.55] scale-125 opacity-70 pointer-events-none transition-all duration-700"
            />

            {/* Dark Radial Gradient Backdrop */}
            <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80 pointer-events-none" />

            {/* Floating Glass Close Button (Top Right) */}
            <button
              type="button"
              data-testid="lightbox-close"
              onClick={closeLightbox}
              className="fixed top-6 right-6 sm:top-8 sm:right-8 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-2xl border border-white/25 shadow-2xl transition-all z-[10000000] flex items-center justify-center cursor-pointer active:scale-95 group"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Glass Prev Arrow */}
            {displayImages.length > 1 && (
              <button
                type="button"
                onClick={lbPrev}
                className="fixed left-4 sm:left-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-2xl transition-all z-[10000000] flex items-center justify-center border border-white/25 shadow-2xl cursor-pointer active:scale-95 group"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Main Crisp Suit Image in Viewport Center */}
            <div
              className="relative z-40 max-w-[92vw] max-h-[90vh] flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imgError[lightboxIndex] ? FALLBACK : (displayImages[lightboxIndex]?.url ?? FALLBACK)}
                alt={displayImages[lightboxIndex]?.alt ?? productName}
                className="max-h-[88vh] max-w-[90vw] object-contain rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] border border-white/15 transition-all duration-300"
                onError={() => setImgError((prev) => ({ ...prev, [lightboxIndex]: true }))}
              />
            </div>

            {/* Glass Next Arrow */}
            {displayImages.length > 1 && (
              <button
                type="button"
                onClick={lbNext}
                className="fixed right-4 sm:right-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-2xl transition-all z-[10000000] flex items-center justify-center border border-white/25 shadow-2xl cursor-pointer active:scale-95 group"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Minimal iPhone Style Dots Indicator at Bottom */}
            {displayImages.length > 1 && (
              <div
                className="fixed bottom-6 inset-x-0 flex items-center justify-center gap-2 z-[10000000] pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-black/40 backdrop-blur-2xl px-4 py-2 rounded-full border border-white/15 flex items-center gap-2 shadow-2xl">
                  {displayImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        idx === lightboxIndex
                          ? 'w-6 h-2 bg-amber-400 shadow-md'
                          : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
