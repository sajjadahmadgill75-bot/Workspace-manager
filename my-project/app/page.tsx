'use client';

import React from 'react';
import { useAppSelector } from '../store';
import { useMockLiveUpdates } from '../hooks/useMockLiveUpdates';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BoardView } from '../components/views/BoardView';
import { ListView } from '../components/views/ListView';
import { TableView } from '../components/views/TableView';
import { TimelineView } from '../components/views/TimelineView';
import { CalendarView } from '../components/views/CalendarView';
import { MyWorkView } from '../components/views/MyWorkView';
import { TaskModal } from '../components/modals/TaskModal';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import { CreateWorkspaceModal } from '../components/modals/CreateWorkspaceModal';
import { WorkspaceSettingsModal } from '../components/modals/WorkspaceSettingsModal';
import { ProjectSettingsModal } from '../components/modals/ProjectSettingsModal';
import { CommandPalette } from '../components/modals/CommandPalette';
import { DataBackupModal } from '../components/modals/DataBackupModal';
import { ToastContainer } from '../components/ui/ToastContainer';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkspaceManagerPage() {
  const router = useRouter();
  const { activeUserId } = useAppSelector((state) => state.auth);
  const { activeViewMode } = useAppSelector((state) => state.ui);

  useEffect(() => {
    if (!activeUserId) {
      router.replace('/login');
    }
  }, [activeUserId, router]);

  // Activate WebSockets simulated live background push notifications hook
  useMockLiveUpdates();
  // Activate global keyboard shortcuts
  useKeyboardShortcuts();

  if (!activeUserId) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header & Toolbar */}
        <Header />

        {/* View Component Switcher */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeViewMode === 'board' && <BoardView />}
          {activeViewMode === 'list' && <ListView />}
          {activeViewMode === 'table' && <TableView />}
          {activeViewMode === 'timeline' && <TimelineView />}
          {activeViewMode === 'calendar' && <CalendarView />}
          {activeViewMode === 'my_work' && <MyWorkView />}
        </main>
      </div>

      {/* Modals & Dialog Portals */}
      <TaskModal />
      <CreateTaskModal />
      <CreateProjectModal />
      <CreateWorkspaceModal />
      <WorkspaceSettingsModal />
      <ProjectSettingsModal />
      <CommandPalette />
      <DataBackupModal />
      <ToastContainer />
    </div>
  );
}
