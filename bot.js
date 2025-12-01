const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// 🚀 提供 public 文件夹里的静态文件
app.use(express.static(path.join(__dirname, "public")));

// Telegram 配置
const TOKEN = "8423870040:AAEyKQukt720qD7qHZ9YrIS9m_x-E65coPU";
const CHAT_ID = 6062973135;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// -----------------------------
// Telegram Webhook 接收
// -----------------------------
app.post("/webhook", async (req, res) => {
  const data = req.body;

  // 按钮点击回调处理
  if (data.callback_query) {
    const callback = data.callback_query;
    const chatId = callback.message.chat.id;
    const messageId = callback.message.message_id;

    try {
      // 清空按钮，防止重复点击
      await axios.post(`${TELEGRAM_API}/editMessageReplyMarkup`, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: [] }
      });

      // 根据按钮发送反馈
      const text = callback.data === "trade_success"
        ? "✅ 交易已成功！"
        : "❌ 交易已取消！";

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: text
      });

    } catch (err) {
      console.error("Error handling callback_query:", err.message);
    }
  }

  res.sendStatus(200);
});

// -----------------------------
// 默认路由，访问 / 返回 index.html
// -----------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -----------------------------
// 启动服务
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
