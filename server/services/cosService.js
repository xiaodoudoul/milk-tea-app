const COS = require("cos-nodejs-sdk-v5");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
require("dotenv").config();

// 数据库文件路径
const DB_FILE_PATH = path.join(__dirname, "../data/milktea.sqlite");
// 备份文件路径
const BACKUP_FILE_PATH = path.join(__dirname, "../data/milktea.sqlite.bak");

// COS 配置
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

// COS 存储桶配置
const Bucket = process.env.COS_BUCKET;
const Region = process.env.COS_REGION;
const Key = "/milktea.sqlite"; // COS 中的文件路径

// 将 fs 的异步方法转换为 Promise
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);

// 上传节流控制
let uploadTimeout = null;
const UPLOAD_THROTTLE = 5 * 60 * 1000; // 5分钟

/**
 * 确保数据目录存在
 */
async function ensureDataDirExists() {
  const dataDir = path.join(__dirname, "../data");
  try {
    await access(dataDir);
  } catch (error) {
    await mkdir(dataDir, { recursive: true });
    console.log("创建数据目录:", dataDir);
  }
}

/**
 * 从 COS 下载数据库文件
 */
async function downloadDatabaseFromCOS() {
  try {
    await ensureDataDirExists();

    console.log("正在从 COS 下载数据库文件...");

    // 检查 COS 上是否存在数据库文件
    try {
      await cos.headObject({
        Bucket,
        Region,
        Key,
      });
    } catch (error) {
      if (error.statusCode === 404) {
        console.log("COS 上不存在数据库文件，将使用本地数据库");
        return false;
      }
      throw error;
    }

    // 如果本地已有数据库文件，先备份
    try {
      await access(DB_FILE_PATH, fs.constants.F_OK);
      await copyFile(DB_FILE_PATH, BACKUP_FILE_PATH);
      console.log("已备份本地数据库文件");
    } catch (error) {
      console.log("本地无数据库文件，将创建新文件");
    }

    // 下载文件
    const result = await cos.getObject({
      Bucket,
      Region,
      Key,
      Output: fs.createWriteStream(DB_FILE_PATH),
    });

    console.log("数据库文件下载成功");
    return true;
  } catch (error) {
    console.error("下载数据库文件失败:", error);

    // 如果下载失败但有备份，恢复备份
    try {
      await access(BACKUP_FILE_PATH, fs.constants.F_OK);
      await copyFile(BACKUP_FILE_PATH, DB_FILE_PATH);
      console.log("已恢复本地数据库备份");
    } catch (backupError) {
      console.error("无法恢复备份:", backupError);
    }

    return false;
  }
}

/**
 * 上传数据库文件到 COS
 */
async function uploadDatabaseToCOS() {
  try {
    console.log("正在上传数据库文件到 COS...");

    // 检查数据库文件是否存在
    await access(DB_FILE_PATH, fs.constants.F_OK);

    // 上传文件
    await cos.putObject({
      Bucket,
      Region,
      Key,
      Body: fs.createReadStream(DB_FILE_PATH),
    });

    console.log("数据库文件上传成功");
    return true;
  } catch (error) {
    console.error("上传数据库文件失败:", error);
    return false;
  }
}

/**
 * 节流上传函数，防止频繁上传
 */
function throttledUpload() {
  if (uploadTimeout) {
    clearTimeout(uploadTimeout);
  }

  uploadTimeout = setTimeout(async () => {
    await uploadDatabaseToCOS();
    uploadTimeout = null;
  }, UPLOAD_THROTTLE);
}

/**
 * 监听数据库文件变化
 */
function watchDatabaseFile() {
  try {
    // 确保文件存在
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, "");
    }

    // 监听文件变化
    fs.watch(DB_FILE_PATH, (eventType) => {
      if (eventType === "change") {
        console.log("检测到数据库文件变化，计划上传...");
        throttledUpload();
      }
    });

    console.log("已开始监听数据库文件变化");
  } catch (error) {
    console.error("监听数据库文件失败:", error);
  }
}

/**
 * 初始化 COS 同步服务
 */
async function initCOSSync() {
  try {
    // 验证 COS 配置
    if (
      !process.env.COS_SECRET_ID ||
      !process.env.COS_SECRET_KEY ||
      !process.env.COS_BUCKET ||
      !process.env.COS_REGION
    ) {
      console.warn("COS 配置不完整，跳过 COS 同步");
      return false;
    }

    // 下载远程数据库
    await downloadDatabaseFromCOS();

    // 开始监听文件变化
    watchDatabaseFile();

    return true;
  } catch (error) {
    console.error("初始化 COS 同步失败:", error);
    return false;
  }
}

module.exports = {
  initCOSSync,
  uploadDatabaseToCOS,
  downloadDatabaseFromCOS,
  throttledUpload,
};
