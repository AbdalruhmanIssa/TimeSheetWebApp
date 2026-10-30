import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import PageHeader from "../../../components/common/PageHeader";
import StatusChip from "../../../components/common/StatusChip";
import TablePager from "../../../components/common/TablePager";
import EntryActions from "../../../components/timeEntries/EntryActions";
import useEntryDialogs from "../../../components/timeEntries/useEntryDialogs";
import { EmptyState, ErrorState, LoadingState } from "../../../components/requestStates/RequestStates";
import { useEmployeeDashboard, useMyEntries, useMyProjects } from "../../../hooks/employeeHooks/useEmployee";
import { DEFAULT_PAGE_SIZE, ENTRY_STATUS } from "../../../utils/constants";
import { formatDateTime, formatHours, formatWeekday } from "../../../utils/format";

const FILTER_KEYS = ["status", "projectId", "from", "to"];

function MyEntries() {
  // filters live in the url so the dashboard can link to e.g. ?status=Rejected
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? ""]));
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE);

  const { data: dashboard } = useEmployeeDashboard();
  const { data: projects = [] } = useMyProjects();
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useMyEntries({ ...filters, page, pageSize });
  const { dialogs, openNew, openEdit, openHistory, openCancel } = useEntryDialogs({
    today: dashboard?.today,
    remainingToday: dashboard?.remainingToday,
  });

  const update = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in changes)) next.delete("page"); // a new filter starts again at page 1
    setSearchParams(next, { replace: true });
  };

  const hasFilters = FILTER_KEYS.some((key) => filters[key]);

  return (
    <Box>
      <PageHeader
        title="My time"
        subtitle="Everything you've logged. Fix rejected entries and they go back to your manager."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
            Log hours
          </Button>
        }
      />

      <Card>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <TextField
            select
            label="Status"
            value={filters.status}
            onChange={(e) => update({ status: e.target.value })}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {Object.entries(ENTRY_STATUS).map(([value, meta]) => (
              <MenuItem key={value} value={value}>
                {meta.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Project"
            value={filters.projectId}
            onChange={(e) => update({ projectId: e.target.value })}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">All projects</MenuItem>
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.code} — {p.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="From"
            type="date"
            value={filters.from}
            onChange={(e) => update({ from: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="To"
            type="date"
            value={filters.to}
            onChange={(e) => update({ to: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          {hasFilters && (
            <Button
              color="inherit"
              startIcon={<FilterAltOffOutlinedIcon />}
              onClick={() => update({ status: "", projectId: "", from: "", to: "" })}
            >
              Clear
            </Button>
          )}
        </Stack>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <Box sx={{ p: 2 }}>
            <ErrorState error={error} onRetry={refetch} />
          </Box>
        ) : data.items.length === 0 ? (
          <EmptyState
            title={hasFilters ? "No entries match these filters" : "No hours logged yet"}
            message={hasFilters ? "Try a different status or date range." : "Log your first hours to send them for approval."}
            action={
              !hasFilters && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
                  Log hours
                </Button>
              )
            }
          />
        ) : (
          <>
            <TableContainer sx={{ opacity: isPlaceholderData ? 0.6 : 1, transition: "opacity .2s" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{formatWeekday(entry.workDate)}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography variant="body2" fontWeight={600}>
                          {entry.projectCode}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entry.projectName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatHours(entry.hours)}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={`Submitted ${formatDateTime(entry.submittedAt)}`}>
                          <span>
                            <StatusChip value={entry.status} />
                          </span>
                        </Tooltip>
                        {entry.status === "Rejected" && entry.rejectionComment && (
                          <Typography variant="caption" color="error.main" sx={{ display: "block", mt: 0.5, maxWidth: 260 }}>
                            {entry.rejectedAtLevel}: “{entry.rejectionComment}”
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 0, width: "30%" }}>
                        <Typography variant="body2" color="text.secondary" noWrap title={entry.notes ?? ""}>
                          {entry.notes || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <EntryActions entry={entry} onEdit={openEdit} onCancel={openCancel} onHistory={openHistory} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePager
              data={data}
              page={page}
              pageSize={pageSize}
              onPageChange={(p) => update({ page: String(p) })}
              onPageSizeChange={(size) => update({ pageSize: String(size) })}
            />
          </>
        )}
      </Card>

      {dialogs}
    </Box>
  );
}

export default MyEntries;
