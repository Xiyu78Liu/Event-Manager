import { useState } from 'react';
import type { SearchMode } from '../types';

interface SearchBarProps {
  onSearch: (query: string, mode: SearchMode) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('name');

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
    onSearch(query, newMode);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    onSearch(value, mode);
  };

  const modes: { label: string; value: SearchMode }[] = [
    { label: '任务名', value: 'name' },
    { label: '创建时间', value: 'createdAt' },
    { label: '完成时间', value: 'completedAt' },
  ];

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="relative flex-1 max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={mode === 'name' ? '搜索任务名...' : '搜索日期 (YYYY-MM-DD)...'}
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          className="glass-input w-full pl-10 pr-4 py-2.5 text-sm"
        />
      </div>
      <div className="flex gap-1">
        {modes.map(m => (
          <button
            key={m.value}
            onClick={() => handleModeChange(m.value)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
              mode === m.value
                ? 'border-[rgba(var(--color-primary-rgb),0.5)] bg-[rgba(var(--color-primary-rgb),0.08)] text-[rgba(var(--color-primary-rgb),1)]'
                : 'border-[var(--border-default)] text-[var(--text-faint)] hover:border-[var(--border-input)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
