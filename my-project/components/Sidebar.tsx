'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setActiveWorkspace } from '../store/slices/workspaceSlice';
import { setActiveProject } from '../store/slices/projectSlice';
import { logoutUser } from '../store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { openModal, toggleTheme, toggleSidebar, setActiveViewMode, setSidebarOpen } from '../store/slices/uiSlice';
import {
  Briefcase,
  FolderKanban,
  Plus,
  Settings,
  ChevronDown,
  UserCheck,
  Bell,
  HardDriveDownload,
  Moon,
  Sun,
  Layout,
  Archive,
  Search,
  CheckCircle2,
  Shield,
  Layers,
  X,
} from 'lucide-react';
import { PermissionGuard } from './ui/PermissionGuard';


export function Sidebar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isSidebarOpen, theme, activeViewMode } = useAppSelector((state) => state.ui);
  const { workspaces, activeWorkspaceId } = useAppSelector((state) => state.workspace);
  const { projects, activeProjectId } = useAppSelector((state) => state.project);
  const { users, activeUserId } = useAppSelector((state) => state.auth);
  const { notifications } = useAppSelector((state) => state.notification);
  const { tasks } = useAppSelector((state) => state.task);

  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const activeUser = users.find((u) => u.id === activeUserId) || users[0];

  const workspaceProjects = projects.filter(
    (p) => p.workspaceId === activeWorkspaceId && (showArchived ? true : !p.isArchived)
  );

  const assignedCount = tasks.filter((t) => t.assigneeId === activeUserId && t.status !== 'done').length;

  const roleColors: Record<string, string> = {
    owner: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    admin: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    member: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    viewer: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  if (!isSidebarOpen) {
    return (
      <div className="hidden md:flex flex-col items-center py-4 px-2 bg-slate-900 border-r border-slate-800 w-16 h-screen sticky top-0 z-30 justify-between">
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            title="Expand Sidebar"
          >
            <Layout className="w-5 h-5" />
          </button>
          <button
            onClick={() => dispatch(setActiveViewMode('my_work'))}
            className={`p-2 rounded-lg transition relative ${
              activeViewMode === 'my_work' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="My Work Dashboard"
          >
            <UserCheck className="w-5 h-5" />
            {assignedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {assignedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => dispatch(openModal({ modal: 'commandPalette' }))}
            className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition"
            title="Search (Cmd+K)"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => dispatch(openModal({ modal: 'jsonExportImport' }))}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            title="Data Backup & Restore"
          >
            <HardDriveDownload className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={() => dispatch(setSidebarOpen(false))}
        className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
      />

      <aside className="fixed md:sticky top-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 select-none shadow-2xl md:shadow-none">
        {/* Workspace Header Switcher */}
        <div className="p-3 border-b border-slate-800 relative">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              className="flex-1 flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition group min-w-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                  style={{ backgroundColor: activeWorkspace?.color || '#3B82F6' }}
                >
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="text-left truncate">
                  <p className="text-sm font-semibold text-slate-100 truncate">{activeWorkspace?.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{activeWorkspace?.defaultView} view default</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 shrink-0" />
            </button>

            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isWorkspaceDropdownOpen && (
            <div className="absolute top-16 left-3 right-3 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 p-1 divide-y divide-slate-700/50">
              <div className="p-1">
                <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workspaces</p>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      dispatch(setActiveWorkspace(ws.id));
                      dispatch(setActiveProject(null));
                      setIsWorkspaceDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition ${
                      ws.id === activeWorkspaceId
                        ? 'bg-indigo-600/20 text-indigo-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ws.color }} />
                      <span className="truncate">{ws.name}</span>
                    </div>
                    {ws.id === activeWorkspaceId && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="p-1 space-y-1">
                <PermissionGuard requiredRole="admin">
                  <button
                    onClick={() => {
                      dispatch(openModal({ modal: 'createWorkspace' }));
                      setIsWorkspaceDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Workspace</span>
                  </button>
                </PermissionGuard>
                <PermissionGuard requiredRole="admin">
                  <button
                    onClick={() => {
                      dispatch(openModal({ modal: 'workspaceSettings' }));
                      setIsWorkspaceDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700/50 rounded-lg transition font-medium"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Workspace Roles Matrix</span>
                  </button>
                </PermissionGuard>
              </div>
            </div>
          )}
        </div>

        {/* User Session & Role Switcher */}
        <div className="px-3 py-2 border-b border-slate-800 relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 transition border border-slate-800"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <div className="text-left truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-200 truncate">{activeUser.name}</span>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border ${
                      roleColors[activeUser.systemRole]
                    }`}
                  >
                    {activeUser.systemRole}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{activeUser.jobTitle}</p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute top-14 left-3 right-3 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 p-1">
              <button
                onClick={() => {
                  dispatch(logoutUser());
                  setIsUserDropdownOpen(false);
                  router.replace('/login');
                }}
                className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
              >
                <span>Switch Account / Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tree */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Main Work Views */}
          <div className="space-y-0.5">
            <button
              onClick={() => dispatch(setActiveViewMode('my_work'))}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeViewMode === 'my_work'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>My Work Dashboard</span>
              </div>
              {assignedCount > 0 && (
                <span className="bg-amber-500 text-black font-extrabold text-[10px] px-1.5 py-0.5 rounded-full">
                  {assignedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => dispatch(openModal({ modal: 'commandPalette' }))}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-400" />
                <span>Search & Commands</span>
              </div>
              <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400 font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Projects Navigation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Projects ({workspaceProjects.length})</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`p-1 rounded transition ${showArchived ? 'text-indigo-400 bg-indigo-500/10' : 'hover:text-slate-300'}`}
                  title={showArchived ? 'Hide Archived Projects' : 'Show Archived Projects'}
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
                <PermissionGuard requiredRole="admin">
                  <button
                    onClick={() => dispatch(openModal({ modal: 'createProject' }))}
                    className="p-1 hover:text-indigo-400 transition"
                    title="Create Project"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </PermissionGuard>
              </div>
            </div>

            <div className="space-y-0.5 mt-1">
              <button
                onClick={() => dispatch(setActiveProject(null))}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeProjectId === null && activeViewMode !== 'my_work'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate">All Project Tasks</span>
              </button>

              {workspaceProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    dispatch(setActiveProject(p.id));
                    if (activeViewMode === 'my_work') dispatch(setActiveViewMode('board'));
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    p.id === activeProjectId && activeViewMode !== 'my_work'
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  } ${p.isArchived ? 'opacity-50 italic' : ''}`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="truncate">{p.name}</span>
                  </div>
                  {p.isArchived && <Archive className="w-3 h-3 text-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-1">
            <button
              onClick={() => dispatch(openModal({ modal: 'jsonExportImport' }))}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Backup & Restore Data"
            >
              <HardDriveDownload className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Toggle Dark / Light Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>

          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Collapse Sidebar"
          >
            <Layout className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
