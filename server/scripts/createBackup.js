const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const dateFns = require("date-fns");

/**
 * 创建服务器文件夹的备份压缩包
 * @param {string} outputPath - 输出路径，默认为上级目录
 * @param {string} archiveFormat - 压缩格式，支持 'zip' 或 'tar'
 * @returns {Promise<string>} - 返回创建的压缩包路径
 */
async function createServerBackup(outputPath = "../", archiveFormat = "zip") {
  return new Promise((resolve, reject) => {
    try {
      // 确保输出目录存在
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      // 生成带时间戳的文件名
      const timestamp = dateFns.format(new Date(), "yyyyMMdd_HHmmss");
      const outputFilename = `server_backup_${timestamp}.${archiveFormat}`;
      const outputFilePath = path.join(outputPath, outputFilename);

      // 创建文件流
      const output = fs.createWriteStream(outputFilePath);
      const archive = archiver(archiveFormat, {
        zlib: { level: 9 }, // 最高压缩级别
      });

      // 监听错误事件
      archive.on("error", (err) => {
        reject(err);
      });

      // 监听关闭事件
      output.on("close", () => {
        const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
        console.log(`备份完成: ${outputFilePath}`);
        console.log(`压缩包大小: ${sizeInMB} MB`);
        resolve(outputFilePath);
      });

      // 将输出流连接到归档
      archive.pipe(output);

      // 获取服务器根目录
      const serverRoot = path.resolve(__dirname, "..");

      // 添加文件和目录，排除 node_modules
      const excludeDirs = ["node_modules", ".git"];

      // 递归添加文件和目录
      function addDirectory(dirPath, archivePath) {
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
          const fullPath = path.join(dirPath, file);
          const relativePath = path.relative(serverRoot, fullPath);
          const stats = fs.statSync(fullPath);

          // 跳过排除的目录
          if (stats.isDirectory() && excludeDirs.includes(file)) {
            continue;
          }

          if (stats.isDirectory()) {
            // 递归添加子目录
            addDirectory(fullPath, path.join(archivePath, file));
          } else {
            // 添加文件
            archive.file(fullPath, { name: path.join(archivePath, file) });
          }
        }
      }

      // 开始添加文件
      addDirectory(serverRoot, "");

      // 完成归档
      archive.finalize();
    } catch (error) {
      reject(error);
    }
  });
}

// 如果直接运行脚本，则执行备份
if (require.main === module) {
  // 获取命令行参数
  const args = process.argv.slice(2);
  const outputPath = args[0] || "../backups";
  const archiveFormat = args[1] || "zip";

  console.log(`开始备份服务器文件夹...`);
  console.log(`输出路径: ${path.resolve(outputPath)}`);
  console.log(`压缩格式: ${archiveFormat}`);

  createServerBackup(outputPath, archiveFormat)
    .then((filePath) => {
      console.log(`备份成功: ${filePath}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`备份失败: ${error.message}`);
      process.exit(1);
    });
} else {
  // 作为模块导出
  module.exports = createServerBackup;
}
