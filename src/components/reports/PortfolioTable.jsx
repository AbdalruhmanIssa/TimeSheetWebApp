import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BudgetBar from "../common/BudgetBar";
import StatusChip from "../common/StatusChip";
import { formatHours } from "../../utils/format";

// director portfolio rows (ProjectSummaryReport); the API already sorts problem projects first
function PortfolioTable({ items, compact = false }) {
  const navigate = useNavigate();

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Project</TableCell>
            {!compact && <TableCell>Client</TableCell>}
            {!compact && <TableCell>Manager</TableCell>}
            <TableCell sx={{ minWidth: 180 }}>Budget used</TableCell>
            <TableCell align="right">Actual / Budget</TableCell>
            {!compact && <TableCell align="right">Pending</TableCell>}
            <TableCell align="right">Projected left</TableCell>
            <TableCell>Budget</TableCell>
            {!compact && <TableCell>Project</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((row) => (
            <TableRow
              key={row.projectId}
              hover
              onClick={() => navigate(`/director/projects/${row.projectId}`)}
              sx={{ cursor: "pointer" }}
            >
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {row.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.code}
                  {compact && ` · ${row.clientName}`}
                </Typography>
              </TableCell>
              {!compact && <TableCell>{row.clientName}</TableCell>}
              {!compact && <TableCell>{row.managerName}</TableCell>}
              <TableCell>
                <BudgetBar usagePercent={row.usagePercent} budgetStatus={row.budgetStatus} />
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                {formatHours(row.actualHours)} / {formatHours(row.budgetHours)}
              </TableCell>
              {!compact && (
                <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums", color: "warning.main" }}>
                  {formatHours(row.pendingManagerHours + row.pendingDirectorHours)}
                </TableCell>
              )}
              <TableCell
                align="right"
                sx={{
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                  color: row.isProjectedToExceed ? "error.main" : undefined,
                }}
              >
                {row.isProjectedToExceed && (
                  <Tooltip title="Approving everything pending would exceed the budget">
                    <TrendingUpIcon sx={{ fontSize: 16, verticalAlign: "text-bottom", mr: 0.5 }} />
                  </Tooltip>
                )}
                {formatHours(row.projectedRemaining)}
              </TableCell>
              <TableCell>
                <StatusChip type="budget" value={row.budgetStatus} />
              </TableCell>
              {!compact && (
                <TableCell>
                  <StatusChip type="project" value={row.projectStatus} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PortfolioTable;
