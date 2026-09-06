import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskStatus, TaskPriority, Subtask, Attachment } from '../../types/workspace';
import initialMockData from '../../mock/index';

export interface TaskState {
  tasks: Task[];
  searchQuery: string;
  statusFilter: TaskStatus | 'all';
  priorityFilter: TaskPriority | 'all';
  assigneeFilter: string | 'all';
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
  history: {
    past: Task[][];
    future: Task[][];
  };
}

const initialState: TaskState = {
  tasks: initialMockData.tasks,
  searchQuery: '',
  statusFilter: 'all',
  priorityFilter: 'all',
  assigneeFilter: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  history: {
    past: [],
    future: [],
  },
};

const pushHistory = (state: TaskState) => {
  // Limit undo history stack size to 25 items
  const newPast = [...state.history.past, state.tasks.map((t) => ({ ...t, subtasks: [...t.subtasks], attachments: [...t.attachments] }))];
  if (newPast.length > 25) {
    newPast.shift();
  }
  state.history.past = newPast;
  state.history.future = [];
};

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      pushHistory(state);
      state.tasks.unshift(action.payload);
    },
    updateTask: (state, action: PayloadAction<Partial<Task> & { id: string }>) => {
      pushHistory(state);
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload };
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      pushHistory(state);
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    moveTaskStatus: (state, action: PayloadAction<{ taskId: string; newStatus: TaskStatus }>) => {
      pushHistory(state);
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.status = action.payload.newStatus;
      }
    },
    // Subtask actions
    addSubtask: (state, action: PayloadAction<{ taskId: string; subtask: Subtask }>) => {
      pushHistory(state);
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.subtasks.push(action.payload.subtask);
      }
    },
    toggleSubtask: (state, action: PayloadAction<{ taskId: string; subtaskId: string }>) => {
      pushHistory(state);
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        const sub = task.subtasks.find((s) => s.id === action.payload.subtaskId);
        if (sub) sub.isCompleted = !sub.isCompleted;
      }
    },
    deleteSubtask: (state, action: PayloadAction<{ taskId: string; subtaskId: string }>) => {
      pushHistory(state);
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.subtasks = task.subtasks.filter((s) => s.id !== action.payload.subtaskId);
      }
    },
    updateSubtaskAssignee: (
      state,
      action: PayloadAction<{ taskId: string; subtaskId: string; assigneeId: string | null }>
    ) => {
      pushHistory(state);
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        const sub = task.subtasks.find((s) => s.id === action.payload.subtaskId);
        if (sub) sub.assigneeId = action.payload.assigneeId;
      }
    },
    // Attachments
    addAttachment: (state, action: PayloadAction<{ taskId: string; attachment: Attachment }>) => {
      pushHistory(state);
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.attachments.push(action.payload.attachment);
      }
    },
    deleteAttachment: (state, action: PayloadAction<{ taskId: string; attachmentId: string }>) => {
      pushHistory(state);
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.attachments = task.attachments.filter((a) => a.id !== action.payload.attachmentId);
      }
    },
    // Bulk Operations
    bulkUpdateStatus: (state, action: PayloadAction<{ taskIds: string[]; status: TaskStatus }>) => {
      pushHistory(state);
      state.tasks.forEach((t) => {
        if (action.payload.taskIds.includes(t.id)) {
          t.status = action.payload.status;
        }
      });
    },
    bulkDeleteTasks: (state, action: PayloadAction<string[]>) => {
      pushHistory(state);
      state.tasks = state.tasks.filter((t) => !action.payload.includes(t.id));
    },
    // Filters & Sorting
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<TaskStatus | 'all'>) => {
      state.statusFilter = action.payload;
    },
    setPriorityFilter: (state, action: PayloadAction<TaskPriority | 'all'>) => {
      state.priorityFilter = action.payload;
    },
    setAssigneeFilter: (state, action: PayloadAction<string | 'all'>) => {
      state.assigneeFilter = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'dueDate' | 'priority' | 'createdAt' | 'title'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    // Undo / Redo History Stack
    undoTaskAction: (state) => {
      if (state.history.past.length > 0) {
        const previous = state.history.past.pop()!;
        state.history.future.unshift(state.tasks);
        state.tasks = previous;
      }
    },
    redoTaskAction: (state) => {
      if (state.history.future.length > 0) {
        const next = state.history.future.shift()!;
        state.history.past.push(state.tasks);
        state.tasks = next;
      }
    },
    setAllTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.history = { past: [], future: [] };
    },
  },
});

export const {
  addTask,
  updateTask,
  deleteTask,
  moveTaskStatus,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  updateSubtaskAssignee,
  addAttachment,
  deleteAttachment,
  bulkUpdateStatus,
  bulkDeleteTasks,
  setSearchQuery,
  setStatusFilter,
  setPriorityFilter,
  setAssigneeFilter,
  setSortBy,
  setSortOrder,
  undoTaskAction,
  redoTaskAction,
  setAllTasks,
} = taskSlice.actions;

export default taskSlice.reducer;
