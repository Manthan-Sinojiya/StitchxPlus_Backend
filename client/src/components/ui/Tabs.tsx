import React, { useState } from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({ items, defaultTabId, onChange, className }: TabsProps) {
  const [activeTabId, setActiveTabId] = useState<string>(
    defaultTabId || (items[0] ? items[0].id : ''),
  );

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    if (onChange) onChange(tabId);
  };

  const activeItem = items.find((item) => item.id === activeTabId);

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Tab Navigation Headers */}
      <div className="flex border-b border-charcoal-200/80 overflow-x-auto no-scrollbar" role="tablist">
        {items.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 border-b-2 -mb-px focus:outline-none',
                isActive
                  ? 'border-bronze-500 text-bronze-700 bg-bronze-50/40'
                  : 'border-transparent text-charcoal-500 hover:text-charcoal-900 hover:border-charcoal-300',
                tab.disabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Panel */}
      {activeItem && (
        <div role="tabpanel" className="animate-fade-in focus:outline-none">
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
