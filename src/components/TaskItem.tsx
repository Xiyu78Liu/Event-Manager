import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Task, Attachment } from '../types';
import { getDateStatus, getDateStatusClasses, getDateIndicatorClasses, formatDate, getPriorityClasses } from '../utils/dateUtils';
import { AttachmentPreview } from './AttachmentPreview';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const dateStatus = getDateStatus(task.dueDate);
  const [previewAttachments, setPreviewAttachments] = useState<Attachment[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const openPreview = () => {
    if (Array.isArray(task.attachments) && task.attachments.length > 0) {
      setPreviewAttachments(task.attachments);
      setShowPreview(true);
    }
  };

  return (
    <>
    <motion.div
      layout
      transition={{ type: 'tween', duration: 0.2 }}
      className={`glass-card p-4 relative ${task.completed ? 'opacity-50' : ''}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-full ${getDateIndicatorClasses(dateStatus)}`} />

      <div className="flex items-center gap-3 pr-3">
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            task.completed
              ? 'bg-indigo-500 border-indigo-500 text-white'
              : 'border-[var(--border-input)] hover:border-[rgba(var(--color-primary-rgb),0.5)] hover:bg-[rgba(var(--color-primary-rgb),0.08)]'
          }`}
        >
          {task.completed && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium text-sm ${task.completed ? 'line-through text-[var(--text-faint)]' : 'text-[var(--text-primary)]'}`}>
              {task.name}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityClasses(task.priority)}`}>
              {task.priority}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-filter)] text-[var(--text-muted)] border border-[var(--border-default)]">
              {task.group}
            </span>
            {task.estimatedTime && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(var(--color-primary-rgb),0.08)] text-[rgba(var(--color-primary-rgb),1)] border border-[rgba(var(--color-primary-rgb),0.2)]">
                {task.estimatedTime}
              </span>
            )}
            {/* 备注图标 */}
            {task.notes && (
              <div className="relative group/notes">
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
            {/* 附件图标 */}
            {Array.isArray(task.attachments) && task.attachments.length > 0 && (
              <div className="relative group/att cursor-pointer" onClick={openPreview}>
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
          </div>
          <div className="flex items-center gap-3 mt-1">
            {task.dueDate && (
              <p className={`text-xs ${getDateStatusClasses(dateStatus)}`}>
                {dateStatus === 'overdue' && '已过期 · '}
                {dateStatus === 'soon' && '即将到期 · '}
                {formatDate(task.dueDate)}
              </p>
            )}
            {task.completed && task.completedAt && (
              <p className="text-xs text-[var(--text-faint)]">
                完成于 {formatDate(task.completedAt)}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="glass-btn p-2 text-[var(--text-faint)] hover:text-[rgba(var(--color-primary-rgb),1)]"
            title="编辑"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="glass-btn p-2 text-[var(--text-faint)] hover:text-red-600"
            title="删除"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
      <AttachmentPreview
        attachments={previewAttachments}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}
