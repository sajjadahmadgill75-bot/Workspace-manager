'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeModal } from '../../store/slices/uiSlice';
import { updateWorkspace, deleteWorkspace, addWorkspaceMember, removeWorkspaceMember } from '../../store/slices/workspaceSlice';
import { updateUserProfile } from '../../store/slices/authSlice';
import { SystemRole, DefaultView } from '../../types/workspace';
import { X, Shield, Trash2, UserPlus, CreditCard, CheckCircle2, AlertTriangle } from 'lucide-react';

export function WorkspaceSettingsModal() {
  const dispatch = useAppDispatch();
  const { activeModal } = useAppSelector((state) => state.ui);
  const { workspaces, activeWorkspaceId } = useAppSelector((state) => state.workspace);
  const { users, activeUserId } = useAppSelector((state) => state.auth);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const activeUser = users.find((u) => u.id === activeUserId);

  const [name, setName] = useState(activeWorkspace?.name || '');
  const [defaultView, setDefaultView] = useState<DefaultView>(activeWorkspace?.defaultView || 'board');
  const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState('');

  if (activeModal !== 'workspaceSettings' || !activeWorkspace) return null;

  const isOwner = activeUser?.systemRole === 'owner';

  const workspaceMembers = users.filter((u) => activeWorkspace.memberIds.includes(u.id));
  const nonMembers = users.filter((u) => !activeWorkspace.memberIds.includes(u.id));

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    dispatch(updateWorkspace({ id: activeWorkspace.id, name: name.trim(), defaultView }));
  };

  const handleRoleChange = (userId: string, newRole: SystemRole) => {
    dispatch(updateUserProfile({ userId, systemRole: newRole }));
  };

  const handleAddMember = () => {
    if (!selectedUserIdToAdd) return;
    dispatch(addWorkspaceMember({ workspaceId: activeWorkspace.id, userId: selectedUserIdToAdd }));
    setSelectedUserIdToAdd('');
  };

  const handleRemoveMember = (userId: string) => {
    if (activeWorkspace.memberIds.length <= 1) return;
    dispatch(removeWorkspaceMember({ workspaceId: activeWorkspace.id, userId }));
  };

  const handleDeleteWorkspace = () => {
    if (confirm(`ARE YOU SURE you want to delete workspace '${activeWorkspace.name}'? This action cannot be undone.`)) {
      dispatch(deleteWorkspace(activeWorkspace.id));
      dispatch(closeModal());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Workspace Authority & Settings</h3>
          </div>
          <button onClick={() => dispatch(closeModal())} className="p-1 rounded-lg text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* General Workspace Form */}
          <form onSubmit={handleSaveGeneral} className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">General Preferences</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Workspace Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isOwner}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-100 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Default View</label>
                <select
                  value={defaultView}
                  onChange={(e) => setDefaultView(e.target.value as DefaultView)}
                  disabled={!isOwner}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-100 disabled:opacity-50"
                >
                  <option value="board">Board</option>
                  <option value="list">List</option>
                  <option value="table">Table</option>
                  <option value="timeline">Timeline</option>
                </select>
              </div>
            </div>

            {isOwner && (
              <div className="flex justify-end">
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg">
                  Save Changes
                </button>
              </div>
            )}
          </form>

          {/* Member & Role Matrix */}
          <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
                Members & Global Authority Matrix
              </h4>

              {isOwner && nonMembers.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedUserIdToAdd}
                    onChange={(e) => setSelectedUserIdToAdd(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-1 text-slate-200 text-xs"
                  >
                    <option value="">Select User to Add...</option>
                    {nonMembers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.jobTitle})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              )}
            </div>

            <div className="divide-y divide-slate-800">
              {workspaceMembers.map((m) => (
                <div key={m.id} className="py-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{m.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{m.jobTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <select
                      value={m.systemRole}
                      onChange={(e) => handleRoleChange(m.id, e.target.value as SystemRole)}
                      disabled={!isOwner}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-semibold disabled:opacity-50"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>

                    {isOwner && m.id !== activeWorkspace.ownerId && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Billing Simulation */}
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-indigo-400 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-100">Enterprise Workspace Plan</h4>
                <p className="text-[11px] text-slate-400">Includes 60 seats, IndexedDB state backup, and unlimited projects.</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-[10px] uppercase">
              Active Subscription
            </span>
          </div>

          {/* Danger Zone */}
          {isOwner && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-2">
              <h4 className="font-bold text-rose-400 uppercase tracking-wider text-[10px]">Danger Zone</h4>
              <p className="text-[11px] text-slate-400">Permanently delete this workspace and all associated projects and tasks.</p>
              <button
                type="button"
                onClick={handleDeleteWorkspace}
                className="px-4 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-lg font-bold"
              >
                Delete Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
