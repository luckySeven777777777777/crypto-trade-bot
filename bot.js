const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public")); // 前端 HTML

const PORT = process.env.PORT || 3000; // Railway 会自动分配端口

const TOKEN = "8423870040:AAEyKQukt720qD7qHZ9YrIS9m_x-E65coPU";
const CHAT_ID = 6062973135;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// Telegram Webhook 接收
app.post("/webhook", async (req, res) => {
    const data = req.body;
    if (data.callback_query) {
        const callback = data.callback_query;
        const chatId = callback.message.chat.id;
        const messageId = callback.message.message_id;

        if (callback.data === "trade_success") {
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

        if (callback.data === "trade_cancel") {
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

// 启动服务
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
