import axios from "axios";

const DEEPSEEK_API_KEY = "xxx";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

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
      prompt = `以上文字由图片识别生成，可能会有错字，请尝试提取出奶茶品牌、奶茶口味、奶茶价格和购买日期。\n\n${text}\n\n请识别这段内容并使用 Markdown 格式输出，包含以下信息：
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

    // 创建响应对象
    const controller = new AbortController();
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullContent = "";
    let buffer = "";

    // 处理流式响应
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 解码二进制数据
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // 处理数据行
      while (buffer.includes("\n")) {
        const lineEnd = buffer.indexOf("\n");
        const line = buffer.slice(0, lineEnd);
        buffer = buffer.slice(lineEnd + 1);

        if (line.startsWith("data: ")) {
          const data = line.slice(6);

          // 检查是否是 [DONE] 标记
          if (data.trim() === "[DONE]") {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            if (
              parsed.choices &&
              parsed.choices[0].delta &&
              parsed.choices[0].delta.content
            ) {
              const content = parsed.choices[0].delta.content;
              fullContent += content;

              // 调用回调函数处理每个数据块
              if (onChunk) {
                onChunk(content, fullContent);
              }
            }
          } catch (e) {
            console.error("解析流数据出错:", e);
          }
        }
      }
    }

    // 返回完整的响应内容
    return {
      choices: [
        {
          message: {
            content: fullContent,
          },
        },
      ],
    };
  } catch (error) {
    console.error("DeepSeek API 请求失败:", error);
    throw error;
  }
};
