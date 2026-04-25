import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskFormData, FilterType, Priority, TaskSummary, SearchMode, SubTask, SubTaskFormData, DiaryEntry } from '../types';

const TASKS_STORAGE_KEY = 'event-manager-tasks';
const GROUPS_STORAGE_KEY = 'event-manager-groups';
const SUBTASKS_STORAGE_KEY = 'event-manager-subtasks';
const DIARY_STORAGE_KEY = 'event-manager-diary';

const DEFAULT_GROUPS = ['家里', '工作'];

function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(TASKS_STORAGE_KEY);
    const tasks: Task[] = data ? JSON.parse(data) : [];
    // 兼容旧数据：attachments 从 string 转为 Attachment[]
    return tasks.map(t => ({
      ...t,
      attachments: Array.isArray(t.attachments) ? t.attachments : [],
      subTaskIds: Array.isArray(t.subTaskIds) ? t.subTaskIds : [],
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

function loadSubTasks(): SubTask[] {
  try { return JSON.parse(localStorage.getItem(SUBTASKS_STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveSubTasks(subTasks: SubTask[]) { localStorage.setItem(SUBTASKS_STORAGE_KEY, JSON.stringify(subTasks)); }
function loadDiary(): DiaryEntry[] {
  try { return JSON.parse(localStorage.getItem(DIARY_STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveDiary(entries: DiaryEntry[]) { localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries)); }

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [groups, setGroups] = useState<string[]>(loadGroups);
  const [filter, setFilter] = useState<FilterType>('全部');
  const [subTasks, setSubTasks] = useState<SubTask[]>(loadSubTasks);
  const [diary, setDiary] = useState<DiaryEntry[]>(loadDiary);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveGroups(groups);
  }, [groups]);

  useEffect(() => {
    saveSubTasks(subTasks);
  }, [subTasks]);

  useEffect(() => {
    saveDiary(diary);
  }, [diary]);

  const addTask = useCallback((data: TaskFormData) => {
    const newTask: Task = {
      id: uuidv4(),
      ...data,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      summary: null,
      subTaskIds: [],
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, data: Partial<TaskFormData & { completed: boolean }>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    // 同时删除关联的子任务
    setSubTasks(prev => prev.filter(st => st.parentId !== id));
  }, []);

  const deleteMultipleTasks = useCallback((ids: string[]) => {
    setTasks(prev => prev.filter(t => !ids.includes(t.id)));
    // 同时删除关联的子任务
    setSubTasks(prev => prev.filter(st => !ids.includes(st.parentId)));
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

  // ===== 子任务 CRUD =====
  const addSubTask = useCallback((parentId: string, data: SubTaskFormData) => {
    const newSubTask: SubTask = {
      id: uuidv4(),
      parentId,
      ...data,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      summary: null,
    };
    setSubTasks(prev => [newSubTask, ...prev]);
    // 将子任务 ID 添加到父任务
    setTasks(prev => prev.map(t => t.id === parentId ? { ...t, subTaskIds: [...t.subTaskIds, newSubTask.id] } : t));
  }, []);

  const updateSubTask = useCallback((id: string, data: Partial<SubTaskFormData & { completed: boolean }>) => {
    setSubTasks(prev => prev.map(st => st.id === id ? { ...st, ...data } : st));
  }, []);

  const deleteSubTask = useCallback((id: string) => {
    setSubTasks(prev => {
      const subTask = prev.find(st => st.id === id);
      if (subTask) {
        // 从父任务中移除该子任务 ID
        setTasks(tasks => tasks.map(t => t.id === subTask.parentId ? { ...t, subTaskIds: t.subTaskIds.filter(sid => sid !== id) } : t));
      }
      return prev.filter(st => st.id !== id);
    });
  }, []);

  const toggleSubTaskComplete = useCallback((id: string) => {
    setSubTasks(prev => prev.map(st => {
      if (st.id !== id) return st;
      if (st.completed) {
        return { ...st, completed: false, completedAt: null, summary: null };
      }
      return { ...st, completed: true, completedAt: new Date().toISOString() };
    }));
  }, []);

  const saveSubTaskSummary = useCallback((id: string, summary: TaskSummary) => {
    setSubTasks(prev => prev.map(st => st.id === id ? { ...st, summary } : st));
  }, []);

  // 获取某个任务的子任务
  const getSubTasksByParentId = useCallback((parentId: string) => {
    return subTasks.filter(st => st.parentId === parentId);
  }, [subTasks]);

  // ===== 日记 CRUD =====
  const addDiaryEntry = useCallback((date: string, content: string) => {
    const newEntry: DiaryEntry = {
      id: uuidv4(),
      date,
      content,
      createdAt: new Date().toISOString(),
    };
    setDiary(prev => [newEntry, ...prev]);
  }, []);

  const updateDiaryEntry = useCallback((id: string, content: string) => {
    setDiary(prev => prev.map(e => e.id === id ? { ...e, content } : e));
  }, []);

  const deleteDiaryEntry = useCallback((id: string) => {
    setDiary(prev => prev.filter(e => e.id !== id));
  }, []);

  const getDiaryByDate = useCallback((date: string) => {
    return diary.filter(e => e.date === date);
  }, [diary]);

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
    // 子任务相关
    subTasks,
    addSubTask,
    updateSubTask,
    deleteSubTask,
    toggleSubTaskComplete,
    saveSubTaskSummary,
    getSubTasksByParentId,
    // 日记相关
    diary,
    addDiaryEntry,
    updateDiaryEntry,
    deleteDiaryEntry,
    getDiaryByDate,
  };
}
