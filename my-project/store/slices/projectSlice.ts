import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../../types/workspace';
import initialMockData from '../../mock/index';

export interface ProjectState {
  projects: Project[];
  activeProjectId: string | null; // null means all projects in workspace
}

const initialState: ProjectState = {
  projects: initialMockData.projects,
  activeProjectId: initialMockData.activeProjectId || null,
};

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setActiveProject: (state, action: PayloadAction<string | null>) => {
      state.activeProjectId = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
      state.activeProjectId = action.payload.id;
    },
    updateProject: (state, action: PayloadAction<Partial<Project> & { id: string }>) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = { ...state.projects[index], ...action.payload };
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.activeProjectId === action.payload) {
        state.activeProjectId = null;
      }
    },
    archiveProject: (state, action: PayloadAction<string>) => {
      const proj = state.projects.find((p) => p.id === action.payload);
      if (proj) proj.isArchived = true;
    },
    unarchiveProject: (state, action: PayloadAction<string>) => {
      const proj = state.projects.find((p) => p.id === action.payload);
      if (proj) proj.isArchived = false;
    },
    setProjectLead: (state, action: PayloadAction<{ projectId: string; leadId: string }>) => {
      const proj = state.projects.find((p) => p.id === action.payload.projectId);
      if (proj) proj.leadId = action.payload.leadId;
    },
    createProjectFromTemplate: (
      state,
      action: PayloadAction<{
        workspaceId: string;
        templateType: 'kanban' | 'scrum' | 'roadmap' | 'design_system';
        name: string;
        description: string;
        leadId: string;
      }>
    ) => {
      const newProjId = `proj_tmpl_${Date.now()}`;
      const templateIcons: Record<string, { icon: string; color: string }> = {
        kanban: { icon: 'layout', color: '#3B82F6' },
        scrum: { icon: 'repeat', color: '#10B981' },
        roadmap: { icon: 'map', color: '#F59E0B' },
        design_system: { icon: 'palette', color: '#8B5CF6' },
      };

      const meta = templateIcons[action.payload.templateType] || { icon: 'folder', color: '#6B7280' };

      const newProject: Project = {
        id: newProjId,
        workspaceId: action.payload.workspaceId,
        name: action.payload.name,
        description: action.payload.description,
        icon: meta.icon,
        color: meta.color,
        memberIds: [action.payload.leadId],
        leadId: action.payload.leadId,
        isArchived: false,
      };

      state.projects.push(newProject);
      state.activeProjectId = newProjId;
    },
    setAllProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
  },
});

export const {
  setActiveProject,
  addProject,
  updateProject,
  deleteProject,
  archiveProject,
  unarchiveProject,
  setProjectLead,
  createProjectFromTemplate,
  setAllProjects,
} = projectSlice.actions;

export default projectSlice.reducer;
