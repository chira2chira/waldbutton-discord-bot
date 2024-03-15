// @ts-check
const Discord = require("discord.js");
const CUSTOM_ID = "random-voice";

exports.CustomId = CUSTOM_ID;

/**
/* @param {Discord.CommandInteraction} interaction 
/* @param {string} count 
 */
exports.searchBy = async (interaction, count) => {
  await interaction.deferReply();

  const res = await fetch(
    `https://waldbutton.vercel.app/api/search-by-random?count=${count}`
  );
  let { items } = await res.json();

  // 25件が最大
  items = items.slice(-25);

  const select = new Discord.StringSelectMenuBuilder()
    .setCustomId(CUSTOM_ID)
    .setPlaceholder(`再生する音声を選んでね`)
    .addOptions(items.map((x) => ({ label: x.text, value: x.url })));
  const row = new Discord.ActionRowBuilder().addComponents(select);
  await interaction.followUp({
    content: `ランダムに${items.length}個取得！`,
    // @ts-ignore
    components: [row],
  });
};
