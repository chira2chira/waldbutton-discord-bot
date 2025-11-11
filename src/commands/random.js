// @ts-check

const Discord = require("discord.js");
const { searchBy, CustomId } = require("../utils/searchByRandom");

module.exports = {
  id: CustomId,
  data: new Discord.SlashCommandBuilder()
    .setName("random")
    .setDescription("ランダムにボタンを取得します（最大25件）")
    .addStringOption((option) =>
      option.setName("count").setDescription("取得する個数").setRequired(false)
    ),
  /** @param {Discord.CommandInteraction} interaction */
  async execute(interaction) {
    try {
      const count = interaction.options.get("count")?.value || "";
      await searchBy(interaction, count.toString());
    } catch (error) {
      console.error(error);
      await interaction.followUp({
        content: "取得中にエラーが発生しました",
        flags: "Ephemeral",
      });
    }
  },
};
