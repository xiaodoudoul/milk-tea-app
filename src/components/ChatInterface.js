import React from "react";
import { Box, Paper, Typography, useTheme, useMediaQuery } from "@mui/material";
import ReactMarkdown from "react-markdown";

/**
 * 聊天界面组件，显示消息历史
 */
const ChatInterface = ({ messages }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        height: isMobile ? "50vh" : "60vh",
        overflowY: "auto",
        mb: 2,
        borderRadius: 2,
      }}
    >
      {messages.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Typography color="text.secondary">
            请上传图片或输入文字来识别奶茶信息
          </Typography>
        </Box>
      ) : (
        messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
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
        ))
      )}
    </Paper>
  );
};

export default ChatInterface;
