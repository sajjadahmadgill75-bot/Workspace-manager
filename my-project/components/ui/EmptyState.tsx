'use client';

import React from 'react';
import { Search, FolderOpen, CheckCircle2, Layers } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  type?: 'search' | 'board' | 'tasks' | 'projects';
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({
  title = 'No tasks found',
  description = 'Try adjusting your search or filter parameters to find what you are looking for.',
  type = 'search',
  onAction,
  actionLabel,
}: EmptyStateProps) {
  const icons = {
    search: Search,
    board: FolderOpen,
    tasks: CheckCircle2,
    projects: Layers,
  };

  const Icon = icons[type] || Search;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 space-y-4 max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>

      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
