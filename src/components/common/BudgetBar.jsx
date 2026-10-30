import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { BUDGET_STATUS } from "../../utils/constants";
import { formatPercent } from "../../utils/format";

// usage of the approved hours against the budget; the bar caps at 100 but the label shows the real %
function BudgetBar({ usagePercent, budgetStatus, showLabel = true, height = 8 }) {
  const color = BUDGET_STATUS[budgetStatus]?.color ?? "primary";
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 120 }}>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(Number(usagePercent) || 0, 100)}
          color={color}
          sx={{ height, borderRadius: height }}
        />
      </Box>
      {showLabel && (
        <Typography
          variant="caption"
          sx={{ minWidth: 44, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
          color={`${color}.main`}
          fontWeight={600}
        >
          {formatPercent(Math.round(usagePercent))}
        </Typography>
      )}
    </Stack>
  );
}

export default BudgetBar;
