import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { login, register } from "../services/userService";
import { syncLocalData } from "../services/milkTeaService";

/**
 * 登录/注册对话框组件
 */
const AuthDialog = ({ open, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [syncStatus, setSyncStatus] = useState(null);

  // 处理标签切换
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError("");
  };

  // 处理登录
  const handleLogin = async () => {
    if (!username || !password) {
      setError("请输入用户名和密码");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await login({ username, password });

      // 尝试同步本地数据
      setSyncStatus({ status: "syncing", message: "正在同步本地数据..." });
      const syncResult = await syncLocalData();
      setSyncStatus({
        status: syncResult.success ? "success" : "error",
        message: syncResult.message,
      });

      // 延迟关闭，让用户看到同步结果
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(result);
        }
        onClose();
      }, 2000);
    } catch (error) {
      setError(error.message || "登录失败，请检查用户名和密码");
    } finally {
      setLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async () => {
    if (!username || !password) {
      setError("请输入用户名和密码");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("开始注册用户:", username);
      const result = await register({ username, password });
      console.log("注册成功:", result);

      // 尝试同步本地数据
      setSyncStatus({ status: "syncing", message: "正在同步本地数据..." });
      console.log("开始同步本地数据");
      const syncResult = await syncLocalData();
      console.log("同步结果:", syncResult);
      setSyncStatus({
        status: syncResult.success ? "success" : "error",
        message: syncResult.message,
      });

      // 延迟关闭，让用户看到同步结果
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(result);
        }
        onClose();
      }, 2000);
    } catch (error) {
      console.error("注册失败:", error);
      setError(error.message || "注册失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 0) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="登录" />
          <Tab label="注册" />
        </Tabs>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {syncStatus && (
            <Alert
              severity={
                syncStatus.status === "syncing"
                  ? "info"
                  : syncStatus.status === "success"
                  ? "success"
                  : "warning"
              }
              sx={{ mb: 2 }}
            >
              {syncStatus.message}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="用户名"
            type="text"
            fullWidth
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
          />

          <TextField
            margin="dense"
            label="密码"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          {activeTab === 1 && (
            <TextField
              margin="dense"
              label="确认密码"
              type="password"
              fullWidth
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          )}

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 0
                ? "登录后可以将本地数据同步到云端"
                : "注册成功后将自动登录"}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {activeTab === 0 ? "登录" : "注册"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AuthDialog;
