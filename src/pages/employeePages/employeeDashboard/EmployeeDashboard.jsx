import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import AddIcon from "@mui/icons-material/Add";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import HourglassTopOutlinedIcon from "@mui/icons-material/HourglassTopOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import useAuthStore from "../../../store/useAuthStore";
import { useEmployeeDashboard, useMyEntries } from "../../../hooks/employeeHooks/useEmployee";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";
import StatusChip from "../../../components/common/StatusChip";
import EntryActions from "../../../components/timeEntries/EntryActions";
import useEntryDialogs from "../../../components/timeEntries/useEntryDialogs";
import { DashboardLoadingState, EmptyState, ErrorState } from "../../../components/requestStates/RequestStates";
import { addDays, formatHours, formatShortDate, formatWeekday } from "../../../utils/format";

const CHART_DAYS = 14;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// hours per day for the last two weeks, split into approved / pending / rejected
function useLastTwoWeeks(today) {
  const from = today ? addDays(today, -(CHART_DAYS - 1)) : null;
  const { data } = useMyEntries({ from, to: today, page: 1, pageSize: 100 }, { enabled: !!today });

  return useMemo(() => {
    if (!today) return null;
    const days = Array.from({ length: CHART_DAYS }, (_, i) => addDays(from, i));
    const totals = Object.fromEntries(days.map((d) => [d, { approved: 0, pending: 0, rejected: 0 }]));
    (data?.items ?? []).forEach((entry) => {
      const day = totals[entry.workDate];
      if (!day) return;
      if (entry.status === "Approved") day.approved += entry.hours;
      else if (entry.status === "Rejected") day.rejected += entry.hours;
      else if (entry.status !== "Cancelled") day.pending += entry.hours;
    });
    return { days, totals };
  }, [data, today, from]);
}

function EmployeeDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError, error, refetch } = useEmployeeDashboard();
  const { data: recent } = useMyEntries({ page: 1, pageSize: 5 });
  const chart = useLastTwoWeeks(data?.today);
  const { dialogs, openNew, openEdit, openHistory, openCancel } = useEntryDialogs({
    today: data?.today,
    remainingToday: data?.remainingToday,
  });

  const firstName = user.fullName.split(" ")[0];

  if (isLoading) return <DashboardLoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const todayPercent = data.dailyLimit ? (data.hoursToday / data.dailyLimit) * 100 : 0;

  return (
    <Box>
      <PageHeader
        eyebrow={formatWeekday(data.today)}
        title={`${greeting()}, ${firstName}`}
        subtitle="Here's where your hours stand."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openNew} disabled={data.activeProjectCount === 0}>
            Log hours
          </Button>
        }
      />

      {data.rejectedCount > 0 && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate("/employee/entries?status=Rejected")}>
              Review
            </Button>
          }
        >
          {data.rejectedCount === 1 ? "1 entry was" : `${data.rejectedCount} entries were`} rejected. Fix and resubmit
          {data.rejectedCount === 1 ? " it" : " them"} so the hours count.
        </Alert>
      )}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" } }}>
        <Card>
          <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Today
              </Typography>
              <TodayOutlinedIcon fontSize="small" color="primary" />
            </Stack>
            <Typography variant="h5" sx={{ mt: 0.5 }}>
              {formatHours(data.hoursToday)}
              <Typography component="span" color="text.secondary" variant="body2">
                {" "}
                / {formatHours(data.dailyLimit)}
              </Typography>
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(todayPercent, 100)}
              color={todayPercent >= 100 ? "error" : "primary"}
              sx={{ mt: 1.5, height: 6, borderRadius: 6 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              {formatHours(data.remainingToday)} left before the daily cap
            </Typography>
          </CardContent>
        </Card>
        <StatCard
          label="This week"
          value={formatHours(data.hoursThisWeek)}
          hint={`Since ${formatShortDate(data.weekStart)}`}
          icon={<DateRangeOutlinedIcon fontSize="small" />}
          color="info"
        />
        <StatCard
          label="Approved this month"
          value={formatHours(data.approvedHoursThisMonth)}
          hint="Counted against project budgets"
          icon={<TaskAltOutlinedIcon fontSize="small" />}
          color="success"
        />
        <StatCard
          label="Active projects"
          value={data.activeProjectCount}
          hint="You can log hours on these"
          icon={<FolderOutlinedIcon fontSize="small" />}
          color="secondary"
        />
      </Box>

      <Box sx={{ display: "grid", gap: 2, mt: 2, gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" } }}>
        <Card>
          <CardHeader title="Last 14 days" subheader="Hours you logged per day" slotProps={{ title: { variant: "h6" } }} />
          <CardContent sx={{ pt: 0 }}>
            {chart && (
              <BarChart
                height={280}
                xAxis={[{ scaleType: "band", data: chart.days, valueFormatter: (d) => formatShortDate(d) }]}
                yAxis={[{ min: 0, max: Math.max(data.dailyLimit, 8) }]}
                series={[
                  { label: "Approved", stack: "h", color: "#22c55e", data: chart.days.map((d) => chart.totals[d].approved) },
                  { label: "Pending", stack: "h", color: "#f59e0b", data: chart.days.map((d) => chart.totals[d].pending) },
                  { label: "Rejected", stack: "h", color: "#ef4444", data: chart.days.map((d) => chart.totals[d].rejected) },
                ]}
                margin={{ left: 0, right: 10 }}
                borderRadius={4}
              />
            )}
          </CardContent>
        </Card>

        <Stack spacing={2}>
          <StatCard
            label="Waiting for approval"
            value={data.pendingCount}
            hint="With your manager or director"
            icon={<HourglassTopOutlinedIcon fontSize="small" />}
            color="warning"
            onClick={() => navigate("/employee/entries?status=PendingManager")}
          />
          <StatCard
            label="Rejected"
            value={data.rejectedCount}
            hint="Need your fix"
            icon={<ReportProblemOutlinedIcon fontSize="small" />}
            color="error"
            onClick={() => navigate("/employee/entries?status=Rejected")}
          />
        </Stack>
      </Box>

      <Card sx={{ mt: 2 }}>
        <CardHeader
          title="Recent entries"
          slotProps={{ title: { variant: "h6" } }}
          action={
            <Button size="small" onClick={() => navigate("/employee/entries")}>
              View all
            </Button>
          }
        />
        {recent?.items.length === 0 ? (
          <EmptyState title="No hours logged yet" message="Your entries will show up here." />
        ) : (
          <List disablePadding>
            {recent?.items.map((entry) => (
              <ListItem
                key={entry.id}
                divider
                secondaryAction={
                  <EntryActions entry={entry} onEdit={openEdit} onCancel={openCancel} onHistory={openHistory} />
                }
                sx={{ pr: 18 }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                      <Typography fontWeight={600}>{formatHours(entry.hours)}</Typography>
                      <Typography color="text.secondary">on {entry.projectCode}</Typography>
                      <StatusChip value={entry.status} />
                    </Stack>
                  }
                  secondary={`${formatWeekday(entry.workDate)} · ${entry.notes || "No notes"}`}
                  slotProps={{ secondary: { noWrap: true } }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Card>

      {dialogs}
    </Box>
  );
}

export default EmployeeDashboard;
