import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SubTaskForm } from '../SubTaskForm';
import type { Task, SubTask, SubTaskFormData } from '../../types';
import { getPriorityClasses, formatDate, getDateStatusClasses, getDateStatus } from '../../utils/dateUtils';

interface DecomposeTabProps {
  tasks: Task[];
  subTasks: SubTask[];
  getSubTasksByParentId: (parentId: string) => SubTask[];
  addSubTask: (parentId: string, data: SubTaskFormData) => void;
  updateSubTask: (id: string, data: Partial<SubTaskFormData & { completed: boolean }>) => void;
  deleteSubTask: (id: string) => void;
  toggleSubTaskComplete: (id: string) => void;
  toggleComplete: (id: string) => void;
}

export function DecomposeTab({
  tasks,
  subTasks,
  getSubTasksByParentId,
  addSubTask,
  updateSubTask,
  deleteSubTask,
  toggleSubTaskComplete,
  toggleComplete,
}: DecomposeTabProps) {
  // 只显示未完成的任务
  const incompleteTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);

  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubTask, setEditingSubTask] = useState<SubTask | null>(null);

  const selectedTask = useMemo(
    () => tasks.find(t => t.id === selectedParentId) || null,
    [tasks, selectedParentId]
  );

  const currentSubTasks = useMemo(
    () => selectedParentId ? getSubTasksByParentId(selectedParentId) : [],
    [selectedParentId, getSubTasksByParentId]
  );

  const completedCount = currentSubTasks.filter(st => st.completed).length;
  const totalCount = currentSubTasks.length;

  const handleAddSubTask = (data: SubTaskFormData) => {
    if (!selectedParentId) return;
    addSubTask(selectedParentId, data);
    setShowAddForm(false);
  };

  const handleEditSubTask = (data: SubTaskFormData) => {
    if (editingSubTask) {
      updateSubTask(editingSubTask.id, data);
      setEditingSubTask(null);
    }
  };

  const handleEditClick = (subTask: SubTask) => {
    setEditingSubTask(subTask);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingSubTask(null);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  const handleToggleSubTask = (subTaskId: string) => {
    const subTask = subTasks.find(s => s.id === subTaskId);
    if (!subTask) return;
    const parentId = subTask.parentId;
    toggleSubTaskComplete(subTaskId);
    // 检查切换后该父任务的所有子任务是否都已完成
    // 注意：由于 state 更新是异步的，需要基于当前状态判断
    const siblings = subTasks.filter(s => s.parentId === parentId);
    const willAllComplete = siblings.every(s =>
      s.id === subTaskId ? !s.completed : s.completed
    );
    if (willAllComplete && siblings.length > 0) {
      const confirmed = window.confirm('所有子任务已完成，是否将父任务标记为完成？');
      if (confirmed) {
        toggleComplete(parentId);
      }
    }
  };

  return (
    <div>
      {/* 父任务选择 */}
      <div className="mb-4">
        <label className="text-[var(--text-faint)] text-xs mb-1.5 block">选择父任务</label>
        <select
          value={selectedParentId}
          onChange={e => {
            setSelectedParentId(e.target.value);
            setShowAddForm(false);
            setEditingSubTask(null);
          }}
          className="glass-input w-full px-4 py-3 text-sm"
        >
          <option value="">-- 请选择一个未完成的任务 --</option>
          {incompleteTasks.map(t => {
            const subCount = getSubTasksByParentId(t.id).length;
            return (
              <option key={t.id} value={t.id}>
                {t.name}{subCount > 0 ? ` (${subCount} 个子任务)` : ''}
              </option>
            );
          })}
        </select>
      </div>

      {/* 父任务信息卡片 */}
      {selectedTask && (
        <motion.div
          className="glass-card p-4 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm text-[var(--text-primary)]">{selectedTask.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityClasses(selectedTask.priority)}`}>
              {selectedTask.priority}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            {selectedTask.dueDate && (
              <span className={getDateStatusClasses(getDateStatus(selectedTask.dueDate))}>
                截止: {formatDate(selectedTask.dueDate)}
              </span>
            )}
            <span>
              进度: {completedCount}/{totalCount}
            </span>
          </div>
          {totalCount > 0 && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          )}
        </motion.div>
      )}

      {/* 子任务列表 */}
      {selectedParentId && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-faint)] mb-3 uppercase tracking-wider">
            子任务
            <span className="text-[var(--text-weakest)] font-normal normal-case ml-1">({totalCount})</span>
          </h3>

          {currentSubTasks.length === 0 && !showAddForm && !editingSubTask && (
            <div className="text-center py-8 text-[var(--text-faint)] text-sm">
              <svg className="w-10 h-10 mx-auto mb-2 text-[var(--text-weakest)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
              <p>还没有子任务</p>
              <p className="text-xs text-[var(--text-weakest)] mt-1">点击下方按钮添加第一个子任务</p>
            </div>
          )}

          <AnimatePresence>
            {currentSubTasks.map(subTask => (
              <motion.div
                key={subTask.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`glass-card p-3 mb-2 ${subTask.completed ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {/* 完成圆圈 */}
                  <button
                    onClick={() => handleToggleSubTask(subTask.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      subTask.completed
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'border-[var(--border-input)] hover:border-[rgba(var(--color-primary-rgb),0.5)] hover:bg-[rgba(var(--color-primary-rgb),0.08)]'
                    }`}
                  >
                    {subTask.completed && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* 子任务信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium text-sm ${subTask.completed ? 'line-through text-[var(--text-faint)]' : 'text-[var(--text-primary)]'}`}>
                        {subTask.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityClasses(subTask.priority)}`}>
                        {subTask.priority}
                      </span>
                      {subTask.estimatedTime && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(var(--color-primary-rgb),0.08)] text-[rgba(var(--color-primary-rgb),1)] border border-[rgba(var(--color-primary-rgb),0.15)]">
                          {subTask.estimatedTime}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {subTask.dueDate && (
                        <span className={`text-xs ${getDateStatusClasses(getDateStatus(subTask.dueDate))}`}>
                          {formatDate(subTask.dueDate)}
                        </span>
                      )}
                      {subTask.notes && (
                        <span className="text-xs text-[var(--text-faint)] truncate max-w-[150px]" title={subTask.notes}>
                          {subTask.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEditClick(subTask)}
                      className="glass-btn p-1.5 text-[var(--text-faint)] hover:text-[rgba(var(--color-primary-rgb),1)]"
                      title="编辑"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteSubTask(subTask.id)}
                      className="glass-btn p-1.5 text-[var(--text-faint)] hover:text-red-600"
                      title="删除"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 编辑子任务表单 */}
      <AnimatePresence>
        {editingSubTask && (
          <SubTaskForm
            key={`edit-${editingSubTask.id}`}
            onSubmit={handleEditSubTask}
            onCancel={handleCancelEdit}
            editingSubTask={editingSubTask}
          />
        )}
      </AnimatePresence>

      {/* 添加子任务按钮/表单 */}
      {selectedParentId && !editingSubTask && (
        <AnimatePresence>
          {showAddForm ? (
            <SubTaskForm
              key="add-new"
              onSubmit={handleAddSubTask}
              onCancel={handleCancelAdd}
            />
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(true)}
              className="glass-btn w-full py-3 text-sm text-[var(--text-muted)] hover:text-[rgba(var(--color-primary-rgb),1)] border border-dashed border-[var(--border-input)] hover:border-[rgba(var(--color-primary-rgb),0.4)] rounded-xl"
            >
              + 添加子任务
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* 未选择父任务时的空状态 */}
      {!selectedParentId && (
        <div className="text-center py-16 text-[var(--text-faint)]">
          <svg className="w-16 h-16 mx-auto mb-3 text-[var(--text-weakest)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-sm">选择一个任务开始分解</p>
          <p className="text-xs text-[var(--text-weakest)] mt-1">将大任务拆分为可管理的小步骤</p>
        </div>
      )}
    </div>
  );
}
