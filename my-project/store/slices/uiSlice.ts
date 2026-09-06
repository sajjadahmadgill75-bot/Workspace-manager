import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DefaultView } from '../../types/workspace';

export type ModalType =
  | 'createTask'
  | 'editTask'
  | 'createProject'
  | 'createWorkspace'
  | 'workspaceSettings'
  | 'projectSettings'
  | 'userProfile'
  | 'commandPalette'
  | 'jsonExportImport'
  | 'keyboardShortcuts'
  | null;

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
  showUndo?: boolean;
}

export interface UIState {
  theme: 'light' | 'dark';
  isSidebarOpen: boolean;
  activeViewMode: DefaultView;
  activeModal: ModalType;
  selectedTaskIdForModal: string | null;
  selectedProjectIdForModal: string | null;
  toasts: Toast[];
}

const initialState: UIState = {
  theme: 'dark',
  isSidebarOpen: true,
  activeViewMode: 'board',
  activeModal: null,
  selectedTaskIdForModal: null,
  selectedProjectIdForModal: null,
  toasts: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    setActiveViewMode: (state, action: PayloadAction<DefaultView>) => {
      state.activeViewMode = action.payload;
    },
    openModal: (
      state,
      action: PayloadAction<{ modal: ModalType; taskId?: string | null; projectId?: string | null }>
    ) => {
      state.activeModal = action.payload.modal;
      if (action.payload.taskId !== undefined) {
        state.selectedTaskIdForModal = action.payload.taskId;
      }
      if (action.payload.projectId !== undefined) {
        state.selectedProjectIdForModal = action.payload.projectId;
      }
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.selectedTaskIdForModal = null;
      state.selectedProjectIdForModal = null;
    },
    showToast: (state, action: PayloadAction<{ message: string; type?: 'info' | 'success' | 'error'; showUndo?: boolean }>) => {
      const newToast: Toast = {
        id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        message: action.payload.message,
        type: action.payload.type || 'info',
        showUndo: action.payload.showUndo || false,
      };
      state.toasts.push(newToast);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setActiveViewMode,
  openModal,
  closeModal,
  showToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
