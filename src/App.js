import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Fab,
  Zoom,
  Button,
} from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import ChatInterface from "./components/ChatInterface";
import InputArea from "./components/InputArea";
import TeaCalendar from "./components/TeaCalendar";
import { extractTextFromImage } from "./utils/ocrUtils";
import { recognizeMilkTeaInfo } from "./services/deepseekService";
import dayjs from "dayjs";
import "./App.css";

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: "#8e44ad", // 紫色，奶茶主题色
      light: "#a569bd",
    },
    secondary: {
      main: "#f39c12", // 橙色，奶茶辅助色
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

function App() {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [teaRecords, setTeaRecords] = useState([]);
  const [lastTeaInfo, setLastTeaInfo] = useState(null);
  const [showCaloriesButton, setShowCaloriesButton] = useState(false);

  // 使用 useEffect 监听 lastTeaInfo 的变化
  useEffect(() => {
    if (lastTeaInfo) {
      console.log("lastTeaInfo 更新:", lastTeaInfo);
      setShowCaloriesButton(true);
    } else {
      setShowCaloriesButton(false);
    }
  }, [lastTeaInfo]);

  // 解析识别结果并添加到记录中
  const parseAndAddRecord = (text) => {
    console.log("开始解析奶茶信息:", text);

    // 使用适用于 Markdown 格式的正则表达式
    const brandMatch =
      text.match(/\*\*奶茶品牌\*\*[：:]\s*(.+?)(?:\n|$)/m) ||
      text.match(/奶茶品牌[：:]\s*(.+?)(?:\n|$)/m);
    const flavorMatch =
      text.match(/\*\*奶茶口味\*\*[：:]\s*(.+?)(?:\n|$)/m) ||
      text.match(/奶茶口味[：:]\s*(.+?)(?:\n|$)/m);
    const priceMatch =
      text.match(/\*\*奶茶价格\*\*[：:]\s*(.+?)元/m) ||
      text.match(/奶茶价格[：:]\s*(.+?)元/m);
    const dateMatch =
      text.match(/\*\*奶茶日期\*\*[：:]\s*(.+?)(?:\n|$)/m) ||
      text.match(/奶茶日期[：:]\s*(.+?)(?:\n|$)/m);

    const brand = brandMatch ? brandMatch[1].trim() : null;
    const flavor = flavorMatch ? flavorMatch[1].trim() : null;
    const price = priceMatch ? priceMatch[1].trim() : null;
    const date = dateMatch ? dateMatch[1].trim() : null;

    console.log("解析结果:", { brand, flavor, price, date });

    if (brand && flavor && price) {
      const record = {
        brand,
        flavor,
        price,
        date: date
          ? dayjs(date, "YYYY年MM月DD日").format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
      };

      console.log("添加奶茶记录:", record);
      setTeaRecords((prev) => [...prev, record]);

      // 保存最后一次的奶茶信息，用于热量查询
      console.log("设置最后一次奶茶信息");
      setLastTeaInfo({ brand, flavor, price });
    } else {
      console.log("未能成功解析奶茶信息");
    }
  };

  // 查询奶茶热量信息
  const handleCaloriesQuery = async () => {
    if (!lastTeaInfo) return;

    try {
      setIsProcessing(true);

      // 构建查询文本
      const queryText = `请根据以下奶茶信息推断奶茶营养，包括热量、含糖量、咖啡因含量：
品牌：${lastTeaInfo.brand}
口味：${lastTeaInfo.flavor}
价格：${lastTeaInfo.price}元`;

      // 添加用户消息到聊天
      const userMessage = { sender: "user", type: "text", content: queryText };
      setMessages((prev) => [...prev, userMessage]);

      // 添加AI回复占位消息
      const aiPlaceholderMessage = { sender: "ai", type: "text", content: "" };
      setMessages((prev) => [...prev, aiPlaceholderMessage]);

      // 调用DeepSeek API（流式响应）
      await recognizeMilkTeaInfo(queryText, (chunk, fullContent) => {
        // 更新AI回复消息
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].sender === "ai") {
            newMessages[lastIndex].content = fullContent;
          }
          return newMessages;
        });
      });

      // 隐藏热量查询按钮
      setLastTeaInfo(null); // 通过设置 lastTeaInfo 为 null 来隐藏按钮
    } catch (error) {
      console.error("查询热量信息失败:", error);
      // 添加错误消息
      const errorMessage = {
        sender: "ai",
        type: "text",
        content: "抱歉，查询热量信息时出现错误。请稍后再试。",
      };
      setMessages((prev) => {
        // 移除占位消息
        const filtered = prev.filter(
          (msg) => !(msg.sender === "ai" && msg.content === "")
        );
        return [...filtered, errorMessage];
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 处理文本消息
  const handleSendMessage = async (text) => {
    try {
      setIsProcessing(true);

      // 添加用户消息到聊天
      const userMessage = { sender: "user", type: "text", content: text };
      setMessages((prev) => [...prev, userMessage]);

      // 添加AI回复占位消息
      const aiPlaceholderMessage = { sender: "ai", type: "text", content: "" };
      setMessages((prev) => [...prev, aiPlaceholderMessage]);

      // 调用DeepSeek API（流式响应）
      await recognizeMilkTeaInfo(text, (chunk, fullContent) => {
        // 更新AI回复消息
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].sender === "ai") {
            newMessages[lastIndex].content = fullContent;
          }
          return newMessages;
        });
      }).then((response) => {
        const aiResponse = response.choices[0].message.content;
        console.log("AI响应完成:", aiResponse);

        // 解析并添加记录
        parseAndAddRecord(aiResponse);
      });

      // 检查热量按钮状态
      console.log("热量按钮状态:", showCaloriesButton);
    } catch (error) {
      console.error("处理消息失败:", error);
      // 添加错误消息
      const errorMessage = {
        sender: "ai",
        type: "text",
        content: "抱歉，处理您的请求时出现错误。请稍后再试。",
      };
      setMessages((prev) => {
        // 移除占位消息
        const filtered = prev.filter(
          (msg) => !(msg.sender === "ai" && msg.content === "")
        );
        return [...filtered, errorMessage];
      });
      setLastTeaInfo(null); // 重置 lastTeaInfo
    } finally {
      setIsProcessing(false);
    }
  };

  // 处理图片上传
  const handleImageUpload = async (file) => {
    try {
      setIsProcessing(true);
      // 重置热量按钮状态
      setLastTeaInfo(null); // 重置 lastTeaInfo

      // 创建图片URL并添加到聊天
      const imageUrl = URL.createObjectURL(file);
      const imageMessage = { sender: "user", type: "image", content: imageUrl };
      setMessages((prev) => [...prev, imageMessage]);

      // 添加处理中消息
      const processingMessage = {
        sender: "ai",
        type: "text",
        content: "正在处理图片，请稍候...",
      };
      setMessages((prev) => [...prev, processingMessage]);

      // 从图片中提取文本
      const extractedText = await extractTextFromImage(file);
      console.log("提取的文本:", extractedText);

      // 添加提取的文本消息
      const textMessage = {
        sender: "user",
        type: "text",
        content: `从图片中提取的文本:\n${extractedText}`,
      };
      setMessages((prev) => [...prev, textMessage]);

      // 添加AI回复占位消息
      const aiPlaceholderMessage = { sender: "ai", type: "text", content: "" };
      setMessages((prev) => [
        ...prev.filter((msg) => msg !== processingMessage),
        aiPlaceholderMessage,
      ]);

      // 调用DeepSeek API（流式响应）
      await recognizeMilkTeaInfo(extractedText, (chunk, fullContent) => {
        // 更新AI回复消息
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].sender === "ai") {
            newMessages[lastIndex].content = fullContent;
          }
          return newMessages;
        });
      }).then((response) => {
        const aiResponse = response.choices[0].message.content;
        console.log("AI响应完成:", aiResponse);

        // 解析并添加记录
        parseAndAddRecord(aiResponse);
      });

      // 检查热量按钮状态
      console.log("热量按钮状态:", showCaloriesButton);
    } catch (error) {
      console.error("处理图片失败:", error);
      // 添加错误消息
      const errorMessage = {
        sender: "ai",
        type: "text",
        content:
          "抱歉，处理您的图片时出现错误。请确保图片清晰可读，并稍后再试。",
      };
      setMessages((prev) => {
        // 移除占位消息和处理中消息
        const filtered = prev.filter(
          (msg) =>
            !(
              (msg.sender === "ai" && msg.content === "") ||
              msg.content === "正在处理图片，请稍候..."
            )
        );
        return [...filtered, errorMessage];
      });

      // 确保错误时不显示热量查询按钮
      setLastTeaInfo(null); // 重置 lastTeaInfo
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            奶茶星球
          </Typography>
        </Box>

        <Box sx={{ mb: 4, position: "relative" }}>
          <ChatInterface messages={messages} />

          {/* 移除悬浮按钮 */}

          <Box
            sx={{
              display: lastTeaInfo ? "flex" : "none",
              justifyContent: "center",
              mt: 2,
              mb: 2,
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              startIcon={<LocalFireDepartmentIcon />}
              endIcon={<span>→</span>}
              onClick={handleCaloriesQuery}
              sx={{
                borderRadius: 4,
                py: 1,
                px: 3,
                boxShadow: 3,
              }}
            >
              想知道奶茶的热量？
            </Button>
          </Box>

          <InputArea
            onSendMessage={handleSendMessage}
            onImageUpload={handleImageUpload}
            isProcessing={isProcessing}
          />
        </Box>

        <Box sx={{ mt: 4 }}>
          <TeaCalendar teaRecords={teaRecords} />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
