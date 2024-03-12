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
const { Client } = require("discord.js");
const router = require("express").Router();

router.post("/", async (req, res) => {
  /** @type {Client} */
  const client = req.discordClient;
  const { url, channel, clientIp } = req.body;

  if (!url || !channel) {
    return res.status(400).send({ message: "不正な呼び出しです。" });
  }

  const memberVC = client.channels.cache.get(channel);
  if (!memberVC || !memberVC.joinable) {
    return res.status(400).send({ message: "VCに接続できません。" });
  }
  if (!memberVC.speakable) {
    return res
      .status(400)
      .send({ message: "VCで音声を再生する権限がありません。" });
  }

  const connection = joinVoiceChannel({
    guildId: memberVC.guild.id,
    channelId: memberVC.id,
    adapterCreator: memberVC.guild.voiceAdapterCreator,
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
  promises.push(entersState(player, AudioPlayerStatus.AutoPaused, 1000 * 10));
  promises.push(
    entersState(connection, VoiceConnectionStatus.Ready, 1000 * 10)
  );
  await Promise.all(promises);
  connection.subscribe(player);
  await entersState(player, AudioPlayerStatus.Playing, 100);

  await entersState(player, AudioPlayerStatus.Idle, 2 ** 31 - 1);

  console.log(
    `Play:${url.replace(/^.*\//, "")}`,
    `Guild:${memberVC.guild.id.slice(-5)}`,
    `Client:${clientIp}`
  );

  res.send({ message: "OK" });
});

module.exports = router;
