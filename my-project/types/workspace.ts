/**
 * Workspace Manager Core Domain Types & Models
 * Production-Grade Client-Side Notion / Jira / Trello Hybrid Architecture
 */

export type SystemRole = 'owner' | 'admin' | 'member' | 'viewer';
export type Department = 'Engineering' | 'Design' | 'Product' | 'Marketing';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  password?: string;
  systemRole: SystemRole;
  jobTitle: string;
  department: Department;
}

export type DefaultView = 'board' | 'list' | 'timeline' | 'calendar' | 'table' | 'my_work';

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
  memberIds: string[];
  defaultView: DefaultView;
  ownerId: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  memberIds: string[];
  leadId: string;
  isArchived: boolean;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  assigneeId: string | null;
}

export interface Attachment {
  id: string;
  name: string;
  url: string; // Base64, Blob URL, or remote URL
  type: string;
  size?: number;
  uploadedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeId: string | null;
  reviewerId: string | null;
  reporterId: string;
  labels: string[];
  subtasks: Subtask[];
  attachments: Attachment[];
  createdAt: string;
}

export type ActivityActionType =
  | 'task_created'
  | 'status_changed'
  | 'priority_changed'
  | 'assignee_changed'
  | 'reviewer_changed'
  | 'subtask_toggled'
  | 'subtask_added'
  | 'comment_added'
  | 'attachment_added'
  | 'project_archived';

export interface ActivityLog {
  id: string;
  taskId?: string;
  projectId: string;
  userId: string;
  actionType: ActivityActionType;
  timestamp: string;
  details: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export type NotificationType =
  | 'task_assigned'
  | 'review_requested'
  | 'mention'
  | 'due_soon'
  | 'status_update'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: NotificationType;
  createdAt: string;
}

export interface WorkspaceManagerStore {
  users: User[];
  workspaces: Workspace[];
  projects: Project[];
  tasks: Task[];
  activityLogs: ActivityLog[];
  comments: Comment[];
  notifications: Notification[];
  activeUserId: string;
  activeWorkspaceId: string;
  activeProjectId: string | null;
  searchQuery: string;
  statusFilter: TaskStatus | 'all';
  priorityFilter: TaskPriority | 'all';
  assigneeFilter: string | 'all';
}
