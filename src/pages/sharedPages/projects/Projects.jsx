import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "../../../components/common/PageHeader";
import StatusChip from "../../../components/common/StatusChip";
import TablePager from "../../../components/common/TablePager";
import ProjectFormDialog from "../../../components/projects/ProjectFormDialog";
import { EmptyState, ErrorState, LoadingState } from "../../../components/requestStates/RequestStates";
import { useProjects } from "../../../hooks/projectHooks/useProjects";
import { useClients } from "../../../hooks/clientHooks/useClients";
import useDebounce from "../../../hooks/generalHooks/useDebounce";
import { DEFAULT_PAGE_SIZE, PROJECT_STATUS } from "../../../utils/constants";
import { formatDate, formatHours } from "../../../utils/format";

function ClientFilter({ value, onChange }) {
  const { data } = useClients({ page: 1, pageSize: 100, includeInactive: true });
  return (
    <TextField select label="Client" value={value} onChange={(e) => onChange(e.target.value)} sx={{ minWidth: 200 }}>
      <MenuItem value="">All clients</MenuItem>
      {(data?.items ?? []).map((client) => (
        <MenuItem key={client.id} value={client.id}>
          {client.name}
        </MenuItem>
      ))}
    </TextField>
  );
}

// area: "Manager" (projects I manage, read only) or "Director" (projects I direct, can create)
function Projects({ area }) {
  const isDirector = area === "Director";
  const base = `/${area.toLowerCase()}/projects`;
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [clientId, setClientId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [creating, setCreating] = useState(false);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useProjects(area, {
    search: debouncedSearch.trim(),
    status,
    clientId,
    page,
    pageSize,
  });

  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };
  const hasFilters = !!(search || status || clientId);

  return (
    <Box>
      <PageHeader
        title="Projects"
        subtitle={isDirector ? "Projects you direct: budgets, managers and teams." : "Projects you manage."}
        actions={
          isDirector && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
              New project
            </Button>
          )
        }
      />

      <Card>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <TextField
            placeholder="Search by code or name"
            value={search}
            onChange={(e) => resetPage(setSearch)(e.target.value)}
            sx={{ flex: 1, minWidth: 220 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField select label="Status" value={status} onChange={(e) => resetPage(setStatus)(e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="">All statuses</MenuItem>
            {Object.entries(PROJECT_STATUS).map(([value, meta]) => (
              <MenuItem key={value} value={value}>
                {meta.label}
              </MenuItem>
            ))}
          </TextField>
          {isDirector && <ClientFilter value={clientId} onChange={resetPage(setClientId)} />}
        </Stack>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <Box sx={{ p: 2 }}>
            <ErrorState error={error} onRetry={refetch} />
          </Box>
        ) : data.items.length === 0 ? (
          <EmptyState
            title={hasFilters ? "No projects match" : "No projects yet"}
            message={
              hasFilters
                ? "Try another search or status."
                : isDirector
                  ? "Create a project to give a manager and team hours to log."
                  : "A director hasn't assigned you a project yet."
            }
          />
        ) : (
          <>
            <TableContainer sx={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>{isDirector ? "Manager" : "Director"}</TableCell>
                    <TableCell align="right">Budget</TableCell>
                    <TableCell align="right">Team</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((project) => (
                    <TableRow
                      key={project.id}
                      hover
                      onClick={() => navigate(`${base}/${project.id}`)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {project.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.code}
                        </Typography>
                      </TableCell>
                      <TableCell>{project.clientName}</TableCell>
                      <TableCell>{isDirector ? project.managerName : project.directorName}</TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatHours(project.budgetHours)}
                      </TableCell>
                      <TableCell align="right">{project.activeEmployeeCount}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDate(project.startDate)} – {project.endDate ? formatDate(project.endDate) : "open"}
                      </TableCell>
                      <TableCell>
                        <StatusChip type="project" value={project.status} />
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
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </>
        )}
      </Card>

      {isDirector && (
        <ProjectFormDialog
          open={creating}
          onClose={() => setCreating(false)}
          onCreated={(project) => navigate(`${base}/${project.id}`)}
        />
      )}
    </Box>
  );
}

export default Projects;
