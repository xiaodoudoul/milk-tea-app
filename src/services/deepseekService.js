// 导入环境配置
import config from "../config/env";

// 后端API配置
const API_BASE_URL = `${config.api.baseUrl}/deepseek`;

/**
 * 发送文本到DeepSeek API进行奶茶信息识别（流式返回）
 * @param {string} text - 要识别的文本内容
 * @param {function} onChunk - 处理每个数据块的回调函数
 * @returns {Promise<Object>} - 返回完整的识别结果
 */
export const recognizeMilkTeaInfo = async (text, onChunk) => {
  try {
    // 检查是否是热量查询请求
    const isCaloriesQuery =
      text.includes("推断奶茶营养") ||
      text.includes("热量") ||
      text.includes("含糖量") ||
      text.includes("咖啡因");

    let prompt;
    if (isCaloriesQuery) {
      prompt = `${text}\n\n请根据奶茶品牌和口味，尽可能准确地估算该奶茶的营养成分，包括：
1. 热量（大卡）
2. 含糖量（克）
3. 咖啡因含量（毫克）
4. 脂肪含量（克）
5. 是否适合减肥人士饮用

请以 Markdown 表格形式呈现营养成分，并给出一段简短的健康建议。使用 Markdown 格式的二级标题、表格和列表等元素使内容更加美观。`;
    } else {
      prompt = `以下文字由图片识别生成，可能会有错字，请尝试纠正并提取出奶茶品牌、奶茶口味、奶茶价格和购买日期，请根据奶茶品牌直接纠正奶茶口味。\n\n${text}\n\n请识别这段内容并使用 Markdown 格式输出，包含以下信息：
- 奶茶品牌
- 奶茶口味
- 奶茶价格
- 奶茶日期

请使用以下 Markdown 格式：

## 奶茶信息

**奶茶品牌**：xxx
**奶茶口味**：xxx
**奶茶价格**：xx元
**奶茶日期**：xx年xx月xx日`;
    }

    // 如果需要流式响应
    if (onChunk) {
      // 创建防抖动的安全回调
      const safeCallback = (() => {
        let lastContent = "";
        let lastCallTime = 0;
        const THROTTLE_MS = 50; // 节流阈值
        let pendingCallbacks = 0;

        return (delta, fullContent) => {
          const now = Date.now();
          // 内容没有变化时跳过
          if (fullContent === lastContent) return;

          // 节流控制
          if (now - lastCallTime < THROTTLE_MS) return;

          // 限制并发回调数量
          if (pendingCallbacks > 10) {
            console.warn("回调队列过长，丢弃当前更新");
            return;
          }

          lastContent = fullContent;
          lastCallTime = now;
          pendingCallbacks++;

          // 使用setTimeout打破调用堆栈
          setTimeout(() => {
            try {
              onChunk(delta, fullContent);
            } catch (err) {
              console.error("回调处理错误:", err);
            } finally {
              pendingCallbacks--;
            }
          }, 0);
        };
      })();

      // 创建响应对象
      const controller = new AbortController();
      console.log("使用真实流式API获取响应...");

      try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            model: "deepseek-chat",
            temperature: 0.7,
            max_tokens: 800,
            stream: true, // 启用流式响应
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 处理SSE流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let accumulatedContent = ""; // 累积的完整内容
        let finalResponse = null;

        try {
          // 处理数据流
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log("数据流结束");
              break;
            }

            // 解码数据块
            const chunkText = decoder.decode(value, { stream: true });
            buffer += chunkText;

            // 处理完整的SSE消息
            const messages = buffer.split("\n\n");
            buffer = messages.pop() || ""; // 保留最后一个不完整的消息

            for (const message of messages) {
              if (message.startsWith("data: ")) {
                const data = message.substring(6);

                // 处理特殊消息
                if (data.includes('"type":"start"')) {
                  console.log("流式响应开始");
                  continue;
                }
                if (data.includes('"type":"end"')) {
                  console.log("流式响应结束");
                  continue;
                }
                if (data === "[DONE]") {
                  console.log("接收到完成标记");
                  continue;
                }

                try {
                  // 解析JSON数据
                  const jsonData = JSON.parse(data);

                  // 提取内容块
                  if (jsonData.choices && jsonData.choices[0]) {
                    let contentDelta = "";

                    if (jsonData.choices[0].delta) {
                      // OpenAI流式格式
                      contentDelta = jsonData.choices[0].delta.content || "";
                    } else if (jsonData.choices[0].message) {
                      // 完整响应格式
                      contentDelta = jsonData.choices[0].message.content || "";
                    }

                    if (contentDelta) {
                      accumulatedContent += contentDelta;
                      safeCallback(contentDelta, accumulatedContent);
                    }

                    // 检查是否有finish_reason表示结束
                    if (jsonData.choices[0].finish_reason) {
                      finalResponse = {
                        choices: [
                          {
                            message: {
                              content: accumulatedContent,
                            },
                            finish_reason: jsonData.choices[0].finish_reason,
                          },
                        ],
                      };
                    }
                  }
                } catch (e) {
                  console.warn("解析SSE数据失败:", e);
                }
              }
            }
          }
        } catch (streamError) {
          console.error("流式处理错误:", streamError);
          throw streamError;
        }

        // 构建最终响应
        if (!finalResponse && accumulatedContent) {
          finalResponse = {
            choices: [
              {
                message: {
                  content: accumulatedContent,
                },
                finish_reason: "length",
              },
            ],
          };
        }

        console.log("流式响应完成, 内容长度:", accumulatedContent.length);
        return finalResponse;
      } catch (error) {
        console.error("流式请求失败:", error);
        throw error;
      }
    } else {
      // 非流式响应
      console.log("使用标准API获取响应...");
      const controller = new AbortController();
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          model: "deepseek-chat",
          temperature: 0.7,
          max_tokens: 800,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        choices: [
          {
            message: {
              content: data.choices[0].message.content,
            },
          },
        ],
      };
    }
  } catch (error) {
    console.error("DeepSeek API 请求失败:", error);
    throw error;
  }
};
