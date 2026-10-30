import { keepPreviousData } from "@tanstack/react-query";
import useFetch from "../generalHooks/useFetch";
import { usePost } from "../generalHooks/useApiMutation";
import { POLL_INTERVAL } from "../../utils/constants";

// area is "Manager" or "Director"; both share the same approval endpoints
const areaKey = (area) => area.toLowerCase();

export function usePendingReviews(area, params) {
  return useFetch(`${area}/TimeEntries/pending`, [areaKey(area), "pending", params], {
    params,
    refetchInterval: POLL_INTERVAL,
    placeholderData: keepPreviousData,
  });
}

export function useApproveEntry(area, options = {}) {
  return usePost(null, { invalidate: [[areaKey(area)]], successMessage: "Entry approved", ...options });
}

export function useRejectEntry(area, options = {}) {
  return usePost(null, {
    invalidate: [[areaKey(area)]],
    toastError: false,
    successMessage: "Entry rejected and sent back to the employee",
    ...options,
  });
}

// director only: Approved → Rejected
export function useReopenEntry(options = {}) {
  return usePost(null, {
    invalidate: [["director"]],
    toastError: false,
    successMessage: "Entry reopened",
    ...options,
  });
}

export function useBulkApprove(area, options = {}) {
  return usePost(`${area}/TimeEntries/bulk-approve`, { invalidate: [[areaKey(area)]], ...options });
}
