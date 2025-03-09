import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  useTheme,
  Badge,
  Grid,
  Divider,
} from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

// 设置中文本地化
dayjs.locale("zh-cn");

// 自定义日期格式化
const zhCNLocale = {
  components: {
    MuiLocalizationProvider: {
      defaultProps: {
        localeText: {
          // 月份和年份的格式
          datePickerToolbarTitle: "选择日期",
          // 确保月份在年份后面
          calendarViewSwitchingButtonAriaLabel: (view) =>
            view === "year" ? "切换到年份视图" : "切换到日历视图",
          // 月份名称
          monthsShort: [
            "1月",
            "2月",
            "3月",
            "4月",
            "5月",
            "6月",
            "7月",
            "8月",
            "9月",
            "10月",
            "11月",
            "12月",
          ],
          months: [
            "一月",
            "二月",
            "三月",
            "四月",
            "五月",
            "六月",
            "七月",
            "八月",
            "九月",
            "十月",
            "十一月",
            "十二月",
          ],
          // 日历头部格式
          datePickerDefaultToolbarTitle: "选择日期",
          // 年月格式
          dateFormat: "YYYY年MM月DD日",
          dateFormatItem: "YYYY年MM月",
        },
      },
    },
  },
};

// 自定义日期组件
const ServerDay = (props) => {
  const {
    day,
    outsideCurrentMonth,
    teaRecords,
    selectedDate,
    setSelectedDate,
    ...other
  } = props;

  const theme = useTheme();

  // 检查当天是否有奶茶记录
  const dayRecords = teaRecords.filter(
    (record) =>
      dayjs(record.purchaseDate).format("YYYY-MM-DD") ===
      day.format("YYYY-MM-DD")
  );
  const isTeaDay = dayRecords.length > 0;

  // 计算当天总消费
  const dayTotal = dayRecords.reduce(
    (sum, record) => sum + parseFloat(record.price || 0),
    0
  );

  // 检查是否是选中的日期
  const isSelected =
    selectedDate &&
    selectedDate.format("YYYY-MM-DD") === day.format("YYYY-MM-DD");

  // 如果不是当前月份或没有记录，正常渲染
  if (outsideCurrentMonth || !isTeaDay) {
    return (
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        selected={isSelected}
        onClick={() => setSelectedDate(day)}
      />
    );
  }

  // 有记录的日期，添加醒目标记
  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={dayRecords.length}
      color="primary"
      sx={{
        "& .MuiBadge-badge": {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          minWidth: "16px",
          height: "16px",
          padding: "0 4px",
          borderRadius: "8px",
          fontSize: "0.65rem",
          fontWeight: "bold",
          right: "2px",
          top: "2px",
          transform: "scale(0.8) translate(25%, -25%)",
        },
      }}
    >
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        selected={isSelected}
        onClick={() => setSelectedDate(day)}
        sx={{
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.primary.contrastText,
          borderRadius: "50%",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            transform: "scale(1.05)",
          },
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.primary.contrastText,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          },
          ...(dayTotal > 50 && {
            border: `2px solid ${theme.palette.warning.main}`,
          }),
        }}
      />
    </Badge>
  );
};

// 奶茶详情组件
const TeaDetails = ({ date, records }) => {
  if (!date || !records || records.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Typography color="text.secondary">
          选择有奶茶记录的日期查看详情
        </Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
          {date.format("YYYY年MM月DD日")}奶茶记录
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {records.map((record, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              {record.brand} - {record.flavor}
              <div
                style={{ color: "rgba(0, 0, 0, 0.6)", fontWeight: "normal" }}
              >
                价格：{record.price}元
              </div>
            </Typography>
            <Typography variant="body2" color="text.secondary"></Typography>
            {index < records.length - 1 && <Divider sx={{ my: 1 }} />}
          </Box>
        ))}

        {records.length > 1 && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              当日共消费：
              {records
                .reduce((sum, record) => sum + parseFloat(record.price || 0), 0)
                .toFixed(2)}
              元
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const TeaCalendar = ({ teaRecords = [] }) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  // 计算当月总消费
  const calculateMonthlyExpense = (date) => {
    if (!teaRecords || teaRecords.length === 0) return 0;

    const currentMonth = date.format("YYYY-MM");
    return teaRecords
      .filter((record) => dayjs(record.date).format("YYYY-MM") === currentMonth)
      .reduce((sum, record) => sum + parseFloat(record.price || 0), 0);
  };

  // 获取指定日期的奶茶记录
  const getDayTeaRecords = (date) => {
    if (!date || !teaRecords || teaRecords.length === 0) return [];

    const dateStr = date.format("YYYY-MM-DD");
    return teaRecords.filter(
      (record) => dayjs(record.purchaseDate).format("YYYY-MM-DD") === dateStr
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }} id="calendar-container">
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="zh-cn"
        localeText={
          zhCNLocale.components.MuiLocalizationProvider.defaultProps.localeText
        }
      >
        <Grid container spacing={3}>
          {/* 日历部分 */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <DateCalendar
                value={selectedDate}
                onChange={(newDate) => {
                  setSelectedDate(newDate);
                  // 处理月份变化
                  if (
                    newDate.format("YYYY-MM") !== currentMonth.format("YYYY-MM")
                  ) {
                    setCurrentMonth(newDate);
                  }
                }}
                slots={{
                  day: (props) => (
                    <ServerDay
                      {...props}
                      teaRecords={teaRecords}
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                    />
                  ),
                }}
                // 自定义日期格式
                formatDensity="spacious"
              />

              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                {currentMonth.format("YYYY年MM月")}奶茶消费：
                {calculateMonthlyExpense(currentMonth).toFixed(2)}元
              </Typography>
            </Box>
          </Grid>

          {/* 奶茶详情部分 */}
          <Grid item xs={12} md={5}>
            <TeaDetails
              date={selectedDate}
              records={getDayTeaRecords(selectedDate)}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Paper>
  );
};

export default TeaCalendar;
