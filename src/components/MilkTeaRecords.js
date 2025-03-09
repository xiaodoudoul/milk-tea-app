import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import EditIcon from "@mui/icons-material/Edit";
import { getAllMilkTeas, updateMilkTea } from "../services/milkTeaService";
import EditMilkTeaDialog from "./EditMilkTeaDialog";

const MilkTeaRecords = ({ teaRecords: propRecords, onRecordUpdated }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  // 在组件加载时获取奶茶消费记录
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        // 如果有传入的记录，则使用传入的记录
        if (propRecords && propRecords.length > 0) {
          setRecords(propRecords);
        } else {
          // 否则从后端获取记录
          const data = await getAllMilkTeas();
          setRecords(data);
        }
        setError(null);
      } catch (err) {
        console.error("获取奶茶记录失败:", err);
        setError("获取奶茶记录失败，请稍后再试");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [propRecords]);

  // 处理分页变化
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 处理编辑按钮点击
  const handleEditClick = (record) => {
    setCurrentRecord(record);
    setEditDialogOpen(true);
  };

  // 处理编辑对话框关闭
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setCurrentRecord(null);
  };

  // 处理保存编辑
  const handleSaveEdit = async (updatedRecord) => {
    try {
      setLoading(true);
      // 调用API更新记录
      const result = await updateMilkTea(updatedRecord.id, updatedRecord);

      // 更新本地记录列表
      const updatedRecords = records.map((record) =>
        record.id === result.id ? result : record
      );
      setRecords(updatedRecords);

      // 关闭对话框
      setEditDialogOpen(false);
      setCurrentRecord(null);

      // 如果有回调函数，则调用
      if (onRecordUpdated) {
        onRecordUpdated(result);
      }
    } catch (err) {
      console.error("更新奶茶记录失败:", err);
      setError("更新奶茶记录失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  // 渲染加载状态
  if (loading && records.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // 渲染空记录状态
  if (records.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          暂无奶茶消费记录，上传奶茶小票或手动添加记录吧！
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <LocalCafeIcon sx={{ mr: 1 }} />
        奶茶消费记录
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>品牌</TableCell>
              <TableCell>口味</TableCell>
              <TableCell>价格</TableCell>
              <TableCell>日期</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Chip
                      label={record.brand}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{record.flavor}</TableCell>
                  <TableCell>¥{record.price.toFixed(2)}</TableCell>
                  <TableCell>{formatDate(record.purchaseDate)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="编辑">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditClick(record)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={records.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="每页行数:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} 共 ${count}`
          }
        />
      </TableContainer>

      {/* 编辑对话框 */}
      <EditMilkTeaDialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        onSave={handleSaveEdit}
        teaRecord={currentRecord}
      />
    </Box>
  );
};

export default MilkTeaRecords;
