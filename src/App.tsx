import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTasks } from './hooks/useTasks';
import { StatsPanel } from './components/StatsPanel';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { PriorityPanel } from './components/PriorityPanel';
import { ConfirmDialog } from './components/ConfirmDialog';
import { TaskSummaryDialog } from './components/TaskSummaryDialog';
import { SearchBar } from './components/SearchBar';
import { PlannerPanel } from './components/PlannerPanel';
import { PageTransition } from './components/PageTransition';
import { Footer } from './components/Footer';
import { UsageGuideDialog } from './components/UsageGuideDialog';
import { ChangelogDialog } from './components/ChangelogDialog';
import type { Task, TaskFormData, TaskSummary, SearchMode } from './types';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
const FINAL_TEXT = 'Event Manager';
const SHORT_TEXT = 'EM';
const SCRAMBLE_DURATION = 1200;

function AnimatedTitle() {
  const [phase, setPhase] = useState<'short' | 'scramble' | 'done'>('short');
  const [displayText, setDisplayText] = useState(SHORT_TEXT);
  const [animKey, setAnimKey] = useState(0);

  const replay = useCallback(() => {
    if (phase !== 'done') return; // 动画播放中不允许重新触发
    setAnimKey(k => k + 1);
    setPhase('short');
    setDisplayText(SHORT_TEXT);
  }, [phase]);

  useEffect(() => {
    const shortTimer = setTimeout(() => setPhase('scramble'), 1000);
    return () => clearTimeout(shortTimer);
  }, [animKey]);

  useEffect(() => {
    if (phase !== 'scramble') return;
    const startTime = Date.now();
    let animFrame: number;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / SCRAMBLE_DURATION, 1);
      let result = '';
      for (let i = 0; i < FINAL_TEXT.length; i++) {
        const charUnlockAt = (i / FINAL_TEXT.length) * 0.6;
        if (progress > charUnlockAt + 0.15) {
          result += FINAL_TEXT[i];
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplayText(result);
      if (progress < 1) {
        animFrame = requestAnimationFrame(animate);
      } else {
        setDisplayText(FINAL_TEXT);
        setPhase('done');
      }
    };
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [phase]);

  return (
    <h1
      className="text-4xl font-bold text-gray-800 tracking-tight h-10 overflow-hidden whitespace-nowrap cursor-pointer select-none"
      onMouseEnter={replay}
      title="悬浮重新播放动画"
    >
      <motion.span
        key={phase}
        initial={{ opacity: 0, filter: 'blur(4px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.3 }}
        className="inline-block font-mono"
      >
        {displayText}
      </motion.span>
    </h1>
  );
}

export default function App() {
  const {
    allTasks, priorityTasks, groups, filter, setFilter,
    addTask, updateTask, deleteTask, deleteMultipleTasks, toggleComplete, saveSummary,
    addGroup, deleteGroup, moveTasksToGroup, searchCompletedTasks,
  } = useTasks();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteGroupTarget, setDeleteGroupTarget] = useState<string | null>(null);
  const [deleteGroupKeepTasks, setDeleteGroupKeepTasks] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchMove, setShowBatchMove] = useState(false);
  const [batchMoveTarget, setBatchMoveTarget] = useState('');
  const [batchDeleteTarget, setBatchDeleteTarget] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [summaryTarget, setSummaryTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('name');
  const [showGuide, setShowGuide] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [activeTab, setActiveTab] = useState<'task' | 'plan'>('task');
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');

  const handleTabChange = (tab: 'task' | 'plan') => {
    // 任务在左(index 0)，规划在右(index 1)
    const dir = (tab === 'plan') ? 'left' : 'right';
    setSlideDir(dir);
    setActiveTab(tab);
  };

  const searchResults = useMemo(() => {
    return searchCompletedTasks(searchQuery, searchMode);
  }, [searchCompletedTasks, searchQuery, searchMode]);

  const handleAdd = (data: TaskFormData) => {
    addTask(data);
    setShowForm(false);
  };

  const handleEdit = (data: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
      setEditingTask(null);
    }
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteTask(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleDeleteGroup = () => {
    if (deleteGroupTarget) {
      deleteGroup(deleteGroupTarget, !deleteGroupKeepTasks);
      setDeleteGroupTarget(null);
      setDeleteGroupKeepTasks(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchDelete = () => {
    if (selectedIds.size > 0) {
      deleteMultipleTasks(Array.from(selectedIds));
      setSelectedIds(new Set());
      setBatchMode(false);
    }
  };

  const handleBatchMove = () => {
    if (selectedIds.size > 0 && batchMoveTarget) {
      moveTasksToGroup(Array.from(selectedIds), batchMoveTarget);
      setSelectedIds(new Set());
      setShowBatchMove(false);
      setBatchMode(false);
    }
  };

  const exitBatchMode = () => {
    setBatchMode(false);
    setSelectedIds(new Set());
    setShowBatchMove(false);
  };

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addGroup(newGroupName);
      setNewGroupName('');
    }
  };

  const handleCompleteClick = (id: string) => {
    const task = allTasks.find(t => t.id === id);
    if (task && !task.completed) {
      setSummaryTarget(id);
    } else {
      toggleComplete(id);
    }
  };

  const handleSummaryConfirm = (summary: TaskSummary) => {
    if (summaryTarget) {
      saveSummary(summaryTarget, summary);
      toggleComplete(summaryTarget);
      setSummaryTarget(null);
    }
  };

  const handleSummarySkip = () => {
    if (summaryTarget) {
      toggleComplete(summaryTarget);
      setSummaryTarget(null);
    }
  };

  const handleSearch = useCallback((query: string, mode: SearchMode) => {
    setSearchQuery(query);
    setSearchMode(mode);
  }, []);

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  const allFilters: { label: string; value: string }[] = [
    { label: '全部', value: '全部' },
    ...groups.map(g => ({ label: g, value: g })),
  ];

  const mainContent = (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 glass-sidebar border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <AnimatedTitle />
            <button
              onClick={() => { setEditingTask(null); setShowForm(prev => !prev); }}
              className="glass-btn glass-btn-primary px-5 py-2 text-sm font-medium"
            >
              {showForm && !editingTask ? '收起' : '+ 新建任务'}
            </button>
          </div>
          {/* 标签页切换 */}
          <div className="flex gap-1 bg-gray-100/80 rounded-xl p-1 w-fit">
            <button
              onClick={() => handleTabChange('task')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'task'
                  ? 'bg-white shadow-sm text-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              任务
            </button>
            <button
              onClick={() => handleTabChange('plan')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'plan'
                  ? 'bg-white shadow-sm text-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              规划
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 overflow-x-hidden relative" style={{ minHeight: '60vh' }}>
        <AnimatePresence initial={false} custom={slideDir}>
          {activeTab === 'task' ? (
            <motion.div
              key="task"
              custom={slideDir}
              initial={{ x: slideDir === 'left' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: slideDir === 'left' ? '-100%' : '100%', position: 'absolute', top: 0, left: 0, right: 0 }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex items-start justify-between gap-6 mb-2">
                <div className="flex-1">
                  <div className="flex gap-2 flex-wrap">
                    {allFilters.map(f => (
                      <motion.button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`filter-tab ${filter === f.value ? 'active' : ''}`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {f.label}
                      </motion.button>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="新分组名称..."
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddGroup()}
                      className="glass-input px-3 py-1.5 text-xs w-36"
                    />
                    <button onClick={handleAddGroup} className="glass-btn px-3 py-1.5 text-xs text-gray-500">
                      + 添加分组
                    </button>
                    {groups.length > 0 && (
                      <div className="flex gap-1 ml-1">
                        {groups.map(g => (
                          <button
                            key={g}
                            onClick={() => setDeleteGroupTarget(g)}
                            className="text-gray-300 hover:text-red-400 transition-colors text-xs px-1"
                            title={`删除分组「${g}」`}
                          >
                            {g}<span className="ml-0.5">&times;</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-56 flex-shrink-0">
                  <StatsPanel tasks={allTasks} />
                </div>
              </div>

              <AnimatePresence>
                {(showForm || editingTask) && (
                  <TaskForm
                    key={editingTask?.id ?? 'new'}
                    onSubmit={editingTask ? handleEdit : handleAdd}
                    onCancel={handleCancelEdit}
                    editingTask={editingTask}
                    groups={groups}
                  />
                )}
              </AnimatePresence>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    优先任务
                  </h3>
                  <div className="flex items-center gap-2">
                    {batchMode && (
                      <>
                        <span className="text-xs text-gray-400">已选 {selectedIds.size} 个</span>
                        <button onClick={() => setShowBatchMove(true)} disabled={selectedIds.size === 0} className="glass-btn px-3 py-1 text-xs disabled:opacity-40">移动分组</button>
                        <button onClick={() => setBatchDeleteTarget(true)} disabled={selectedIds.size === 0} className="glass-btn px-3 py-1 text-xs text-red-500 disabled:opacity-40">批量删除</button>
                        <button onClick={exitBatchMode} className="glass-btn px-3 py-1 text-xs">取消</button>
                      </>
                    )}
                    {!batchMode && priorityTasks.length > 0 && (
                      <button onClick={() => setBatchMode(true)} className="glass-btn px-3 py-1 text-xs text-gray-500">
                        批量管理
                      </button>
                    )}
                  </div>
                </div>
                <PriorityPanel
                  tasks={priorityTasks}
                  onToggleComplete={handleCompleteClick}
                  onEdit={handleEditClick}
                  onDelete={(id) => setDeleteTarget(id)}
                  batchMode={batchMode}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                />
              </div>

              {/* 批量移动分组弹窗 */}
              <AnimatePresence>
                {showBatchMove && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card p-4 mb-4"
                  >
                    <p className="text-sm text-gray-600 mb-2">将 {selectedIds.size} 个任务移动到：</p>
                    <div className="flex gap-2 flex-wrap mb-3">
                      <button
                        onClick={() => setBatchMoveTarget('')}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${batchMoveTarget === '' ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >
                        无分组
                      </button>
                      {groups.map(g => (
                        <button
                          key={g}
                          onClick={() => setBatchMoveTarget(g)}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${batchMoveTarget === g ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleBatchMove} disabled={!batchMoveTarget && batchMoveTarget !== ''} className="glass-btn glass-btn-primary px-4 py-1.5 text-xs">确认移动</button>
                      <button onClick={() => setShowBatchMove(false)} className="glass-btn px-4 py-1.5 text-xs">取消</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-12">
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  已完成的任务
                  <span className="text-gray-300 font-normal normal-case ml-1">· {searchResults.length} 个</span>
                </h3>
                <SearchBar onSearch={handleSearch} />
                <TaskList
                  tasks={searchResults}
                  onToggleComplete={handleCompleteClick}
                  onEdit={handleEditClick}
                  onDelete={(id) => setDeleteTarget(id)}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="plan"
              custom={slideDir}
              initial={{ x: slideDir === 'left' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: slideDir === 'left' ? '-100%' : '100%', position: 'absolute', top: 0, left: 0, right: 0 }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <PlannerPanel tasks={priorityTasks} groups={groups} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="确认删除"
        message="确定要删除这个任务吗？此操作不可撤销。"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={!!deleteGroupTarget}
        title="删除分组"
        message={
          <div>
            <p className="mb-3">确定要删除分组「{deleteGroupTarget}」吗？</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteGroupKeepTasks}
                onChange={e => setDeleteGroupKeepTasks(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">保留该分组下的任务（分组将变为空）</span>
            </label>
          </div>
        }
        confirmText="删除"
        onConfirm={handleDeleteGroup}
        onCancel={() => { setDeleteGroupTarget(null); setDeleteGroupKeepTasks(false); }}
      />

      <ConfirmDialog
        isOpen={batchDeleteTarget}
        title="批量删除"
        message={`确定要删除 ${selectedIds.size} 个任务吗？此操作不可撤销。`}
        confirmText="删除"
        onConfirm={() => { handleBatchDelete(); setBatchDeleteTarget(false); }}
        onCancel={() => setBatchDeleteTarget(false)}
      />

      <TaskSummaryDialog
        isOpen={!!summaryTarget}
        onConfirm={handleSummaryConfirm}
        onSkip={handleSummarySkip}
      />
    </div>
  );

  const footerContent = (
    <Footer onOpenGuide={() => setShowGuide(true)} onOpenChangelog={() => setShowChangelog(true)} />
  );

  return (
    <>
      <PageTransition footerContent={footerContent}>
        {mainContent}
      </PageTransition>

      <UsageGuideDialog isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <ChangelogDialog isOpen={showChangelog} onClose={() => setShowChangelog(false)} />
    </>
  );
}
