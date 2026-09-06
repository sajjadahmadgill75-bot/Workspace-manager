'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { addNotification } from '../store/slices/notificationSlice';
import { addActivityLog } from '../store/slices/activitySlice';
import { showToast } from '../store/slices/uiSlice';

export function useMockLiveUpdates() {
  const dispatch = useAppDispatch();
  const { activeUserId, users } = useAppSelector((state) => state.auth);
  const { tasks } = useAppSelector((state) => state.task);

  useEffect(() => {
    if (!activeUserId || tasks.length === 0) return;

    // Inject simulated WebSocket live push event every 35 seconds
    const interval = setInterval(() => {
      const randomUser = users.find((u) => u.id !== activeUserId) || users[0];
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)];

      const events = [
        {
          title: 'Review Requested',
          message: `${randomUser.name} requested your QA review on '${randomTask.title}'.`,
          type: 'review_requested' as const,
        },
        {
          title: 'Task Assigned',
          message: `${randomUser.name} assigned you to '${randomTask.title}'.`,
          type: 'task_assigned' as const,
        },
        {
          title: 'Comment Mention',
          message: `${randomUser.name} mentioned you in a comment on '${randomTask.title}'.`,
          type: 'mention' as const,
        },
      ];

      const chosenEvent = events[Math.floor(Math.random() * events.length)];

      // 1. Push into Redux Notifications
      dispatch(
        addNotification({
          id: `notif_live_${Date.now()}`,
          userId: activeUserId,
          title: chosenEvent.title,
          message: chosenEvent.message,
          isRead: false,
          type: chosenEvent.type,
          createdAt: new Date().toISOString(),
        })
      );

      // 2. Push into Activity Feed
      dispatch(
        addActivityLog({
          id: `act_live_${Date.now()}`,
          taskId: randomTask.id,
          projectId: randomTask.projectId,
          userId: randomUser.id,
          actionType: 'status_changed',
          timestamp: new Date().toISOString(),
          details: chosenEvent.message,
        })
      );

      // 3. Show Toast Notification
      dispatch(
        showToast({
          message: chosenEvent.message,
          type: 'info',
        })
      );
    }, 35000);

    return () => clearInterval(interval);
  }, [dispatch, activeUserId, users, tasks]);
}
