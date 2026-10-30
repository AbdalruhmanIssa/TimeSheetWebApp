import {
  Box,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useDailyReport } from "../../hooks/reportHooks/useReports";
import { EmptyState, ErrorState, LoadingState } from "../requestStates/RequestStates";
import { formatDate, formatHours, formatShortDate } from "../../utils/format";

function periodLabel(row, groupBy) {
  if (groupBy === "Month") return formatDate(row.periodStart, { month: "long", year: "numeric" });
  if (groupBy === "Week") return `${formatShortDate(row.periodStart)} – ${formatShortDate(row.periodEnd)}`;
  return formatDate(row.periodStart, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

// opening balance, then one row per day / week / month that has approved hours, then the closing balance
function DailyReport({ area, projectId, filters }) {
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useDailyReport(area, projectId, filters);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const remainingAt = (balance) => data.budgetHours - balance;

  return (
    <Stack spacing={2} sx={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" } }}>
        {[
          ["Opening balance", data.openingBalance, `Approved before ${formatDate(data.from)}`],
          ["Hours in period", data.periodHours, `${formatDate(data.from)} – ${formatDate(data.to)}`],
          ["Closing balance", data.closingBalance, `${formatHours(remainingAt(data.closingBalance))} of budget left`],
        ].map(([label, value, hint]) => (
          <Card key={label}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="h6">{formatHours(value)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {hint}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {data.rows.length === 0 ? (
        <Card>
          <EmptyState title="No approved hours in this period" message="Only days with approved hours are listed." />
        </Card>
      ) : (
        <>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600}>
                Running total against budget
              </Typography>
              <LineChart
                height={300}
                xAxis={[
                  {
                    scaleType: "point",
                    data: data.rows.map((r) => r.periodStart),
                    valueFormatter: (d) => formatShortDate(d),
                  },
                ]}
                series={[
                  {
                    label: "Approved (running total)",
                    data: data.rows.map((r) => r.runningTotal),
                    area: true,
                    color: "#4f8cff",
                    showMark: data.rows.length < 40,
                    valueFormatter: (v) => formatHours(v),
                  },
                  {
                    label: "Budget",
                    data: data.rows.map(() => data.budgetHours),
                    color: "#ef4444",
                    showMark: false,
                    valueFormatter: (v) => formatHours(v),
                  },
                ]}
                yAxis={[{ min: 0 }]}
                margin={{ left: 10, right: 20 }}
                sx={{ "& .MuiAreaElement-root": { fillOpacity: 0.15 } }}
              />
            </CardContent>
          </Card>

          <Card>
            <TableContainer sx={{ maxHeight: 520 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell align="right">Running total</TableCell>
                    <TableCell align="right">Remaining</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ "& td": { color: "text.secondary", fontStyle: "italic" } }}>
                    <TableCell>Opening balance</TableCell>
                    <TableCell align="right">—</TableCell>
                    <TableCell align="right">{formatHours(data.openingBalance)}</TableCell>
                    <TableCell align="right">{formatHours(remainingAt(data.openingBalance))}</TableCell>
                  </TableRow>
                  {data.rows.map((row) => (
                    <TableRow key={row.periodStart} hover>
                      <TableCell>{periodLabel(row, data.groupBy)}</TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatHours(row.hours)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatHours(row.runningTotal)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontVariantNumeric: "tabular-nums", color: row.remaining < 0 ? "error.main" : undefined }}
                      >
                        {formatHours(row.remaining)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}
    </Stack>
  );
}

export default DailyReport;
