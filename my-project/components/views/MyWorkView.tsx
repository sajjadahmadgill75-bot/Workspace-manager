'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { openModal } from '../../store/slices/uiSlice';
import { moveTaskStatus } from '../../store/slices/taskSlice';
import { TaskStatus, TaskPriority } from '../../types/workspace';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Shield,
  Layers,
  ChevronRight,
  TrendingUp,
  User as UserIcon,
} from 'lucide-react';

export function MyWorkView() {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector((state) => state.task);
  const { users, activeUserId } = useAppSelector((state) => state.auth);
  const { projects } = useAppSelector((state) => state.project);

  const [activeTab, setActiveTab] = useState<'assigned' | 'review' | 'reported'>('assigned');

  const activeUser = users.find((u) => u.id === activeUserId);

  const assignedToMe = tasks.filter((t) => t.assigneeId === activeUserId && t.status !== 'done');
  const awaitingMyReview = tasks.filter((t) => t.reviewerId === activeUserId && t.status === 'in_review');
  const reportedByMe = tasks.filter((t) => t.reporterId === activeUserId);

  const statusBadges: Record<TaskStatus, { label: string; style: string }> = {
    todo: { label: 'To Do', style: 'bg-slate-800 text-slate-300' },
    in_progress: { label: 'In Progress', style: 'bg-blue-500/20 text-blue-400' },
    in_review: { label: 'In Review', style: 'bg-amber-500/20 text-amber-400 font-semibold' },
    done: { label: 'Done', style: 'bg-emerald-500/20 text-emerald-400' },
  };

  const priorityBadges: Record<TaskPriority, { label: string; style: string }> = {
    urgent: { label: 'Urgent', style: 'text-rose-400 font-bold' },
    high: { label: 'High', style: 'text-amber-400 font-semibold' },
    medium: { label: 'Medium', style: 'text-blue-400' },
    low: { label: 'Low', style: 'text-slate-400' },
  };

  // Team capacity metric calculation
  const memberWorkload = users.map((u) => {
    const activeTasksCount = tasks.filter((t) => t.assigneeId === u.id && t.status !== 'done').length;
    let capacityBadge = 'Optimal';
    let capacityColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

    if (activeTasksCount === 0) {
      capacityBadge = 'Available';
      capacityColor = 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    } else if (activeTasksCount > 5) {
      capacityBadge = 'High Load';
      capacityColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    } else if (activeTasksCount > 3) {
      capacityBadge = 'Busy';
      capacityColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }

    return {
      user: u,
      count: activeTasksCount,
      capacityBadge,
      capacityColor,
    };
  });

  const getDisplayedTasks = () => {
    switch (activeTab) {
      case 'review':
        return awaitingMyReview;
      case 'reported':
        return reportedByMe;
      default:
        return assignedToMe;
    }
  };

  const displayedTasks = getDisplayedTasks();

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 space-y-6">
      {/* Top Banner & Profile Overview */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={activeUser?.avatar}
            alt={activeUser?.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">{activeUser?.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {activeUser?.systemRole}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {activeUser?.jobTitle} • {activeUser?.department} Department
            </p>
          </div>
        </div>

        {/* Quick Workload Metrics */}
        <div className="flex items-center gap-4 text-center">
          <div className="px-4 py-2 bg-slate-800/60 rounded-xl border border-slate-800">
            <p className="text-xl font-extrabold text-indigo-400">{assignedToMe.length}</p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Assigned To Me</p>
          </div>
          <div className="px-4 py-2 bg-slate-800/60 rounded-xl border border-slate-800">
            <p className="text-xl font-extrabold text-amber-400">{awaitingMyReview.length}</p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Awaiting Review</p>
          </div>
          <div className="px-4 py-2 bg-slate-800/60 rounded-xl border border-slate-800">
            <p className="text-xl font-extrabold text-slate-200">{reportedByMe.length}</p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Reported By Me</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main My Work List Container */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-4">
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-800 p-2 bg-slate-900/90 text-xs font-semibold gap-2">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'assigned'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Assigned to Me ({assignedToMe.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'review'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Awaiting Review ({awaitingMyReview.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reported')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'reported'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Reported by Me ({reportedByMe.length})</span>
            </button>
          </div>

          {/* Task List */}
          <div className="p-4 space-y-3">
            {displayedTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                No tasks currently in this queue.
              </div>
            ) : (
              displayedTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const taskAssignee = users.find((u) => u.id === task.assigneeId);
                const taskReviewer = users.find((u) => u.id === task.reviewerId);

                return (
                  <div
                    key={task.id}
                    onClick={() => dispatch(openModal({ modal: 'editTask', taskId: task.id }))}
                    className="p-4 bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/60 rounded-xl transition cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        {project && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-semibold truncate"
                            style={{ backgroundColor: `${project.color}20`, color: project.color }}
                          >
                            {project.name}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold ${priorityBadges[task.priority].style}`}>
                          {priorityBadges[task.priority].label}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-100 group-hover:text-indigo-400 transition truncate">
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] px-2.5 py-1 rounded font-semibold ${statusBadges[task.status].style}`}>
                        {statusBadges[task.status].label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Team Capacity Indicator Widget */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Team Capacity & Workload
            </h3>
          </div>

          <div className="space-y-3">
            {memberWorkload.map(({ user, count, capacityBadge, capacityColor }) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.jobTitle}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${capacityColor}`}>
                    {capacityBadge}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">{count} active tasks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
