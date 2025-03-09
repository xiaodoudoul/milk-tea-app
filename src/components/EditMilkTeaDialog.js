import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import zhCN from "date-fns/locale/zh-CN";

const EditMilkTeaDialog = ({ open, onClose, onSave, teaRecord }) => {
  const [formData, setFormData] = useState({
    brand: "",
    flavor: "",
    price: "",
    purchaseDate: new Date(),
    id: "",
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
        id: teaRecord.id || "",
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
      newErrors.brand = "请输入奶茶品牌";
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
      onSave({
        ...formData,
        price: parseFloat(formData.price),
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>编辑奶茶记录</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="brand"
              label="奶茶品牌"
              value={formData.brand}
              onChange={handleChange}
              error={!!errors.brand}
              helperText={errors.brand}
              fullWidth
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="flavor"
              label="奶茶口味"
              value={formData.flavor}
              onChange={handleChange}
              error={!!errors.flavor}
              helperText={errors.flavor}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="price"
              label="价格"
              type="number"
              value={formData.price}
              onChange={handleChange}
              error={!!errors.price}
              helperText={errors.price}
              fullWidth
              inputProps={{ step: "0.1" }}
            />
          </Grid>
          <Grid item xs={12}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={zhCN}
            >
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
