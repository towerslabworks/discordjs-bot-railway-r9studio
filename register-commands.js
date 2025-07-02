import "dotenv/config";
import { REST, Routes } from "discord.js";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { APPLICATION_ID, GUILD_ID, DISCORD_TOKEN } = process.env;

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    file.endsWith(".js")
  );

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const rest = new REST().setToken(DISCORD_TOKEN);

try {
  // Optional: clear global commands — only run when cleaning up
  console.log("Clearing global commands...");
  await rest.put(Routes.applicationCommands(APPLICATION_ID), { body: [] });

  // Always: clear and register guild commands
  console.log("Clearing guild commands...");
  await rest.put(Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID), {
    body: [],
  });

  console.log(`Registering ${commands.length} application (/) commands.`);

  const data = await rest.put(
    Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID),
    { body: commands }
  );

  console.log(
    `Successfully registered ${data.length} application (/) commands.`
  );
} catch (error) {
  console.error(error);
}
