import type { Database } from 'better-sqlite3';
import { addDays } from '../lib/date';

export interface Task {
  id: number;
  description: string;
  assigneeId: string;
  dueDate: string;
  status: 'open' | 'done';
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
  remindedDayBefore: boolean;
  remindedDueDate: boolean;
}

interface TaskRow {
  id: number;
  description: string;
  assignee_id: string;
  due_date: string;
  status: string;
  created_by: string;
  created_at: string;
  completed_at: string | null;
  reminded_day_before: number;
  reminded_due_date: number;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    description: row.description,
    assigneeId: row.assignee_id,
    dueDate: row.due_date,
    status: row.status as 'open' | 'done',
    createdBy: row.created_by,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    remindedDayBefore: row.reminded_day_before === 1,
    remindedDueDate: row.reminded_due_date === 1,
  };
}

export function createTask(
  db: Database,
  input: { description: string; assigneeId: string; dueDate: string; createdBy: string }
): Task {
  const createdAt = new Date().toISOString();
  const result = db
    .prepare(
      `INSERT INTO tasks (description, assignee_id, due_date, status, created_by, created_at)
       VALUES (?, ?, ?, 'open', ?, ?)`
    )
    .run(input.description, input.assigneeId, input.dueDate, input.createdBy, createdAt);

  return getTaskById(db, Number(result.lastInsertRowid))!;
}

export function getTaskById(db: Database, id: number): Task | undefined {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
  return row ? rowToTask(row) : undefined;
}

export function listTasks(
  db: Database,
  filter: { assigneeId?: string; status?: 'open' | 'done' } = {}
): Task[] {
  const clauses: string[] = [];
  const params: string[] = [];

  if (filter.assigneeId) {
    clauses.push('assignee_id = ?');
    params.push(filter.assigneeId);
  }
  if (filter.status) {
    clauses.push('status = ?');
    params.push(filter.status);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM tasks ${where} ORDER BY due_date ASC`).all(...params) as TaskRow[];
  return rows.map(rowToTask);
}

export function markTaskDone(db: Database, id: number): Task | undefined {
  const completedAt = new Date().toISOString();
  db.prepare(`UPDATE tasks SET status = 'done', completed_at = ? WHERE id = ?`).run(completedAt, id);
  return getTaskById(db, id);
}

export function deleteTask(db: Database, id: number): boolean {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}

export function markReminded(db: Database, id: number, stage: 'day_before' | 'due_date'): void {
  const column = stage === 'day_before' ? 'reminded_day_before' : 'reminded_due_date';
  db.prepare(`UPDATE tasks SET ${column} = 1 WHERE id = ?`).run(id);
}

export function findTasksNeedingReminder(
  db: Database,
  today: string
): { task: Task; stage: 'day_before' | 'due_date' }[] {
  const tomorrow = addDays(today, 1);
  const openTasks = listTasks(db, { status: 'open' }).filter(
    (task) => task.dueDate === today || task.dueDate === tomorrow
  );

  const results: { task: Task; stage: 'day_before' | 'due_date' }[] = [];
  for (const task of openTasks) {
    if (task.dueDate === tomorrow && !task.remindedDayBefore) {
      results.push({ task, stage: 'day_before' });
    }
    if (task.dueDate === today && !task.remindedDueDate) {
      results.push({ task, stage: 'due_date' });
    }
  }
  return results;
}
