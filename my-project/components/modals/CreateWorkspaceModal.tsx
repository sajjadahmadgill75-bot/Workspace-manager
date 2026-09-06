'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeModal } from '../../store/slices/uiSlice';
import { addWorkspace } from '../../store/slices/workspaceSlice';
import { Workspace, DefaultView } from '../../types/workspace';
import { X } from 'lucide-react';

export function CreateWorkspaceModal() {
  const dispatch = useAppDispatch();
  const { activeModal } = useAppSelector((state) => state.ui);
  const { activeUserId } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [defaultView, setDefaultView] = useState<DefaultView>('board');

  if (activeModal !== 'createWorkspace') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newWorkspace: Workspace = {
      id: `ws_${Date.now()}`,
      name: name.trim(),
      icon: 'briefcase',
      color,
      memberIds: [activeUserId!],
      defaultView,
      ownerId: activeUserId!,
    };

    dispatch(addWorkspace(newWorkspace));
    dispatch(closeModal());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Create Workspace</h3>
          <button onClick={() => dispatch(closeModal())} className="p-1 rounded-lg text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Workspace Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Growth & Ops"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Theme Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-9 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer p-1"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Default View</label>
              <select
                value={defaultView}
                onChange={(e) => setDefaultView(e.target.value as DefaultView)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
              >
                <option value="board">Board</option>
                <option value="list">List</option>
                <option value="table">Table</option>
                <option value="timeline">Timeline</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => dispatch(closeModal())} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg">
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
