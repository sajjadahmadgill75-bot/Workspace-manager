'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeModal } from '../../store/slices/uiSlice';
import { addProject, createProjectFromTemplate } from '../../store/slices/projectSlice';
import { X, Layout, Repeat, Map, Palette } from 'lucide-react';

export function CreateProjectModal() {
  const dispatch = useAppDispatch();
  const { activeModal } = useAppSelector((state) => state.ui);
  const { activeWorkspaceId } = useAppSelector((state) => state.workspace);
  const { users, activeUserId } = useAppSelector((state) => state.auth);

  const [mode, setMode] = useState<'custom' | 'template'>('custom');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [leadId, setLeadId] = useState(activeUserId!);
  const [selectedTemplate, setSelectedTemplate] = useState<'kanban' | 'scrum' | 'roadmap' | 'design_system'>('kanban');

  if (activeModal !== 'createProject') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (mode === 'template') {
      dispatch(
        createProjectFromTemplate({
          workspaceId: activeWorkspaceId,
          templateType: selectedTemplate,
          name: name.trim(),
          description: description.trim(),
          leadId,
        })
      );
    } else {
      dispatch(
        addProject({
          id: `proj_${Date.now()}`,
          workspaceId: activeWorkspaceId,
          name: name.trim(),
          description: description.trim(),
          icon: 'folder',
          color,
          memberIds: [activeUserId!],
          leadId,
          isArchived: false,
        })
      );
    }

    dispatch(closeModal());
  };

  const templates = [
    { id: 'kanban', label: 'Kanban Board', icon: Layout, desc: 'Agile visual workflow for continuous delivery' },
    { id: 'scrum', label: 'Scrum Sprint', icon: Repeat, desc: 'Time-boxed sprint tracking & backlog management' },
    { id: 'roadmap', label: 'Product Roadmap', icon: Map, desc: 'Strategic high-level milestone timeline' },
    { id: 'design_system', label: 'Design System', icon: Palette, desc: 'Component tokenization & UI kit guidelines' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Create New Project</h3>
          <button onClick={() => dispatch(closeModal())} className="p-1 rounded-lg text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Mode Switcher */}
          <div className="flex bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${mode === 'custom' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Custom Project
            </button>
            <button
              type="button"
              onClick={() => setMode('template')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${mode === 'template' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Use Template
            </button>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design System 3.0"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project goals & scope..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {mode === 'template' ? (
            <div className="space-y-2">
              <label className="block text-slate-300 font-semibold">Select Template</label>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((tmpl) => {
                  const Icon = tmpl.icon;
                  const isSelected = selectedTemplate === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl.id as any)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600/10 text-indigo-300'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-200">
                        <Icon className="w-4 h-4 text-indigo-400" />
                        <span>{tmpl.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{tmpl.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Project Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-9 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer p-1"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Project Lead</label>
                <select
                  value={leadId || activeUserId!}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => dispatch(closeModal())} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
