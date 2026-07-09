import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Database } from 'better-sqlite3';
import { parseDueDate } from '../lib/parseDate';
import { createTask, listTasks, getTaskById, markTaskDone, deleteTask } from '../repositories/taskRepository';

export const data = new SlashCommandBuilder()
  .setName('task')
  .setDescription('Manage crew tasks')
  .addSubcommand((sub) =>
    sub
      .setName('add')
      .setDescription('Add a new task')
      .addStringOption((opt) =>
        opt.setName('description').setDescription('What needs to get done').setRequired(true)
      )
      .addUserOption((opt) =>
        opt.setName('assignee').setDescription('Who owns this task').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('due').setDescription('Due date, e.g. "friday" or "july 17"').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName('list')
      .setDescription('List tasks')
      .addUserOption((opt) => opt.setName('assignee').setDescription('Filter by assignee'))
      .addStringOption((opt) =>
        opt
          .setName('status')
          .setDescription('Filter by status')
          .addChoices({ name: 'open', value: 'open' }, { name: 'done', value: 'done' })
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName('done')
      .setDescription('Mark a task done')
      .addIntegerOption((opt) => opt.setName('id').setDescription('Task ID').setRequired(true))
  )
  .addSubcommand((sub) =>
    sub
      .setName('delete')
      .setDescription('Delete a task')
      .addIntegerOption((opt) => opt.setName('id').setDescription('Task ID').setRequired(true))
  );

export async function execute(interaction: ChatInputCommandInteraction, db: Database): Promise<void> {
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case 'add':
      return handleAdd(interaction, db);
    case 'list':
      return handleList(interaction, db);
    case 'done':
      return handleDone(interaction, db);
    case 'delete':
      return handleDelete(interaction, db);
    default:
      throw new Error(`Unknown /task subcommand: ${subcommand}`);
  }
}

async function handleAdd(interaction: ChatInputCommandInteraction, db: Database): Promise<void> {
  const description = interaction.options.getString('description', true);
  const assignee = interaction.options.getUser('assignee', true);
  const dueInput = interaction.options.getString('due', true);

  const dueDate = parseDueDate(dueInput);
  if (!dueDate) {
    await interaction.reply({
      content: `I couldn't understand the due date "${dueInput}". Try something like "friday" or "july 17".`,
      ephemeral: true,
    });
    return;
  }

  const task = createTask(db, {
    description,
    assigneeId: assignee.id,
    dueDate,
    createdBy: interaction.user.id,
  });

  await interaction.reply(
    `✅ Task #${task.id} created — "${description}" assigned to <@${assignee.id}>, due ${dueDate}.`
  );
}

async function handleList(interaction: ChatInputCommandInteraction, db: Database): Promise<void> {
  const assignee = interaction.options.getUser('assignee');
  const status = interaction.options.getString('status') as 'open' | 'done' | null;

  const tasks = listTasks(db, {
    assigneeId: assignee?.id,
    status: status ?? undefined,
  });

  if (tasks.length === 0) {
    await interaction.reply({ content: 'No tasks found.', ephemeral: true });
    return;
  }

  const lines = tasks.map(
    (task) => `#${task.id} [${task.status}] "${task.description}" — <@${task.assigneeId}>, due ${task.dueDate}`
  );

  await interaction.reply({ content: lines.join('\n'), ephemeral: true });
}

async function handleDone(interaction: ChatInputCommandInteraction, db: Database): Promise<void> {
  const id = interaction.options.getInteger('id', true);
  const existing = getTaskById(db, id);

  if (!existing) {
    await interaction.reply({ content: `Task #${id} not found.`, ephemeral: true });
    return;
  }

  markTaskDone(db, id);
  await interaction.reply(`✅ Task #${id} "${existing.description}" marked done.`);
}

async function handleDelete(interaction: ChatInputCommandInteraction, db: Database): Promise<void> {
  const id = interaction.options.getInteger('id', true);
  const deleted = deleteTask(db, id);

  if (!deleted) {
    await interaction.reply({ content: `Task #${id} not found.`, ephemeral: true });
    return;
  }

  await interaction.reply(`🗑️ Task #${id} deleted.`);
}
