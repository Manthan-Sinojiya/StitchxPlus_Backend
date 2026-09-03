import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Filter } from 'lucide-react';
import {
  contentService,
  CMSCuratedCollectionSection,
  DEFAULT_CURATED_COLLECTION,
} from '../../services/contentService';

const FIT_FILTERS = ['All Styles', 'Bespoke Slim', 'Italian Classic', 'Black Tie Formal', 'Double-Breasted'];

export const CuratedCollectionsSection: React.FC = () => {
  const [data, setData] = useState<CMSCuratedCollectionSection>(DEFAULT_CURATED_COLLECTION);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedFilter, setSelectedFilter] = useState<string>('All Styles');
  const [loading, setLoading] = useState<boolean>(true);

  const loadContent = async () => {
    try {
      setLoading(true);
      const res = await contentService.getCuratedCollectionContent();
      if (res && res.items && res.items.length > 0) {
        setData(res);
      }
    } catch (_err) {
      // Fallback already set
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
    const handleUpdate = () => loadContent();
    window.addEventListener('curated-collections-updated', handleUpdate);
    return () => window.removeEventListener('curated-collections-updated', handleUpdate);
  }, []);

  if (loading) {
    return (
      <section className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="aspect-[4/5] rounded-3xl bg-slate-200/80" />
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
            <div className="h-8 w-2/3 bg-slate-200/80 rounded-2xl" />
            <div className="h-4 w-1/2 bg-slate-200/80 rounded-xl" />
            <div className="space-y-3 pt-4">
              <div className="h-16 w-full bg-slate-200/80 rounded-2xl" />
              <div className="h-16 w-full bg-slate-200/80 rounded-2xl" />
              <div className="h-16 w-full bg-slate-200/80 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!data || !data.items || data.items.length === 0) return null;

  // Filter items by active filter tag if matching
  const filteredItems = selectedFilter === 'All Styles'
    ? data.items
    : data.items.filter((item) => item.title.toLowerCase().includes(selectedFilter.toLowerCase()) || (item.description || '').toLowerCase().includes(selectedFilter.toLowerCase()));

  const displayList = filteredItems.length > 0 ? filteredItems : data.items;
  const safeActiveIndex = activeIndex < displayList.length ? activeIndex : 0;
  const activeItem = displayList[safeActiveIndex] || displayList[0];

  return (
    <section className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
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
              <span className="font-semibold text-amber-400 uppercase tracking-widest text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" />
                Featured Style #{safeActiveIndex + 1}
              </span>
              <span className="truncate max-w-[180px]">{activeItem.title}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Subtitle, Filter Pills, Accordion Items & CTA */}
        <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center">
          {/* Section Header */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-slate-950 tracking-tight">
              {data.title || 'Curated Collections For Style'}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 font-normal">
              {data.subtitle || 'Thoughtfully designed fashion pieces defining modern elegance.'}
            </p>
          </div>

          {/* Interactive Fit & Fabric Filter Pills */}
          <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Filter className="w-4 h-4 text-amber-600 shrink-0 mr-1" />
            {FIT_FILTERS.map((fit) => (
              <button
                key={fit}
                type="button"
                onClick={() => {
                  setSelectedFilter(fit);
                  setActiveIndex(0);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  selectedFilter === fit
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400'
                }`}
              >
                {fit}
              </button>
            ))}
          </div>

          {/* Dynamic Interactive Accordions */}
          <div className="space-y-3">
            {displayList.map((item, idx) => {
              const isActive = idx === safeActiveIndex;
              return (
                <div
                  key={item.id || idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                    isActive
                      ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <h3
                        className={`font-serif font-bold text-base sm:text-lg transition-colors ${
                          isActive ? 'text-slate-950' : 'text-slate-700'
                        }`}
                      >
                        {item.title}
                      </h3>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-900 border border-amber-500/30'
                          : 'text-slate-400'
                      }`}
                    >
                      {isActive ? 'Active View' : 'Explore'}
                    </span>
                  </div>

                  {isActive && item.description && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 font-sans leading-relaxed border-t border-amber-200/60 mt-1 pt-3 animate-fadeIn">
                      <p>{item.description}</p>
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
    </section>
  );
};

