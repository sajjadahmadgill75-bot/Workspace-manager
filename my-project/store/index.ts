import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import authReducer, { setAllUsers, setActiveUser } from './slices/authSlice';
import workspaceReducer, { setAllWorkspaces, setActiveWorkspace } from './slices/workspaceSlice';
import projectReducer, { setAllProjects, setActiveProject } from './slices/projectSlice';
import taskReducer, { setAllTasks } from './slices/taskSlice';
import activityReducer, { setAllActivity } from './slices/activitySlice';
import notificationReducer, { setAllNotifications } from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';

import { localStorageMiddleware } from './middleware/localStorageMiddleware';
import { loadFromLocalStorage, loadFromIndexedDB, validateStateSchema, clearAllStorage } from './middleware/storageHelpers';
import initialMockData from '../mock/index';

const rootReducer = combineReducers({
  auth: authReducer,
  workspace: workspaceReducer,
  project: projectReducer,
  task: taskReducer,
  activity: activityReducer,
  notification: notificationReducer,
  ui: uiReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Rehydrates Redux Store state from LocalStorage/IndexedDB on app initialization.
 */
export async function rehydrateStore(): Promise<boolean> {
  let savedState = loadFromLocalStorage();
  if (!savedState) {
    savedState = await loadFromIndexedDB();
  }

  if (savedState) {
    if (savedState.auth?.users) store.dispatch(setAllUsers(savedState.auth.users));
    // Only restore session if a valid activeUserId was persisted (i.e. user was logged in)
    if (savedState.auth?.activeUserId) {
      store.dispatch(setActiveUser(savedState.auth.activeUserId));
    }
    
    if (savedState.workspace?.workspaces) store.dispatch(setAllWorkspaces(savedState.workspace.workspaces));
    if (savedState.workspace?.activeWorkspaceId) store.dispatch(setActiveWorkspace(savedState.workspace.activeWorkspaceId));
    
    if (savedState.project?.projects) store.dispatch(setAllProjects(savedState.project.projects));
    if (savedState.project?.activeProjectId !== undefined) store.dispatch(setActiveProject(savedState.project.activeProjectId));
    
    if (savedState.task?.tasks) store.dispatch(setAllTasks(savedState.task.tasks));
    
    if (savedState.activity) {
      store.dispatch(
        setAllActivity({
          activityLogs: savedState.activity.activityLogs || [],
          comments: savedState.activity.comments || [],
        })
      );
    }
    
    if (savedState.notification?.notifications) {
      store.dispatch(setAllNotifications(savedState.notification.notifications));
    }

    return true;
  }
  return false;
}

/**
 * Full JSON Export Action - Exports entire client database state
 */
export function exportStateToJSON(): void {
  const state = store.getState();
  const exportPayload = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    users: state.auth.users,
    workspaces: state.workspace.workspaces,
    projects: state.project.projects,
    tasks: state.task.tasks,
    comments: state.activity.comments,
    activityLogs: state.activity.activityLogs,
    notifications: state.notification.notifications,
    activeUserId: state.auth.activeUserId,
    activeWorkspaceId: state.workspace.activeWorkspaceId,
    activeProjectId: state.project.activeProjectId,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `workspace_manager_backup_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Full JSON Import Action - Restores database with schema validation
 */
export function importStateFromJSON(jsonString: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const validation = validateStateSchema(parsed);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    store.dispatch(setAllUsers(parsed.users));
    store.dispatch(setAllWorkspaces(parsed.workspaces));
    store.dispatch(setAllProjects(parsed.projects));
    store.dispatch(setAllTasks(parsed.tasks));
    store.dispatch(
      setAllActivity({
        activityLogs: parsed.activityLogs || [],
        comments: parsed.comments || [],
      })
    );
    store.dispatch(setAllNotifications(parsed.notifications || []));

    if (parsed.activeUserId) store.dispatch(setActiveUser(parsed.activeUserId));
    if (parsed.activeWorkspaceId) store.dispatch(setActiveWorkspace(parsed.activeWorkspaceId));
    if (parsed.activeProjectId !== undefined) store.dispatch(setActiveProject(parsed.activeProjectId));

    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Malformed JSON file format.' };
  }
}

/**
 * Factory Reset Action - Clears browser storage and restores initial factory mock dataset
 */
export function performFactoryReset(): void {
  clearAllStorage();
  store.dispatch(setAllUsers(initialMockData.users));
  store.dispatch(setAllWorkspaces(initialMockData.workspaces));
  store.dispatch(setAllProjects(initialMockData.projects));
  store.dispatch(setAllTasks(initialMockData.tasks));
  store.dispatch(
    setAllActivity({
      activityLogs: initialMockData.activityLogs,
      comments: initialMockData.comments,
    })
  );
  store.dispatch(setAllNotifications(initialMockData.notifications));
  // After factory reset, log out — user must sign in again with the new mock credentials
  store.dispatch(setActiveUser(null));
  store.dispatch(setActiveWorkspace(initialMockData.activeWorkspaceId));
  store.dispatch(setActiveProject(null));
}
