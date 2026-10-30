import { keepPreviousData } from "@tanstack/react-query";
import useFetch from "../generalHooks/useFetch";
import { useDelete, usePost, usePut } from "../generalHooks/useApiMutation";
import { POLL_INTERVAL } from "../../utils/constants";

const invalidate = [["employee"]];

export function useEmployeeDashboard() {
  return useFetch("Employee/Dashboards", ["employee", "dashboard"], { refetchInterval: POLL_INTERVAL });
}

// dropdown: active projects the employee is assigned to
export function useMyProjects() {
  return useFetch("Employee/Projects", ["employee", "projects"]);
}

export function useMyEntries(params, options = {}) {
  return useFetch("Employee/TimeEntries", ["employee", "entries", params], {
    params,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useEntryHistory(id) {
  return useFetch(`Employee/TimeEntries/${id}/history`, ["employee", "history", id], { enabled: !!id });
}

export function useSubmitEntry(options = {}) {
  return usePost("Employee/TimeEntries", {
    invalidate,
    toastError: false,
    successMessage: "Hours submitted for approval",
    ...options,
  });
}

// editing a Rejected entry resubmits it to the manager
export function useUpdateEntry(options = {}) {
  return usePut(null, {
    invalidate,
    toastError: false,
    successMessage: (entry) =>
      entry.status === "PendingManager" ? "Entry saved and sent to your manager" : "Entry saved",
    ...options,
  });
}

export function useCancelEntry(options = {}) {
  return useDelete(null, { invalidate, successMessage: "Entry cancelled", ...options });
}
