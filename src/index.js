const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
const { TOKEN, APP_ID } = require("./config");
const createExpressApp = require("./express");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.on(Events.ClientReady, () => {
  console.log(`${client.user.tag}でログインしました。`);
});

client.login(TOKEN);

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`${filePath} に必要な "data" か "execute" がありません。`);
  }
}

// VCから人がいなくなったら退出する
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (oldState.channelId != null && newState.channelId === null) {
    const vcMembers = client.channels.cache.get(oldState.channelId).members;
    const own = vcMembers.find((x) => x.user.id === APP_ID);
    if (vcMembers.filter((x) => !x.user.bot).size === 0 && own) {
      getVoiceConnection(own.guild.id)?.disconnect();
    }
  }
});

// SlashCommand
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`${interaction.commandName} が見つかりません。`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.followUp({
      content: "エラーが発生しました。",
      ephemeral: true,
    });
  }
});

// SelectMenu
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isAnySelectMenu()) return;

  try {
    const searchCommand = require("./commands/search");
    if (interaction.customId === searchCommand.id) {
      await searchCommand.select(interaction);
    }
  } catch (error) {
    console.error(error);
    await interaction.followUp({
      content: "エラーが発生しました。",
      ephemeral: true,
    });
  }
});

// Button
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  try {
    const searchCommand = require("./commands/search");
    if (interaction.customId.startsWith("replay@")) {
      await searchCommand.replay(interaction);
    }
  } catch (error) {
    console.error(error);
    await interaction.followUp({
      content: "エラーが発生しました。",
      ephemeral: true,
    });
  }
});

client.on(Events.Error, async (error) => {
  console.error("Unhandled error:", error);
});

const app = createExpressApp(client);
app.listen("8080", "0.0.0.0", () => {
  console.log("Expres is running");
});
