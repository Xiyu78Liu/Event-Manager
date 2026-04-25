import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Task, Attachment, SubTask } from '../types';
import type { AppSettings } from '../hooks/useSettings';
import { getDateStatus, getDateIndicatorClasses, formatDateTime, getPriorityClasses } from '../utils/dateUtils';
import { AttachmentPreview } from './AttachmentPreview';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface PriorityPanelProps {
  tasks: Task[];
  subTasks?: SubTask[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  batchMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  settings?: AppSettings;
}

export function PriorityPanel({ tasks, subTasks = [], onToggleComplete, onEdit, onDelete, batchMode, selectedIds, onToggleSelect, settings }: PriorityPanelProps) {
  const [previewAttachments, setPreviewAttachments] = useState<Attachment[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const reduced = useReducedMotion();

  const openPreview = (task: Task) => {
    if (Array.isArray(task.attachments) && task.attachments.length > 0) {
      setPreviewAttachments(task.attachments);
      setShowPreview(true);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <svg className="w-10 h-10 mx-auto mb-2 text-[var(--text-weakest)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
        <p className="text-[var(--text-faint)] text-sm">所有任务已完成!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {tasks.map((task, index) => {
          const dateStatus = getDateStatus(task.dueDate);
          const dueTime = task.dueDate.includes('T') ? task.dueDate.split('T')[1] : undefined;
          const isHigh = task.priority === '高';
          const isSelected = batchMode && selectedIds?.has(task.id);

          return (
            <motion.div
              key={task.id}
              layout
              initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={reduced ? { duration: 0 } : { delay: Math.min(index * 0.03, 0.3), type: 'spring', damping: 25, stiffness: 300 }}
              className={`glass-card p-3 relative group cursor-pointer transition-all ${
                isHigh ? 'ring-1 ring-red-200/60' : ''
              } ${isSelected ? 'ring-2 ring-[rgba(var(--color-primary-rgb),0.5)] bg-[rgba(var(--color-primary-rgb),0.08)]' : ''}`}
              onClick={() => batchMode && onToggleSelect?.(task.id)}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-full ${getDateIndicatorClasses(dateStatus)}`} />
              <div className="flex items-center gap-2 pr-3">
                {/* 批量选择复选框 */}
                {batchMode && (
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-[var(--border-input)]'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
                  className="w-4 h-4 rounded-full border-2 border-[var(--border-input)] hover:border-[rgba(var(--color-primary-rgb),0.5)] flex-shrink-0 transition-colors"
                />
                <span className="text-sm text-[var(--text-primary)] truncate flex-1">{task.name}</span>
                {(() => {
                  const taskSubs = subTasks.filter(s => s.parentId === task.id);
                  if (taskSubs.length > 0) {
                    const completedCount = taskSubs.filter(s => s.completed).length;
                    return (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'var(--bg-filter, #f3f4f6)', color: 'var(--text-muted, #9ca3af)' }}
                      >
                        {completedCount}/{taskSubs.length} 子任务
                      </span>
                    );
                  }
                  return null;
                })()}
                {task.estimatedTime && settings?.showEstimatedTime !== false && (
                  <span className="text-xs text-[var(--text-faint)] flex-shrink-0">⏱ {task.estimatedTime}</span>
                )}

                {/* 备注图标 + tooltip */}
                {task.notes && settings?.showNotes !== false && (
                  <div className="relative group/notes flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-[var(--text-faint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    <div className="invisible group-hover/notes:visible opacity-0 group-hover/notes:opacity-100 transition-all absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 pointer-events-none">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-gray-800 rotate-45" />
                      <p className="font-medium text-gray-300 mb-1">备注</p>
                      <p className="whitespace-pre-wrap break-words">{task.notes}</p>
                    </div>
                  </div>
                )}

                {/* 附件图标 + tooltip */}
                {Array.isArray(task.attachments) && task.attachments.length > 0 && settings?.showAttachments !== false && (
                  <div
                    className="relative group/att flex-shrink-0 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); openPreview(task); }}
                  >
                    <svg className="w-3.5 h-3.5 text-[var(--text-faint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                    <div className="invisible group-hover/att:visible opacity-0 group-hover/att:opacity-100 transition-all absolute bottom-full right-0 mb-2 w-64 p-2.5 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 pointer-events-none">
                      <div className="absolute top-full right-3 -mt-px w-2 h-2 bg-gray-800 rotate-45" />
                      <p className="font-medium text-gray-300 mb-1.5">附件（{task.attachments.length}）</p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {task.attachments.map(att => (
                          att.type === 'image' && att.data ? (
                            <div key={att.id} className="flex items-center gap-2">
                              <img src={att.data} alt={att.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                              <span className="truncate">{att.name}</span>
                            </div>
                          ) : (
                            <div key={att.id} className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                              <span className="truncate">{att.name}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <span className={`text-xs px-1.5 py-0.5 rounded-full border flex-shrink-0 ${getPriorityClasses(task.priority)}`}>
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-[var(--text-faint)] flex-shrink-0">{formatDateTime(task.dueDate, dueTime)}</span>
                )}
                {/* 编辑和删除按钮 */}
                {!batchMode && (
                  <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                      className="glass-btn p-1.5 text-[var(--text-faint)] hover:text-[rgba(var(--color-primary-rgb),1)]"
                      title="编辑"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                      className="glass-btn p-1.5 text-[var(--text-faint)] hover:text-red-600"
                      title="删除"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <AttachmentPreview
        attachments={previewAttachments}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
