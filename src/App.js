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
  CircularProgress,
} from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import ChatInterface from "./components/ChatInterface";
import InputArea from "./components/InputArea";
import TeaCalendar from "./components/TeaCalendar";
import MilkTeaRecords from "./components/MilkTeaRecords";
import { extractTextFromImage } from "./utils/tencentOcrUtils";
import { recognizeMilkTeaInfo } from "./services/deepseekService";
import { getAllMilkTeas, createMilkTea } from "./services/milkTeaService";
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
  const [isLoadingCalories, setIsLoadingCalories] = useState(false);

  // 在组件加载时获取奶茶消费记录
  useEffect(() => {
    const fetchTeaRecords = async () => {
      try {
        const records = await getAllMilkTeas();
        setTeaRecords(records);
      } catch (error) {
        console.error("获取奶茶记录失败:", error);
      }
    };

    fetchTeaRecords();
  }, []);

  // 使用 useEffect 监听 lastTeaInfo 的变化
  useEffect(() => {
    if (lastTeaInfo) {
      console.log("lastTeaInfo 更新:", lastTeaInfo);
      setShowCaloriesButton(true);
    } else {
      console.log("lastTeaInfo 被重置，隐藏热量查询按钮");
      setShowCaloriesButton(false);
    }
  }, [lastTeaInfo]);

  // 解析识别结果并添加到记录中
  const parseAndAddRecord = async (text) => {
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
      const purchaseDate = date
        ? dayjs(date, "YYYY年MM月DD日").format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD");

      const record = {
        brand,
        flavor,
        price: parseFloat(price),
        purchaseDate,
      };

      console.log("添加奶茶记录:", record);

      try {
        // 保存到后端
        const savedRecord = await createMilkTea(record);
        console.log("记录已保存到后端:", savedRecord);

        // 更新本地状态
        setTeaRecords((prev) => [...prev, savedRecord]);

        // 设置最后一条记录，用于热量查询
        setLastTeaInfo(savedRecord);
      } catch (error) {
        console.error("保存记录失败:", error);
      }
    } else {
      console.log("未能成功解析奶茶信息");
    }
  };

  // 查询奶茶热量信息
  const handleCaloriesQuery = async () => {
    if (!lastTeaInfo) return;

    try {
      setIsProcessing(true);
      setIsLoadingCalories(true);

      // 构建查询文本
      const queryText = `请根据以下奶茶信息推断奶茶营养，包括热量、含糖量、咖啡因含量：
品牌：${lastTeaInfo.brand}
口味：${lastTeaInfo.flavor}`;

      // 添加用户消息
      const userMessage = {
        sender: "user",
        type: "text",
        content: queryText,
      };
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
      }).then(async (response) => {
        const aiResponse = response.choices[0].message.content;
        console.log("AI响应完成:", aiResponse);

        // 解析热量信息
        const caloriesMatch = aiResponse.match(/热量[：:]\s*(\d+)/);
        const sugarMatch = aiResponse.match(/含糖量[：:]\s*(\d+)/);
        const caffeineMatch = aiResponse.match(/咖啡因[：:]\s*(\d+)/);
        const fatMatch = aiResponse.match(/脂肪[：:]\s*(\d+)/);

        if (caloriesMatch || sugarMatch || caffeineMatch || fatMatch) {
          const calories = caloriesMatch ? parseInt(caloriesMatch[1]) : null;
          const sugar = sugarMatch ? parseInt(sugarMatch[1]) : null;
          const caffeine = caffeineMatch ? parseInt(caffeineMatch[1]) : null;
          const fat = fatMatch ? parseInt(fatMatch[1]) : null;

          console.log("解析到的营养信息:", { calories, sugar, caffeine, fat });

          // 更新后端记录
          try {
            // 构建更新数据
            const updateData = {
              ...lastTeaInfo,
              calories,
              sugar,
              caffeine,
              fat,
            };

            // 调用API更新记录
            const response = await fetch(
              `http://localhost:3001/api/milktea/${lastTeaInfo.id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
              }
            );

            if (!response.ok) {
              throw new Error(
                `更新记录失败: ${response.status} ${response.statusText}`
              );
            }

            const updatedRecord = await response.json();
            console.log("记录已更新:", updatedRecord);

            // 更新本地状态
            setTeaRecords((prev) =>
              prev.map((record) =>
                record.id === updatedRecord.id ? updatedRecord : record
              )
            );
          } catch (error) {
            console.error("更新记录失败:", error);
          }
        }
      });
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
      // 无论成功与否，都隐藏热量查询按钮
      setLastTeaInfo(null);
      setIsProcessing(false);
      setIsLoadingCalories(false);
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
      // 延迟一秒后结束处理状态，让用户有时间看到完整的响应
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
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
      // 延迟一秒后结束处理状态，让用户有时间看到完整的响应
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
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
          <ChatInterface
            messages={messages}
            lastTeaInfo={lastTeaInfo}
            isLoadingCalories={isLoadingCalories}
            handleCaloriesQuery={handleCaloriesQuery}
            showCaloriesButton={showCaloriesButton}
          />

          <InputArea
            onSendMessage={handleSendMessage}
            onImageUpload={handleImageUpload}
            isProcessing={isProcessing}
          />
        </Box>

        <Box sx={{ mt: 4 }}>
          <TeaCalendar teaRecords={teaRecords} />
        </Box>

        <Box sx={{ mt: 4 }}>
          <MilkTeaRecords teaRecords={teaRecords} />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
