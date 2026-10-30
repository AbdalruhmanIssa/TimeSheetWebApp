import { keepPreviousData } from "@tanstack/react-query";
import useFetch from "../generalHooks/useFetch";
import { useDelete, usePatch, usePost, usePut } from "../generalHooks/useApiMutation";

// area is "Manager" or "Director": both list and open projects in their own scope
const areaKey = (area) => area.toLowerCase();
const invalidate = [["director"]];

export function useProjects(area, params) {
  return useFetch(`${area}/Projects`, [areaKey(area), "projects", params], {
    params,
    placeholderData: keepPreviousData,
  });
}

export function useProject(area, id) {
  return useFetch(`${area}/Projects/${id}`, [areaKey(area), "project", id], { enabled: !!id });
}

export function useCreateProject(options = {}) {
  return usePost("Director/Projects", {
    invalidate,
    toastError: false,
    successMessage: (project) => `Project ${project.code} created`,
    ...options,
  });
}

export function useUpdateProject(options = {}) {
  return usePut(null, { invalidate, toastError: false, successMessage: "Project updated", ...options });
}

export function useChangeProjectStatus(options = {}) {
  return usePatch(null, {
    invalidate,
    successMessage: (project) => `Project is now ${project.status}`,
    ...options,
  });
}

export function useAssignEmployees(options = {}) {
  return usePost(null, { invalidate, toastError: false, successMessage: "Team updated", ...options });
}

export function useRemoveEmployee(options = {}) {
  return useDelete(null, { invalidate, successMessage: "Employee removed from the project", ...options });
}
