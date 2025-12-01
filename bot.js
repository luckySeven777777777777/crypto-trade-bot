const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// 🚀 静态文件服务
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

// Telegram 配置
const TOKEN = "8423870040:AAEyKQukt720qD7qHZ9YrIS9m_x-E65coPU";
const CHAT_ID = 6062973135;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// Webhook 接收
app.post("/webhook", async (req, res) => {
    const data = req.body;
    if (data.callback_query) {
        const callback = data.callback_query;
        const chatId = callback.message.chat.id;
        const messageId = callback.message.message_id;

        if(callback.data === "trade_success") {
            await axios.post(`${TELEGRAM_API}/editMessageReplyMarkup`, {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: { inline_keyboard: [] }
            });
            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: chatId,
                text: "✅ 交易已成功！"
            });
        }

        if(callback.data === "trade_cancel") {
            await axios.post(`${TELEGRAM_API}/editMessageReplyMarkup`, {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: { inline_keyboard: [] }
            });
            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: chatId,
                text: "❌ 交易已取消！"
            });
        }
    }
    res.sendStatus(200);
});

// 默认路由，访问 / 自动跳转到 index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 启动服务
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
