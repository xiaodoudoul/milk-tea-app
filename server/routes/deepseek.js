const express = require("express");
const axios = require("axios");
const router = express.Router();

/**
 * 聊天完成API
 * POST /api/deepseek/chat
 */
router.post("/chat", async (req, res, next) => {
  try {
    const { messages, model, temperature, max_tokens } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "请提供有效的消息数组" });
    }

    const apiUrl = `${process.env.DEEPSEEK_API_URL}/chat/completions`;
    console.log("Calling DeepSeek API:", apiUrl);

    const response = await axios.post(
      apiUrl,
      {
        model: model || "deepseek-chat",
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("完整错误信息:", {
      message: error.message,
      config: error.config,
      response: error.response?.data,
      env: {
        apiUrl: process.env.DEEPSEEK_API_URL,
        hasApiKey: !!process.env.DEEPSEEK_API_KEY,
      },
    });
    next(error);
  }
});

/**
 * 文本嵌入API
 * POST /api/deepseek/embeddings
 */
router.post("/embeddings", async (req, res, next) => {
  try {
    const { input, model } = req.body;

    if (!input) {
      return res.status(400).json({ error: "请提供有效的输入文本" });
    }

    const response = await axios.post(
      `${process.env.DEEPSEEK_API_URL}/embeddings`,
      {
        model: model || "deepseek-embedding",
        input,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
