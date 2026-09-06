'use client';

import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="w-full h-full p-6 space-y-6 animate-pulse bg-slate-950">
      <div className="flex items-center justify-between gap-4">
        <div className="h-8 w-48 bg-slate-800/80 rounded-xl" />
        <div className="h-8 w-32 bg-slate-800/80 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[500px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-4">
            <div className="h-6 w-24 bg-slate-800 rounded-md" />
            <div className="space-y-3">
              <div className="h-24 bg-slate-800/60 rounded-xl" />
              <div className="h-24 bg-slate-800/60 rounded-xl" />
              <div className="h-24 bg-slate-800/60 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
