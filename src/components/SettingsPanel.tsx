import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppSettings } from '../hooks/useSettings';
import { PRESET_THEMES, SOLID_COLORS } from '../utils/colorUtils';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onResetSettings: () => void;
}

const themeOptions = [
  { value: 'light', label: '浅色', icon: '☀️' },
  { value: 'dark', label: '深色', icon: '🌙' },
  { value: 'system', label: '跟随系统', icon: '💻' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-[rgba(var(--color-primary-rgb),0.8)]' : 'bg-[var(--bg-filter)]'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onUpdateSetting,
  onResetSettings,
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      tasks: localStorage.getItem('event-manager-tasks'),
      groups: localStorage.getItem('event-manager-groups'),
      subtasks: localStorage.getItem('event-manager-subtasks'),
      diary: localStorage.getItem('event-manager-diary'),
      settings: localStorage.getItem('event-manager-settings'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        if (data.tasks) localStorage.setItem('event-manager-tasks', data.tasks);
        if (data.groups) localStorage.setItem('event-manager-groups', data.groups);
        if (data.subtasks) localStorage.setItem('event-manager-subtasks', data.subtasks);
        if (data.diary) localStorage.setItem('event-manager-diary', data.diary);
        if (data.settings) localStorage.setItem('event-manager-settings', data.settings);

        window.location.reload();
      } catch {
        alert('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be re-imported
    e.target.value = '';
  };

  const handleClearAll = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      localStorage.removeItem('event-manager-tasks');
      localStorage.removeItem('event-manager-groups');
      localStorage.removeItem('event-manager-subtasks');
      localStorage.removeItem('event-manager-diary');
      localStorage.removeItem('event-manager-settings');
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md overflow-y-auto"
            style={{
              background: 'var(--bg-card-solid)',
              backdropFilter: 'blur(20px)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">设置</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-filter)] transition-colors text-[var(--text-secondary)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* 1. 外观设置 */}
              <div className="glass-card rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)]">外观设置</h3>

                {/* 明暗模式 */}
                <div className="space-y-2">
                  <label className="text-sm text-[var(--text-primary)]">明暗模式</label>
                  <div className="flex gap-2">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => onUpdateSetting('themeMode', option.value as 'light' | 'dark' | 'system')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          settings.themeMode === option.value
                            ? 'text-white'
                            : 'bg-[var(--bg-filter)] text-[var(--text-secondary)] hover:bg-[var(--bg-filter-hover)]'
                        }`}
                        style={
                          settings.themeMode === option.value
                            ? { background: settings.primaryColor }
                            : undefined
                        }
                      >
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 预设主题色 */}
                <div className="space-y-2">
                  <label className="text-sm text-[var(--text-primary)]">预设主题色</label>
                  <div className="grid grid-cols-4 gap-3">
                    {PRESET_THEMES.map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => {
                          onUpdateSetting('primaryColor', theme.value);
                          onUpdateSetting('isCustomColor', false);
                        }}
                        className={`flex flex-col items-center gap-1 transition-all ${
                          settings.primaryColor === theme.value && !settings.isCustomColor
                            ? 'scale-110'
                            : 'hover:scale-105'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            settings.primaryColor === theme.value && !settings.isCustomColor
                              ? 'ring-2 ring-offset-2 ring-gray-800'
                              : ''
                          }`}
                          style={{ background: `conic-gradient(${theme.colors[0]} 0deg, ${theme.colors[1]} 72deg, ${theme.colors[2]} 144deg, ${theme.colors[3]} 216deg, ${theme.colors[4]} 288deg, ${theme.colors[0]} 360deg)` }}
                        >
                          {settings.primaryColor === theme.value && !settings.isCustomColor && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 text-white drop-shadow-sm"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] leading-tight truncate w-full text-center">
                          {theme.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* 纯色分隔线 */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 h-px bg-[var(--text-muted)] opacity-30"></div>
                    <span className="text-xs text-[var(--text-muted)]">纯色</span>
                    <div className="flex-1 h-px bg-[var(--text-muted)] opacity-30"></div>
                  </div>

                  {/* 纯色选项 */}
                  <div className="flex flex-wrap gap-3">
                    {SOLID_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => {
                          onUpdateSetting('primaryColor', color.value);
                          onUpdateSetting('isCustomColor', true);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          settings.primaryColor === color.value && settings.isCustomColor
                            ? 'ring-2 ring-offset-2 ring-gray-800 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ background: color.value }}
                        title={color.name}
                      >
                        {settings.primaryColor === color.value && settings.isCustomColor && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 text-white drop-shadow-sm"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 自定义颜色 */}
                <div className="space-y-2">
                  <label className="text-sm text-[var(--text-primary)]">自定义颜色</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.isCustomColor ? settings.primaryColor : '#6366f1'}
                      onChange={(e) => {
                        onUpdateSetting('primaryColor', e.target.value);
                        onUpdateSetting('isCustomColor', true);
                      }}
                      className="w-12 h-12 rounded-lg cursor-pointer border-0"
                      style={{
                        WebkitAppearance: 'none',
                        border: 'none',
                        padding: 0,
                      }}
                    />
                    <span className="text-sm text-[var(--text-muted)]">
                      自定义颜色（纯色模式）
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. 显示设置 */}
              <div className="glass-card rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)]">显示设置</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-primary)]">显示附件图标</span>
                    <Toggle
                      checked={settings.showAttachments}
                      onChange={(v) => onUpdateSetting('showAttachments', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-primary)]">显示备注图标</span>
                    <Toggle
                      checked={settings.showNotes}
                      onChange={(v) => onUpdateSetting('showNotes', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-primary)]">显示预估时间</span>
                    <Toggle
                      checked={settings.showEstimatedTime}
                      onChange={(v) => onUpdateSetting('showEstimatedTime', v)}
                    />
                  </div>
                </div>
              </div>

              {/* 3. 数据管理 */}
              <div className="glass-card rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)]">数据管理</h3>

                <div className="space-y-3">
                  {/* 导出数据 */}
                  <button
                    onClick={handleExport}
                    className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-filter)] hover:bg-[var(--bg-filter-hover)] transition-colors"
                  >
                    导出数据
                  </button>

                  {/* 导入数据 */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-filter)] hover:bg-[var(--bg-filter-hover)] transition-colors"
                  >
                    导入数据
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />

                  {/* 清除所有数据 */}
                  <button
                    onClick={handleClearAll}
                    className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    清除所有数据
                  </button>
                </div>
              </div>

              {/* 重置设置 */}
              <button
                onClick={onResetSettings}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-filter)] transition-colors"
              >
                恢复默认设置
              </button>

              {/* Footer */}
              <div className="text-center text-xs text-[var(--text-muted)] pt-2 pb-4">
                v2.0.0
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
