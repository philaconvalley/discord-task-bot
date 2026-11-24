import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Database } from 'better-sqlite3';
import type { Client } from 'discord.js';
import { initDb } from '../src/db';
import { createTask } from '../src/repositories/taskRepository';
import { runReminderCheck } from '../src/reminderJob';

const CHANNEL_ID = 'tasks-channel';

function fakeClient(isTextBased = true) {
  const send = vi.fn().mockResolvedValue(undefined);
  const fetch = vi.fn().mockResolvedValue({ isTextBased: () => isTextBased, send });
  return { client: { channels: { fetch } } as unknown as Client, fetch, send };
}

describe('runReminderCheck', () => {
  let db: Database;

  beforeEach(() => {
    db = initDb(':memory:');
    vi.useFakeTimers();
    // Noon UTC is 08:00 in New York, so today() is the same calendar day.
    vi.setSystemTime(new Date('2026-07-16T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sends one day-before reminder and does not repeat it', async () => {
    createTask(db, {
      description: 'Finalize sticker design',
      assigneeId: 'user-1',
      dueDate: '2026-07-17',
      createdBy: 'user-2',
    });
    const { client, send } = fakeClient();

    await runReminderCheck(client, db, CHANNEL_ID);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toContain('is due tomorrow');
    expect(send.mock.calls[0][0]).toContain('user-1');

    await runReminderCheck(client, db, CHANNEL_ID);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('sends a due-today reminder', async () => {
    createTask(db, {
      description: 'Send invoice',
      assigneeId: 'user-2',
      dueDate: '2026-07-16',
      createdBy: 'user-1',
    });
    const { client, send } = fakeClient();

    await runReminderCheck(client, db, CHANNEL_ID);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toContain('is due today');
  });

  it('never fetches the channel when no task is due', async () => {
    createTask(db, {
      description: 'Later task',
      assigneeId: 'user-1',
      dueDate: '2026-07-20',
      createdBy: 'user-2',
    });
    const { client, fetch, send } = fakeClient();

    await runReminderCheck(client, db, CHANNEL_ID);

    expect(fetch).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it('sends nothing and does not throw when the channel is not text-based', async () => {
    createTask(db, {
      description: 'Send invoice',
      assigneeId: 'user-2',
      dueDate: '2026-07-16',
      createdBy: 'user-1',
    });
    const { client, send } = fakeClient(false);
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(runReminderCheck(client, db, CHANNEL_ID)).resolves.toBeUndefined();

    expect(send).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
