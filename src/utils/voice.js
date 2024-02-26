const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
  createAudioResource,
  StreamType,
  createAudioPlayer,
  AudioPlayerStatus,
  NoSubscriberBehavior,
} = require("@discordjs/voice");

exports.play = async (interaction, url) => {
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
  const status = ["Loading Sounds...", `Connecting to ${memberVC}...`];
  const p = interaction.reply({ content: status.join("\n"), ephemeral: true });
  const connection = joinVoiceChannel({
    guildId: guild.id,
    channelId: memberVC.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfMute: false,
  });
  const resource = createAudioResource(`https://waldbutton.vercel.app${url}`, {
    inputType: StreamType.Arbitrary,
  });
  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });
  player.play(resource);
  const promises = [];
  promises.push(
    entersState(player, AudioPlayerStatus.AutoPaused, 1000 * 10).then(
      () => (status[0] += "Done!")
    )
  );
  promises.push(
    entersState(connection, VoiceConnectionStatus.Ready, 1000 * 10).then(
      () => (status[1] += "Done!")
    )
  );
  await Promise.race(promises);
  const reply = await p;
  await Promise.all([...promises, interaction.editReply(status.join("\n"))]);
  connection.subscribe(player);
  await entersState(player, AudioPlayerStatus.Playing, 100);

  await entersState(player, AudioPlayerStatus.Idle, 2 ** 31 - 1);
  connection.destroy();

  return reply;
};
