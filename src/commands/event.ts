import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
} from 'discord.js';
import { parseDateTime } from '../lib/parseDate';

export const data = new SlashCommandBuilder()
  .setName('event')
  .setDescription('Manage PhilaCon Valley events')
  .addSubcommand((sub) =>
    sub
      .setName('add')
      .setDescription('Create a Discord scheduled event')
      .addStringOption((opt) => opt.setName('name').setDescription('Event name').setRequired(true))
      .addStringOption((opt) =>
        opt.setName('start').setDescription('Start time, e.g. "july 30 6pm"').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('end').setDescription('End time, e.g. "july 30 9pm"').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('location').setDescription('Where it happens').setRequired(true)
      )
      .addStringOption((opt) => opt.setName('description').setDescription('Event description'))
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const subcommand = interaction.options.getSubcommand();
  if (subcommand !== 'add') {
    throw new Error(`Unknown /event subcommand: ${subcommand}`);
  }

  const name = interaction.options.getString('name', true);
  const startInput = interaction.options.getString('start', true);
  const endInput = interaction.options.getString('end', true);
  const location = interaction.options.getString('location', true);
  const description = interaction.options.getString('description') ?? undefined;

  const start = parseDateTime(startInput);
  if (!start) {
    await interaction.reply({
      content: `I couldn't understand the start time "${startInput}".`,
      ephemeral: true,
    });
    return;
  }

  const end = parseDateTime(endInput);
  if (!end) {
    await interaction.reply({
      content: `I couldn't understand the end time "${endInput}".`,
      ephemeral: true,
    });
    return;
  }

  if (!interaction.guild) {
    await interaction.reply({ content: 'This command only works in a server.', ephemeral: true });
    return;
  }

  try {
    const scheduledEvent = await interaction.guild.scheduledEvents.create({
      name,
      scheduledStartTime: start,
      scheduledEndTime: end,
      privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
      entityType: GuildScheduledEventEntityType.External,
      description,
      entityMetadata: { location },
    });

    await interaction.reply(`📅 Event created: ${scheduledEvent.url}`);
  } catch (error) {
    console.error('Failed to create scheduled event', error);
    await interaction.reply({
      content: 'Something went wrong creating that event. Check the bot has the "Manage Events" permission.',
      ephemeral: true,
    });
  }
}
