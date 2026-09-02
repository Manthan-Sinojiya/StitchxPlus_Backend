import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface AccordionItemData {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  allowMultiple?: boolean;
  defaultExpandedIds?: string[];
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultExpandedIds = [],
  className,
}: AccordionProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setExpandedIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      );
    } else {
      setExpandedIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div
      className={cn(
        'divide-y divide-slate-200/80 border border-slate-200/90 rounded-3xl bg-white shadow-xs overflow-hidden',
        className,
      )}
    >
      {items.map((item) => {
        const isExpanded = expandedIds.includes(item.id);
        return (
          <div key={item.id} className="transition-colors">
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-950 hover:bg-slate-50/70 transition-colors focus:outline-none cursor-pointer"
              aria-expanded={isExpanded}
            >
              <span className="text-base font-serif font-bold text-slate-900">{item.title}</span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-amber-600 transition-transform duration-300 shrink-0 ml-4',
                  isExpanded && 'rotate-180',
                )}
              />
            </button>
            <div
              className={cn(
                'grid transition-all duration-300 ease-in-out text-sm text-slate-600 leading-relaxed',
                isExpanded ? 'grid-rows-[1fr] opacity-100 px-5 pb-5 pt-1 border-t border-slate-100' : 'grid-rows-[0fr] opacity-0 px-5 overflow-hidden',
              )}
            >
              <div className="overflow-hidden">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

