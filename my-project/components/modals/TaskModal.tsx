'use client';

import React, { useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeModal } from '../../store/slices/uiSlice';
import {
  updateTask,
  deleteTask,
  addTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  updateSubtaskAssignee,
  addAttachment,
  deleteAttachment,
} from '../../store/slices/taskSlice';
import { addComment, addActivityLog } from '../../store/slices/activitySlice';
import { Task, TaskStatus, TaskPriority, Subtask, Attachment } from '../../types/workspace';
import {
  X,
  Trash2,
  Plus,
  CheckSquare,
  Square,
  Paperclip,
  MessageSquare,
  Clock,
  UserCheck,
  Tag,
  AlertCircle,
  History,
  Send,
  Upload,
  ArrowUpRight,
  User as UserIcon,
  Shield,
} from 'lucide-react';
import { PermissionGuard } from '../ui/PermissionGuard';


export function TaskModal() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { activeModal, selectedTaskIdForModal } = useAppSelector((state) => state.ui);
  const { tasks } = useAppSelector((state) => state.task);
  const { projects } = useAppSelector((state) => state.project);
  const { users, activeUserId } = useAppSelector((state) => state.auth);
  const { comments, activityLogs } = useAppSelector((state) => state.activity);

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskAssigneeId, setNewSubtaskAssigneeId] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'attachments' | 'activity'>('details');
  const [isDragOver, setIsDragOver] = useState(false);

  if (activeModal !== 'editTask' || !selectedTaskIdForModal) return null;

  const task = tasks.find((t) => t.id === selectedTaskIdForModal);
  if (!task) return null;

  const activeUser = users.find((u) => u.id === activeUserId);
  const project = projects.find((p) => p.id === task.projectId);
  const assignee = users.find((u) => u.id === task.assigneeId);
  const reviewer = users.find((u) => u.id === task.reviewerId);
  const reporter = users.find((u) => u.id === task.reporterId);

  const taskComments = comments.filter((c) => c.taskId === task.id);
  const taskActivity = activityLogs.filter((a) => a.taskId === task.id);

  const canEdit = activeUser?.systemRole !== 'viewer';
  const completedSubtasksCount = task.subtasks.filter((s) => s.isCompleted).length;

  const handleAssigneeChange = (newAssigneeId: string) => {
    const newAss = users.find((u) => u.id === newAssigneeId);
    dispatch(updateTask({ id: task.id, assigneeId: newAssigneeId || null }));

    dispatch(
      addActivityLog({
        id: `act_${Date.now()}`,
        taskId: task.id,
        projectId: task.projectId,
        userId: activeUserId!,
        actionType: 'assignee_changed',
        timestamp: new Date().toISOString(),
        details: newAssigneeId ? `reassigned task to ${newAss?.name}` : 'unassigned the task',
      })
    );
  };

  const handleReviewerChange = (newReviewerId: string) => {
    const newRev = users.find((u) => u.id === newReviewerId);
    dispatch(updateTask({ id: task.id, reviewerId: newReviewerId || null }));

    dispatch(
      addActivityLog({
        id: `act_${Date.now()}`,
        taskId: task.id,
        projectId: task.projectId,
        userId: activeUserId!,
        actionType: 'reviewer_changed',
        timestamp: new Date().toISOString(),
        details: newReviewerId ? `requested QA review from ${newRev?.name}` : 'removed task reviewer',
      })
    );
  };

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelInput.trim() || task.labels.includes(newLabelInput.trim())) return;
    dispatch(updateTask({ id: task.id, labels: [...task.labels, newLabelInput.trim()] }));
    setNewLabelInput('');
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    dispatch(updateTask({ id: task.id, labels: task.labels.filter((l) => l !== labelToRemove) }));
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !canEdit) return;

    const newSub: Subtask = {
      id: `sub_${Date.now()}`,
      title: newSubtaskTitle.trim(),
      isCompleted: false,
      assigneeId: newSubtaskAssigneeId || task.assigneeId,
    };

    dispatch(addSubtask({ taskId: task.id, subtask: newSub }));
    setNewSubtaskTitle('');
    setNewSubtaskAssigneeId('');
  };

  const handleConvertSubtaskToTask = (sub: Subtask) => {
    const convertedTask: Task = {
      id: `task_${Date.now()}`,
      projectId: task.projectId,
      title: sub.title,
      description: `Converted from subtask of #${task.id}: ${task.title}`,
      status: 'todo',
      priority: task.priority,
      dueDate: task.dueDate,
      assigneeId: sub.assigneeId || task.assigneeId,
      reviewerId: task.reviewerId,
      reporterId: activeUserId!,
      labels: task.labels,
      subtasks: [],
      attachments: [],
      createdAt: new Date().toISOString(),
    };

    dispatch(addTask(convertedTask));
    dispatch(deleteSubtask({ taskId: task.id, subtaskId: sub.id }));

    dispatch(
      addActivityLog({
        id: `act_${Date.now()}`,
        taskId: task.id,
        projectId: task.projectId,
        userId: activeUserId!,
        actionType: 'subtask_toggled',
        timestamp: new Date().toISOString(),
        details: `converted subtask '${sub.title}' into full task #${convertedTask.id}`,
      })
    );
  };

  // Base64 File Upload Handler
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0 || !canEdit) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        const attachmentObj: Attachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          url: base64Data,
          type: file.type || 'file',
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };

        dispatch(addAttachment({ taskId: task.id, attachment: attachmentObj }));
        dispatch(
          addActivityLog({
            id: `act_${Date.now()}`,
            taskId: task.id,
            projectId: task.projectId,
            userId: activeUserId!,
            actionType: 'attachment_added',
            timestamp: new Date().toISOString(),
            details: `uploaded attachment '${file.name}' (${(file.size / 1024).toFixed(1)} KB)`,
          })
        );
      };
      reader.readAsDataURL(file);
    });
  };

  // Comment & @Mention Autocomplete
  const handleCommentTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewCommentText(val);
    if (val.endsWith('@')) {
      setShowMentionMenu(true);
    } else if (!val.includes('@')) {
      setShowMentionMenu(false);
    }
  };

  const handleSelectMention = (user: (typeof users)[0]) => {
    setNewCommentText((prev) => prev.slice(0, prev.lastIndexOf('@')) + `@${user.name} `);
    setShowMentionMenu(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const commentObj = {
      id: `comment_${Date.now()}`,
      taskId: task.id,
      userId: activeUserId!,
      content: newCommentText.trim(),
      createdAt: new Date().toISOString(),
    };

    dispatch(addComment(commentObj));
    dispatch(
      addActivityLog({
        id: `act_${Date.now()}`,
        taskId: task.id,
        projectId: task.projectId,
        userId: activeUserId!,
        actionType: 'comment_added',
        timestamp: new Date().toISOString(),
        details: `added a comment: "${newCommentText.trim().substring(0, 30)}..."`,
      })
    );

    setNewCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3 min-w-0">
            {project && (
              <span className="text-xs px-2.5 py-1 rounded-md font-semibold text-white truncate" style={{ backgroundColor: project.color }}>
                {project.name}
              </span>
            )}
            <span className="text-xs text-slate-500 font-mono">#{task.id}</span>
            {reporter && (
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 hidden sm:inline">
                Reporter: {reporter.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <PermissionGuard requiredRole="member" projectId={task.projectId}>
              <button
                onClick={() => {
                  dispatch(deleteTask(task.id));
                  dispatch(closeModal());
                }}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </PermissionGuard>
            <button
              onClick={() => dispatch(closeModal())}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Grid Layout */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Left Content Panel (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Description Editor */}
            <div className="space-y-3">
              {canEdit ? (
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => dispatch(updateTask({ id: task.id, title: e.target.value }))}
                  className="w-full bg-transparent text-xl font-bold text-slate-100 border-b border-transparent focus:border-indigo-500 focus:outline-none py-1"
                />
              ) : (
                <h2 className="text-xl font-bold text-slate-100">{task.title}</h2>
              )}

              {canEdit ? (
                <textarea
                  value={task.description}
                  rows={3}
                  onChange={(e) => dispatch(updateTask({ id: task.id, description: e.target.value }))}
                  className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  placeholder="Task markdown description..."
                />
              ) : (
                <p className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl leading-relaxed">{task.description}</p>
              )}
            </div>

            {/* Label Tag Manager */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Labels & Tags</p>
              <div className="flex flex-wrap items-center gap-1.5">
                {task.labels.map((lbl) => (
                  <span
                    key={lbl}
                    className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium"
                  >
                    #{lbl}
                    {canEdit && (
                      <button onClick={() => handleRemoveLabel(lbl)} className="hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}

                {canEdit && (
                  <form onSubmit={handleAddLabel} className="inline-flex">
                    <input
                      type="text"
                      placeholder="+ Add label"
                      value={newLabelInput}
                      onChange={(e) => setNewLabelInput(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-full px-2.5 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-24"
                    />
                  </form>
                )}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-800 text-xs font-semibold gap-6 pt-2">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 transition ${activeTab === 'details' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Comments ({taskComments.length})
              </button>
              <button
                onClick={() => setActiveTab('subtasks')}
                className={`pb-2 transition ${activeTab === 'subtasks' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Subtasks ({task.subtasks.length})
              </button>
              <button
                onClick={() => setActiveTab('attachments')}
                className={`pb-2 transition ${activeTab === 'attachments' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Attachments ({task.attachments.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-2 transition ${activeTab === 'activity' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Audit Log ({taskActivity.length})
              </button>
            </div>

            {/* Tab 1: Comments & @Mentions */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <form onSubmit={handleAddComment} className="relative space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment... (Type @ to mention team members)"
                      value={newCommentText}
                      onChange={handleCommentTextChange}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>

                  {/* @Mention Autocomplete Dropdown */}
                  {showMentionMenu && (
                    <div className="absolute top-11 left-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 p-1 w-56">
                      <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Mention Team Member
                      </p>
                      {users.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleSelectMention(u)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition text-left"
                        >
                          <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
                          <span className="font-semibold truncate">{u.name}</span>
                          <span className="text-[9px] text-slate-400 truncate">({u.jobTitle})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </form>

                <div className="space-y-3">
                  {taskComments.map((comm) => {
                    const commUser = users.find((u) => u.id === comm.userId);
                    return (
                      <div key={comm.id} className="p-3 bg-slate-800/50 border border-slate-800 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {commUser && (
                              <img src={commUser.avatar} alt={commUser.name} className="w-5 h-5 rounded-full object-cover" />
                            )}
                            <span className="font-semibold text-slate-200">{commUser?.name || 'Unknown User'}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 pl-7 leading-relaxed">{comm.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Subtasks Engine */}
            {activeTab === 'subtasks' && (
              <div className="space-y-4">
                {/* Progress Meter Bar */}
                {task.subtasks.length > 0 && (
                  <div className="space-y-1 p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Subtask Progress Meter</span>
                      <span className="font-mono text-indigo-400">
                        {completedSubtasksCount} / {task.subtasks.length} Completed (
                        {Math.round((completedSubtasksCount / task.subtasks.length) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${(completedSubtasksCount / task.subtasks.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {canEdit && (
                  <form onSubmit={handleAddSubtask} className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="New subtask title..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 min-w-[200px]"
                    />
                    <select
                      value={newSubtaskAssigneeId}
                      onChange={(e) => setNewSubtaskAssigneeId(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                    >
                      <option value="">Subtask Assignee...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Subtask</span>
                    </button>
                  </form>
                )}

                <div className="space-y-2">
                  {task.subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex flex-wrap items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs gap-3"
                    >
                      <div
                        onClick={() => dispatch(toggleSubtask({ taskId: task.id, subtaskId: sub.id }))}
                        className="flex items-center gap-2 cursor-pointer flex-1 min-w-[180px]"
                      >
                        {sub.isCompleted ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className={sub.isCompleted ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}>
                          {sub.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Subtask Assignee */}
                        <select
                          value={sub.assigneeId || ''}
                          onChange={(e) =>
                            dispatch(
                              updateSubtaskAssignee({
                                taskId: task.id,
                                subtaskId: sub.id,
                                assigneeId: e.target.value || null,
                              })
                            )
                          }
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-300"
                        >
                          <option value="">Unassigned</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </select>

                        {/* Convert to Task Button */}
                        {canEdit && (
                          <button
                            onClick={() => handleConvertSubtaskToTask(sub)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 rounded text-[10px] font-semibold flex items-center gap-1 transition"
                            title="Convert Subtask to Full Task"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Convert</span>
                          </button>
                        )}

                        {canEdit && (
                          <button
                            onClick={() => dispatch(deleteSubtask({ taskId: task.id, subtaskId: sub.id }))}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Base64 Drag & Drop File Attachments */}
            {activeTab === 'attachments' && (
              <div className="space-y-4">
                {canEdit && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
                      isDragOver
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700/80 bg-slate-800/30 hover:border-slate-600'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-indigo-400 mb-2" />
                    <p className="text-xs font-semibold text-slate-200">
                      Drag & Drop files here, or <span className="text-indigo-400 underline">browse</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Converts documents/images into Base64 strings in Redux state</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {task.attachments.map((att) => {
                    const isImage = att.url.startsWith('data:image/') || att.type.includes('image');
                    return (
                      <div
                        key={att.id}
                        className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isImage ? (
                            <img src={att.url} alt={att.name} className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0">
                              <Paperclip className="w-5 h-5" />
                            </div>
                          )}
                          <div className="truncate">
                            <a href={att.url} download={att.name} target="_blank" rel="noreferrer" className="font-semibold text-indigo-400 hover:underline truncate block">
                              {att.name}
                            </a>
                            {att.size && <span className="text-[10px] text-slate-500 font-mono">{(att.size / 1024).toFixed(1)} KB</span>}
                          </div>
                        </div>

                        {canEdit && (
                          <button
                            onClick={() => dispatch(deleteAttachment({ taskId: task.id, attachmentId: att.id }))}
                            className="text-slate-500 hover:text-rose-400 p-1 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 4: Reassignment Audit Log Side-Feed */}
            {activeTab === 'activity' && (
              <div className="space-y-2">
                {taskActivity.map((act) => {
                  const actUser = users.find((u) => u.id === act.userId);
                  return (
                    <div key={act.id} className="flex items-start gap-3 text-xs p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                      <History className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-slate-300">
                          <span className="font-semibold text-slate-100">{actUser?.name || 'User'}</span> {act.details}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(act.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dedicated Right Side-Panel Properties */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-4 text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] pb-2 border-b border-slate-800">
              Task Attributes
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Status</label>
                {canEdit ? (
                  <select
                    value={task.status}
                    onChange={(e) => dispatch(updateTask({ id: task.id, status: e.target.value as TaskStatus }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-200"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                ) : (
                  <span className="capitalize font-semibold text-indigo-400">{task.status.replace('_', ' ')}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Priority</label>
                {canEdit ? (
                  <select
                    value={task.priority}
                    onChange={(e) => dispatch(updateTask({ id: task.id, priority: e.target.value as TaskPriority }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-200"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                ) : (
                  <span className="capitalize font-semibold text-amber-400">{task.priority}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Assignee</label>
                {canEdit ? (
                  <select
                    value={task.assigneeId || ''}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-200 truncate"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-slate-200 font-medium">{assignee?.name || 'Unassigned'}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Reviewer (QA)</label>
                {canEdit ? (
                  <select
                    value={task.reviewerId || ''}
                    onChange={(e) => handleReviewerChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-200 truncate"
                  >
                    <option value="">No Reviewer</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-slate-200 font-medium">{reviewer?.name || 'None'}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Due Date</label>
                {canEdit ? (
                  <input
                    type="date"
                    value={task.dueDate ? task.dueDate.substring(0, 10) : ''}
                    onChange={(e) =>
                      dispatch(
                        updateTask({
                          id: task.id,
                          dueDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                        })
                      )
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-200"
                  />
                ) : (
                  <span className="text-slate-300 font-mono">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
