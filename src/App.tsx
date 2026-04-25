import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTasks } from './hooks/useTasks';
import { useSettings } from './hooks/useSettings';
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
import { DecomposeTab } from './components/tabs/DecomposeTab';
import { DateTab } from './components/tabs/DateTab';
import { RecordTab } from './components/tabs/RecordTab';
import SettingsPanel from './components/SettingsPanel';
import type { Task, TaskFormData, TaskSummary, SearchMode } from './types';

// ===== 标签页配置 =====
type TabId = 'task' | 'decompose' | 'plan' | 'date' | 'record';
const TAB_ORDER: TabId[] = ['task', 'decompose', 'plan', 'date', 'record'];
const TAB_LABELS: Record<TabId, string> = {
  task: '任务',
  decompose: '分解',
  plan: '规划',
  date: '日期',
  record: '记录',
};

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
      className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight h-8 sm:h-10 overflow-hidden whitespace-nowrap cursor-pointer select-none min-w-[2rem] sm:min-w-[16rem]"
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
    addTask, updateTask, deleteTask, deleteMultipleTasks, toggleComplete, saveSummary, saveSubTaskSummary,
    addGroup, deleteGroup, moveTasksToGroup, searchCompletedTasks,
    // 子任务相关
    subTasks, addSubTask, updateSubTask, deleteSubTask, toggleSubTaskComplete,
    getSubTasksByParentId,
    // 日记相关
    diary, addDiaryEntry, updateDiaryEntry, deleteDiaryEntry,
    // 已完成任务
    completedTasks,
  } = useTasks();

  const { settings, updateSetting, resetSettings } = useSettings();

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
  const [activeTab, setActiveTab] = useState<TabId>('task');
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');
  const [showSettings, setShowSettings] = useState(false);

  const handleTabChange = (tab: TabId) => {
    const currentIdx = TAB_ORDER.indexOf(activeTab);
    const newIdx = TAB_ORDER.indexOf(tab);
    setSlideDir(newIdx > currentIdx ? 'left' : 'right');
    setActiveTab(tab);
    if (showForm && tab !== 'task') {
      setShowForm(false);
    }
  };

  const searchResults = useMemo(() => {
    return searchCompletedTasks(searchQuery, searchMode);
  }, [searchCompletedTasks, searchQuery, searchMode]);

  const handleAddTask = () => {
    if (activeTab !== 'task') setActiveTab('task');
    setEditingTask(null);
    setShowForm(prev => !prev);
  };

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AnimatedTitle />
              {/* 设置按钮 */}
              <button
                onClick={() => setShowSettings(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-filter)] transition-colors text-[var(--text-faint)] hover:text-[var(--text-secondary)]"
                title="设置"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleAddTask}
              className="glass-btn glass-btn-primary px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium"
            >
              {showForm && !editingTask && activeTab === 'task' ? '收起' : '+ 新建任务'}
            </button>
          </div>
          {/* 标签页切换 - 5个标签，移动端横向滚动 */}
          <div className="flex gap-1 bg-[var(--bg-filter)] rounded-xl p-1 w-full sm:w-fit overflow-x-auto no-scrollbar">
            {TAB_ORDER.map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-shrink-0 whitespace-nowrap flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-[var(--bg-card-solid)] shadow-sm text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 relative" style={{ minHeight: '60vh' }}>
        <AnimatePresence mode="wait" initial={false} custom={slideDir}>
          <motion.div
            key={activeTab}
            custom={slideDir}
            initial={{ x: slideDir === 'left' ? '100%' : '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: slideDir === 'left' ? '-100%' : '100%', opacity: 0 }}
            transition={{ type: 'tween', duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {activeTab === 'task' && (
              <>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 mb-2">
                  <div className="flex-1 w-full">
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
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="新分组名称..."
                        value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddGroup()}
                        className="glass-input px-3 py-1.5 text-xs w-28 sm:w-36"
                      />
                      <button onClick={handleAddGroup} className="glass-btn px-3 py-1.5 text-xs text-[var(--text-muted)]">
                        + 添加分组
                      </button>
                      {groups.length > 0 && (
                        <div className="flex gap-1 ml-1">
                          {groups.map(g => (
                            <button
                              key={g}
                              onClick={() => setDeleteGroupTarget(g)}
                              className="text-[var(--text-weakest)] hover:text-red-400 transition-colors text-xs px-1"
                              title={`删除分组「${g}」`}
                            >
                              {g}<span className="ml-0.5">&times;</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full sm:w-56 flex-shrink-0">
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
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-[var(--text-faint)] uppercase tracking-wider">
                      优先任务
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {batchMode && (
                        <>
                          <span className="text-xs text-[var(--text-faint)]">已选 {selectedIds.size} 个</span>
                          <button onClick={() => setShowBatchMove(true)} disabled={selectedIds.size === 0} className="glass-btn px-3 py-1 text-xs disabled:opacity-40">移动分组</button>
                          <button onClick={() => setBatchDeleteTarget(true)} disabled={selectedIds.size === 0} className="glass-btn px-3 py-1 text-xs text-red-500 disabled:opacity-40">批量删除</button>
                          <button onClick={exitBatchMode} className="glass-btn px-3 py-1 text-xs">取消</button>
                        </>
                      )}
                      {!batchMode && priorityTasks.length > 0 && (
                        <button onClick={() => setBatchMode(true)} className="glass-btn px-3 py-1 text-xs text-[var(--text-muted)]">
                          批量管理
                        </button>
                      )}
                    </div>
                  </div>
                  <PriorityPanel
                    tasks={priorityTasks}
                    subTasks={subTasks}
                    onToggleComplete={handleCompleteClick}
                    onEdit={handleEditClick}
                    onDelete={(id) => setDeleteTarget(id)}
                    batchMode={batchMode}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    settings={settings}
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
                      <p className="text-sm text-[var(--text-secondary)] mb-2">将 {selectedIds.size} 个任务移动到：</p>
                      <div className="flex gap-2 flex-wrap mb-3">
                        <button
                          onClick={() => setBatchMoveTarget('')}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${batchMoveTarget === '' ? 'bg-[rgba(var(--color-primary-rgb),0.15)] border-[rgba(var(--color-primary-rgb),0.3)] text-[rgba(var(--color-primary-rgb),1)]' : 'border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--border-input)]'}`}
                        >
                          无分组
                        </button>
                        {groups.map(g => (
                          <button
                            key={g}
                            onClick={() => setBatchMoveTarget(g)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${batchMoveTarget === g ? 'bg-[rgba(var(--color-primary-rgb),0.15)] border-[rgba(var(--color-primary-rgb),0.3)] text-[rgba(var(--color-primary-rgb),1)]' : 'border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--border-input)]'}`}
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
                  <h3 className="text-sm font-semibold text-[var(--text-faint)] mb-3 uppercase tracking-wider">
                    已完成的任务
                    <span className="text-[var(--text-weakest)] font-normal normal-case ml-1">· {searchResults.length} 个</span>
                  </h3>
                  <SearchBar onSearch={handleSearch} />
                  <TaskList
                    tasks={searchResults}
                    onToggleComplete={handleCompleteClick}
                    onEdit={handleEditClick}
                    onDelete={(id) => setDeleteTarget(id)}
                  />
                </div>
              </>
            )}

            {activeTab === 'decompose' && (
              <DecomposeTab
                tasks={allTasks}
                subTasks={subTasks}
                getSubTasksByParentId={getSubTasksByParentId}
                addSubTask={addSubTask}
                updateSubTask={updateSubTask}
                deleteSubTask={deleteSubTask}
                toggleSubTaskComplete={toggleSubTaskComplete}
                toggleComplete={toggleComplete}
              />
            )}

            {activeTab === 'plan' && (
              <PlannerPanel
                tasks={priorityTasks}
                groups={groups}
                onNavigateToTask={() => {
                  setActiveTab('task');
                  setEditingTask(null);
                  setShowForm(true);
                }}
              />
            )}

            {activeTab === 'date' && (
              <DateTab
                tasks={allTasks}
                subTasks={subTasks}
              />
            )}

            {activeTab === 'record' && (
              <RecordTab
                completedTasks={completedTasks}
                subTasks={subTasks}
                diaryEntries={diary}
                onAddDiary={addDiaryEntry}
                onUpdateDiary={updateDiaryEntry}
                onDeleteDiary={deleteDiaryEntry}
                onSaveSummary={saveSummary}
                onSaveSubTaskSummary={saveSubTaskSummary}
              />
            )}
          </motion.div>
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
                className="w-4 h-4 rounded border-[var(--border-input)] text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-[var(--text-secondary)]">保留该分组下的任务（分组将变为空）</span>
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

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSetting={updateSetting}
        onResetSettings={resetSettings}
      />

      <UsageGuideDialog isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <ChangelogDialog isOpen={showChangelog} onClose={() => setShowChangelog(false)} />
    </>
  );
}
