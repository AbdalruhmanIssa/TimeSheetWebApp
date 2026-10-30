import { Stack, Tooltip, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { formatHours } from "../../utils/format";

// director queue: what approving this entry does to the project budget
function BudgetImpact({ impact }) {
  if (!impact) return null;

  const detail = `Budget ${formatHours(impact.budgetHours)} · approved so far ${formatHours(impact.actualHours)}`;

  if (impact.wouldExceedBudget) {
    return (
      <Tooltip title={detail}>
        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
          <WarningAmberIcon color="error" sx={{ fontSize: 14 }} />
          <Typography variant="caption" color="error.main" fontWeight={600} noWrap>
            {formatHours(impact.exceedsBudgetBy)} over
          </Typography>
        </Stack>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={detail}>
      <Typography variant="caption" color="text.secondary" noWrap>
        {formatHours(impact.remainingAfterApproval)} left after
      </Typography>
    </Tooltip>
  );
}

export default BudgetImpact;
