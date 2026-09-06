'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeModal } from '../../store/slices/uiSlice';
import { updateProject, deleteProject, archiveProject, unarchiveProject, setProjectLead } from '../../store/slices/projectSlice';
import { X, Layers, Archive, Trash2, UserCheck, Shield } from 'lucide-react';
import { PermissionGuard } from '../ui/PermissionGuard';

export function ProjectSettingsModal() {
  const dispatch = useAppDispatch();
  const { activeModal, selectedProjectIdForModal } = useAppSelector((state) => state.ui);
  const { projects } = useAppSelector((state) => state.project);
  const { users, activeUserId } = useAppSelector((state) => state.auth);

  if (activeModal !== 'projectSettings' || !selectedProjectIdForModal) return null;

  const project = projects.find((p) => p.id === selectedProjectIdForModal);
  if (!project) return null;

  const activeUser = users.find((u) => u.id === activeUserId);

  const handleSaveLead = (leadId: string) => {
    dispatch(setProjectLead({ projectId: project.id, leadId }));
  };

  const handleToggleArchive = () => {
    if (project.isArchived) {
      dispatch(unarchiveProject(project.id));
    } else {
      dispatch(archiveProject(project.id));
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete project '${project.name}'?`)) {
      dispatch(deleteProject(project.id));
      dispatch(closeModal());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
            <h3 className="text-base font-bold text-slate-100">{project.name} Settings</h3>
          </div>
          <button onClick={() => dispatch(closeModal())} className="p-1 rounded-lg text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Project Lead Assignment</label>
            <PermissionGuard requiredRole="admin" projectId={project.id} disabledMode>
              <select
                value={project.leadId}
                onChange={(e) => handleSaveLead(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 disabled:opacity-50"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.jobTitle})
                  </option>
                ))}
              </select>
            </PermissionGuard>
          </div>

          <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Project Lifecycle</h4>
            <p className="text-[11px] text-slate-400">
              Archived projects are hidden from normal board views but retained in history.
            </p>
            <PermissionGuard requiredRole="admin" projectId={project.id}>
              <button
                type="button"
                onClick={handleToggleArchive}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition ${
                  project.isArchived
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/30'
                }`}
              >
                <Archive className="w-4 h-4" />
                <span>{project.isArchived ? 'Unarchive Project' : 'Archive Project'}</span>
              </button>
            </PermissionGuard>
          </div>

          <PermissionGuard requiredRole="admin" projectId={project.id}>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-lg font-bold flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Project</span>
              </button>
            </div>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
}
