/**
 * 开发服务器启动脚本
 * 用于同时启动前端和后端服务器
 */
const { spawn } = require("child_process");
const path = require("path");

// 颜色代码
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// 启动前端服务器
const startFrontend = () => {
  console.log(
    `${colors.bright}${colors.green}启动前端服务器...${colors.reset}`
  );

  const frontend = spawn("npm", ["start"], {
    stdio: "pipe",
    shell: true,
  });

  frontend.stdout.on("data", (data) => {
    console.log(
      `${colors.green}[前端] ${colors.reset}${data.toString().trim()}`
    );
  });

  frontend.stderr.on("data", (data) => {
    console.error(
      `${colors.red}[前端错误] ${colors.reset}${data.toString().trim()}`
    );
  });

  frontend.on("close", (code) => {
    console.log(
      `${colors.yellow}前端服务器已退出，退出码: ${code}${colors.reset}`
    );
  });

  return frontend;
};

// 启动后端服务器
const startBackend = () => {
  console.log(`${colors.bright}${colors.blue}启动后端服务器...${colors.reset}`);

  const backend = spawn("npm", ["start"], {
    stdio: "pipe",
    shell: true,
    cwd: path.join(__dirname, "server"),
  });

  backend.stdout.on("data", (data) => {
    console.log(
      `${colors.blue}[后端] ${colors.reset}${data.toString().trim()}`
    );
  });

  backend.stderr.on("data", (data) => {
    console.error(
      `${colors.red}[后端错误] ${colors.reset}${data.toString().trim()}`
    );
  });

  backend.on("close", (code) => {
    console.log(
      `${colors.yellow}后端服务器已退出，退出码: ${code}${colors.reset}`
    );
  });

  return backend;
};

// 处理进程退出
const handleExit = (frontend, backend) => {
  process.on("SIGINT", () => {
    console.log(`${colors.yellow}正在关闭服务器...${colors.reset}`);

    if (frontend) {
      frontend.kill("SIGINT");
    }

    if (backend) {
      backend.kill("SIGINT");
    }

    process.exit(0);
  });
};

// 主函数
const main = () => {
  console.log(
    `${colors.bright}${colors.magenta}===== 奶茶消费记录应用开发服务器 =====${colors.reset}`
  );

  const backend = startBackend();

  // 等待后端启动后再启动前端
  setTimeout(() => {
    const frontend = startFrontend();
    handleExit(frontend, backend);
  }, 2000);
};

// 启动服务器
main();
