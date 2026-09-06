'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { moveTaskStatus, toggleSubtask } from '../../store/slices/taskSlice';
import { openModal } from '../../store/slices/uiSlice';
import { TaskStatus, TaskPriority } from '../../types/workspace';
import {
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  Clock,
  Paperclip,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

export function ListView() {
  const dispatch = useAppDispatch();
  const { tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter } = useAppSelector(
    (state) => state.task
  );
  const { activeWorkspaceId } = useAppSelector((state) => state.workspace);
  const { projects, activeProjectId } = useAppSelector((state) => state.project);
  const { users } = useAppSelector((state) => state.auth);

  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTasks = tasks.filter((task) => {
    const project = projects.find((p) => p.id === task.projectId);
    if (!project || project.workspaceId !== activeWorkspaceId) return false;
    if (activeProjectId && task.projectId !== activeProjectId) return false;

    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && task.assigneeId !== assigneeFilter) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (
        !task.title.toLowerCase().includes(q) &&
        !task.description.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const statusBadges: Record<TaskStatus, { label: string; style: string }> = {
    todo: { label: 'To Do', style: 'bg-slate-700/60 text-slate-300' },
    in_progress: { label: 'In Progress', style: 'bg-blue-500/20 text-blue-400' },
    in_review: { label: 'In Review', style: 'bg-amber-500/20 text-amber-400' },
    done: { label: 'Done', style: 'bg-emerald-500/20 text-emerald-400' },
  };

  const priorityBadges: Record<TaskPriority, { label: string; style: string }> = {
    urgent: { label: 'Urgent', style: 'text-rose-400 font-bold' },
    high: { label: 'High', style: 'text-amber-400 font-semibold' },
    medium: { label: 'Medium', style: 'text-blue-400' },
    low: { label: 'Low', style: 'text-slate-400' },
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
      <div className="max-w-6xl mx-auto bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-800/80 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-5 flex items-center gap-2">Task Title</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-1 text-right">Due Date</div>
        </div>

        {/* Task Row List */}
        <div className="divide-y divide-slate-800/60">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No tasks match your filters.</div>
          ) : (
            filteredTasks.map((task) => {
              const isExpanded = expandedTasks[task.id];
              const assignee = users.find((u) => u.id === task.assigneeId);
              const project = projects.find((p) => p.id === task.projectId);

              return (
                <React.Fragment key={task.id}>
                  <div
                    onClick={() => dispatch(openModal({ modal: 'editTask', taskId: task.id }))}
                    className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-slate-800/50 transition cursor-pointer text-xs text-slate-200"
                  >
                    {/* Title & Expand Toggle */}
                    <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                      {task.subtasks.length > 0 ? (
                        <button
                          onClick={(e) => toggleExpand(task.id, e)}
                          className="p-1 text-slate-400 hover:text-white transition rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      ) : (
                        <span className="w-5" />
                      )}

                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100 truncate">{task.title}</span>
                          {project && (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded font-medium truncate"
                              style={{ backgroundColor: `${project.color}20`, color: project.color }}
                            >
                              {project.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          dispatch(
                            moveTaskStatus({ taskId: task.id, newStatus: e.target.value as TaskStatus })
                          )
                        }
                        className={`px-2 py-1 rounded text-[11px] font-semibold border border-transparent focus:outline-none ${
                          statusBadges[task.status].style
                        }`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="done">Done</option>
                      </select>
                    </div>

                    {/* Priority Badge */}
                    <div className="col-span-2">
                      <span className={`text-xs ${priorityBadges[task.priority].style}`}>
                        {priorityBadges[task.priority].label}
                      </span>
                    </div>

                    {/* Assignee Avatar */}
                    <div className="col-span-2 flex items-center gap-2">
                      {assignee ? (
                        <>
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="w-5 h-5 rounded-full object-cover border border-slate-700"
                          />
                          <span className="text-slate-300 truncate">{assignee.name}</span>
                        </>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="col-span-1 text-right text-slate-400">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '-'}
                    </div>
                  </div>

                  {/* Subtask Nested List */}
                  {isExpanded && task.subtasks.length > 0 && (
                    <div className="bg-slate-950/40 pl-12 pr-6 py-2 space-y-1.5 border-t border-slate-800/40">
                      {task.subtasks.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(toggleSubtask({ taskId: task.id, subtaskId: sub.id }));
                          }}
                          className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer"
                        >
                          {sub.isCompleted ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span className={sub.isCompleted ? 'line-through text-slate-500' : ''}>
                            {sub.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
