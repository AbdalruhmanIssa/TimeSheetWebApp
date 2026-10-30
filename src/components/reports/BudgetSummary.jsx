import { Alert, Box, Card, CardContent, Stack, Tooltip, Typography } from "@mui/material";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import StatusChip from "../common/StatusChip";
import { formatHours, formatPercent } from "../../utils/format";
import { BUDGET_STATUS } from "../../utils/constants";

const segmentColors = {
  actual: "#22c55e",
  pendingDirector: "#38bdf8",
  pendingManager: "#f59e0b",
};

// one bar = the budget; approved, then pending-director, then pending-manager hours fill it from the left
function BudgetBreakdownBar({ summary }) {
  const total = Math.max(
    summary.budgetHours,
    summary.actualHours + summary.pendingDirectorHours + summary.pendingManagerHours,
  );
  const segments = [
    { key: "actual", label: "Approved", value: summary.actualHours },
    { key: "pendingDirector", label: "Pending director", value: summary.pendingDirectorHours },
    { key: "pendingManager", label: "Pending manager", value: summary.pendingManagerHours },
  ];
  const budgetMark = total ? (summary.budgetHours / total) * 100 : 100;

  return (
    <Box>
      <Box sx={{ position: "relative", height: 18, borderRadius: 9, bgcolor: "action.hover", overflow: "hidden", display: "flex" }}>
        {segments.map((s) =>
          s.value > 0 ? (
            <Tooltip key={s.key} title={`${s.label}: ${formatHours(s.value)}`}>
              <Box sx={{ width: `${(s.value / total) * 100}%`, bgcolor: segmentColors[s.key] }} />
            </Tooltip>
          ) : null,
        )}
        {budgetMark < 100 && (
          <Box sx={{ position: "absolute", top: 0, bottom: 0, left: `${budgetMark}%`, width: 2, bgcolor: "error.main" }} />
        )}
      </Box>
      <Stack direction="row" spacing={2} sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 1 }}>
        {segments.map((s) => (
          <Stack key={s.key} direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: segmentColors[s.key] }} />
            <Typography variant="caption" color="text.secondary">
              {s.label} {formatHours(s.value)}
            </Typography>
          </Stack>
        ))}
        {budgetMark < 100 && (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 10, height: 2, bgcolor: "error.main" }} />
            <Typography variant="caption" color="text.secondary">
              Budget line
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

function Figure({ label, value, color }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" color={color} sx={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Typography>
    </Box>
  );
}

function BudgetSummary({ summary }) {
  const statusColor = BUDGET_STATUS[summary.budgetStatus]?.color ?? "primary";

  return (
    <Stack spacing={2}>
      {summary.budgetStatus === "Exceeded" ? (
        <Alert severity="error" variant="outlined">
          Over budget by {formatHours(summary.exceededBy)} of approved hours.
        </Alert>
      ) : (
        summary.isProjectedToExceed && (
          <Alert severity="warning" variant="outlined">
            Projected to exceed: approving everything pending would leave {formatHours(summary.projectedRemaining)}.
          </Alert>
        )
      )}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "280px 1fr" } }}>
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2" color="text.secondary">
              Budget used
            </Typography>
            <Gauge
              height={180}
              value={Math.min(summary.usagePercent, 100)}
              startAngle={-110}
              endAngle={110}
              innerRadius="75%"
              text={() => formatPercent(Math.round(summary.usagePercent))}
              sx={(theme) => ({
                [`& .${gaugeClasses.valueText}`]: { fontSize: 28, fontWeight: 700 },
                [`& .${gaugeClasses.valueArc}`]: { fill: theme.palette[statusColor].main },
                [`& .${gaugeClasses.referenceArc}`]: { fill: theme.palette.action.hover },
              })}
            />
            <StatusChip type="budget" value={summary.budgetStatus} size="medium" />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, mb: 3 }}>
              <Figure label="Budget" value={formatHours(summary.budgetHours)} />
              <Figure label="Approved (actual)" value={formatHours(summary.actualHours)} color="success.main" />
              <Figure
                label="Remaining"
                value={formatHours(summary.remainingHours)}
                color={summary.remainingHours < 0 ? "error.main" : undefined}
              />
              <Figure label="Pending manager" value={formatHours(summary.pendingManagerHours)} color="warning.main" />
              <Figure label="Pending director" value={formatHours(summary.pendingDirectorHours)} color="info.main" />
              <Figure
                label="Projected remaining"
                value={formatHours(summary.projectedRemaining)}
                color={summary.isProjectedToExceed ? "error.main" : undefined}
              />
            </Box>
            <BudgetBreakdownBar summary={summary} />
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}

export default BudgetSummary;
