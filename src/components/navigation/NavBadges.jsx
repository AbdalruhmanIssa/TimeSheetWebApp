import { Badge } from "@mui/material";
import { useReviewerDashboard } from "../../hooks/dashboardHooks/useDashboards";
import { useEmployeeDashboard } from "../../hooks/employeeHooks/useEmployee";

// these share the dashboard query (same key), so the badge costs no extra request
export function PendingBadge({ area }) {
  const { data } = useReviewerDashboard(area);
  return <Badge badgeContent={data?.pendingReview?.count ?? 0} color="warning" max={99} />;
}

export function RejectedBadge() {
  const { data } = useEmployeeDashboard();
  return <Badge badgeContent={data?.rejectedCount ?? 0} color="error" max={99} />;
}
