import React from 'react';

interface SkeletonProps {
  variant?: 'line' | 'circle' | 'card';
  className?: string;
  lines?: number;
}

export default function Skeleton({ variant = 'line', className = '', lines = 1 }: SkeletonProps) {
  if (variant === 'circle') {
    return (
      <div className={`animate-pulse rounded-full bg-gray-200 ${className || 'h-10 w-10'}`} />
    );
  }

  if (variant === 'card') {
    return (
      <div className={`animate-pulse bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded bg-gray-200 h-4 ${i === lines - 1 && lines > 1 ? 'w-4/5' : 'w-full'} ${className}`}
        />
      ))}
    </div>
  );
}
