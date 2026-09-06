'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { openModal } from '../../store/slices/uiSlice';
import { Task } from '../../types/workspace';
import { EmptyState } from '../ui/EmptyState';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

export function CalendarView() {
  const dispatch = useAppDispatch();
  const { tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter } = useAppSelector(
    (state) => state.task
  );
  const { activeWorkspaceId } = useAppSelector((state) => state.workspace);
  const { projects, activeProjectId } = useAppSelector((state) => state.project);

  const [currentDate, setCurrentDate] = useState(new Date('2026-09-01T00:00:00.000Z'));

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date('2026-09-01T00:00:00.000Z'));

  const calendarCells = [];
  // Empty padding cells for starting day offset
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const priorityDotColors: Record<string, string> = {
    urgent: 'bg-rose-500',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
    low: 'bg-slate-400',
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-slate-950 space-y-4">
      {/* Calendar Header Toolbar */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-slate-100">{monthName}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Today
          </button>
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded hover:bg-slate-700 text-slate-300 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded hover:bg-slate-700 text-slate-300 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Grid Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl min-w-[800px]">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-800/90 text-center py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Grid Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/60 min-h-[550px]">
          {calendarCells.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty_${idx}`} className="bg-slate-950/40 min-h-[100px] p-2" />;
            }

            // Tasks due on this specific date
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayTasks = filteredTasks.filter((t) => t.dueDate && t.dueDate.startsWith(dateStr));

            const isToday = dayNum === 1 && month === 8 && year === 2026;

            return (
              <div
                key={`day_${dayNum}`}
                className={`min-h-[100px] p-2 flex flex-col space-y-1 hover:bg-slate-800/20 transition ${
                  isToday ? 'bg-indigo-500/5' : 'bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                      isToday ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">
                      {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Task Pills */}
                <div className="flex-1 overflow-y-auto space-y-1 max-h-24">
                  {dayTasks.map((t) => {
                    const project = projects.find((p) => p.id === t.projectId);
                    return (
                      <div
                        key={t.id}
                        onClick={() => dispatch(openModal({ modal: 'editTask', taskId: t.id }))}
                        className="px-2 py-1 rounded bg-slate-800/90 border border-slate-700/80 hover:border-indigo-500 text-[10px] text-slate-200 cursor-pointer truncate flex items-center gap-1.5 transition"
                        title={t.title}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDotColors[t.priority]}`} />
                        <span className="truncate font-medium">{t.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
