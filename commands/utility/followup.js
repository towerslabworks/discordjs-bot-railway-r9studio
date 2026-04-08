import { SlashCommandBuilder } from "discord.js";

// Normalize client name for consistent lookup (used later for Sheets keying)
function normalizeKey(name) {
  return name.trim().toLowerCase();
}

// Format today as YYYY-MM-DD for Sheets compatibility
function isoDate() {
  return new Date().toISOString().split("T")[0];
}

// Human-readable date for Discord display
function displayDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export const data = new SlashCommandBuilder()
  .setName("followup")
  .setDescription("Flag a client you haven't replied to yet.")
  .addStringOption((option) =>
    option
      .setName("entry")
      .setDescription('Client name and note — e.g. "Jane waiting on ref images"')
      .setRequired(true)
  );

export async function execute(interaction) {
  const raw = interaction.options.getString("entry").trim();

  // Split on first space: everything before = name, everything after = note
  const spaceIndex = raw.indexOf(" ");
  const displayName =
    spaceIndex !== -1 ? raw.substring(0, spaceIndex) : raw;
  const note =
    spaceIndex !== -1 ? raw.substring(spaceIndex + 1).trim() : null;

  // Data object — structured for future Sheets write
  const clientData = {
    key: normalizeKey(displayName),       // lookup key
    displayName,                           // shown in Discord
    note: note ?? "—",                    // shown in Discord and Sheets
    status: "followup",                   // controlled vocabulary
    dateISO: isoDate(),                   // Sheets-friendly date
    dateDisplay: displayDate(),            // Discord-friendly date
  };

  // Console log for debugging and future Sheets hook
  console.log(`[FOLLOWUP] client=${clientData.key} note="${clientData.note}" date=${clientData.dateISO} status=${clientData.status}`);

  // Find the followup channel
  const followupChannel = interaction.guild.channels.cache.find(
    (ch) => ch.name === "followup"
  );

  if (!followupChannel) {
    await interaction.reply({
      content: "Couldn't find a `#followup` channel. Make sure it exists in the server.",
      ephemeral: true,
    });
    return;
  }

  // Find or create the pinned summary message
  const pins = await followupChannel.messages.fetchPinned();
  let summaryMessage = pins.find((m) => m.author.id === interaction.client.user.id);

  if (!summaryMessage) {
    // No pinned message exists yet — create and pin it
    summaryMessage = await followupChannel.send("📋 **OPEN FOLLOWUPS**\n\n*No open followups.*");
    await summaryMessage.pin();
  }

  // Parse existing entries from the pinned message
  const existing = summaryMessage.content;
  const lines = existing.split("\n").filter(
    (l) => l.startsWith("🔁") || l.startsWith("⚠️")
  );

  // Check if this client is already in the list
  const alreadyExists = lines.some((l) =>
    l.toLowerCase().includes(clientData.key)
  );

  if (alreadyExists) {
    await interaction.reply({
      content: `**${clientData.displayName}** is already in the followup list. Use \`/clear ${clientData.displayName}\` first if you want to re-add them.`,
      ephemeral: true,
    });
    return;
  }

  // Add new entry line
  const newLine = `🔁 **${clientData.displayName}** — ${clientData.note} _(${clientData.dateDisplay})_`;
  lines.push(newLine);

  // Rebuild the full pinned message
  const updated =
    `📋 **OPEN FOLLOWUPS**\n\n` +
    lines.join("\n") +
    `\n\n_Last updated: ${clientData.dateDisplay}_`;

  await summaryMessage.edit(updated);

  await interaction.reply({
    content: `Got it. **${clientData.displayName}** added to <#${followupChannel.id}>.`,
    ephemeral: true,
  });
}
