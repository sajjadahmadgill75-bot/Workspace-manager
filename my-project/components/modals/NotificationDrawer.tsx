'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { markAsRead, markAllAsRead, clearNotification } from '../../store/slices/notificationSlice';
import { NotificationType } from '../../types/workspace';
import { Bell, CheckCheck, Trash2, X, AlertCircle, Calendar, MessageSquare, Shield } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.notification);
  const { activeUserId } = useAppSelector((state) => state.auth);

  if (!isOpen) return null;

  const userNotifs = notifications.filter((n) => n.userId === activeUserId!);
  const unreadCount = userNotifs.filter((n) => !n.isRead).length;

  const typeIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
    task_assigned: Bell,
    review_requested: AlertCircle,
    mention: MessageSquare,
    due_soon: Calendar,
    status_update: CheckCheck,
    system: Shield,
  };

  return (
    <div className="absolute top-14 right-6 z-50 w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="p-3 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold text-slate-100">Notifications</h4>
          {unreadCount > 0 && (
            <span className="bg-indigo-500 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={() => dispatch(markAllAsRead(activeUserId!))}
              className="text-[10px] text-indigo-400 hover:underline font-semibold p-1"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
        {userNotifs.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs italic">No notifications yet.</div>
        ) : (
          userNotifs.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell;
            return (
              <div
                key={notif.id}
                onClick={() => dispatch(markAsRead(notif.id))}
                className={`p-3 text-xs transition flex items-start justify-between gap-3 cursor-pointer ${
                  notif.isRead ? 'bg-slate-900/40 opacity-70' : 'bg-indigo-500/5 font-semibold'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400 shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-slate-200 font-bold truncate">{notif.title}</p>
                    <p className="text-[11px] text-slate-400 leading-tight">{notif.message}</p>
                    <p className="text-[9px] text-slate-500 font-mono">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(clearNotification(notif.id));
                  }}
                  className="text-slate-500 hover:text-rose-400 p-1 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
