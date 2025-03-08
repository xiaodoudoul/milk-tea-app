const express = require("express");
const router = express.Router();
const tencentcloud = require("tencentcloud-sdk-nodejs");

// 导入腾讯云OCR客户端
const OcrClient = tencentcloud.ocr.v20181119.Client;

// 腾讯云API密钥配置
const SECRET_ID = process.env.TENCENT_SECRET_ID;
const SECRET_KEY = process.env.TENCENT_SECRET_KEY;

// 创建OCR客户端实例
const clientConfig = {
  credential: {
    secretId: SECRET_ID,
    secretKey: SECRET_KEY,
  },
  region: "ap-guangzhou", // 地域，可根据实际情况修改
  profile: {
    httpProfile: {
      endpoint: "ocr.tencentcloudapi.com",
    },
  },
};

/**
 * 通用OCR识别
 * POST /api/ocr/general
 */
router.post("/general", async (req, res, next) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "请提供图片的Base64编码" });
    }

    // 创建OCR客户端
    const client = new OcrClient(clientConfig);

    // 调用通用OCR接口
    const params = {
      ImageBase64: imageBase64,
      LanguageType: "auto", // 自动检测语言
    };

    // 发送请求
    const data = await client.GeneralBasicOCR(params);

    res.status(200).json(data);
  } catch (error) {
    console.error("腾讯云OCR识别失败:", error);
    next(error);
  }
});

/**
 * 发票OCR识别
 * POST /api/ocr/receipt
 */
router.post("/receipt", async (req, res, next) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "请提供图片的Base64编码" });
    }

    // 创建OCR客户端
    const client = new OcrClient(clientConfig);

    // 调用发票识别接口
    const params = {
      ImageBase64: imageBase64,
    };

    // 发送请求
    const data = await client.GeneralBasicOCR(params);

    res.status(200).json(data);
  } catch (error) {
    console.error("腾讯云发票OCR识别失败:", error);
    next(error);
  }
});

module.exports = router;
