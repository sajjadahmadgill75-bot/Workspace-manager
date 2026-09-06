'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { moveTaskStatus } from '../../store/slices/taskSlice';
import { openModal } from '../../store/slices/uiSlice';
import { Task, TaskStatus, TaskPriority } from '../../types/workspace';
import { EmptyState } from '../ui/EmptyState';
import {
  CheckSquare,
  Paperclip,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Plus,
  ArrowRight,
  UserCheck,
  Tag,
} from 'lucide-react';

export function BoardView() {
  const dispatch = useAppDispatch();
  const { tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter } = useAppSelector(
    (state) => state.task
  );
  const { activeWorkspaceId } = useAppSelector((state) => state.workspace);
  const { projects, activeProjectId } = useAppSelector((state) => state.project);
  const { users, activeUserId } = useAppSelector((state) => state.auth);

  const activeUser = users.find((u) => u.id === activeUserId);
  const canEdit = activeUser?.systemRole !== 'viewer';

  const filteredTasks = tasks.filter((task) => {
    const project = projects.find((p) => p.id === task.projectId);
    if (!project || project.workspaceId !== activeWorkspaceId) return false;
    if (activeProjectId && task.projectId !== activeProjectId) return false;

    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && task.assigneeId !== assigneeFilter) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchLabel = task.labels.some((l) => l.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchLabel) return false;
    }

    return true;
  });

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'todo', label: 'To Do', color: 'border-slate-600 bg-slate-800/40 text-slate-300' },
    { id: 'in_progress', label: 'In Progress', color: 'border-blue-500/50 bg-blue-500/10 text-blue-400' },
    { id: 'in_review', label: 'In Review', color: 'border-amber-500/50 bg-amber-500/10 text-amber-400' },
    { id: 'done', label: 'Done', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' },
  ];

  const priorityBadges: Record<TaskPriority, { label: string; style: string }> = {
    urgent: { label: 'Urgent', style: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    high: { label: 'High', style: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    medium: { label: 'Medium', style: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    low: { label: 'Low', style: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && canEdit) {
      dispatch(moveTaskStatus({ taskId, newStatus }));
    }
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
        <EmptyState
          type="search"
          title="No tasks match your current filter parameters"
          description="Try broadening your search query, status filters, or assignee selections."
          onAction={canEdit ? () => dispatch(openModal({ modal: 'createTask' })) : undefined}
          actionLabel="Create New Task"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto p-6 bg-slate-950">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-w-[1000px] h-full items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 min-h-[600px] space-y-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">{colTasks.length}</span>
                </div>
                {canEdit && (
                  <button
                    onClick={() => dispatch(openModal({ modal: 'createTask' }))}
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Column Task Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {colTasks.map((task) => {
                  const assignee = users.find((u) => u.id === task.assigneeId);
                  const reviewer = users.find((u) => u.id === task.reviewerId);
                  const project = projects.find((p) => p.id === task.projectId);
                  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;
                  const priorityMeta = priorityBadges[task.priority];

                  return (
                    <div
                      key={task.id}
                      draggable={canEdit}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => dispatch(openModal({ modal: 'editTask', taskId: task.id }))}
                      className="bg-slate-800/90 border border-slate-700/60 hover:border-indigo-500/60 rounded-xl p-4 shadow-sm hover:shadow-md hover:bg-slate-800 transition cursor-pointer group space-y-3"
                    >
                      {/* Top Meta Tags */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${priorityMeta.style}`}
                        >
                          {priorityMeta.label}
                        </span>

                        {project && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium truncate">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                            <span className="truncate">{project.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Task Title */}
                      <h4 className="text-xs font-semibold text-slate-100 group-hover:text-indigo-400 transition leading-snug line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Labels */}
                      {task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.labels.map((lbl) => (
                            <span
                              key={lbl}
                              className="text-[9px] bg-slate-700/60 text-slate-300 px-1.5 py-0.5 rounded"
                            >
                              #{lbl}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Subtask Progress Bar */}
                      {task.subtasks.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3 text-indigo-400" />
                              Subtasks
                            </span>
                            <span>
                              {completedSubtasks}/{task.subtasks.length}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 transition-all duration-300"
                              style={{
                                width: `${(completedSubtasks / task.subtasks.length) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Card Footer: Assignee, Attachments, Due Date */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-[10px] text-slate-400">
                        <div className="flex items-center gap-2">
                          {assignee ? (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-5 h-5 rounded-full object-cover border border-slate-600"
                              title={`Assignee: ${assignee.name}`}
                            />
                          ) : (
                            <span className="text-slate-500 italic">Unassigned</span>
                          )}

                          {reviewer && (
                            <div
                              className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[9px] font-bold text-amber-400"
                              title={`Reviewer: ${reviewer.name}`}
                            >
                              R
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {task.attachments.length > 0 && (
                            <span className="flex items-center gap-0.5 text-slate-400">
                              <Paperclip className="w-3 h-3" />
                              {task.attachments.length}
                            </span>
                          )}

                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
