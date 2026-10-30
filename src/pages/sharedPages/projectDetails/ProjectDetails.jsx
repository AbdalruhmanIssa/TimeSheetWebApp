import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CheckIcon from "@mui/icons-material/Check";
import PageHeader from "../../../components/common/PageHeader";
import StatusChip from "../../../components/common/StatusChip";
import ProjectFormDialog from "../../../components/projects/ProjectFormDialog";
import TeamPanel from "../../../components/projects/TeamPanel";
import BudgetSummary from "../../../components/reports/BudgetSummary";
import DailyReport from "../../../components/reports/DailyReport";
import EmployeeBreakdown from "../../../components/reports/EmployeeBreakdown";
import ReportFilters from "../../../components/reports/ReportFilters";
import { ErrorState, LoadingState } from "../../../components/requestStates/RequestStates";
import { useChangeProjectStatus, useProject } from "../../../hooks/projectHooks/useProjects";
import { useProjectSummary } from "../../../hooks/reportHooks/useReports";
import useDownloadPDF from "../../../hooks/generalHooks/useDownloadPDF";
import { PROJECT_STATUS } from "../../../utils/constants";
import { formatDate, formatHours } from "../../../utils/format";

function InfoItem({ label, children }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} sx={{ overflowWrap: "anywhere" }}>
        {children}
      </Typography>
    </Box>
  );
}

function StatusMenu({ project }) {
  const [anchor, setAnchor] = useState(null);
  const { mutation } = useChangeProjectStatus({ onSuccess: () => setAnchor(null) });

  return (
    <>
      <Button variant="outlined" startIcon={<SwapHorizIcon />} onClick={(e) => setAnchor(e.currentTarget)} loading={mutation.isPending}>
        Change status
      </Button>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {Object.entries(PROJECT_STATUS).map(([value, meta]) => (
          <MenuItem
            key={value}
            disabled={value === project.status}
            onClick={() => mutation.mutate({ url: `Director/Projects/${project.id}/status`, data: { status: value } })}
          >
            <ListItemIcon>{value === project.status && <CheckIcon fontSize="small" />}</ListItemIcon>
            <ListItemText>{meta.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

const TABS = ["overview", "daily", "employees", "team"];

// area: "Manager" (read only + reports) or "Director" (edit, status, team)
function ProjectDetails({ area }) {
  const { id } = useParams();
  const isDirector = area === "Director";
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [filters, setFilters] = useState({ from: "", to: "", groupBy: "Day" });
  const download = useDownloadPDF();

  const { data: project, isLoading, isError, error, refetch } = useProject(area, id);
  const summary = useProjectSummary(area, id);

  if (isLoading) return <LoadingState />;
  if (isError) {
    return (
      <Box>
        <Button component={RouterLink} to=".." relative="path" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          Projects
        </Button>
        <ErrorState error={error} onRetry={refetch} title="Project not available" />
      </Box>
    );
  }

  const downloadPdf = () =>
    download.mutate({
      url: `${area}/Reports/projects/${id}/pdf`,
      params: filters,
      fileName: `${project.code}-report.pdf`,
    });

  return (
    <Box>
      <Link component={RouterLink} to=".." relative="path" underline="hover" color="text.secondary" variant="body2">
        ← Projects
      </Link>

      <Box sx={{ mt: 1 }}>
        <PageHeader
          eyebrow={project.code}
          title={
            <Stack direction="row" spacing={1.5} alignItems="center" component="span" sx={{ flexWrap: "wrap" }}>
              <span>{project.name}</span>
              <StatusChip type="project" value={project.status} />
            </Stack>
          }
          subtitle={project.description}
          actions={
            isDirector && (
              <>
                <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <StatusMenu project={project} />
              </>
            )
          }
        />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(6, 1fr)" } }}>
            <InfoItem label="Client">{project.clientName}</InfoItem>
            <InfoItem label="Manager">{project.managerName}</InfoItem>
            <InfoItem label="Director">{project.directorName}</InfoItem>
            <InfoItem label="Budget">
              {formatHours(project.budgetHours)}
              {project.isBudgetLocked && (
                <Typography component="span" variant="caption" color="text.secondary">
                  {" "}
                  · locked
                </Typography>
              )}
            </InfoItem>
            <InfoItem label="Start">{formatDate(project.startDate)}</InfoItem>
            <InfoItem label="End">{project.endDate ? formatDate(project.endDate) : "Open-ended"}</InfoItem>
          </Box>
        </CardContent>
      </Card>

      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ lg: "center" }}
        spacing={2}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" allowScrollButtonsMobile>
          <Tab value="overview" label="Budget" />
          <Tab value="daily" label="Balances" />
          <Tab value="employees" label="By employee" />
          <Tab value="team" label={`Team (${project.employees.filter((e) => e.isActive).length})`} />
        </Tabs>
        {(tab === "daily" || tab === "employees") && (
          <Box sx={{ pb: 1.5 }}>
            <ReportFilters filters={filters} onChange={setFilters} onDownload={downloadPdf} downloading={download.isPending} />
          </Box>
        )}
      </Stack>

      {tab === TABS[0] &&
        (summary.isLoading ? (
          <LoadingState />
        ) : summary.isError ? (
          <ErrorState error={summary.error} onRetry={summary.refetch} />
        ) : (
          <BudgetSummary summary={summary.data} />
        ))}
      {tab === TABS[1] && <DailyReport area={area} projectId={id} filters={filters} />}
      {tab === TABS[2] && <EmployeeBreakdown area={area} projectId={id} filters={filters} />}
      {tab === TABS[3] && <TeamPanel project={project} canEdit={isDirector} />}

      {isDirector && <ProjectFormDialog open={editing} project={project} onClose={() => setEditing(false)} />}
    </Box>
  );
}

export default ProjectDetails;
