import React from "react";
import { Paper, Typography, Box, Grid, Divider, useTheme } from "@mui/material";

/**
 * 结果显示组件，展示奶茶识别结果
 */
const ResultDisplay = ({ result }) => {
  const theme = useTheme();

  // 如果没有结果，则不显示
  if (!result) return null;

  // 解析结果文本，提取奶茶信息
  const extractInfo = (text) => {
    const brand = text.match(/奶茶品牌：(.*?)[,，]/)?.[1] || "未识别";
    const flavor = text.match(/奶茶口味：(.*?)[,，]/)?.[1] || "未识别";
    const price = text.match(/奶茶价格：(.*?)元/)?.[1] || "未识别";
    const date = text.match(/奶茶日期：(.*?)$/)?.[1] || "未识别";

    return { brand, flavor, price, date };
  };

  const { brand, flavor, price, date } = extractInfo(result);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        width: "100%",
      }}
    >
      <Typography variant="h5" gutterBottom align="center" color="primary">
        奶茶识别结果
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" color="text.secondary">
              奶茶品牌
            </Typography>
            <Typography variant="h6">{brand}</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" color="text.secondary">
              奶茶口味
            </Typography>
            <Typography variant="h6">{flavor}</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" color="text.secondary">
              奶茶价格
            </Typography>
            <Typography variant="h6">{price} 元</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" color="text.secondary">
              奶茶日期
            </Typography>
            <Typography variant="h6">{date}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ResultDisplay;
