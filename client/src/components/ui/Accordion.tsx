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
        'divide-y divide-charcoal-100 border border-charcoal-200/70 rounded-2xl bg-white shadow-subtle overflow-hidden',
        className,
      )}
    >
      {items.map((item) => {
        const isExpanded = expandedIds.includes(item.id);
        return (
          <div key={item.id} className="transition-colors">
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-5 text-left font-semibold text-charcoal-950 hover:bg-cream-50/70 transition-colors focus:outline-none"
              aria-expanded={isExpanded}
            >
              <span className="text-base font-heading">{item.title}</span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-bronze-600 transition-transform duration-300 shrink-0 ml-4',
                  isExpanded && 'rotate-180',
                )}
              />
            </button>
            {isExpanded && (
              <div className="px-5 pb-5 text-sm text-charcoal-700 leading-relaxed animate-fade-in border-t border-charcoal-100 pt-3">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
