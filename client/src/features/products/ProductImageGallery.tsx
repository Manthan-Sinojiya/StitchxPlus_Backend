import React, { useState, useCallback, useRef } from 'react';
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

      {/* ─── Luxury High-Resolution Lightbox Modal (Expand View) ─── */}
      {isLightboxOpen && (
        <div
          data-testid="lightbox-modal"
          className="fixed inset-0 z-[999999] bg-navy-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-fadeIn"
          onClick={closeLightbox}
        >
          {/* Top Header Controls Bar */}
          <div
            className="w-full max-w-7xl flex items-center justify-between z-50 pt-2 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="bg-gold-500 text-navy-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                Bespoke Inspection View
              </span>
              <span className="text-slate-300 text-sm font-semibold hidden sm:inline truncate max-w-md">
                {productName}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gold-400 font-mono text-sm font-bold">
                {lightboxIndex + 1} of {displayImages.length}
              </span>

              <button
                type="button"
                data-testid="lightbox-close"
                onClick={closeLightbox}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-gold-500 hover:text-navy-950 text-white transition-all z-50 flex items-center justify-center shadow-xl border border-white/20 cursor-pointer active:scale-95"
                aria-label="Close Lightbox"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Center Main Expanded Image Stage */}
          <div
            className="relative w-full h-[78vh] sm:h-[82vh] flex items-center justify-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Arrow */}
            {displayImages.length > 1 && (
              <button
                type="button"
                onClick={lbPrev}
                className="absolute left-2 sm:left-8 w-12 h-12 rounded-full bg-white/10 hover:bg-gold-500 hover:text-navy-950 text-white backdrop-blur-md transition-all z-50 flex items-center justify-center border border-white/20 shadow-2xl cursor-pointer active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            {/* High Res Expanded Image */}
            <img
              src={imgError[lightboxIndex] ? FALLBACK : (displayImages[lightboxIndex]?.url ?? FALLBACK)}
              alt={displayImages[lightboxIndex]?.alt ?? productName}
              className="max-h-full max-w-[92vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-white/10"
              onError={() => setImgError((prev) => ({ ...prev, [lightboxIndex]: true }))}
            />

            {/* Next Arrow */}
            {displayImages.length > 1 && (
              <button
                type="button"
                onClick={lbNext}
                className="absolute right-2 sm:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-gold-500 hover:text-navy-950 text-white backdrop-blur-md transition-all z-50 flex items-center justify-center border border-white/20 shadow-2xl cursor-pointer active:scale-95"
                aria-label="Next image"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>

          {/* Bottom Full Gallery Thumbnail Strip */}
          {displayImages.length > 1 && (
            <div
              className="w-full max-w-2xl flex items-center justify-center gap-2 overflow-x-auto py-2 z-50 scrollbar-none"
              onClick={(e) => e.stopPropagation()}
            >
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative w-14 h-18 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    idx === lightboxIndex
                      ? 'border-gold-400 ring-2 ring-gold-400/50 scale-110 shadow-lg'
                      : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/50'
                  }`}
                >
                  <img
                    src={imgError[idx] ? FALLBACK : img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
