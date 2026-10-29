import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`animate-pulse bg-zinc-200/80 rounded ${className}`} />;
};

export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden shadow-xs flex flex-col">
      <Skeleton className="w-full h-44 rounded-none" />
      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
        <div className="flex gap-2">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-20 h-5" />
        </div>
        <Skeleton className="w-3/4 h-6" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-2/3 h-4" />
        <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-16 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <tr className="border-b border-zinc-100 animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-zinc-200 rounded w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
};
