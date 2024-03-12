const { Client } = require("discord.js");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
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

  app.use("/connect", require("./route/connect"));

  app.use("/play", require("./route/play"));

  return app;
}

module.exports = createExpressApp;
