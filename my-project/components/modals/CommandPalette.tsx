'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeModal, openModal, setActiveViewMode, toggleTheme } from '../../store/slices/uiSlice';
import { setActiveProject } from '../../store/slices/projectSlice';
import { DefaultView } from '../../types/workspace';
import { Search, Kanban, ListFilter, Table, Calendar, Plus, HardDriveDownload, Moon, Sun, Layers } from 'lucide-react';

export function CommandPalette() {
  const dispatch = useAppDispatch();
  const { activeModal } = useAppSelector((state) => state.ui);
  const { tasks } = useAppSelector((state) => state.task);
  const { projects } = useAppSelector((state) => state.project);
  const { activeWorkspaceId } = useAppSelector((state) => state.workspace);

  const [query, setQuery] = useState('');

  // Keyboard shortcut Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        dispatch(openModal({ modal: 'commandPalette' }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  if (activeModal !== 'commandPalette') return null;

  const workspaceProjects = projects.filter((p) => p.workspaceId === activeWorkspaceId);
  const workspaceTasks = tasks.filter((t) =>
    workspaceProjects.some((p) => p.id === t.projectId)
  );

  const filteredTasks = query
    ? workspaceTasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    : workspaceTasks.slice(0, 5);

  const filteredProjects = query
    ? workspaceProjects.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : workspaceProjects;

  const actions = [
    { label: 'Create New Task', icon: Plus, action: () => dispatch(openModal({ modal: 'createTask' })) },
    { label: 'Create New Project', icon: Layers, action: () => dispatch(openModal({ modal: 'createProject' })) },
    { label: 'Switch to Board View', icon: Kanban, action: () => dispatch(setActiveViewMode('board')) },
    { label: 'Switch to List View', icon: ListFilter, action: () => dispatch(setActiveViewMode('list')) },
    { label: 'Switch to Table View', icon: Table, action: () => dispatch(setActiveViewMode('table')) },
    { label: 'Switch to Timeline View', icon: Calendar, action: () => dispatch(setActiveViewMode('timeline')) },
    { label: 'Data Backup & Restore', icon: HardDriveDownload, action: () => dispatch(openModal({ modal: 'jsonExportImport' })) },
    { label: 'Toggle Dark / Light Theme', icon: Moon, action: () => dispatch(toggleTheme()) },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden divide-y divide-slate-800">
        {/* Search Bar */}
        <div className="p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search tasks & projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-700 text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4 text-xs">
          {/* Quick Actions */}
          <div className="space-y-1">
            <p className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Actions</p>
            {actions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    act.action();
                    dispatch(closeModal());
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition font-medium text-left"
                >
                  <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{act.label}</span>
                </button>
              );
            })}
          </div>

          {/* Matching Tasks */}
          {filteredTasks.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tasks</p>
              {filteredTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    dispatch(openModal({ modal: 'editTask', taskId: t.id }));
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition text-left"
                >
                  <span className="font-semibold text-slate-100 truncate">{t.title}</span>
                  <span className="text-[10px] capitalize text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {t.status.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Matching Projects */}
          {filteredProjects.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Projects</p>
              {filteredProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    dispatch(setActiveProject(p.id));
                    dispatch(closeModal());
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition text-left"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="font-semibold text-slate-100 truncate">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
