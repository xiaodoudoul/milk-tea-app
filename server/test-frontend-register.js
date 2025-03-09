const axios = require("axios");

// 测试用户数据
const testUser = {
  username: "frontuser" + Math.floor(Math.random() * 1000),
  password: "password123",
  email: "front@example.com",
};

// 模拟前端注册过程
async function testFrontendRegister() {
  try {
    console.log("尝试注册用户:", testUser.username);

    // 1. 发送注册请求
    console.log("发送注册请求...");
    const registerResponse = await axios.post(
      "http://localhost:9000/api/auth/register",
      testUser,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("注册响应状态码:", registerResponse.status);
    console.log("注册响应数据:", registerResponse.data);

    // 2. 保存用户ID到本地存储（这里只是模拟）
    const userId = registerResponse.data.userId;
    console.log("保存用户ID到本地存储:", userId);

    // 3. 尝试同步本地数据
    console.log("尝试同步本地数据...");
    const syncResponse = await axios
      .post(
        "http://localhost:9000/api/milktea/sync",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${registerResponse.data.token}`,
          },
        }
      )
      .catch((error) => {
        if (error.response) {
          console.log("同步响应状态码:", error.response.status);
          console.log("同步响应数据:", error.response.data);
        } else {
          console.error("同步请求错误:", error.message);
        }
        return { status: "error", data: error.message };
      });

    if (syncResponse.data) {
      console.log("同步响应状态码:", syncResponse.status);
      console.log("同步响应数据:", syncResponse.data);
    }

    return { success: true, data: registerResponse.data };
  } catch (error) {
    if (error.response) {
      // 服务器返回了错误状态码
      console.error("请求失败:", error.response.status);
      console.error("错误数据:", error.response.data);
      return { success: false, error: error.response.data };
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error("没有收到响应");
      return { success: false, error: "服务器没有响应" };
    } else {
      // 设置请求时发生错误
      console.error("请求错误:", error.message);
      return { success: false, error: error.message };
    }
  }
}

// 执行测试
testFrontendRegister().then((result) => {
  console.log("测试完成，结果:", result.success ? "成功" : "失败");
  process.exit(0);
});
