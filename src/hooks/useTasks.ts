import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskFormData, FilterType, Priority, TaskSummary, SearchMode } from '../types';

const TASKS_STORAGE_KEY = 'event-manager-tasks';
const GROUPS_STORAGE_KEY = 'event-manager-groups';

const DEFAULT_GROUPS = ['家里', '工作'];

function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(TASKS_STORAGE_KEY);
    const tasks: Task[] = data ? JSON.parse(data) : [];
    // 兼容旧数据：attachments 从 string 转为 Attachment[]
    return tasks.map(t => ({
      ...t,
      attachments: Array.isArray(t.attachments) ? t.attachments : [],
    }));
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

function loadGroups(): string[] {
  try {
    const data = localStorage.getItem(GROUPS_STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_GROUPS;
  } catch {
    return DEFAULT_GROUPS;
  }
}

function saveGroups(groups: string[]) {
  localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [groups, setGroups] = useState<string[]>(loadGroups);
  const [filter, setFilter] = useState<FilterType>('全部');

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveGroups(groups);
  }, [groups]);

  const addTask = useCallback((data: TaskFormData) => {
    const newTask: Task = {
      id: uuidv4(),
      ...data,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      summary: null,
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, data: Partial<TaskFormData & { completed: boolean }>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const deleteMultipleTasks = useCallback((ids: string[]) => {
    setTasks(prev => prev.filter(t => !ids.includes(t.id)));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (t.completed) {
        return { ...t, completed: false, completedAt: null, summary: null };
      }
      return { ...t, completed: true, completedAt: new Date().toISOString() };
    }));
  }, []);

  const saveSummary = useCallback((id: string, summary: TaskSummary) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, summary } : t));
  }, []);

  // 分组管理
  const addGroup = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed || groups.includes(trimmed)) return;
    setGroups(prev => [...prev, trimmed]);
  }, [groups]);

  const deleteGroup = useCallback((name: string, deleteTasks = true) => {
    setGroups(prev => prev.filter(g => g !== name));
    if (deleteTasks) {
      setTasks(prev => prev.filter(t => t.group !== name));
    } else {
      // 保留任务，将分组清空
      setTasks(prev => prev.map(t => t.group === name ? { ...t, group: '' } : t));
    }
    if (filter === name) {
      setFilter('全部');
    }
  }, [groups, filter]);

  // 批量移动任务到另一个分组
  const moveTasksToGroup = useCallback((ids: string[], targetGroup: string) => {
    setTasks(prev => prev.map(t => ids.includes(t.id) ? { ...t, group: targetGroup } : t));
  }, []);

  // 未完成任务（按分组筛选）
  const filteredTasks = tasks.filter(t => {
    if (t.completed) return false;
    if (filter === '全部') return true;
    return t.group === filter;
  });

  // 已完成任务
  const completedTasks = tasks.filter(t => t.completed);

  // 搜索已完成任务
  const searchCompletedTasks = useCallback((query: string, mode: SearchMode) => {
    if (!query.trim()) return completedTasks;
    const q = query.trim().toLowerCase();
    return completedTasks.filter(t => {
      if (mode === 'name') return t.name.toLowerCase().includes(q);
      if (mode === 'createdAt') return t.createdAt.slice(0, 10).includes(q);
      if (mode === 'completedAt') return (t.completedAt || '').slice(0, 10).includes(q);
      return true;
    });
  }, [completedTasks]);

  // 优先面板（按分组筛选 + 排序）
  const priorityTasks = tasks
    .filter(t => {
      if (t.completed) return false;
      if (filter === '全部') return true;
      return t.group === filter;
    })
    .sort((a, b) => {
      const priorityOrder: Record<Priority, number> = { '高': 0, '中': 1, '低': 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    completedTasks,
    priorityTasks,
    groups,
    filter,
    setFilter,
    addTask,
    updateTask,
    deleteTask,
    deleteMultipleTasks,
    toggleComplete,
    saveSummary,
    addGroup,
    deleteGroup,
    moveTasksToGroup,
    searchCompletedTasks,
  };
}
