import { SlashCommandBuilder } from "discord.js";

function normalizeKey(name) {
  return name.trim().toLowerCase();
}

function displayDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export const data = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Mark a followup as resolved and remove from the list.")
  .addStringOption((option) =>
    option
      .setName("client")
      .setDescription("The client name exactly as entered in /followup")
      .setRequired(true)
  );

export async function execute(interaction) {
  const raw = interaction.options.getString("client").trim();
  const key = normalizeKey(raw);

  console.log(`[CLEAR] client=${key} date=${new Date().toISOString().split("T")[0]}`);

  const followupChannel = interaction.guild.channels.cache.find(
    (ch) => ch.name === "followup"
  );

  if (!followupChannel) {
    await interaction.reply({
      content: "Couldn't find a `#followup` channel.",
      ephemeral: true,
    });
    return;
  }

  const pins = await followupChannel.messages.fetchPinned();
  const summaryMessage = pins.find(
    (m) => m.author.id === interaction.client.user.id
  );

  if (!summaryMessage) {
    await interaction.reply({
      content: "No followup list found. Nothing to clear.",
      ephemeral: true,
    });
    return;
  }

  const lines = summaryMessage.content
    .split("\n")
    .filter((l) => l.startsWith("🔁") || l.startsWith("⚠️"));

  const filtered = lines.filter((l) => !l.toLowerCase().includes(key));

  if (filtered.length === lines.length) {
    await interaction.reply({
      content: `Couldn't find **${raw}** in the followup list. Check the spelling matches what was entered.`,
      ephemeral: true,
    });
    return;
  }

  const updated =
    filtered.length === 0
      ? `📋 **OPEN FOLLOWUPS**\n\n*No open followups.*`
      : `📋 **OPEN FOLLOWUPS**\n\n` +
        filtered.join("\n") +
        `\n\n_Last updated: ${displayDate()}_`;

  await summaryMessage.edit(updated);

  await interaction.reply({
    content: `✅ **${raw}** cleared from the followup list.`,
    ephemeral: true,
  });
}
