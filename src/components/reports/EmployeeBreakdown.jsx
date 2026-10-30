import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { useEmployeeBreakdown } from "../../hooks/reportHooks/useReports";
import { EmptyState, ErrorState, LoadingState } from "../requestStates/RequestStates";
import { formatHours, formatPercent } from "../../utils/format";

const palette = ["#4f8cff", "#22c3a6", "#f59e0b", "#a78bfa", "#f472b6", "#38bdf8", "#84cc16", "#fb7185", "#facc15", "#2dd4bf"];

// approved hours and share per employee in the period, plus what each still has pending
function EmployeeBreakdown({ area, projectId, filters }) {
  const { data = [], isLoading, isError, error, refetch, isPlaceholderData } = useEmployeeBreakdown(area, projectId, filters);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (data.length === 0) {
    return (
      <Card>
        <EmptyState title="No hours in this period" message="Nobody has approved or pending hours on this project in the range." />
      </Card>
    );
  }

  const withHours = data.filter((row) => row.approvedHours > 0);

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", lg: "360px 1fr" },
        opacity: isPlaceholderData ? 0.6 : 1,
      }}
    >
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Share of approved hours
          </Typography>
          {withHours.length === 0 ? (
            <EmptyState title="No approved hours yet" />
          ) : (
            <PieChart
              height={300}
              colors={palette}
              series={[
                {
                  data: withHours.map((row, i) => ({ id: i, value: row.approvedHours, label: row.employeeName })),
                  innerRadius: 60,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  valueFormatter: (item) => formatHours(item.value),
                },
              ]}
              slotProps={{ legend: { direction: "horizontal", position: { vertical: "bottom", horizontal: "center" } } }}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell align="right">Approved</TableCell>
                <TableCell sx={{ width: "30%" }}>Share</TableCell>
                <TableCell align="right">Pending</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.employeeId} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} component="span">
                      {row.employeeName}
                    </Typography>
                    {!row.isActiveOnProject && <Chip label="Removed" size="small" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatHours(row.approvedHours)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Number(row.sharePercent)}
                        sx={{ flex: 1, height: 6, borderRadius: 6 }}
                      />
                      <Typography variant="caption" sx={{ minWidth: 40, textAlign: "right" }}>
                        {formatPercent(row.sharePercent)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums", color: "warning.main" }}>
                    {row.pendingHours ? formatHours(row.pendingHours) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

export default EmployeeBreakdown;
