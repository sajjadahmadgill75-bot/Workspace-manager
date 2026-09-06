import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActivityLog, Comment } from '../../types/workspace';
import initialMockData from '../../mock/index';

export interface ActivityState {
  activityLogs: ActivityLog[];
  comments: Comment[];
}

const initialState: ActivityState = {
  activityLogs: initialMockData.activityLogs,
  comments: initialMockData.comments,
};

export const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    addActivityLog: (state, action: PayloadAction<ActivityLog>) => {
      state.activityLogs.unshift(action.payload);
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments.push(action.payload);
    },
    deleteComment: (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter((c) => c.id !== action.payload);
    },
    updateComment: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const comm = state.comments.find((c) => c.id === action.payload.id);
      if (comm) {
        comm.content = action.payload.content;
      }
    },
    setAllActivity: (
      state,
      action: PayloadAction<{ activityLogs: ActivityLog[]; comments: Comment[] }>
    ) => {
      state.activityLogs = action.payload.activityLogs;
      state.comments = action.payload.comments;
    },
  },
});

export const { addActivityLog, addComment, deleteComment, updateComment, setAllActivity } =
  activitySlice.actions;

export default activitySlice.reducer;
