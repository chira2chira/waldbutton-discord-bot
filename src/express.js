const { Client } = require("discord.js");
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
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { onetimeKeys } = require("./commands/connect");
const { API_KEY } = require("./config");

/** @param {Client} client */
function createExpressApp(client) {
  const app = express();

  app.use(
    morgan("combined", {
      skip: (req, res) => req.url === "/",
    })
  );
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(bodyParser.json());
  app.use((req, res, next) => {
    req.discordClient = client;
    next();
  });

  app.use((req, res, next) => {
    if (req.url !== "/" && req.get("x-api-key") !== API_KEY) {
      return res.status(401).send({ message: "認証に失敗。" });
    }
    next();
  });

  app.get("/", (req, res) => {
    res.status(200).send();
  });

  app.post("/connect", async (req, res) => {
    const { key } = req.body;
    const channelId = onetimeKeys[key];

    if (!key) {
      return res.status(400).send({ message: "不正な呼び出しです。" });
    } else if (!channelId) {
      return res
        .status(400)
        .send({ message: "有効な接続キーではありません。" });
    }

    res.send({ id: channelId, message: "接続成功" });
  });

  app.post("/play", async (req, res) => {
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
    const resource = createAudioResource(
      `https://waldbutton.vercel.app${url}`,
      {
        inputType: StreamType.Arbitrary,
      }
    );
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
      `Client: ${clientIp}`
    );

    res.send({ message: "OK" });
  });

  return app;
}

module.exports = createExpressApp;
