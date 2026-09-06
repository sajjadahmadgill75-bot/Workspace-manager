import { Middleware } from '@reduxjs/toolkit';
import { saveToLocalStorage, saveToIndexedDB } from './storageHelpers';

let debounceTimeout: NodeJS.Timeout | null = null;

export const localStorageMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  const result = next(action);

  // Skip auto-persisting UI transient states like modals or search typing on every keystroke
  const state = storeApi.getState();

  const persistedSnapshot = {
    auth: state.auth,
    workspace: state.workspace,
    project: state.project,
    task: {
      ...state.task,
      history: { past: [], future: [] }, // Do not bloat local storage with undo/redo stack
    },
    activity: state.activity,
    notification: state.notification,
    ui: {
      theme: state.ui.theme,
      isSidebarOpen: state.ui.isSidebarOpen,
      activeViewMode: state.ui.activeViewMode,
    },
  };

  // Debounce storage writes by 300ms to maintain 60fps performance
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    saveToLocalStorage(persistedSnapshot);
    saveToIndexedDB(persistedSnapshot);
  }, 300);

  return result;
};
