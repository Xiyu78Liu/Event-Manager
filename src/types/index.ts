export type Priority = '高' | '中' | '低';

export interface TaskSummary {
  exceeded: boolean;
  difficulty: number;
  comment: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  size: number;
  data: string; // 图片为 base64，文件为空字符串
}

export interface Task {
  id: string;
  name: string;
  group: string;
  priority: Priority;
  dueDate: string;
  estimatedTime: string;
  attachments: Attachment[];
  notes: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
  summary: TaskSummary | null;
}

export type FilterType = '全部' | string;

export type SearchMode = 'name' | 'createdAt' | 'completedAt';

export interface TaskFormData {
  name: string;
  group: string;
  priority: Priority;
  dueDate: string;
  estimatedTime: string;
  attachments: Attachment[];
  notes: string;
}

// 规划板块类型
export type PlanBlockType = 'task' | 'break';

export interface PlanBlock {
  id: string;
  type: PlanBlockType;
  taskId?: string;         // 关联的任务 ID（type='task' 时）
  taskName?: string;       // 任务名称（显示用）
  startHour: number;       // 开始小时（0-23）
  startMinute: number;     // 开始分钟（0-59）
  duration: number;        // 持续时间（分钟）
}

export interface Plan {
  id: string;
  name: string;            // 计划名称，如"今日计划"
  blocks: PlanBlock[];
  createdAt: string;
}
