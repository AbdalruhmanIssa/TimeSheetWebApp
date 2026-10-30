import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import useAuthStore from "../../../store/useAuthStore";
import { useReviewerDashboard } from "../../../hooks/dashboardHooks/useDashboards";
import { usePendingReviews } from "../../../hooks/approvalHooks/useApprovals";
import { useProjects } from "../../../hooks/projectHooks/useProjects";
import { usePortfolio } from "../../../hooks/reportHooks/useReports";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";
import StatusChip from "../../../components/common/StatusChip";
import PortfolioTable from "../../../components/reports/PortfolioTable";
import { DashboardLoadingState, EmptyState, ErrorState } from "../../../components/requestStates/RequestStates";
import { formatHours, formatWeekday, timeAgo } from "../../../utils/format";

function BudgetHealth({ alerts, activeProjectCount }) {
  const rows = [
    { label: "Exceeded", value: alerts.exceededCount, color: "error.main", hint: "Approved hours over budget" },
    { label: "Projected to exceed", value: alerts.projectedToExceedCount, color: "warning.main", hint: "Would go over if pending is approved" },
    { label: "Near limit", value: alerts.nearLimitCount, color: "info.main", hint: "80–100% of budget used" },
  ];
  const clean = rows.every((r) => r.value === 0);

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title="Budget health" subheader={`${activeProjectCount} active projects`} slotProps={{ title: { variant: "h6" } }} />
      <CardContent sx={{ pt: 0 }}>
        {clean ? (
          <EmptyState
            icon={<TaskAltIcon sx={{ fontSize: 40, color: "success.main" }} />}
            title="All budgets on track"
            message="No project is near, over, or projected over its budget."
          />
        ) : (
          <Stack spacing={2}>
            {rows.map((row) => (
              <Stack key={row.label} direction="row" alignItems="center" spacing={2}>
                <Box sx={{ width: 10, height: 36, borderRadius: 1, bgcolor: row.color, opacity: row.value ? 1 : 0.25 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>{row.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.hint}
                  </Typography>
                </Box>
                <Typography variant="h5" color={row.value ? row.color : "text.secondary"}>
                  {row.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function PendingPreview({ area }) {
  const navigate = useNavigate();
  const { data } = usePendingReviews(area, { page: 1, pageSize: 5 });
  const approvals = `/${area.toLowerCase()}/approvals`;

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        title="Waiting for you"
        slotProps={{ title: { variant: "h6" } }}
        action={
          <Button size="small" onClick={() => navigate(approvals)}>
            Open queue
          </Button>
        }
      />
      {data?.items.length === 0 ? (
        <EmptyState
          icon={<TaskAltIcon sx={{ fontSize: 40, color: "success.main" }} />}
          title="All caught up"
          message="Nothing to review right now."
        />
      ) : (
        <List disablePadding>
          {data?.items.map((entry) => (
            <ListItemButton key={entry.id} divider onClick={() => navigate(approvals)}>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                    <Typography fontWeight={600}>{entry.employeeName}</Typography>
                    <Typography color="text.secondary">
                      {formatHours(entry.hours)} on {entry.projectCode}
                    </Typography>
                    {entry.budgetImpact?.wouldExceedBudget && <StatusChip type="budget" value="Exceeded" />}
                  </Stack>
                }
                secondary={`${formatWeekday(entry.workDate)} · submitted ${timeAgo(entry.submittedAt)}`}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Card>
  );
}

function DirectorProjects() {
  const navigate = useNavigate();
  const { data } = usePortfolio({ page: 1, pageSize: 5 });
  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader
        title="Projects needing attention"
        subheader="Worst budget health first"
        slotProps={{ title: { variant: "h6" } }}
        action={
          <Button size="small" onClick={() => navigate("/director/portfolio")}>
            Full portfolio
          </Button>
        }
      />
      {data?.items.length ? <PortfolioTable items={data.items} compact /> : <EmptyState title="No projects yet" />}
    </Card>
  );
}

function ManagerProjects() {
  const navigate = useNavigate();
  const { data } = useProjects("Manager", { status: "Active", page: 1, pageSize: 6 });
  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader
        title="My active projects"
        slotProps={{ title: { variant: "h6" } }}
        action={
          <Button size="small" onClick={() => navigate("/manager/projects")}>
            All projects
          </Button>
        }
      />
      {data?.items.length === 0 ? (
        <EmptyState title="No active projects" />
      ) : (
        <Box sx={{ display: "grid", gap: 2, p: 2, pt: 0, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" } }}>
          {data?.items.map((project) => (
            <Card key={project.id} sx={{ bgcolor: "background.default" }}>
              <ListItemButton onClick={() => navigate(`/manager/projects/${project.id}`)} sx={{ display: "block", p: 2 }}>
                <Typography variant="caption" color="primary.main" fontWeight={600}>
                  {project.code}
                </Typography>
                <Typography fontWeight={600} noWrap>
                  {project.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {project.clientName} · {project.activeEmployeeCount} people · {formatHours(project.budgetHours)} budget
                </Typography>
              </ListItemButton>
            </Card>
          ))}
        </Box>
      )}
    </Card>
  );
}

// area: "Manager" or "Director"
function ReviewerDashboard({ area }) {
  const navigate = useNavigate();
  const isDirector = area === "Director";
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError, error, refetch } = useReviewerDashboard(area);

  if (isLoading) return <DashboardLoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const pending = data.pendingReview;

  return (
    <Box>
      <PageHeader
        eyebrow={`${area} dashboard`}
        title={`Hello, ${user.fullName.split(" ")[0]}`}
        subtitle={
          pending.count
            ? `${pending.count} ${pending.count === 1 ? "entry is" : "entries are"} waiting for your ${isDirector ? "final" : "first"} approval.`
            : "Your review queue is empty."
        }
        actions={
          <Button variant="contained" startIcon={<FactCheckOutlinedIcon />} onClick={() => navigate(`/${area.toLowerCase()}/approvals`)}>
            Review entries
          </Button>
        }
      />

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: `repeat(${isDirector ? 4 : 3}, 1fr)` } }}>
        <StatCard
          label="Pending review"
          value={pending.count}
          hint={`${formatHours(pending.hours)} in total`}
          icon={<FactCheckOutlinedIcon fontSize="small" />}
          color="warning"
          onClick={() => navigate(`/${area.toLowerCase()}/approvals`)}
        />
        <StatCard
          label="Oldest in queue"
          value={pending.oldestSubmittedAt ? timeAgo(pending.oldestSubmittedAt) : "—"}
          hint="Submitted"
          icon={<ScheduleOutlinedIcon fontSize="small" />}
          color="info"
        />
        <StatCard
          label="Active projects"
          value={data.activeProjectCount}
          hint={isDirector ? "You direct" : "You manage"}
          icon={<FolderOutlinedIcon fontSize="small" />}
          color="secondary"
          onClick={() => navigate(`/${area.toLowerCase()}/projects`)}
        />
        {isDirector && (
          <StatCard
            label="Approved this month"
            value={formatHours(data.approvedHoursThisMonth)}
            hint="Across your projects"
            icon={<TaskAltOutlinedIcon fontSize="small" />}
            color="success"
          />
        )}
      </Box>

      <Box sx={{ display: "grid", gap: 2, mt: 2, gridTemplateColumns: { xs: "1fr", lg: "3fr 2fr" } }}>
        <PendingPreview area={area} />
        <BudgetHealth alerts={data.budgetAlerts} activeProjectCount={data.activeProjectCount} />
      </Box>

      {isDirector ? <DirectorProjects /> : <ManagerProjects />}
    </Box>
  );
}

export default ReviewerDashboard;
