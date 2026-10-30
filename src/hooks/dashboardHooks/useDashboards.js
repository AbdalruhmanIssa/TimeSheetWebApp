import useFetch from "../generalHooks/useFetch";
import { POLL_INTERVAL } from "../../utils/constants";

// Manager / Director dashboards: pending queue, budget alerts. Polled so the counts stay fresh.
export function useReviewerDashboard(area, options = {}) {
  return useFetch(`${area}/Dashboards`, [area.toLowerCase(), "dashboard"], {
    refetchInterval: POLL_INTERVAL,
    ...options,
  });
}
