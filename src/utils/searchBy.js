// @ts-check
const Discord = require("discord.js");
const CUSTOM_ID = "select-voice";

exports.CustomId = CUSTOM_ID;

/**
/* @param {Discord.CommandInteraction} interaction 
/* @param {string} keyword 
 */
exports.searchBy = async (interaction, keyword) => {
  await interaction.deferReply();

  const res = await fetch(
    `https://waldbutton.vercel.app/api/search-by-keyword?keyword=${keyword}`
  );
  let { items } = await res.json();

  if (items.length === 0) {
    const reply = await interaction.editReply({
      content: "指定されたキーワードでは音声が見つかりませんでした",
    });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await reply.delete();
    return;
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
};
