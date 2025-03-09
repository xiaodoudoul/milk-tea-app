import React from "react";
import { Chip, Tooltip } from "@mui/material";
import config from "../config/env";

/**
 * 环境指示器组件
 * 在开发环境中显示当前环境信息
 */
const EnvIndicator = () => {
  // 只在开发环境中显示
  if (!config.isDevelopment) {
    return null;
  }

  return (
    <Tooltip title={`API: ${config.api.baseUrl}`} arrow>
      <Chip
        label={config.env.toUpperCase()}
        color={config.env === "development" ? "warning" : "success"}
        size="small"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 9999,
          opacity: 0.8,
          "&:hover": {
            opacity: 1,
          },
        }}
      />
    </Tooltip>
  );
};

export default EnvIndicator;
