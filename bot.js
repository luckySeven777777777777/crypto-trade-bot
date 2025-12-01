import express from "express";

const app = express();
app.use(express.json());

// --- Webhook 诊断路由 ---
app.post("/webhook", (req, res) => {
  console.log(">>> Received Webhook POST");
  console.log(req.body); // 打印 Telegram 发送的内容
  res.status(200).send("OK"); // 必须返回 200，否则 Telegram 报错
});

// --- 根路径用于测试网页是否正常 ---
app.get("/", (req, res) => {
  res.send("Webhook test server running");
});

// --- Railway 端口监听 ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`TEST SERVER RUNNING ON PORT ${PORT}`);
});
