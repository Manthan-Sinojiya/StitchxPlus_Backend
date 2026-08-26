import React, { useState, useRef, useCallback } from 'react';
import { SlidersHorizontal, Sparkles, Image as ImageIcon, Eye } from 'lucide-react';
import { CustomizationOptionGroup } from '@stitchx/shared';

interface CompareSliderProps {
  originalImage: string;
  customImage: string;
  productName: string;
  selectedOptions: Record<string, string>;
  groups: CustomizationOptionGroup[];
}

export const CompareSlider: React.FC<CompareSliderProps> = ({
  originalImage,
  customImage,
  productName,
  selectedOptions,
  groups,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove],
  );

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Extract selected option details for visual pills
  const activeCustomizations = groups
    .map((grp) => {
      const selectedCode = selectedOptions[grp.groupCode];
      const opt = grp.options.find((o) => o.code === selectedCode);
      if (!opt) return null;
      return {
        group: grp.group,
        optionName: opt.name,
        image: opt.image,
        priceAdj: opt.priceAdjustment,
      };
    })
    .filter(Boolean);

  // Calculate blur/enhancement transition based on sliderPosition
  // When slider is at right (100%), full custom enhancement is shown sharp
  const blurAmount = Math.max(0, (50 - Math.abs(sliderPosition - 50)) / 10);

  return (
    <div className="space-y-4">
      {/* Interactive Stage Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={() => setIsDragging(true)}
        className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden border-2 border-gold-500/40 shadow-2xl bg-navy-950 select-none cursor-ew-resize group"
      >
        {/* 1. Base Layer: Original Ready-to-Wear Suit Image (Right Side) */}
        <img
          src={originalImage}
          alt={`${productName} Original Default`}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute top-4 right-4 bg-navy-950/85 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full border border-navy-700 flex items-center gap-1.5 shadow-lg z-10">
          <ImageIcon className="w-3.5 h-3.5 text-navy-300" />
          <span>Original Default</span>
        </div>

        {/* 2. Top Layer: Customized Suit Outfit Preview (Left Side Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden transition-all duration-75"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <div className="relative w-full h-full">
            <img
              src={customImage || originalImage}
              alt={`${productName} Customized`}
              className="w-full h-full object-cover filter saturate-115 contrast-105"
              style={{
                filter: `saturate(1.2) contrast(1.08) backdrop-blur(${blurAmount}px)`,
              }}
            />

            {/* Custom Overlay Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/10 via-transparent to-navy-950/20 pointer-events-none" />

            {/* Customized Active Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 max-w-[75%]">
              <div className="bg-gold-500 text-navy-950 text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3.5 h-3.5 fill-navy-950" />
                <span>Customized Bespoke Outfit</span>
              </div>

              {activeCustomizations.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="bg-navy-950/90 backdrop-blur-md text-gold-300 text-[11px] font-medium px-2.5 py-1 rounded-xl border border-gold-500/30 flex items-center gap-2 truncate shadow-md animate-fadeIn"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 flex-shrink-0" />
                  <span className="truncate">
                    <strong>{item?.group}:</strong> {item?.optionName}
                  </span>
                </div>
              ))}
              {activeCustomizations.length > 3 && (
                <span className="text-[10px] text-gold-300 font-semibold px-2 py-0.5 bg-navy-900/80 rounded-md w-fit">
                  +{activeCustomizations.length - 3} more customized features
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Slider Vertical Bar & Handle Knob */}
        <div
          className="absolute top-0 bottom-0 z-20 w-1 bg-gold-400 shadow-[0_0_12px_rgba(234,179,8,0.8)] cursor-ew-resize transition-transform duration-75"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Circular Drag Knob */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-navy-950 border-2 border-gold-400 text-gold-400 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
            <SlidersHorizontal className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* Slider Instruction Prompt Banner */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-navy-950/90 backdrop-blur-md text-white text-[11px] font-semibold px-4 py-1.5 rounded-full border border-navy-700/80 flex items-center gap-2 shadow-xl pointer-events-none z-10">
          <Eye className="w-3.5 h-3.5 text-gold-400" />
          <span>Drag or Scroll Slider to Compare (Left: Custom | Right: Original)</span>
        </div>
      </div>

      {/* 4. Controls & Quick Position Preset Buttons */}
      <div className="bg-white border border-navy-100 rounded-2xl p-3 shadow-card space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-navy-800">
          <span className="flex items-center gap-1 text-gold-600 font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Customized Outfit ({Math.round(sliderPosition)}%)
          </span>
          <span className="text-navy-500">
            Original Ready-to-Wear ({Math.round(100 - sliderPosition)}%)
          </span>
        </div>

        {/* Range Slider Track */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="w-full h-2 bg-navy-100 rounded-lg appearance-none cursor-pointer accent-gold-500 focus:outline-none"
        />

        {/* Preset Buttons */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSliderPosition(0)}
            className={`py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
              sliderPosition === 0
                ? 'bg-navy-900 text-white border-navy-900 font-bold'
                : 'bg-navy-50 text-navy-700 border-navy-200 hover:bg-navy-100'
            }`}
          >
            100% Original
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(50)}
            className={`py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
              sliderPosition === 50
                ? 'bg-gold-500 text-navy-950 border-gold-500 font-bold'
                : 'bg-navy-50 text-navy-700 border-navy-200 hover:bg-navy-100'
            }`}
          >
            50/50 Split View
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(75)}
            className={`py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
              sliderPosition === 75
                ? 'bg-gold-500 text-navy-950 border-gold-500 font-bold'
                : 'bg-navy-50 text-navy-700 border-navy-200 hover:bg-navy-100'
            }`}
          >
            75% Custom
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(100)}
            className={`py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
              sliderPosition === 100
                ? 'bg-navy-900 text-white border-navy-900 font-bold'
                : 'bg-navy-50 text-navy-700 border-navy-200 hover:bg-navy-100'
            }`}
          >
            100% Custom
          </button>
        </div>
      </div>
    </div>
  );
};
