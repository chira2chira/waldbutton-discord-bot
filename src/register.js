const { TOKEN, APP_ID, SERVER_ID } = require("./config");
const { REST, Routes } = require("discord.js");
const fs = require("node:fs");

const commands = [];
const commandFiles = fs
  .readdirSync("./src/commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log(
      `${commands.length} 個のアプリケーションコマンドを登録します。`
    );

    // const data = await rest.put(
    //   Routes.applicationGuildCommands(APP_ID, SERVER_ID),
    //   { body: commands }
    // );
    const data = await rest.put(Routes.applicationCommands(APP_ID), {
      body: commands,
    });

    console.log(`${data.length} 個のアプリケーションコマンドを登録しました。`);
  } catch (error) {
    console.error(error);
  }
})();
