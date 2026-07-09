export interface Config {
  discordToken: string;
  discordClientId: string;
  guildId: string;
  tasksChannelId: string;
  dbPath: string;
}

const REQUIRED_KEYS = [
  'DISCORD_TOKEN',
  'DISCORD_CLIENT_ID',
  'GUILD_ID',
  'TASKS_CHANNEL_ID',
  'DB_PATH',
] as const;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const missing = REQUIRED_KEYS.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    discordToken: env.DISCORD_TOKEN!,
    discordClientId: env.DISCORD_CLIENT_ID!,
    guildId: env.GUILD_ID!,
    tasksChannelId: env.TASKS_CHANNEL_ID!,
    dbPath: env.DB_PATH!,
  };
}
