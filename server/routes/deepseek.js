const express = require("express");
const { OpenAI } = require("openai");
const router = express.Router();

// 初始化OpenAI客户端，配置为使用DeepSeek API
const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_API_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// 流式响应进度跟踪函数
const logStreamProgress = () => {
  let chunkCount = 0;
  let tokenCount = 0;
  let startTime = Date.now();

  return {
    onChunk: (chunk) => {
      chunkCount++;
      // 估算token数量 (仅供参考)
      if (chunk.choices && chunk.choices[0]?.delta?.content) {
        tokenCount += Math.ceil(chunk.choices[0].delta.content.length / 4);
      }

      // 每10个块记录一次
      if (chunkCount % 10 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        console.log(
          `流式响应进度: ${chunkCount} 块, ~${tokenCount} tokens, 耗时 ${elapsed.toFixed(
            2
          )}s`
        );
      }
    },

    getStats: () => {
      const elapsed = (Date.now() - startTime) / 1000;
      console.log(
        `流式响应完成: 共 ${chunkCount} 块, ~${tokenCount} tokens, 总耗时 ${elapsed.toFixed(
          2
        )}s`
      );
      return { chunks: chunkCount, tokens: tokenCount, time: elapsed };
    },
  };
};

// 安全地写入SSE数据
const writeSSE = (res, data) => {
  try {
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    res.write(`data: ${payload}\n\n`);
    if (typeof res.flush === "function") {
      res.flush();
    }
    return true;
  } catch (err) {
    console.error("SSE写入错误:", err);
    return false;
  }
};

/**
 * 聊天完成API
 * POST /api/deepseek/chat
 */
router.post("/chat", async (req, res, next) => {
  try {
    const { messages, model, temperature, max_tokens, stream } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "请提供有效的消息数组" });
    }

    // 检查是否请求流式响应
    if (stream) {
      console.log("使用OpenAI SDK发起流式请求");

      // 设置SSE响应头
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      const progress = logStreamProgress();

      // 发送开始事件
      writeSSE(res, { type: "start", timestamp: Date.now() });

      try {
        // 创建流式请求
        const streamResponse = await openai.chat.completions.create({
          model: model || "deepseek-chat",
          messages,
          temperature: temperature || 0.7,
          max_tokens: max_tokens || 1000,
          stream: true,
        });

        // 处理流式数据
        for await (const chunk of streamResponse) {
          progress.onChunk(chunk);
          writeSSE(res, chunk);
        }

        // 发送完成事件
        const stats = progress.getStats();
        writeSSE(res, { type: "end", stats });
        writeSSE(res, "[DONE]");
        res.end();
      } catch (error) {
        console.error("流式处理错误:", error);
        writeSSE(res, { error: error.message });
        res.end();
      }
    } else {
      console.log("Calling DeepSeek API using OpenAI SDK");

      // 使用OpenAI SDK调用DeepSeek API
      const completion = await openai.chat.completions.create({
        model: model || "deepseek-chat",
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1000,
      });

      res.status(200).json(completion);
    }
  } catch (error) {
    console.error("完整错误信息:", {
      message: error.message,
      stack: error.stack,
      env: {
        hasApiKey: !!process.env.DEEPSEEK_API_KEY,
      },
    });

    // 确保响应正确结束
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else if (!res.finished) {
      res.end();
    }
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

    console.log("调用嵌入API(使用OpenAI SDK)");

    // 使用OpenAI SDK调用DeepSeek嵌入API
    const embedding = await openai.embeddings.create({
      model: model || "deepseek-embedding",
      input,
    });

    res.status(200).json(embedding);
  } catch (error) {
    console.error("嵌入API调用失败:", error);
    next(error);
  }
});

module.exports = router;
