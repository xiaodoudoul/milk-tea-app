# DeepSeek API 代理服务

这是一个简单的Node.js后端服务，用于转发调用DeepSeek的API请求，避免在前端暴露API密钥。

## 功能

- 提供API代理，安全地转发请求到DeepSeek API
- 支持DeepSeek聊天完成API
- 错误处理和日志记录

## 安装

1. 进入server目录：
   ```bash
   cd server
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 复制环境变量示例文件并填写你的DeepSeek API密钥：
   ```bash
   cp .env.example .env
   ```
   然后编辑`.env`文件，填入你的实际API密钥。

## 使用方法

### 启动服务器

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务器默认运行在 http://localhost:3001

### API端点

#### 健康检查

```
GET /api/health
```

响应示例：
```json
{
  "status": "ok",
  "message": "DeepSeek API代理服务运行正常"
}
```

#### 聊天完成

```
POST /api/deepseek/chat
```

请求体示例：
```json
{
  "messages": [
    {"role": "system", "content": "你是一个有用的助手。"},
    {"role": "user", "content": "你好，请介绍一下自己。"}
  ],
  "model": "deepseek-chat",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

响应将直接转发DeepSeek API的响应。

## 前端集成示例

```javascript
async function callDeepSeekAPI(messages) {
  try {
    const response = await fetch('http://localhost:3001/api/deepseek/chat', {
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