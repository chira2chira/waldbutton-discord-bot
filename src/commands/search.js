// @ts-check

const Discord = require("discord.js");
const { play } = require("../utils/voice");

const CUSTOM_ID = "select-voice";

module.exports = {
  id: CUSTOM_ID,
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
      await interaction.deferReply();

      const keyword = interaction.options.get("keyword")?.value || "";
      const res = await fetch(
        `https://waldbutton.vercel.app/api/search-by-keyword?keyword=${keyword}`
      );
      let { items } = await res.json();

      if (items.length === 0) {
        return await interaction.followUp({
          content: "指定されたキーワードでは音声が見つかりませんでした",
        });
      }

      // 25件が最大
      items = items.slice(-25);

      const select = new Discord.StringSelectMenuBuilder()
        .setCustomId(CUSTOM_ID)
        .setPlaceholder(`再生する音声を選んでね（${items.length}件）`)
        .addOptions(items.map((x) => ({ label: x.text, value: x.url })));
      const row = new Discord.ActionRowBuilder().addComponents(select);
      await interaction.followUp({
        content: `キーワード：${keyword}`,
        // @ts-ignore
        components: [row],
      });
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
    const [_, url] = interaction.customId.split('@');
    try {
      const reply = await play(interaction, url);
      reply.delete();
    } catch (error) {
      await interaction.followUp({
        content: "再生中にエラーが発生しました",
        ephemeral: true,
      });
    }
  }
};
