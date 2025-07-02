import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Provides information about the server.");

export async function execute(interaction) {
  // interaction.guild is the Guild where the command was run
  // we exclude the bot itself from the member count
  await interaction.reply(
    `This server is ${interaction.guild.name} and has ${
      interaction.guild.memberCount - 1
    } members.`
  );
}
