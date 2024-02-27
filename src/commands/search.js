// @ts-check

const Discord = require("discord.js");
const { play } = require("../utils/voice");
const { searchBy, CustomId } = require("../utils/searchBy");

module.exports = {
  id: CustomId,
  data: new Discord.SlashCommandBuilder()
    .setName("search")
    .setDescription("キーワードからボタンを探します（最大25件）")
    .addStringOption((option) =>
      option
        .setName("keyword")
        .setDescription("検索するキーワード")
        .setRequired(true)
    ),
  /** @param {Discord.CommandInteraction} interaction */
  async execute(interaction) {
    try {
      const keyword = interaction.options.get("keyword")?.value || "";
      await searchBy(interaction, keyword.toString());
    } catch (error) {
      console.error(error);
      await interaction.followUp({
        content: "検索中にエラーが発生しました",
        ephemeral: true,
      });
    }
  },
  /** @param {Discord.StringSelectMenuInteraction} interaction */
  async select(interaction) {
    const value = interaction.values[0];

    try {
      await play(interaction, value);
    } catch (error) {
      await interaction.followUp({
        content: "再生中にエラーが発生しました",
        ephemeral: true,
      });
    }

    const button = new Discord.ButtonBuilder()
      .setCustomId("replay@" + value)
      .setStyle(Discord.ButtonStyle.Primary)
      .setLabel("もう1度再生");
    const row = new Discord.ActionRowBuilder().addComponents(button);
    // @ts-ignore
    await interaction.editReply({ components: [row] });
  },
  /** @param {Discord.StringSelectMenuInteraction} interaction */
  async replay(interaction) {
    const [_, url] = interaction.customId.split("@");
    try {
      const reply = await play(interaction, url);
      reply.delete();
    } catch (error) {
      await interaction.followUp({
        content: "再生中にエラーが発生しました",
        ephemeral: true,
      });
    }
  },
};
