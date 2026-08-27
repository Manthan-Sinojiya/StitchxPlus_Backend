import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  contentService,
  CMSCuratedCollectionSection,
  DEFAULT_CURATED_COLLECTION,
} from '../../services/contentService';

export const CuratedCollectionsSection: React.FC = () => {
  const [data, setData] = useState<CMSCuratedCollectionSection>(DEFAULT_CURATED_COLLECTION);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const loadContent = async () => {
    try {
      const res = await contentService.getCuratedCollectionContent();
      if (res && res.items && res.items.length > 0) {
        setData(res);
      }
    } catch (_err) {
      // Fallback already set
    }
  };

  useEffect(() => {
    loadContent();
    const handleUpdate = () => loadContent();
    window.addEventListener('curated-collections-updated', handleUpdate);
    return () => window.removeEventListener('curated-collections-updated', handleUpdate);
  }, []);

  if (!data || !data.items || data.items.length === 0) return null;

  // Clamp activeIndex if items changed dynamically
  const safeActiveIndex = activeIndex < data.items.length ? activeIndex : 0;
  const activeItem = data.items[safeActiveIndex] || data.items[0];

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Featured Image with Smooth Dynamic Switch */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] bg-slate-900 group">
                <img
                  key={activeItem.id || safeActiveIndex}
                  src={
                    activeItem.image ||
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt={activeItem.title}
                  className="w-full h-full object-cover object-center transition-all duration-700 ease-out animate-fadeIn"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 z-10 text-white/90 text-xs font-medium tracking-wide drop-shadow-sm flex items-center justify-between">
                  <span className="font-semibold text-amber-400 uppercase tracking-widest text-[10px]">
                    Featured Style #{safeActiveIndex + 1}
                  </span>
                  <span>{activeItem.title}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Subtitle, Accordion Items & CTA */}
            <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center">
              {/* Section Header */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-slate-950 tracking-tight">
                  {data.title || 'Curated Collections For Style'}
                </h2>
                <p className="text-sm sm:text-base text-slate-500 mt-2 font-normal">
                  {data.subtitle || 'Thoughtfully designed fashion pieces defining modern elegance.'}
                </p>
              </div>

              {/* Accordion / List Items */}
              <div className="divide-y divide-slate-200/80 border-y border-slate-200/80 my-2">
                {data.items.map((item, index) => {
                  const isActive = index === safeActiveIndex;

                  return (
                    <div key={item.id || index} className="py-4">
                      <button
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className="w-full text-left flex items-center justify-between gap-4 cursor-pointer group/item transition-colors focus:outline-hidden"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              isActive ? 'bg-amber-500 scale-125' : 'bg-slate-300 group-hover/item:bg-slate-400'
                            }`}
                          />
                          <span
                            className={`text-lg sm:text-xl font-serif font-bold transition-colors ${
                              isActive
                                ? 'text-slate-950'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {item.title}
                          </span>
                        </div>
                        <ArrowRight
                          className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                            isActive
                              ? 'text-slate-950 translate-x-1'
                              : 'text-slate-400 group-hover/item:text-slate-700'
                          }`}
                        />
                      </button>

                      {/* Active Description */}
                      {isActive && (
                        <div className="mt-2.5 pl-5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl animate-fadeIn">
                          {item.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom CTA Button */}
              <div className="mt-8">
                <Link
                  to={activeItem.link || data.buttonLink || '/collections'}
                  className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>{data.buttonText || 'Shop Collections'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
