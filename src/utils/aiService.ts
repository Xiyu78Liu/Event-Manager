import type { Task, PlanBlock } from '../types';
import { v4 as uuidv4 } from 'uuid';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const STORAGE_KEY = 'event-manager-deepseek-key';

export function getApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function setApiKey(key: string) {
  localStorage.setItem(STORAGE_KEY, key);
}

function parseEstimatedTime(time: string): number {
  if (!time) return 0;
  const parts = time.split(':');
  return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
}

interface AIGenerateResult {
  blocks: PlanBlock[];
  summary: string;
}

export async function generateAIPlan(
  tasks: Task[],
  startHour: number,
  apiKey: string,
  userPrompt?: string
): Promise<AIGenerateResult> {
  const tasksWithDuration = tasks
    .map(t => ({ ...t, durationMin: parseEstimatedTime(t.estimatedTime) }))
    .filter(t => t.durationMin > 0);

  if (tasksWithDuration.length === 0) {
    throw new Error('没有设置了预估时间的任务');
  }

  const taskList = tasksWithDuration.map(t =>
    `- ${t.name}（优先级：${t.priority}，预估时间：${t.durationMin}分钟）`
  ).join('\n');

  const prompt = `你是一个智能学习规划助手。请根据以下任务列表，生成一个最优的今日学习/工作计划。

任务列表：
${taskList}
${userPrompt ? `\n用户额外需求：\n${userPrompt}\n` : ''}
要求：
1. 按优先级排序（高 > 中 > 低），同优先级按预估时间短的先做
2. 从 ${startHour}:00 开始
3. 每完成一个任务后安排休息（任务>=90分钟休息15分钟，否则休息5-10分钟）
4. 最后一个任务后不需要休息
5. 考虑学习效率，高难度任务放在精力最好的时段

请严格按以下 JSON 格式返回，不要加任何其他文字：
{
  "blocks": [
    {"type": "task", "taskName": "任务名称", "startHour": 9, "startMinute": 0, "duration": 60},
    {"type": "break", "startHour": 10, "startMinute": 0, "duration": 10}
  ],
  "summary": "一句话总结这个计划"
}`;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个智能学习规划助手，只返回 JSON 格式的数据，不要加任何 markdown 标记或其他文字。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('API Key 无效，请检查设置');
    }
    throw new Error(`API 请求失败：${errorData?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content || '';

  // 清理可能的 markdown 标记
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let parsed: { blocks: Array<{ type: string; taskName?: string; startHour: number; startMinute: number; duration: number }>; summary: string };

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('AI 返回的数据格式有误，请重试');
  }

  if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
    throw new Error('AI 返回的数据格式有误，请重试');
  }

  // 转换为 PlanBlock 格式
  const blocks: PlanBlock[] = parsed.blocks.map(b => ({
    id: uuidv4(),
    type: b.type === 'task' ? 'task' : 'break',
    taskName: b.taskName || '',
    startHour: b.startHour || 0,
    startMinute: b.startMinute || 0,
    duration: b.duration || 30,
  }));

  return {
    blocks,
    summary: parsed.summary || '计划已生成',
  };
}
