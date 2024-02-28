const Discord = require("discord.js");
const crypto = require("crypto");
const { WALDBUTTON_URL } = require("../config");

const onetimeKeys = {};

module.exports = {
  onetimeKeys: onetimeKeys,
  data: new Discord.SlashCommandBuilder()
    .setName("connect")
    .setDescription("ワルトボタンと接続します"),
  /** @param {Discord.CommandInteraction} interaction */
  async execute(interaction) {
    const guild = interaction.guild;
    const member = await guild.members.fetch(interaction.member.id);
    const memberVC = member.voice.channel;
    if (!memberVC) {
      return interaction.reply({
        content: "接続先のVCが見つかりません。",
        ephemeral: true,
      });
    }
    if (!memberVC.joinable) {
      return interaction.reply({
        content: "VCに接続できません。",
        ephemeral: true,
      });
    }
    if (!memberVC.speakable) {
      return interaction.reply({
        content: "VCで音声を再生する権限がありません。",
        ephemeral: true,
      });
    }

    const key = generateOnetimeKey();
    onetimeKeys[key] = memberVC.id;
    scheduleRemoveKey(key);

    await interaction.reply({
      content: `下記リンクからワルトボタンと接続できます\n${WALDBUTTON_URL}/discord/connect?key=${key}`,
      ephemeral: true,
    });
  },
};

function generateOnetimeKey() {
  const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const N = 16;
  return Array.from(crypto.getRandomValues(new Uint8Array(N)))
    .map((n) => S[n % S.length])
    .join("");
}

function scheduleRemoveKey(key) {
  function delteKey(key) {
    if (onetimeKeys[key]) delete onetimeKeys[key];
  }
  // 300 秒したらキャッシュを削除
  setTimeout(() => delteKey(key), 300 * 1000);
}
