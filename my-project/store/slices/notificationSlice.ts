import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../types/workspace';
import initialMockData from '../../mock/index';

export interface NotificationPreferences {
  emailDigest: boolean;
  pushNotifications: boolean;
  sound: boolean;
}

export interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreferences;
}

const initialState: NotificationState = {
  notifications: initialMockData.notifications,
  preferences: {
    emailDigest: true,
    pushNotifications: true,
    sound: true,
  },
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif) notif.isRead = true;
    },
    markAllAsRead: (state, action: PayloadAction<string>) => {
      // mark all for given userId
      state.notifications.forEach((n) => {
        if (n.userId === action.payload) {
          n.isRead = true;
        }
      });
    },
    clearNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    updateNotificationPreferences: (state, action: PayloadAction<Partial<NotificationPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setAllNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotification,
  updateNotificationPreferences,
  setAllNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
