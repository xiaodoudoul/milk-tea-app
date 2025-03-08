import React from "react";
import {
  Box,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Button,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

/**
 * 聊天界面组件，显示消息历史
 */
const ChatInterface = ({
  messages,
  lastTeaInfo,
  isLoadingCalories,
  handleCaloriesQuery,
  showCaloriesButton,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // 检查是否有正在加载的AI消息（内容为空字符串）
  const hasLoadingMessage = messages.some(
    (msg) => msg.sender === "ai" && msg.content === ""
  );

  // 打字动画效果的样式
  const typingAnimation = {
    display: "inline-block",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    margin: "0 2px",
    backgroundColor: theme.palette.primary.main,
    animation: "typing 1s infinite ease-in-out",
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        height: isMobile ? "50vh" : "60vh",
        overflowY: "auto",
        mb: 2,
        borderRadius: 2,
        "@keyframes typing": {
          "0%": { opacity: 0.3, transform: "scale(0.8)" },
          "50%": { opacity: 1, transform: "scale(1)" },
          "100%": { opacity: 0.3, transform: "scale(0.8)" },
        },
      }}
    >
      {messages.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
          flexDirection="column"
          gap={2}
        >
          <Typography color="text.secondary">
            请上传图片或输入文字来识别奶茶信息
          </Typography>
        </Box>
      ) : (
        <>
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent:
                  msg.sender === "user" ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: "80%",
                  borderRadius: 2,
                  bgcolor:
                    msg.sender === "user"
                      ? theme.palette.primary.light
                      : theme.palette.grey[100],
                }}
              >
                {msg.type === "image" ? (
                  <Box
                    sx={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={msg.content}
                      alt="用户上传图片"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                ) : msg.sender === "ai" && msg.content === "" ? (
                  // 显示AI正在输入的动画
                  <Box
                    sx={{
                      minHeight: "24px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={typingAnimation}></span>
                    <span
                      style={{ ...typingAnimation, animationDelay: "0.2s" }}
                    ></span>
                    <span
                      style={{ ...typingAnimation, animationDelay: "0.4s" }}
                    ></span>
                  </Box>
                ) : msg.sender === "ai" ? (
                  <Box
                    sx={{
                      color: "text.primary",
                      "& p": { margin: "0.5em 0" },
                      "& table": {
                        borderCollapse: "collapse",
                        width: "100%",
                        margin: "1em 0",
                      },
                      "& th, & td": {
                        border: `1px solid ${theme.palette.divider}`,
                        padding: "8px",
                        textAlign: "left",
                      },
                      "& th": {
                        backgroundColor: theme.palette.action.hover,
                      },
                      "& ul, & ol": {
                        paddingLeft: "1.5em",
                        margin: "0.5em 0",
                      },
                      "& code": {
                        backgroundColor: theme.palette.action.hover,
                        padding: "2px 4px",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                      },
                      "& blockquote": {
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                        margin: "0.5em 0",
                        padding: "0.5em 1em",
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </Box>
                ) : (
                  <Typography
                    color={msg.sender === "user" ? "white" : "text.primary"}
                    sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {msg.content}
                  </Typography>
                )}
              </Paper>
            </Box>
          ))}

          {/* 热量查询按钮 */}
          {lastTeaInfo && showCaloriesButton && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
                mb: 2,
              }}
            >
              <Button
                variant="contained"
                color="secondary"
                startIcon={<LocalFireDepartmentIcon />}
                endIcon={
                  isLoadingCalories ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <span>→</span>
                  )
                }
                onClick={handleCaloriesQuery}
                disabled={isLoadingCalories || !lastTeaInfo}
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
          )}
        </>
      )}
    </Paper>
  );
};

export default ChatInterface;
