import { useState, useMemo, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Task, SubTask, DiaryEntry, TaskSummary } from '../../types';
import { formatDateStr } from '../../utils/dateUtils';

interface RecordTabProps {
  completedTasks: Task[];
  subTasks: SubTask[];
  diaryEntries: DiaryEntry[];
  onAddDiary: (date: string, content: string) => void;
  onUpdateDiary: (id: string, content: string) => void;
  onDeleteDiary: (id: string) => void;
  onSaveSummary: (id: string, summary: TaskSummary) => void;
  onSaveSubTaskSummary: (id: string, summary: TaskSummary) => void;
}

function StarRating({ difficulty }: { difficulty: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= difficulty ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function InteractiveStarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <svg
            className={`w-5 h-5 transition-colors ${star <= (hover || value) ? 'text-amber-400' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function RecordTab({
  completedTasks,
  subTasks,
  diaryEntries,
  onAddDiary,
  onUpdateDiary,
  onDeleteDiary,
  onSaveSummary,
  onSaveSubTaskSummary,
}: RecordTabProps) {
  const [subTab, setSubTab] = useState<'summary' | 'diary'>('summary');

  return (
    <div>
      {/* 底部切换滑块 */}
      <div className="flex gap-1 bg-[var(--bg-filter)] rounded-xl p-1 mb-4">
        <button
          onClick={() => setSubTab('summary')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            subTab === 'summary'
              ? 'bg-[var(--bg-card-solid)] shadow-sm text-[var(--text-primary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          完成总结
        </button>
        <button
          onClick={() => setSubTab('diary')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            subTab === 'diary'
              ? 'bg-[var(--bg-card-solid)] shadow-sm text-[var(--text-primary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          日记/感受
        </button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'summary' ? (
          <motion.div
            key="summary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <SummaryPanel
              completedTasks={completedTasks}
              subTasks={subTasks}
              onSaveSummary={onSaveSummary}
              onSaveSubTaskSummary={onSaveSubTaskSummary}
            />
          </motion.div>
        ) : (
          <motion.div
            key="diary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <DiaryPanel
              diaryEntries={diaryEntries}
              onAddDiary={onAddDiary}
              onUpdateDiary={onUpdateDiary}
              onDeleteDiary={onDeleteDiary}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ========== 完成总结子板块 ========== */
function SummaryPanel({
  completedTasks,
  subTasks,
  onSaveSummary,
  onSaveSubTaskSummary,
}: {
  completedTasks: Task[];
  subTasks: SubTask[];
  onSaveSummary: (id: string, summary: TaskSummary) => void;
  onSaveSubTaskSummary: (id: string, summary: TaskSummary) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDifficulty, setEditDifficulty] = useState(3);
  const [editComment, setEditComment] = useState('');
  const [editExceeded, setEditExceeded] = useState(false);
  const [editType, setEditType] = useState<'task' | 'subtask'>('task');
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [createDifficulty, setCreateDifficulty] = useState(3);
  const [createComment, setCreateComment] = useState('');
  const [createType, setCreateType] = useState<'task' | 'subtask'>('task');

  // 合并已完成任务和子任务的总结记录（有总结的）
  const records = useMemo(() => {
    const items: Array<{
      id: string;
      name: string;
      type: 'task' | 'subtask';
      completedAt: string | null;
      dueDate: string;
      exceeded: boolean;
      difficulty: number;
      comment: string;
    }> = [];

    for (const task of completedTasks) {
      if (task.summary) {
        items.push({
          id: task.id,
          name: task.name,
          type: 'task',
          completedAt: task.completedAt,
          dueDate: task.dueDate,
          exceeded: task.summary.exceeded,
          difficulty: task.summary.difficulty,
          comment: task.summary.comment,
        });
      }
    }

    for (const st of subTasks) {
      if (st.completed && st.summary) {
        items.push({
          id: st.id,
          name: st.name,
          type: 'subtask',
          completedAt: st.completedAt,
          dueDate: st.dueDate,
          exceeded: st.summary.exceeded,
          difficulty: st.summary.difficulty,
          comment: st.summary.comment,
        });
      }
    }

    items.sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA;
    });

    return items;
  }, [completedTasks, subTasks]);

  // 没有 summary 的已完成任务/子任务
  const noSummaryItems = useMemo(() => {
    const items: Array<{
      id: string;
      name: string;
      type: 'task' | 'subtask';
      completedAt: string | null;
      dueDate: string;
    }> = [];

    for (const task of completedTasks) {
      if (!task.summary) {
        items.push({
          id: task.id,
          name: task.name,
          type: 'task',
          completedAt: task.completedAt,
          dueDate: task.dueDate,
        });
      }
    }

    for (const st of subTasks) {
      if (st.completed && !st.summary) {
        items.push({
          id: st.id,
          name: st.name,
          type: 'subtask',
          completedAt: st.completedAt,
          dueDate: st.dueDate,
        });
      }
    }

    items.sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA;
    });

    return items;
  }, [completedTasks, subTasks]);

  const handleEditStart = (record: typeof records[0]) => {
    setEditingId(record.id);
    setEditDifficulty(record.difficulty);
    setEditComment(record.comment);
    setEditExceeded(record.exceeded);
    setEditType(record.type);
  };

  const handleEditSave = () => {
    if (!editingId) return;
    const summary: TaskSummary = {
      exceeded: editExceeded,
      difficulty: editDifficulty,
      comment: editComment.trim(),
    };
    if (editType === 'task') {
      onSaveSummary(editingId, summary);
    } else {
      onSaveSubTaskSummary(editingId, summary);
    }
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleCreateStart = (item: typeof noSummaryItems[0]) => {
    setCreatingId(item.id);
    setCreateDifficulty(3);
    setCreateComment('');
    setCreateType(item.type);
  };

  const handleCreateSave = () => {
    if (!creatingId) return;
    const summary: TaskSummary = {
      exceeded: false,
      difficulty: createDifficulty,
      comment: createComment.trim(),
    };
    if (createType === 'task') {
      onSaveSummary(creatingId, summary);
    } else {
      onSaveSubTaskSummary(creatingId, summary);
    }
    setCreatingId(null);
  };

  const handleCreateCancel = () => {
    setCreatingId(null);
  };

  if (records.length === 0 && noSummaryItems.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-faint)]">
        <svg className="w-16 h-16 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">暂无完成总结</p>
        <p className="text-xs text-[var(--text-weakest)] mt-1">完成任务时填写总结后会在这里显示</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 有总结的记录 */}
      {records.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-[var(--text-faint)] uppercase tracking-wider">
            完成总结
            <span className="text-[var(--text-weakest)] font-normal normal-case ml-1">({records.length})</span>
          </h3>
          {records.map(record => (
            <motion.div
              key={record.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-[var(--text-primary)]">{record.name}</span>
                  {record.type === 'subtask' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-filter)] text-[var(--text-muted)] border border-[var(--border-default)]">
                      子任务
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {record.exceeded ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                      超出预期
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-600 border border-green-200">
                      符合预期
                    </span>
                  )}
                  {editingId !== record.id ? (
                    <StarRating difficulty={record.difficulty} />
                  ) : (
                    <InteractiveStarRating value={editDifficulty} onChange={setEditDifficulty} />
                  )}
                </div>
              </div>
              <div className="text-xs text-[var(--text-faint)] mb-2">
                {record.completedAt
                  ? `完成于 ${new Date(record.completedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`
                  : ''}
                {record.dueDate && (
                  <span className="ml-2">截止: {new Date(record.dueDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                )}
              </div>
              {editingId === record.id ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditExceeded(!editExceeded)}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                        editExceeded
                          ? 'bg-red-100 text-red-600 border-red-200'
                          : 'bg-green-100 text-green-600 border-green-200'
                      }`}
                    >
                      {editExceeded ? '超出预期' : '符合预期'}
                    </button>
                  </div>
                  <textarea
                    value={editComment}
                    onChange={e => setEditComment(e.target.value)}
                    placeholder="写点什么..."
                    rows={3}
                    className="glass-input w-full px-3 py-2 text-sm resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={handleEditCancel} className="glass-btn px-3 py-1 text-xs">取消</button>
                    <button onClick={handleEditSave} className="glass-btn glass-btn-primary px-3 py-1 text-xs">保存</button>
                  </div>
                </div>
              ) : (
                <div>
                  {record.comment && (
                    <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-filter)] rounded-lg p-3 border border-[var(--border-default)]">
                      {record.comment}
                    </div>
                  )}
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => handleEditStart(record)}
                      className="glass-btn px-2 py-0.5 text-[10px] text-[var(--text-faint)] hover:text-[rgba(var(--color-primary-rgb),1)]"
                    >
                      编辑反思
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </>
      )}

      {/* 没有 summary 的已完成任务 */}
      {noSummaryItems.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-[var(--text-faint)] uppercase tracking-wider mt-4">
            待写反思
            <span className="text-[var(--text-weakest)] font-normal normal-case ml-1">({noSummaryItems.length})</span>
          </h3>
          {noSummaryItems.map(item => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm text-[var(--text-primary)]">{item.name}</span>
                {item.type === 'subtask' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-filter)] text-[var(--text-muted)] border border-[var(--border-default)]">
                    子任务
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--text-faint)] mb-2">
                {item.completedAt
                  ? `完成于 ${new Date(item.completedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`
                  : ''}
                {item.dueDate && (
                  <span className="ml-2">截止: {new Date(item.dueDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                )}
              </div>
              {creatingId === item.id ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-[var(--text-faint)] text-xs mb-1 block">难度评分</label>
                    <InteractiveStarRating value={createDifficulty} onChange={setCreateDifficulty} />
                  </div>
                  <textarea
                    value={createComment}
                    onChange={e => setCreateComment(e.target.value)}
                    placeholder="写点反思..."
                    rows={3}
                    className="glass-input w-full px-3 py-2 text-sm resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={handleCreateCancel} className="glass-btn px-3 py-1 text-xs">取消</button>
                    <button onClick={handleCreateSave} className="glass-btn glass-btn-primary px-3 py-1 text-xs">保存反思</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleCreateStart(item)}
                  className="glass-btn px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[rgba(var(--color-primary-rgb),1)] border border-dashed border-[var(--border-input)] hover:border-[rgba(var(--color-primary-rgb),0.4)] rounded-lg"
                >
                  写反思
                </button>
              )}
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}

/* ========== 富文本工具栏 ========== */
function RichTextToolbar({ editorRef }: { editorRef: React.RefObject<HTMLDivElement | null> }) {
  const execCmd = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  }, [editorRef]);

  return (
    <div className="glass-card p-2 mb-2 flex flex-wrap items-center gap-1">
      <button
        type="button"
        onClick={() => execCmd('bold')}
        className="glass-btn px-2 py-1 text-xs font-bold text-[var(--text-secondary)] hover:text-[rgba(var(--color-primary-rgb),1)]"
        title="加粗"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => execCmd('italic')}
        className="glass-btn px-2 py-1 text-xs italic text-[var(--text-secondary)] hover:text-[rgba(var(--color-primary-rgb),1)]"
        title="斜体"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => execCmd('underline')}
        className="glass-btn px-2 py-1 text-xs underline text-[var(--text-secondary)] hover:text-[rgba(var(--color-primary-rgb),1)]"
        title="下划线"
      >
        U
      </button>
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <select
        onChange={e => execCmd('fontSize', e.target.value)}
        className="glass-input px-2 py-1 text-xs"
        defaultValue=""
      >
        <option value="" disabled>字号</option>
        <option value="2">小</option>
        <option value="3">中</option>
        <option value="4">大</option>
        <option value="5">特大</option>
      </select>
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <label className="flex items-center gap-1 text-xs text-[var(--text-muted)] cursor-pointer">
        <span>文字</span>
        <input
          type="color"
          defaultValue="#000000"
          onChange={e => execCmd('foreColor', e.target.value)}
          className="w-5 h-5 border-0 cursor-pointer rounded"
        />
      </label>
      <label className="flex items-center gap-1 text-xs text-[var(--text-muted)] cursor-pointer">
        <span>高亮</span>
        <input
          type="color"
          defaultValue="#ffff00"
          onChange={e => execCmd('hiliteColor', e.target.value)}
          className="w-5 h-5 border-0 cursor-pointer rounded"
        />
      </label>
    </div>
  );
}

/* ========== 日记/感受子板块 ========== */
function DiaryPanel({
  diaryEntries,
  onAddDiary,
  onUpdateDiary,
  onDeleteDiary,
}: {
  diaryEntries: DiaryEntry[];
  onAddDiary: (date: string, content: string) => void;
  onUpdateDiary: (id: string, content: string) => void;
  onDeleteDiary: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState(() => formatDateStr(new Date()));
  const formEditorRef = useRef<HTMLDivElement>(null);
  const editEditorRef = useRef<HTMLDivElement>(null);

  // 按日期倒序
  const sortedEntries = useMemo(() => {
    return [...diaryEntries].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [diaryEntries]);

  const handleAddSubmit = () => {
    const html = formEditorRef.current?.innerHTML || '';
    if (!html.trim() || html === '<br>') return;
    onAddDiary(formDate, html);
    if (formEditorRef.current) {
      formEditorRef.current.innerHTML = '';
    }
    setShowForm(false);
  };

  const handleEditStart = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    // 在下一个 tick 设置 innerHTML，确保 ref 已挂载
    setTimeout(() => {
      if (editEditorRef.current) {
        editEditorRef.current.innerHTML = entry.content;
      }
    }, 0);
  };

  const handleEditSave = () => {
    if (!editingId) return;
    const html = editEditorRef.current?.innerHTML || '';
    if (!html.trim() || html === '<br>') return;
    onUpdateDiary(editingId, html);
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  return (
    <div>
      {/* 新建日记按钮 */}
      {!showForm && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowForm(true)}
          className="glass-btn w-full py-3 text-sm text-[var(--text-muted)] hover:text-[rgba(var(--color-primary-rgb),1)] border border-dashed border-[var(--border-input)] hover:border-[rgba(var(--color-primary-rgb),0.4)] rounded-xl mb-4"
        >
          + 写新日记
        </motion.button>
      )}

      {/* 新建日记表单 */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4 mb-4 overflow-hidden"
          >
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">写新日记</h4>
            <div className="mb-3">
              <label className="text-[var(--text-faint)] text-xs mb-1 block">日期</label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="glass-input w-full px-3 py-2 text-sm"
              />
            </div>
            <div className="mb-3">
              <label className="text-[var(--text-faint)] text-xs mb-1 block">内容</label>
              <RichTextToolbar editorRef={formEditorRef} />
              <div
                ref={formEditorRef}
                contentEditable
                suppressContentEditableWarning
                data-placeholder="今天有什么想记录的..."
                className="min-h-[120px] p-3 border border-[var(--border-default)] rounded-lg outline-none text-sm text-[var(--text-primary)] focus:border-indigo-300 transition-colors [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-[var(--text-weakest)]"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowForm(false); if (formEditorRef.current) formEditorRef.current.innerHTML = ''; }}
                className="glass-btn px-4 py-1.5 text-xs"
              >
                取消
              </button>
              <button
                onClick={handleAddSubmit}
                className="glass-btn glass-btn-primary px-4 py-1.5 text-xs"
              >
                保存
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 日记列表 */}
      {sortedEntries.length === 0 && !showForm ? (
        <div className="text-center py-16 text-[var(--text-faint)]">
          <svg className="w-16 h-16 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-sm">还没有日记</p>
          <p className="text-xs text-[var(--text-weakest)] mt-1">记录你的想法和感受</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEntries.map(entry => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              {/* 日期标题 */}
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  {entry.date}
                </h4>
                {editingId !== entry.id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditStart(entry)}
                      className="glass-btn p-1.5 text-[var(--text-faint)] hover:text-[rgba(var(--color-primary-rgb),1)]"
                      title="编辑"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeleteDiary(entry.id)}
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

              {/* 内容 / 编辑模式 */}
              {editingId === entry.id ? (
                <div>
                  <RichTextToolbar editorRef={editEditorRef} />
                  <div
                    ref={editEditorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="min-h-[120px] p-3 border border-[var(--border-default)] rounded-lg outline-none text-sm text-[var(--text-primary)] focus:border-indigo-300 transition-colors mb-2"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleEditCancel}
                      className="glass-btn px-3 py-1 text-xs"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleEditSave}
                      className="glass-btn glass-btn-primary px-3 py-1 text-xs"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="text-sm text-[var(--text-secondary)] leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: entry.content }}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
