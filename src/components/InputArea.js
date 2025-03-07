import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";

/**
 * 输入区域组件，包含文本输入和图片上传功能
 */
const InputArea = ({ onSendMessage, onImageUpload, isProcessing }) => {
  const [message, setMessage] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const fileInputRef = React.useRef();

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/gif")
    ) {
      onImageUpload(file);
    } else {
      alert("请上传有效的图片文件 (JPEG, PNG, GIF)");
    }
    // 重置文件输入，以便可以再次选择同一文件
    e.target.value = null;
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        mt: 2,
        position: "relative",
        gap: 1,
        alignItems: "stretch",
        "& .MuiInputBase-root": {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        },
      }}
    >
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <TextField
        fullWidth
        multiline={false}
        placeholder="输入文字或上传图片..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isProcessing}
        sx={{
          flexGrow: 1,
          "& .MuiOutlinedInput-root": {
            borderRadius: "16px",
            height: isMobile ? "40px" : "48px",
          },
          "& .MuiInputBase-input": {
            padding: isMobile ? "8px 14px" : "12px 14px",
            height: "100%",
            boxSizing: "border-box",
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                color="primary"
                onClick={() => fileInputRef.current.click()}
                disabled={isProcessing}
                edge="start"
                sx={{
                  padding: isMobile ? "4px" : "8px",
                  marginLeft: "4px",
                  borderRadius: "50%",
                }}
              >
                <AttachFileIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSend}
        disabled={!message.trim() || isProcessing}
        sx={{
          borderRadius: "16px",
          height: isMobile ? "40px" : "48px",
          minWidth: isMobile ? "80px" : "100px",
          padding: "0 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
          display: "inline-flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
          alignSelf: "center",
        }}
      >
        {isProcessing ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <>
            <span
              style={{
                fontSize: isMobile ? "14px" : "16px",
                fontWeight: 500,
                lineHeight: 1,
                display: "inline-block",
                marginRight: "4px",
              }}
            >
              发送
            </span>
            <SendIcon fontSize={isMobile ? "small" : "medium"} />
          </>
        )}
      </Button>
    </Box>
  );
};

export default InputArea;
