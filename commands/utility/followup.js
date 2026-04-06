import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("followup")
  .setDescription("Flag a client DM you haven't replied to yet.")
  .addStringOption((option) =>
    option
      .setName("client")
      .setDescription("The client's name or Discord username")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("note")
      .setDescription("What are you waiting on? (optional)")
      .setRequired(false)
  );

export async function execute(interaction) {
  const client = interaction.options.getString("client");
  const note = interaction.options.getString("note") ?? "No note added";
  const timestamp = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const followupChannel = interaction.guild.channels.cache.find(
    (ch) => ch.name === "followup"
  );

  if (!followupChannel) {
    await interaction.reply({
      content: "Couldn't find a channel named `followup`. Make sure it exists in the server.",
      ephemeral: true,
    });
    return;
  }

  await followupChannel.send(
    `🔁 **${client}** — ${note}\n📅 Flagged: ${timestamp}\n> Use \`/clear ${client}\` once resolved.`
  );

  await interaction.reply({
    content: `Got it. **${client}** added to <#${followupChannel.id}>.`,
    ephemeral: true,
  });
}
