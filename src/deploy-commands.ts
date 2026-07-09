import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { loadConfig } from './config';
import { data as taskCommand } from './commands/task';
import { data as eventCommand } from './commands/event';

dotenv.config();

async function main() {
  const config = loadConfig();
  const rest = new REST().setToken(config.discordToken);
  const commands = [taskCommand.toJSON(), eventCommand.toJSON()];

  await rest.put(Routes.applicationGuildCommands(config.discordClientId, config.guildId), {
    body: commands,
  });

  console.log(`Registered ${commands.length} commands to guild ${config.guildId}.`);
}

main().catch((error) => {
  console.error('Failed to register commands:', error);
  process.exit(1);
});
