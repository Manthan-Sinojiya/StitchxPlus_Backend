import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  helperText,
  placeholder = 'Select option...',
  disabled = false,
  className,
  name,
  id,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = React.useId();
  const selectId = id || generatedId;

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    setIsOpen(false);
    if (onChange) {
      onChange({ target: { value: option.value, name } });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        if (options[nextIndex] && !options[nextIndex].disabled) {
          handleSelect(options[nextIndex]);
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        if (options[prevIndex] && !options[prevIndex].disabled) {
          handleSelect(options[prevIndex]);
        }
      }
    }
  };

  return (
    <div className="w-full space-y-1.5 font-sans relative" ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[11px] font-bold uppercase tracking-wider text-slate-700"
        >
          {label} {required && <span className="text-amber-600">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={label || placeholder}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 transition-all duration-200 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 disabled:cursor-not-allowed',
            isOpen && 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            className,
          )}
        >
          <span className="flex items-center gap-2 truncate font-medium">
            {selectedOption ? (
              <>
                {selectedOption.icon}
                <span>{selectedOption.label}</span>
              </>
            ) : (
              <span className="text-slate-400 font-normal">{placeholder}</span>
            )}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2',
              isOpen && 'transform rotate-180 text-amber-600',
            )}
          />
        </button>

        {/* Custom Dropdown Popover */}
        {isOpen && (
          <div
            role="listbox"
            aria-activedescendant={value ? `${selectId}-opt-${value}` : undefined}
            className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-white border border-slate-200/90 shadow-xl py-1.5 focus:outline-none animate-in fade-in-50 zoom-in-95"
          >
            {options.length > 0 ? (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    id={`${selectId}-opt-${opt.value}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      'w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors font-medium',
                      isSelected
                        ? 'bg-amber-50 text-amber-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                      opt.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon}
                      <div>
                        <span className="block truncate">{opt.label}</span>
                        {opt.description && (
                          <span className="block text-[10px] text-slate-400 font-normal truncate">
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3.5 py-3 text-xs text-slate-400 text-center font-normal">
                No options available
              </div>
            )}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
