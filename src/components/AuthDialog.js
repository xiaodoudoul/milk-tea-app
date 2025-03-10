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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [syncStatus, setSyncStatus] = useState(null);

  // 处理标签切换
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError("");
    setUsernameError("");
    // 切换标签时清空密码和确认密码
    setPassword("");
    setConfirmPassword("");
  };

  // 处理对话框关闭
  const handleClose = () => {
    if (!loading) {
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setEmail("");
      setError("");
      setUsernameError("");
      setSyncStatus(null);
      onClose();
    }
  };

  // 验证用户名
  const validateUsername = (value) => {
    if (activeTab === 1) {
      // 只在注册时验证
      if (value.length < 3 || value.length > 30) {
        setUsernameError("用户名长度必须在3-30个字符之间");
        return false;
      } else {
        setUsernameError("");
        return true;
      }
    }
    return true;
  };

  // 处理用户名变更
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    validateUsername(value);
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

    // 验证用户名长度
    if (!validateUsername(username)) {
      setError("用户名长度必须在3-30个字符之间");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("开始注册用户:", username);
      const result = await register({ username, password, email });
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
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
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
            onChange={handleUsernameChange}
            disabled={loading}
            required
            helperText={
              activeTab === 1
                ? usernameError || "用户名长度必须在3-30个字符之间"
                : ""
            }
            error={activeTab === 1 && !!usernameError && username.length > 0}
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
            <>
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
              <TextField
                margin="dense"
                label="邮箱"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                helperText="请输入有效的邮箱地址"
              />
            </>
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
          <Button onClick={handleClose} disabled={loading}>
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
