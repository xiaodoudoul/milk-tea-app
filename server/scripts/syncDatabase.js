require("dotenv").config();
const {
  uploadDatabaseToCOS,
  downloadDatabaseFromCOS,
} = require("../services/cosService");

const command = process.argv[2];

async function main() {
  try {
    if (command === "upload") {
      console.log("手动上传数据库到 COS...");
      await uploadDatabaseToCOS();
    } else if (command === "download") {
      console.log("手动从 COS 下载数据库...");
      await downloadDatabaseFromCOS();
    } else {
      console.log("用法: node syncDatabase.js [upload|download]");
      console.log("  upload   - 上传本地数据库到 COS");
      console.log("  download - 从 COS 下载数据库到本地");
    }
  } catch (error) {
    console.error("同步操作失败:", error);
  }

  process.exit(0);
}

main();
