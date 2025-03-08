import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Badge,
  CircularProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SyncIcon from "@mui/icons-material/Sync";
import LogoutIcon from "@mui/icons-material/Logout";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import { isLoggedIn, logout, getCurrentUserId } from "../services/userService";
import { syncLocalData } from "../services/milkTeaService";
import { getUnsyncedRecords } from "../services/localStorageService";
import AuthDialog from "./AuthDialog";

/**
 * 用户信息组件
 */
const UserInfo = ({ onLoginStatusChange, onSyncComplete }) => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const loggedIn = isLoggedIn();
  const userId = getCurrentUserId();
  const unsyncedRecords = getUnsyncedRecords();

  // 处理菜单打开
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // 处理菜单关闭
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // 处理登录/注册对话框打开
  const handleAuthDialogOpen = () => {
    setAuthDialogOpen(true);
    handleMenuClose();
  };

  // 处理登录/注册对话框关闭
  const handleAuthDialogClose = () => {
    setAuthDialogOpen(false);
  };

  // 处理登录成功
  const handleLoginSuccess = (result) => {
    if (onLoginStatusChange) {
      onLoginStatusChange(true, result);
    }
  };

  // 处理登出
  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    if (onLoginStatusChange) {
      onLoginStatusChange(false);
    }
  };

  // 处理同步数据
  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);

      const result = await syncLocalData();

      setSyncResult(result);

      if (onSyncComplete) {
        onSyncComplete(result);
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: `同步失败: ${error.message}`,
      });
    } finally {
      setSyncing(false);
      // 3秒后清除同步结果
      setTimeout(() => {
        setSyncResult(null);
      }, 3000);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {/* 同步状态 */}
        {syncResult && (
          <Typography
            variant="body2"
            color={syncResult.success ? "success.main" : "error.main"}
            sx={{ mr: 2, animation: "fadeOut 3s forwards" }}
          >
            {syncResult.message}
          </Typography>
        )}

        {/* 同步按钮 */}
        {loggedIn && (
          <Tooltip title="同步本地数据到云端">
            <span>
              <IconButton
                color="primary"
                onClick={handleSync}
                disabled={syncing || unsyncedRecords.length === 0}
                sx={{ mr: 1 }}
              >
                {syncing ? (
                  <CircularProgress size={24} />
                ) : (
                  <Badge badgeContent={unsyncedRecords.length} color="error">
                    <SyncIcon />
                  </Badge>
                )}
              </IconButton>
            </span>
          </Tooltip>
        )}

        {/* 离线指示器 */}
        {!navigator.onLine && (
          <Tooltip title="当前处于离线模式">
            <CloudOffIcon color="action" sx={{ mr: 1 }} />
          </Tooltip>
        )}

        {/* 用户头像/登录按钮 */}
        {loggedIn ? (
          <>
            <Tooltip title="用户菜单">
              <IconButton onClick={handleMenuOpen}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                  <PersonIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem disabled>
                <Typography variant="body2">用户ID: {userId}</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                退出登录
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={handleAuthDialogOpen}
            size="small"
          >
            登录/注册
          </Button>
        )}
      </Box>

      {/* 登录/注册对话框 */}
      <AuthDialog
        open={authDialogOpen}
        onClose={handleAuthDialogClose}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default UserInfo;
