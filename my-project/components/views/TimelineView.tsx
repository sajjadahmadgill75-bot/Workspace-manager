'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { openModal } from '../../store/slices/uiSlice';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export function TimelineView() {
  const dispatch = useAppDispatch();
  const { tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter } = useAppSelector(
    (state) => state.task
  );
  const { activeWorkspaceId } = useAppSelector((state) => state.workspace);
  const { projects, activeProjectId } = useAppSelector((state) => state.project);
  const { users } = useAppSelector((state) => state.auth);

  const filteredTasks = tasks.filter((task) => {
    const project = projects.find((p) => p.id === task.projectId);
    if (!project || project.workspaceId !== activeWorkspaceId) return false;
    if (activeProjectId && task.projectId !== activeProjectId) return false;

    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && task.assigneeId !== assigneeFilter) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (!task.title.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const daysInMonth = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="flex-1 overflow-auto p-6 bg-slate-950">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 min-w-[950px] shadow-xl space-y-4">
        {/* Timeline Header Scale */}
        <div className="grid grid-cols-12 gap-2 border-b border-slate-800 pb-3 text-xs font-bold text-slate-400">
          <div className="col-span-4">Task</div>
          <div className="col-span-8 flex justify-between px-2 font-mono text-[11px] text-slate-500">
            {daysInMonth.map((day) => (
              <span key={day}>Sep {day}</span>
            ))}
          </div>
        </div>

        {/* Task Timeline Bars */}
        <div className="space-y-3">
          {filteredTasks.map((task, idx) => {
            const project = projects.find((p) => p.id === task.projectId);
            const assignee = users.find((u) => u.id === task.assigneeId);

            // Calculate mock horizontal bar offset
            const startOffset = (idx * 7) % 60;
            const barWidth = 25 + ((idx * 11) % 40);

            return (
              <div
                key={task.id}
                onClick={() => dispatch(openModal({ modal: 'editTask', taskId: task.id }))}
                className="grid grid-cols-12 gap-2 items-center py-2 px-2 hover:bg-slate-800/40 rounded-lg transition cursor-pointer text-xs"
              >
                <div className="col-span-4 flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: project?.color || '#3B82F6' }}
                  />
                  <span className="font-medium text-slate-200 truncate">{task.title}</span>
                </div>

                <div className="col-span-8 relative h-7 bg-slate-800/40 rounded-md overflow-hidden flex items-center">
                  <div
                    className="absolute h-5 rounded-md px-2 flex items-center text-[10px] font-bold text-white shadow transition-all"
                    style={{
                      left: `${startOffset}%`,
                      width: `${barWidth}%`,
                      backgroundColor: project?.color || '#6366F1',
                    }}
                  >
                    <span className="truncate">{task.title}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
