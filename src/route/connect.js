const { onetimeKeys } = require("../commands/connect");
const router = require("express").Router();

router.post("/", async (req, res) => {
  const { key } = req.body;
  const channelId = onetimeKeys[key];

  if (!key) {
    return res.status(400).send({ message: "不正な呼び出しです。" });
  } else if (!channelId) {
    return res.status(400).send({ message: "有効な接続キーではありません。" });
  }

  res.send({ id: channelId, message: "接続成功" });
});

module.exports = router;
