import { describe, it, expect } from 'vitest';
import type { Task } from '../src/repositories/taskRepository';
import { formatTaskList, MAX_MESSAGE_LENGTH } from '../src/lib/taskList';

function makeTask(id: number, description = `Task ${id}`): Task {
  return {
    id,
    description,
    assigneeId: `user-${id}`,
    dueDate: '2026-07-17',
    status: 'open',
    createdBy: 'user-1',
    createdAt: '2026-07-01T00:00:00.000Z',
    completedAt: null,
    remindedDayBefore: false,
    remindedDueDate: false,
  };
}

describe('formatTaskList', () => {
  it('shows every task when the list is short', () => {
    const tasks = [makeTask(1), makeTask(2), makeTask(3)];

    const text = formatTaskList(tasks);

    for (const task of tasks) {
      expect(text).toContain(`#${task.id} `);
    }
    expect(text).not.toContain('more.');
  });

  it('stays under the limit and says how many tasks were left out', () => {
    const tasks = Array.from({ length: 100 }, (_, index) =>
      makeTask(index + 1, 'A long task description that fills the line')
    );

    const text = formatTaskList(tasks);

    expect(text.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
    const shown = tasks.filter((task) => text.includes(`#${task.id} `)).length;
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(tasks.length);
    expect(text).toContain(`…and ${tasks.length - shown} more. Filter by assignee or status to see them.`);
  });

  it('returns only the footer when even one task does not fit', () => {
    const tasks = [makeTask(1, 'x'.repeat(MAX_MESSAGE_LENGTH))];

    const text = formatTaskList(tasks);

    expect(text.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
    expect(text).toBe('…and 1 more. Filter by assignee or status to see them.');
  });
});
