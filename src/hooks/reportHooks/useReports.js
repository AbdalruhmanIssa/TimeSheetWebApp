import { keepPreviousData } from "@tanstack/react-query";
import useFetch from "../generalHooks/useFetch";

// area is "Manager" or "Director"; reports are scoped to the caller's own projects
const areaKey = (area) => area.toLowerCase();

export function useProjectSummary(area, id) {
  return useFetch(`${area}/Reports/projects/${id}/summary`, [areaKey(area), "report", "summary", id], {
    enabled: !!id,
  });
}

export function useDailyReport(area, id, params) {
  return useFetch(`${area}/Reports/projects/${id}/daily`, [areaKey(area), "report", "daily", id, params], {
    params,
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
}

export function useEmployeeBreakdown(area, id, params) {
  return useFetch(
    `${area}/Reports/projects/${id}/employees`,
    [areaKey(area), "report", "employees", id, params],
    { params, enabled: !!id, placeholderData: keepPreviousData },
  );
}

// director only: every project, Exceeded / projected-to-exceed first
export function usePortfolio(params) {
  return useFetch("Director/Reports/portfolio", ["director", "portfolio", params], {
    params,
    placeholderData: keepPreviousData,
  });
}
