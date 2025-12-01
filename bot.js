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

    if (data.callback_query) {
      const callback = data.callback_query;
      const chatId = callback.message.chat.id;
      const messageId = callback.message.message_id;
      const user = callback.from.username || callback.from.first_name || "Unknown";
      const now = new Date().toLocaleString();

      // 回复按钮点击
      await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
        callback_query_id: callback.id,
        text: "操作已处理",
        show_alert: false
      });

      // 清空按钮，保证只能点击一次
      await axios.post(`${TELEGRAM_API}/editMessageReplyMarkup`, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: [] }
      });

      // 根据按钮类型发送反馈消息
      const text = callback.data === "trade_success"
        ? `✅ 交易成功！\n操作人: ${user}\n时间: ${now}`
        : `❌ 交易取消！\n操作人: ${user}\n时间: ${now}`;

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: text
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.message);
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
