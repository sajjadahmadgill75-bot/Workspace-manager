import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workspace, DefaultView } from '../../types/workspace';
import initialMockData from '../../mock/index';

export interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
}

const initialState: WorkspaceState = {
  workspaces: initialMockData.workspaces,
  activeWorkspaceId: initialMockData.activeWorkspaceId || 'ws_tech_01',
};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setActiveWorkspace: (state, action: PayloadAction<string>) => {
      state.activeWorkspaceId = action.payload;
    },
    addWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspaces.push(action.payload);
      state.activeWorkspaceId = action.payload.id;
    },
    updateWorkspace: (state, action: PayloadAction<Partial<Workspace> & { id: string }>) => {
      const index = state.workspaces.findIndex((w) => w.id === action.payload.id);
      if (index !== -1) {
        state.workspaces[index] = { ...state.workspaces[index], ...action.payload };
      }
    },
    deleteWorkspace: (state, action: PayloadAction<string>) => {
      state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
      if (state.activeWorkspaceId === action.payload) {
        state.activeWorkspaceId = state.workspaces[0]?.id || '';
      }
    },
    addWorkspaceMember: (state, action: PayloadAction<{ workspaceId: string; userId: string }>) => {
      const ws = state.workspaces.find((w) => w.id === action.payload.workspaceId);
      if (ws && !ws.memberIds.includes(action.payload.userId)) {
        ws.memberIds.push(action.payload.userId);
      }
    },
    removeWorkspaceMember: (state, action: PayloadAction<{ workspaceId: string; userId: string }>) => {
      const ws = state.workspaces.find((w) => w.id === action.payload.workspaceId);
      if (ws) {
        ws.memberIds = ws.memberIds.filter((id) => id !== action.payload.userId);
      }
    },
    setDefaultView: (state, action: PayloadAction<{ workspaceId: string; view: DefaultView }>) => {
      const ws = state.workspaces.find((w) => w.id === action.payload.workspaceId);
      if (ws) {
        ws.defaultView = action.payload.view;
      }
    },
    setAllWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
      state.workspaces = action.payload;
    },
  },
});

export const {
  setActiveWorkspace,
  addWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
  setDefaultView,
  setAllWorkspaces,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
