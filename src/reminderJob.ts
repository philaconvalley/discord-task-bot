import cron from 'node-cron';
import type { Client } from 'discord.js';
import type { Database } from 'better-sqlite3';
import { findTasksNeedingReminder, markReminded } from './repositories/taskRepository';
import { today } from './lib/date';

export async function runReminderCheck(client: Client, db: Database, channelId: string): Promise<void> {
  const dueReminders = findTasksNeedingReminder(db, today());
  if (dueReminders.length === 0) {
    return;
  }

  const channel = await client.channels.fetch(channelId);
  if (!channel || !channel.isTextBased() || !('send' in channel)) {
    console.error(`Tasks channel ${channelId} is not a sendable text channel.`);
    return;
  }

  for (const { task, stage } of dueReminders) {
    const when = stage === 'day_before' ? 'tomorrow' : 'today';
    await channel.send(`⏰ <@${task.assigneeId}> — "${task.description}" is due ${when}.`);
    markReminded(db, task.id, stage);
  }
}

export function startReminderJob(client: Client, db: Database, channelId: string): void {
  cron.schedule('0 9 * * *', () => {
    runReminderCheck(client, db, channelId).catch((error) => {
      console.error('Reminder job failed', error);
    });
  }, { timezone: 'America/New_York' });
}
