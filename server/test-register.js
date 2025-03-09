// 使用axios替代node-fetch
const axios = require("axios");

// 测试用户数据
const testUser = {
  username: "testuser" + Math.floor(Math.random() * 1000),
  password: "password123",
  email: "test@example.com",
};

// 调用注册API
async function testRegister() {
  try {
    console.log("尝试注册用户:", testUser.username);

    const response = await axios.post(
      "http://localhost:9000/api/auth/register",
      testUser,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("注册成功:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      // 服务器返回了错误状态码
      console.error("注册失败:", error.response.status, error.response.data);
      return { success: false, error: error.response.data };
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error("没有收到响应:", error.request);
      return { success: false, error: "服务器没有响应" };
    } else {
      // 设置请求时发生错误
      console.error("请求错误:", error.message);
      return { success: false, error: error.message };
    }
  }
}

// 执行测试
testRegister().then((result) => {
  console.log("测试完成");
  process.exit(0);
});
