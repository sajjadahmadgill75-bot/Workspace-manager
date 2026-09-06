'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setActiveViewMode, openModal, toggleSidebar } from '../store/slices/uiSlice';
import { logoutUser } from '../store/slices/authSlice';
import { useRouter } from 'next/navigation';
import {
  setSearchQuery,
  setStatusFilter,
  setPriorityFilter,
  setAssigneeFilter,
  setSortBy,
  setSortOrder,
  undoTaskAction,
  redoTaskAction,
} from '../store/slices/taskSlice';
import { DefaultView, TaskStatus, TaskPriority } from '../types/workspace';
import { NotificationDrawer } from './modals/NotificationDrawer';
import {
  Kanban,
  ListFilter,
  Table as TableIcon,
  Calendar,
  UserCheck,
  Plus,
  Search,
  RotateCcw,
  RotateCw,
  ChevronRight,
  Shield,
  Settings,
  Bell,
  Menu,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activeViewMode } = useAppSelector((state) => state.ui);
  const { searchQuery, statusFilter, priorityFilter, assigneeFilter, sortBy, sortOrder, history } = useAppSelector(
    (state) => state.task
  );
  const { projects, activeProjectId } = useAppSelector((state) => state.project);
  const { workspaces, activeWorkspaceId } = useAppSelector((state) => state.workspace);
  const { users, activeUserId } = useAppSelector((state) => state.auth);
  const { notifications } = useAppSelector((state) => state.notification);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeUser = users.find((u) => u.id === activeUserId);

  const isOwner = activeUser?.systemRole === 'owner';
  const unreadCount = notifications.filter((n) => n.userId === activeUserId && !n.isRead).length;

  const views: { id: DefaultView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'board', label: 'Board', icon: Kanban },
    { id: 'list', label: 'List', icon: ListFilter },
    { id: 'table', label: 'Table', icon: TableIcon },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'my_work', label: 'My Work', icon: UserCheck },
  ];

  const canEdit = activeUser?.systemRole !== 'viewer';

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur sticky top-0 z-20 px-4 sm:px-6 py-3 space-y-3 relative">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs sm:text-sm truncate">
            <button
              onClick={() => dispatch(openModal({ modal: 'workspaceSettings' }))}
              className="font-semibold text-slate-300 hover:text-indigo-400 flex items-center gap-1 transition truncate"
            >
              <span className="truncate">{activeWorkspace?.name || 'Workspace'}</span>
              <Settings className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>
            <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
            <span className="font-bold text-slate-100 flex items-center gap-2 truncate">
              {activeProject ? (
                <button
                  onClick={() => dispatch(openModal({ modal: 'projectSettings', projectId: activeProject.id }))}
                  className="flex items-center gap-1.5 hover:text-indigo-400 transition truncate"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: activeProject.color }} />
                  <span className="truncate">{activeProject.name}</span>
                  <Settings className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>
              ) : (
                'All Tasks'
              )}
            </span>
          </div>
        </div>

        {/* Right: Actions, Notifications, & User Profile Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <NotificationDrawer isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
          </div>

          {/* User Profile Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 transition"
            >
              <img
                src={activeUser?.avatar}
                alt={activeUser?.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-600"
              />
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{activeUser?.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute top-11 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 p-1 w-52">
                <button
                  onClick={() => {
                    dispatch(logoutUser());
                    setIsUserDropdownOpen(false);
                    router.replace('/login');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <span>Switch Account / Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Undo / Redo */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => dispatch(undoTaskAction())}
              disabled={history.past.length === 0}
              className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
              title="Undo Action (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => dispatch(redoTaskAction())}
              disabled={history.future.length === 0}
              className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
              title="Redo Action (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New Task Button */}
          {canEdit && (
            <button
              onClick={() => dispatch(openModal({ modal: 'createTask' }))}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Second Row: View Tabs & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-800/80 rounded-lg border border-slate-700/80 overflow-x-auto max-w-full">
          {views.map((v) => {
            const Icon = v.icon;
            const isActive = activeViewMode === v.id;
            return (
              <button
                key={v.id}
                onClick={() => dispatch(setActiveViewMode(v.id))}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filters & Sorting Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-32 sm:w-40 transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => dispatch(setStatusFilter(e.target.value as TaskStatus | 'all'))}
            className="px-2 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => dispatch(setPriorityFilter(e.target.value as TaskPriority | 'all'))}
            className="px-2 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => dispatch(setAssigneeFilter(e.target.value))}
            className="px-2 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Assignees</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value as any))}
            className="px-2 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="createdAt">Sort: Created Date</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="title">Sort: Title</option>
          </select>

          {/* Sort Order Toggle */}
          <button
            onClick={() => dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'))}
            className="p-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg text-slate-300 hover:text-white transition"
            title={`Sort Order: ${sortOrder.toUpperCase()}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
