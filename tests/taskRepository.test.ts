import { describe, it, expect, beforeEach } from 'vitest';
import type { Database } from 'better-sqlite3';
import { initDb } from '../src/db';
import {
  createTask,
  listTasks,
  getTaskById,
  markTaskDone,
  deleteTask,
  findTasksNeedingReminder,
  markReminded,
} from '../src/repositories/taskRepository';

describe('taskRepository', () => {
  let db: Database;

  beforeEach(() => {
    db = initDb(':memory:');
  });

  it('creates and retrieves a task', () => {
    const task = createTask(db, {
      description: 'Finalize sticker design',
      assigneeId: 'user-1',
      dueDate: '2026-07-17',
      createdBy: 'user-2',
    });

    expect(task.id).toBeTypeOf('number');
    expect(task.status).toBe('open');

    const fetched = getTaskById(db, task.id);
    expect(fetched?.description).toBe('Finalize sticker design');
  });

  it('lists tasks filtered by assignee and status', () => {
    createTask(db, { description: 'A', assigneeId: 'user-1', dueDate: '2026-07-17', createdBy: 'user-2' });
    const b = createTask(db, { description: 'B', assigneeId: 'user-2', dueDate: '2026-07-18', createdBy: 'user-2' });
    markTaskDone(db, b.id);

    expect(listTasks(db, { assigneeId: 'user-1' })).toHaveLength(1);
    expect(listTasks(db, { status: 'done' })).toHaveLength(1);
    expect(listTasks(db, {})).toHaveLength(2);
  });

  it('marks a task done and sets completedAt', () => {
    const task = createTask(db, { description: 'A', assigneeId: 'user-1', dueDate: '2026-07-17', createdBy: 'user-2' });
    const done = markTaskDone(db, task.id);

    expect(done?.status).toBe('done');
    expect(done?.completedAt).not.toBeNull();
  });

  it('deletes a task', () => {
    const task = createTask(db, { description: 'A', assigneeId: 'user-1', dueDate: '2026-07-17', createdBy: 'user-2' });
    expect(deleteTask(db, task.id)).toBe(true);
    expect(getTaskById(db, task.id)).toBeUndefined();
  });

  it('returns false deleting a task that does not exist', () => {
    expect(deleteTask(db, 999)).toBe(false);
  });

  describe('findTasksNeedingReminder', () => {
    it('flags a task due tomorrow for a day_before reminder', () => {
      createTask(db, { description: 'Due tomorrow', assigneeId: 'user-1', dueDate: '2026-07-09', createdBy: 'user-2' });

      const results = findTasksNeedingReminder(db, '2026-07-08');

      expect(results).toHaveLength(1);
      expect(results[0].stage).toBe('day_before');
    });

    it('flags a task due today for a due_date reminder', () => {
      createTask(db, { description: 'Due today', assigneeId: 'user-1', dueDate: '2026-07-08', createdBy: 'user-2' });

      const results = findTasksNeedingReminder(db, '2026-07-08');

      expect(results).toHaveLength(1);
      expect(results[0].stage).toBe('due_date');
    });

    it('does not re-flag a stage that was already reminded', () => {
      const task = createTask(db, { description: 'Due today', assigneeId: 'user-1', dueDate: '2026-07-08', createdBy: 'user-2' });
      markReminded(db, task.id, 'due_date');

      expect(findTasksNeedingReminder(db, '2026-07-08')).toHaveLength(0);
    });

    it('ignores tasks that are not due today or tomorrow', () => {
      createTask(db, { description: 'Far future', assigneeId: 'user-1', dueDate: '2026-08-01', createdBy: 'user-2' });

      expect(findTasksNeedingReminder(db, '2026-07-08')).toHaveLength(0);
    });

    it('ignores completed tasks', () => {
      const task = createTask(db, { description: 'Due today, done', assigneeId: 'user-1', dueDate: '2026-07-08', createdBy: 'user-2' });
      markTaskDone(db, task.id);

      expect(findTasksNeedingReminder(db, '2026-07-08')).toHaveLength(0);
    });
  });
});
