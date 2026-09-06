'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { moveTaskStatus, updateTask } from '../../store/slices/taskSlice';
import { openModal } from '../../store/slices/uiSlice';
import { Task, TaskStatus, TaskPriority } from '../../types/workspace';
import { Layers, ChevronDown, ChevronRight, User as UserIcon, AlertCircle } from 'lucide-react';

type GroupByField = 'none' | 'assignee' | 'status' | 'priority' | 'reporter';

export function TableView() {
  const dispatch = useAppDispatch();
  const { tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter } = useAppSelector(
    (state) => state.task
  );
  const { activeWorkspaceId } = useAppSelector((state) => state.workspace);
  const { projects, activeProjectId } = useAppSelector((state) => state.project);
  const { users } = useAppSelector((state) => state.auth);

  const [groupBy, setGroupBy] = useState<GroupByField>('none');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
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
      if (!task.title.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Dynamic Grouping Logic
  const groupedTasks = React.useMemo(() => {
    if (groupBy === 'none') {
      return [{ key: 'All Tasks', label: 'All Tasks', items: filteredTasks }];
    }

    const groups: Record<string, { key: string; label: string; items: Task[] }> = {};

    filteredTasks.forEach((task) => {
      let groupKey = 'unassigned';
      let groupLabel = 'Unassigned';

      if (groupBy === 'assignee') {
        const u = users.find((usr) => usr.id === task.assigneeId);
        groupKey = u ? u.id : 'unassigned';
        groupLabel = u ? u.name : 'Unassigned';
      } else if (groupBy === 'status') {
        groupKey = task.status;
        groupLabel = task.status.replace('_', ' ').toUpperCase();
      } else if (groupBy === 'priority') {
        groupKey = task.priority;
        groupLabel = task.priority.toUpperCase();
      } else if (groupBy === 'reporter') {
        const u = users.find((usr) => usr.id === task.reporterId);
        groupKey = u ? u.id : 'unknown';
        groupLabel = u ? `Reported by ${u.name}` : 'Unknown Reporter';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = { key: groupKey, label: groupLabel, items: [] };
      }
      groups[groupKey].items.push(task);
    });

    return Object.values(groups);
  }, [filteredTasks, groupBy, users]);

  return (
    <div className="flex-1 overflow-auto p-6 bg-slate-950 space-y-4">
      {/* Table Toolbar Controls */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-md">
        <div className="flex items-center gap-2 text-xs">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-300">Dynamic Grouping:</span>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByField)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="none">No Grouping</option>
            <option value="status">Group by Status</option>
            <option value="priority">Group by Priority</option>
            <option value="assignee">Group by Assignee</option>
            <option value="reporter">Group by Reporter</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredTasks.length} tasks
        </span>
      </div>

      {/* Grouped Tables */}
      <div className="space-y-6 min-w-[900px]">
        {groupedTasks.map((group) => {
          const isCollapsed = collapsedGroups[group.key];
          return (
            <div key={group.key} className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              {/* Group Header */}
              {groupBy !== 'none' && (
                <div
                  onClick={() => toggleGroupCollapse(group.key)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/90 border-b border-slate-700/80 cursor-pointer hover:bg-slate-800 transition text-xs font-bold text-slate-200"
                >
                  {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-indigo-400" />}
                  <span>{group.label}</span>
                  <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {group.items.length}
                  </span>
                </div>
              )}

              {/* Table Data Rows */}
              {!isCollapsed && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/60 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-700/60">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Assignee</th>
                      <th className="py-3 px-4">Reviewer (QA)</th>
                      <th className="py-3 px-4">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
                    {group.items.map((task) => {
                      const project = projects.find((p) => p.id === task.projectId);
                      const assignee = users.find((u) => u.id === task.assigneeId);
                      const reviewer = users.find((u) => u.id === task.reviewerId);

                      return (
                        <tr key={task.id} className="hover:bg-slate-800/50 transition">
                          <td
                            onClick={() => dispatch(openModal({ modal: 'editTask', taskId: task.id }))}
                            className="py-3 px-4 font-semibold text-slate-100 cursor-pointer hover:text-indigo-400"
                          >
                            {task.title}
                          </td>
                          <td className="py-3 px-4">
                            {project && (
                              <span className="flex items-center gap-1.5 font-medium" style={{ color: project.color }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                                {project.name}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={task.status}
                              onChange={(e) =>
                                dispatch(
                                  moveTaskStatus({
                                    taskId: task.id,
                                    newStatus: e.target.value as TaskStatus,
                                  })
                                )
                              }
                              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="in_review">In Review</option>
                              <option value="done">Done</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={task.priority}
                              onChange={(e) =>
                                dispatch(
                                  updateTask({
                                    id: task.id,
                                    priority: e.target.value as TaskPriority,
                                  })
                                )
                              }
                              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="urgent">Urgent</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={task.assigneeId || ''}
                              onChange={(e) =>
                                dispatch(
                                  updateTask({
                                    id: task.id,
                                    assigneeId: e.target.value || null,
                                  })
                                )
                              }
                              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="">Unassigned</option>
                              {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={task.reviewerId || ''}
                              onChange={(e) =>
                                dispatch(
                                  updateTask({
                                    id: task.id,
                                    reviewerId: e.target.value || null,
                                  })
                                )
                              }
                              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="">No Reviewer</option>
                              {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="date"
                              value={task.dueDate ? task.dueDate.substring(0, 10) : ''}
                              onChange={(e) =>
                                dispatch(
                                  updateTask({
                                    id: task.id,
                                    dueDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                                  })
                                )
                              }
                              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
