# 奶茶消费记录后端服务

这是一个用于管理奶茶消费记录的后端服务，支持用户注册、登录、记录管理等功能。

## 功能特性

- 用户认证（注册、登录）
- 奶茶消费记录的增删改查
- 腾讯云 OCR 图像识别
- DeepSeek API 集成
- 数据库自动同步到腾讯云 COS
- 服务器文件备份功能

## 数据库同步功能

本服务使用 SQLite 作为本地数据库，并支持将数据库文件自动同步到腾讯云 COS 对象存储。

### 同步机制

- **启动时同步**：服务启动时会自动从 COS 下载最新的数据库文件
- **自动上传**：当数据库发生变更时，会在 5 分钟内自动上传到 COS
- **节流控制**：5 分钟内的多次变更只会触发一次上传，避免频繁请求

### 配置说明

在 `.env` 文件中配置以下参数：

```
# 腾讯云 COS 配置
COS_SECRET_ID=your_cos_secret_id
COS_SECRET_KEY=your_cos_secret_key
COS_BUCKET=your-bucket-name
COS_REGION=ap-guangzhou
```

### 手动同步命令

```bash
# 手动上传数据库到 COS
npm run db:upload

# 手动从 COS 下载数据库
npm run db:download
```

## 服务器备份功能

本服务提供了将整个服务器文件夹打包成压缩文件的功能，方便备份和迁移。备份不包含 `node_modules` 目录。

### 创建备份

```bash
# 创建备份，默认保存到上级目录的 backups 文件夹
npm run backup

# 指定输出路径
npm run backup -- /path/to/backup/folder

# 指定输出路径和格式（支持 zip 或 tar）
npm run backup -- /path/to/backup/folder tar
```

### 备份文件命名

备份文件会自动添加时间戳，格式为：`server_backup_YYYYMMDD_HHMMSS.zip`

### 特殊处理

备份过程中会自动进行以下处理：

1. **排除目录**：`node_modules` 和 `.git` 目录会被排除，减小备份文件大小

## 安装与运行

1. 安装依赖：
   ```bash
   npm install
   ```

2. 配置环境变量：
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入必要的配置信息
   ```

3. 启动服务：
   ```bash
   npm start
   ```

4. 开发模式：
   ```bash
   npm run dev
   ```

## API 接口

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 奶茶记录

- `GET /api/milktea` - 获取奶茶记录列表
- `POST /api/milktea` - 创建新的奶茶记录
- `GET /api/milktea/:id` - 获取单个奶茶记录
- `PUT /api/milktea/:id` - 更新奶茶记录
- `DELETE /api/milktea/:id` - 删除奶茶记录

### OCR 识别

- `POST /api/ocr/recognize` - 识别图片中的文字

### DeepSeek API

- `POST /api/deepseek/chat` - 调用 DeepSeek 聊天 API

## 前端集成示例

```javascript
async function callDeepSeekAPI(messages) {
  try {
    const response = await fetch('http://localhost:9000/api/deepseek/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: 'deepseek-chat',
        temperature: 0.7,
        max_tokens: 1000
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw error;
  }
}
``` 