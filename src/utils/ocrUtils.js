import Tesseract from "tesseract.js";

/**
 * 使用Tesseract.js从图像中提取文本
 * @param {File} imageFile - 要识别的图像文件
 * @returns {Promise<string>} - 返回识别出的文本
 */
export const extractTextFromImage = async (imageFile) => {
  try {
    const result = await Tesseract.recognize(
      imageFile,
      "chi_sim+eng", // 中文简体和英文
      {
        logger: (m) => console.log(m),
      }
    );

    return result.data.text;
  } catch (error) {
    console.error("OCR识别失败:", error);
    throw error;
  }
};
