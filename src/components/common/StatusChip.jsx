import { Chip } from "@mui/material";
import { BUDGET_STATUS, ENTRY_STATUS, PROJECT_STATUS, REVIEW_DECISION } from "../../utils/constants";

const maps = {
  entry: ENTRY_STATUS,
  project: PROJECT_STATUS,
  budget: BUDGET_STATUS,
  decision: REVIEW_DECISION,
};

function StatusChip({ type = "entry", value, size = "small" }) {
  const meta = maps[type]?.[value] ?? { label: value, color: "default" };
  return <Chip size={size} label={meta.label} color={meta.color} variant="outlined" />;
}

export default StatusChip;
