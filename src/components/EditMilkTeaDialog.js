import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import zhCN from "date-fns/locale/zh-CN";

// 常见奶茶品牌列表
const COMMON_BRANDS = [
  "喜茶",
  "奈雪的茶",
  "蜜雪冰城",
  "一点点",
  "茶百道",
  "COCO都可",
  "贡茶",
  "沪上阿姨",
  "其他",
];

const EditMilkTeaDialog = ({ open, onClose, onSave, teaRecord }) => {
  const [formData, setFormData] = useState({
    brand: "",
    flavor: "",
    price: "",
    purchaseDate: new Date(),
  });

  const [errors, setErrors] = useState({});

  // 当teaRecord变化时更新表单数据
  useEffect(() => {
    if (teaRecord) {
      setFormData({
        brand: teaRecord.brand || "",
        flavor: teaRecord.flavor || "",
        price: teaRecord.price ? teaRecord.price.toString() : "",
        purchaseDate: teaRecord.purchaseDate
          ? new Date(teaRecord.purchaseDate)
          : new Date(),
      });
    }
  }, [teaRecord]);

  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // 处理日期变化
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      purchaseDate: date,
    });
  };

  // 验证表单
  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand.trim()) {
      newErrors.brand = "请选择或输入奶茶品牌";
    }

    if (!formData.flavor.trim()) {
      newErrors.flavor = "请输入奶茶口味";
    }

    if (!formData.price) {
      newErrors.price = "请输入价格";
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = "价格必须是大于0的数字";
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = "请选择购买日期";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理保存
  const handleSave = () => {
    if (validateForm()) {
      const updatedRecord = {
        ...teaRecord,
        brand: formData.brand,
        flavor: formData.flavor,
        price: parseFloat(formData.price),
        purchaseDate: formData.purchaseDate.toISOString(),
      };
      onSave(updatedRecord);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>编辑奶茶消费记录</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.brand}>
              <InputLabel id="brand-label">奶茶品牌</InputLabel>
              <Select
                labelId="brand-label"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                label="奶茶品牌"
              >
                {COMMON_BRANDS.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
              {errors.brand && <FormHelperText>{errors.brand}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="奶茶口味"
              name="flavor"
              value={formData.flavor}
              onChange={handleChange}
              error={!!errors.flavor}
              helperText={errors.flavor}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="价格 (¥)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              error={!!errors.price}
              helperText={errors.price}
              InputProps={{
                startAdornment: "¥",
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns} locale={zhCN}>
              <DatePicker
                label="购买日期"
                value={formData.purchaseDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.purchaseDate,
                    helperText: errors.purchaseDate,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMilkTeaDialog;
