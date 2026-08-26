import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className={cn('flex items-center justify-center gap-1.5 py-4', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageNumbers().map((page, index) => {
        if (typeof page === 'string') {
          return (
            <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-slate-400 text-xs font-semibold">
              ...
            </span>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'min-w-[36px] h-9 px-3 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none cursor-pointer',
              isCurrent
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 border border-slate-200 bg-white',
            )}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Next Page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

