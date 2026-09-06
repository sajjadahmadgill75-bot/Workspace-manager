'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store, rehydrateStore } from '../store';
import { setSidebarOpen } from '../store/slices/uiSlice';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [isRehydrated, setIsRehydrated] = useState(false);

  useEffect(() => {
    rehydrateStore().then(() => {
      setIsRehydrated(true);
    });
  }, []);

  if (!isRehydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Loading Workspace Manager Store...</p>
        </div>
      </div>
    );
  }

  return <Provider store={store}>{children}</Provider>;
}
