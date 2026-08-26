import { useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';

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

  const activeImage = imgError[selectedIndex]
    ? FALLBACK
    : (displayImages[selectedIndex]?.url ?? FALLBACK);

  const openLightbox = (idx: number) => {
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
          <div className="flex flex-col gap-2 w-16 sm:w-20 flex-shrink-0 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 pr-0.5">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                data-testid={`thumbnail-${idx}`}
                onClick={() => setSelectedIndex(idx)}
                className={`relative flex-shrink-0 w-full aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  selectedIndex === idx
                    ? 'border-amber-500 shadow-md ring-1 ring-amber-400/40'
                    : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400'
                }`}
              >
                <img
                  src={imgError[idx] ? FALLBACK : img.url}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={() => setImgError((prev) => ({ ...prev, [idx]: true }))}
                />
                {selectedIndex === idx && (
                  <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main Image Stage */}
        <div className="flex-1 relative group">
          {/* Main Image Container */}
          <div
            data-testid="main-image-container"
            className="relative w-full aspect-[3/4] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-sm cursor-zoom-in select-none"
            onClick={() => openLightbox(selectedIndex)}
          >
            <img
              src={activeImage}
              alt={displayImages[selectedIndex]?.alt ?? productName}
              data-testid="main-image"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-[1.02]"
              onError={() => setImgError((prev) => ({ ...prev, [selectedIndex]: true }))}
            />

            {/* Overlay gradient at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

            {/* Expand icon */}
            <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm text-slate-800 text-[11px] font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Expand className="w-3.5 h-3.5 text-amber-600" />
              <span>Expand</span>
            </div>

            {/* Counter badge */}
            {displayImages.length > 1 && (
              <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                {selectedIndex + 1} / {displayImages.length}
              </div>
            )}
          </div>

          {/* Prev / Next arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((p) => (p - 1 + displayImages.length) % displayImages.length);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-amber-700 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"
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
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-amber-700 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ─── Lightbox Modal ─── */}
      {isLightboxOpen && (
        <div
          data-testid="lightbox-modal"
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            type="button"
            data-testid="lightbox-close"
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-50 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev / Next */}
          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={lbPrev}
                className="absolute left-3 sm:left-6 w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-50 flex items-center justify-center"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={lbNext}
                className="absolute right-3 sm:right-6 w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-50 flex items-center justify-center"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-w-3xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imgError[lightboxIndex] ? FALLBACK : (displayImages[lightboxIndex]?.url ?? FALLBACK)}
              alt={displayImages[lightboxIndex]?.alt ?? productName}
              className="max-h-[82vh] w-auto object-contain rounded-xl shadow-2xl"
              onError={() => setImgError((prev) => ({ ...prev, [lightboxIndex]: true }))}
            />
            <p className="mt-3 text-sm text-white/60 text-center">
              {productName} — Image {lightboxIndex + 1} of {displayImages.length}
            </p>

            {/* Thumbnail dots */}
            {displayImages.length > 1 && (
              <div className="flex items-center gap-2 mt-3">
                {displayImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === lightboxIndex ? 'bg-amber-400 w-4' : 'bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
