import { describe, it, expect } from 'vitest';
import { loadConfig } from '../src/config';

describe('loadConfig', () => {
  it('throws when required variables are missing', () => {
    expect(() => loadConfig({})).toThrow(/Missing required environment variables/);
  });

  it('throws listing only the missing variables', () => {
    expect(() =>
      loadConfig({ DISCORD_TOKEN: 'x', GUILD_ID: 'y' } as NodeJS.ProcessEnv)
    ).toThrow(/DISCORD_CLIENT_ID, TASKS_CHANNEL_ID, DB_PATH/);
  });

  it('returns a populated config when all variables are present', () => {
    const config = loadConfig({
      DISCORD_TOKEN: 'token',
      DISCORD_CLIENT_ID: 'client',
      GUILD_ID: 'guild',
      TASKS_CHANNEL_ID: 'channel',
      DB_PATH: './data/tasks.db',
    } as NodeJS.ProcessEnv);

    expect(config).toEqual({
      discordToken: 'token',
      discordClientId: 'client',
      guildId: 'guild',
      tasksChannelId: 'channel',
      dbPath: './data/tasks.db',
    });
  });
});
