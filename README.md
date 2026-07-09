# discord-task-bot

Discord bot for PhilaCon Valley task assignments, due-date reminders, and
Scheduled Event creation. See the design spec and implementation plan in the
`philaConValley` working folder under `docs/superpowers/specs/` and
`docs/superpowers/plans/` for the full design.

## Local development

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the values (see "Discord setup"
   below for where to find them).
3. `npm run dev` — runs the bot with live reload against your `.env` config.

## Discord setup

1. Create an application at https://discord.com/developers/applications.
2. Under **Bot**, create a bot user and copy the token into `DISCORD_TOKEN`.
3. Copy the **Application ID** (General Information tab) into
   `DISCORD_CLIENT_ID`.
4. Under **OAuth2 → URL Generator**, check the `bot` and
   `applications.commands` scopes, then under bot permissions check
   `View Channels`, `Send Messages`, and `Manage Events`. Open the generated
   URL and invite the bot to the PhilaCon Valley server.
5. Enable Developer Mode in Discord (Settings → Advanced), right-click the
   server icon → Copy Server ID → `GUILD_ID`. Right-click the `#tasks`
   channel → Copy Channel ID → `TASKS_CHANNEL_ID`.
6. Register slash commands: `npm run deploy-commands`. Re-run this any time
   command definitions change.

## Deploying to Railway

1. Push this repo to GitHub under the `philaconvalley` org.
2. In Railway, create a new service from this GitHub repo (existing Hobby
   plan project).
3. Add a volume mounted at `/data`.
4. Set environment variables: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`,
   `GUILD_ID`, `TASKS_CHANNEL_ID`, and `DB_PATH=/data/tasks.db`.
5. Deploy. Railway runs `npm run build` then `npm run start` automatically
   (Nixpacks detects the `build` script).
6. Run `npm run deploy-commands` once (locally, with the same `.env` values
   as production) to register the slash commands to the guild.
