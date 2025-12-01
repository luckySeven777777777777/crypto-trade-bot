// server.js
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());

// 静态网页
app.use(express.static(path.join(__dirname, "public")));

// 环境变量
const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// Webhook
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    // 按钮点击
    if (data.callback_query) {
      const callback = data.callback_query;
      const chatId = callback.message.chat.id;
      const messageId = callback.message.message_id;
      const user = callback.from.username || callback.from.first_name;
      const now = new Date().toLocaleString();

      // 回复用户点击按钮立即返回 200
      res.sendStatus(200);

      // 清空按钮
      await axios.post(`${TELEGRAM_API}/editMessageReplyMarkup`, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: [] }
      });

      // 发送确认消息
      const text = callback.data === "trade_success"
        ? `✅ 交易已成功！\n操作人: @${user}\n时间: ${now}`
        : `❌ 交易已取消！\n操作人: @${user}\n时间: ${now}`;

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text
      });

      return;
    }

    // 普通消息直接返回 200
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// 默认返回 index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
