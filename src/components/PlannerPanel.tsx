import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import type { Plan, PlanBlock, Task } from '../types';
import { generateAIPlan, getApiKey, setApiKey } from '../utils/aiService';

interface PlannerPanelProps {
  tasks: Task[]; // 未完成的任务列表
  groups: string[]; // 分组列表
}

// 解析 estimatedTime "2:30" → 分钟数
function parseEstimatedTime(time: string): number {
  if (!time) return 0;
  const parts = time.split(':');
  const h = parseInt(parts[0]) || 0;
  const m = parseInt(parts[1]) || 0;
  return h * 60 + m;
}

// 分钟数 → 显示文本
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
}

// 分钟数 → 时间显示
function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

type Mode = 'diy' | 'ai';

// 快捷休息时长选项
const BREAK_PRESETS = [5, 10, 15, 30];

export function PlannerPanel({ tasks, groups }: PlannerPanelProps) {
  const [mode, setMode] = useState<Mode>('diy');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddBreak, setShowAddBreak] = useState(false);
  const [planGroupFilter, setPlanGroupFilter] = useState('全部');
  const [aiSelectedIds, setAiSelectedIds] = useState<Set<string>>(new Set());

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setShowAddTask(false);
    setShowAddBreak(false);
  };

  const [plan, setPlan] = useState<Plan>(() => {
    try {
      const saved = localStorage.getItem('event-manager-plan');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: uuidv4(),
      name: '今日计划',
      blocks: [],
      createdAt: new Date().toISOString(),
    };
  });

  const [newBlockStart, setNewBlockStart] = useState('09:00');
  const [newBlockDuration, setNewBlockDuration] = useState(30);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [aiStartHour, setAiStartHour] = useState(9);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState(getApiKey());

  // 保存到 localStorage
  const updatePlan = useCallback((newPlan: Plan) => {
    setPlan(newPlan);
    localStorage.setItem('event-manager-plan', JSON.stringify(newPlan));
  }, []);

  // 添加任务块
  const handleAddTaskBlock = () => {
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;
    const [h, m] = newBlockStart.split(':').map(Number);
    const block: PlanBlock = {
      id: uuidv4(),
      type: 'task',
      taskId: task.id,
      taskName: task.name,
      startHour: h,
      startMinute: m,
      duration: newBlockDuration,
    };
    updatePlan({ ...plan, blocks: [...plan.blocks, block].sort((a, b) => a.startHour * 60 + a.startMinute - b.startHour * 60 - b.startMinute) });
    setShowAddTask(false);
    setSelectedTaskId('');
  };

  // 添加休息块
  const handleAddBreakBlock = () => {
    const [h, m] = newBlockStart.split(':').map(Number);
    const block: PlanBlock = {
      id: uuidv4(),
      type: 'break',
      startHour: h,
      startMinute: m,
      duration: newBlockDuration,
    };
    updatePlan({ ...plan, blocks: [...plan.blocks, block].sort((a, b) => a.startHour * 60 + a.startMinute - b.startHour * 60 - b.startMinute) });
    setShowAddBreak(false);
  };

  // 删除块
  const handleDeleteBlock = (blockId: string) => {
    updatePlan({ ...plan, blocks: plan.blocks.filter(b => b.id !== blockId) });
  };

  // AI 自动生成计划
  const handleAIGenerate = async () => {
    const key = getApiKey();
    if (!key) {
      setShowApiKeyInput(true);
      return;
    }

    // 获取可选任务（按分组筛选 + 有预估时间）
    let candidates = tasks.filter(t => parseEstimatedTime(t.estimatedTime) > 0);
    if (planGroupFilter !== '全部') {
      candidates = candidates.filter(t => t.group === planGroupFilter);
    }
    // 如果有手动选择的任务，只使用选中的
    if (aiSelectedIds.size > 0) {
      candidates = candidates.filter(t => aiSelectedIds.has(t.id));
    }

    if (candidates.length === 0) return;

    setAiLoading(true);
    setAiError('');
    setAiSummary('');

    try {
      const result = await generateAIPlan(candidates, aiStartHour, key);
      updatePlan({
        ...plan,
        blocks: result.blocks,
        name: `AI计划 ${new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`,
      });
      setAiSummary(result.summary);
    } catch (err: any) {
      setAiError(err.message || '生成失败，请重试');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    setApiKey(apiKeyValue.trim());
    setShowApiKeyInput(false);
  };

  // 计算总时间
  const totalTaskMin = plan.blocks.filter(b => b.type === 'task').reduce((sum, b) => sum + b.duration, 0);
  const totalBreakMin = plan.blocks.filter(b => b.type === 'break').reduce((sum, b) => sum + b.duration, 0);

  // 计算结束时间
  const getEndTime = () => {
    if (plan.blocks.length === 0) return '';
    const last = plan.blocks[plan.blocks.length - 1];
    const endMin = last.startHour * 60 + last.startMinute + last.duration;
    return formatTime(Math.floor(endMin / 60), endMin % 60);
  };

  return (
    <div className="space-y-6">
      {/* 标题 + 模式切换 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">时间规划</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {plan.blocks.length > 0
              ? `${plan.blocks.filter(b => b.type === 'task').length} 个任务 · ${formatDuration(totalTaskMin)} · 休息 ${formatDuration(totalBreakMin)} · ${getEndTime()} 结束`
              : '添加任务和休息，规划你的一天'}
          </p>
        </div>

        {/* 模式切换 */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => handleModeChange('diy')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'diy' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
            }`}
          >
            手动规划
          </button>
          <button
            onClick={() => handleModeChange('ai')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'ai' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
            }`}
          >
            AI 规划
          </button>
        </div>
      </div>

      {/* AI 模式 */}
      {mode === 'ai' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700">智能规划</h4>
              <p className="text-xs text-gray-400">根据任务优先级和预估时间自动排班</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-xs text-gray-500">开始时间</label>
            <select
              value={aiStartHour}
              onChange={e => setAiStartHour(Number(e.target.value))}
              className="glass-input px-3 py-1.5 text-sm w-24"
            >
              {Array.from({ length: 16 }, (_, i) => i + 6).map(h => (
                <option key={h} value={h}>{h}:00</option>
              ))}
            </select>
            <span className="text-xs text-gray-400">
              （需要任务设置了预估时间）
            </span>
          </div>

          {/* 分组筛选 */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs text-gray-500">分组：</span>
            <button
              onClick={() => { setPlanGroupFilter('全部'); setAiSelectedIds(new Set()); }}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${planGroupFilter === '全部' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              全部
            </button>
            {groups.map(g => (
              <button
                key={g}
                onClick={() => { setPlanGroupFilter(g); setAiSelectedIds(new Set()); }}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${planGroupFilter === g ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* 任务选择 */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-gray-500">可规划任务：</span>
            <span className="text-xs font-medium text-indigo-600">
              {(() => {
                let c = tasks.filter(t => parseEstimatedTime(t.estimatedTime) > 0);
                if (planGroupFilter !== '全部') c = c.filter(t => t.group === planGroupFilter);
                return c.length;
              })()} 个
            </span>
            {aiSelectedIds.size > 0 && (
              <span className="text-xs text-gray-400">（已选 {aiSelectedIds.size} 个）</span>
            )}
          </div>

          {/* 任务列表（可勾选） */}
          <div className="max-h-40 overflow-y-auto mb-3 space-y-1">
            {(() => {
              let c = tasks.filter(t => parseEstimatedTime(t.estimatedTime) > 0);
              if (planGroupFilter !== '全部') c = c.filter(t => t.group === planGroupFilter);
              const allIds = c.map(t => t.id);
              const isAllSelected = aiSelectedIds.size === 0;
              return c.map(t => {
                const checked = isAllSelected || aiSelectedIds.has(t.id);
                return (
                  <label key={t.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${checked ? 'bg-white' : 'bg-gray-50 opacity-50'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setAiSelectedIds(prev => {
                          if (isAllSelected) {
                            // 全选状态下点击 → 取消这一个，选中其余
                            return new Set(allIds.filter(id => id !== t.id));
                          }
                          const next = new Set(prev);
                          if (next.has(t.id)) next.delete(t.id);
                          else next.add(t.id);
                          // 如果全部都选了，回到"全选"状态（清空 set）
                          if (next.size === allIds.length) return new Set();
                          if (next.size === 0) return new Set();
                          return next;
                        });
                      }}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600"
                    />
                    <span className="text-xs text-gray-700 truncate flex-1">{t.name}</span>
                    <span className="text-xs text-gray-400">{t.estimatedTime || '未设置'}</span>
                    <span className={`text-xs px-1 py-0.5 rounded ${t.priority === '高' ? 'text-red-500' : t.priority === '中' ? 'text-amber-500' : 'text-blue-500'}`}>
                      {t.priority}
                    </span>
                  </label>
                );
              });
            })()}
          </div>

          {(() => {
            let c = tasks.filter(t => parseEstimatedTime(t.estimatedTime) > 0);
            if (planGroupFilter !== '全部') c = c.filter(t => t.group === planGroupFilter);
            if (c.length === 0) return (
              <p className="text-xs text-amber-500 bg-amber-50 rounded-lg px-3 py-2 mb-3">
                提示：请先给任务设置预估时间，AI 才能自动排班
              </p>
            );
            return null;
          })()}

          <button
            onClick={handleAIGenerate}
            disabled={aiLoading || tasks.filter(t => parseEstimatedTime(t.estimatedTime) > 0).length === 0}
            className="glass-btn glass-btn-primary px-5 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {aiLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AI 正在思考...
              </>
            ) : (
              '生成计划'
            )}
          </button>

          {/* API Key 设置 */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {getApiKey() ? '修改 API Key' : '设置 API Key'}
            </button>
            {getApiKey() && (
              <span className="text-xs text-green-500">已配置</span>
            )}
          </div>

          <AnimatePresence>
            {showApiKeyInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="输入 DeepSeek API Key..."
                    value={apiKeyValue}
                    onChange={e => setApiKeyValue(e.target.value)}
                    className="glass-input flex-1 px-3 py-1.5 text-xs"
                  />
                  <button onClick={handleSaveApiKey} className="glass-btn px-3 py-1.5 text-xs">
                    保存
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  在 platform.deepseek.com 获取 API Key
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 错误提示 */}
          {aiError && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 mt-3">
              {aiError}
            </p>
          )}

          {/* AI 总结 */}
          {aiSummary && (
            <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-xs text-indigo-700">
                <span className="font-medium">AI 建议：</span>{aiSummary}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* DIY 模式 - 添加按钮 */}
      {mode === 'diy' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          <button
            onClick={() => { setShowAddTask(true); setShowAddBreak(false); }}
            className="glass-btn px-4 py-2 text-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            添加任务
          </button>
          <button
            onClick={() => { setShowAddBreak(true); setShowAddTask(false); }}
            className="glass-btn px-4 py-2 text-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            添加休息
          </button>
          {plan.blocks.length > 0 && (
            <button
              onClick={() => updatePlan({ ...plan, blocks: [] })}
              className="glass-btn px-4 py-2 text-sm text-gray-400 ml-auto"
            >
              清空
            </button>
          )}
        </motion.div>
      )}

      {/* 添加任务表单 */}
      <AnimatePresence>
        {showAddTask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">选择任务</label>
                <select
                  value={selectedTaskId}
                  onChange={e => setSelectedTaskId(e.target.value)}
                  className="glass-input w-full px-3 py-2 text-sm"
                >
                  <option value="">-- 选择任务 --</option>
                  {tasks.map(t => {
                    const totalMin = parseEstimatedTime(t.estimatedTime);
                    const usedMin = plan.blocks
                      .filter(b => b.type === 'task' && b.taskId === t.id)
                      .reduce((sum, b) => sum + b.duration, 0);
                    const remainMin = totalMin - usedMin;
                    const timeStr = totalMin > 0
                      ? `${formatDuration(totalMin)}${remainMin >= 0 && remainMin < totalMin ? `（剩余${formatDuration(remainMin)}）` : ''}`
                      : '未设置时间';
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name}（{timeStr}）
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">开始时间</label>
                <input
                  type="time"
                  value={newBlockStart}
                  onChange={e => setNewBlockStart(e.target.value)}
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">时长（分钟）</label>
                <input
                  type="number"
                  min={5}
                  max={480}
                  step={5}
                  value={newBlockDuration}
                  onChange={e => setNewBlockDuration(Number(e.target.value))}
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleAddTaskBlock} className="glass-btn glass-btn-primary px-4 py-1.5 text-xs">确认添加</button>
              <button onClick={() => setShowAddTask(false)} className="glass-btn px-4 py-1.5 text-xs">取消</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 添加休息表单 */}
      <AnimatePresence>
        {showAddBreak && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">开始时间</label>
                <input
                  type="time"
                  value={newBlockStart}
                  onChange={e => setNewBlockStart(e.target.value)}
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">时长（分钟）</label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  step={5}
                  value={newBlockDuration}
                  onChange={e => setNewBlockDuration(Number(e.target.value))}
                  className="glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">快捷选择</label>
                <div className="flex gap-1">
                  {BREAK_PRESETS.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setNewBlockDuration(m)}
                      className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${
                        newBlockDuration === m
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {m}min
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleAddBreakBlock} className="glass-btn glass-btn-primary px-4 py-1.5 text-xs">确认添加</button>
              <button onClick={() => setShowAddBreak(false)} className="glass-btn px-4 py-1.5 text-xs">取消</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 时间轴 */}
      {plan.blocks.length > 0 && (
        <div className="space-y-1">
          {plan.blocks.map((block, index) => {
            const isTask = block.type === 'task';
            const startTime = formatTime(block.startHour, block.startMinute);
            const endMin = block.startHour * 60 + block.startMinute + block.duration;
            const endTime = formatTime(Math.floor(endMin / 60), endMin % 60);

            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 group"
              >
                {/* 时间标签 */}
                <div className="w-24 flex-shrink-0 text-right">
                  <span className="text-xs font-medium text-gray-600">{startTime}</span>
                  <span className="text-xs text-gray-300 mx-1">-</span>
                  <span className="text-xs text-gray-400">{endTime}</span>
                </div>

                {/* 时间块 */}
                <div className={`flex-1 relative rounded-xl px-4 py-3 transition-all ${
                  isTask
                    ? 'bg-indigo-50 border border-indigo-100 hover:bg-indigo-100'
                    : 'bg-green-50 border border-green-100 hover:bg-green-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isTask ? (
                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                        </svg>
                      )}
                      <span className={`text-sm font-medium ${isTask ? 'text-indigo-700' : 'text-green-700'}`}>
                        {isTask ? block.taskName : '休息'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${isTask ? 'text-indigo-400' : 'text-green-400'}`}>
                        {formatDuration(block.duration)}
                      </span>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-xs"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 空状态 */}
      {plan.blocks.length === 0 && (
        <div className="glass-card p-8 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p className="text-gray-400 text-sm">还没有规划内容</p>
          <p className="text-gray-300 text-xs mt-1">
            {mode === 'ai' ? '点击「生成计划」让 AI 帮你安排' : '点击上方按钮添加任务和休息'}
          </p>
        </div>
      )}
    </div>
  );
}
