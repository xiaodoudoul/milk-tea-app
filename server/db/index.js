const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");

// 创建数据库文件路径
const dbPath = path.join(__dirname, "db.json");
const adapter = new FileSync(dbPath);
const db = low(adapter);

// 设置默认数据结构
db.defaults({
  milkTeas: [],
  users: [],
}).write();

module.exports = db;
