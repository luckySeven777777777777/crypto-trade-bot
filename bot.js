import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Telegram 配置
const TOKEN = "8423870040:AAEyKQukt720qD7qHZ9YrIS9m_x-E65coPU";
const CHAT_ID = 6062973135;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// Webhook 接收
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;
    console.log("Webhook received:", JSON.stringify(data, null, 2));

    // 处理按钮点击
    if (data.callback_query) {
      const callback = data.callback_query;
      const chatId = callback.message.chat.id;
      const messageId = callback.message.message_id;
      const username = callback.from.username || callback.from.first_name || "Unknown";
      const now = new Date().toLocaleString();

      // 回复 Telegram，让按钮点击显示已处理
      await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
        callback_query_id: callback.id,
        text: "操作已记录",
        show_alert: false
      });

      // 清空按钮
      await axios.post(`${TELEGRAM_API}/editMessageReplyMarkup`, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: [] }
      });

      // 发送新的确认消息，显示操作人和时间
      const text = callback.data === "trade_success"
        ? `✅ 交易已成功！\n操作人: ${username}\n时间: ${now}`
        : `❌ 交易已取消！\n操作人: ${username}\n时间: ${now}`;

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Error in webhook:", err.message);
    res.sendStatus(500);
  }
});

// 默认路由返回 index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));