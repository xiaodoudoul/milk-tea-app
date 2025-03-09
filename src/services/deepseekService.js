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

    // 创建响应对象
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
    const content = data.choices[0].message.content;

    // 由于后端不支持流式响应，我们模拟流式效果
    if (onChunk) {
      const chunkSize = 10;
      for (let i = 0; i < content.length; i += chunkSize) {
        const chunk = content.slice(i, i + chunkSize);
        onChunk(chunk, content.slice(0, i + chunkSize));
        await new Promise((resolve) => setTimeout(resolve, 50)); // 添加50ms延迟
      }
    }

    return {
      choices: [
        {
          message: {
            content,
          },
        },
      ],
    };
  } catch (error) {
    console.error("DeepSeek API 请求失败:", error);
    throw error;
  }
};
