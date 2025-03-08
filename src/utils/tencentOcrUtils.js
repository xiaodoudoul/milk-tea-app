/**
 * 将图片文件转换为Base64编码
 * @param {File} file - 图片文件
 * @returns {Promise<string>} - Base64编码的图片
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // 移除Base64前缀（如data:image/jpeg;base64,）
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * 使用腾讯云OCR从图像中提取文本（通过后端代理）
 * @param {File} imageFile - 要识别的图像文件
 * @returns {Promise<string>} - 返回识别出的文本
 */
export const extractTextFromImage = async (imageFile) => {
  try {
    // 将图片转换为Base64
    const imageBase64 = await fileToBase64(imageFile);

    // 调用后端代理服务
    const response = await fetch("https://tuanzi.voderl.cn/api/ocr/general", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 提取识别结果
    let text = "";
    if (data && data.TextDetections) {
      text = data.TextDetections.map((item) => item.DetectedText).join("\n");
    }

    return text;
  } catch (error) {
    console.error("腾讯云OCR识别失败:", error);
    throw error;
  }
};

/**
 * 使用腾讯云OCR从图像中提取发票信息（通过后端代理）
 * @param {File} imageFile - 要识别的发票图像文件
 * @returns {Promise<Object>} - 返回识别出的发票信息
 */
export const extractReceiptInfo = async (imageFile) => {
  try {
    // 将图片转换为Base64
    const imageBase64 = await fileToBase64(imageFile);

    // 调用后端代理服务
    const response = await fetch("https://tuanzi.voderl.cn/api/ocr/receipt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("腾讯云发票OCR识别失败:", error);
    throw error;
  }
};
