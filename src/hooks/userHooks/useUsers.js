import { keepPreviousData, useQueries } from "@tanstack/react-query";
import axiosInstance from "../../Api/axiosInstance";
import useFetch from "../generalHooks/useFetch";
import { useDelete, usePatch, usePost, usePut } from "../generalHooks/useApiMutation";
import { ROLE_LIST } from "../../utils/constants";

const invalidate = [["admin"]];

export function useUsers(params) {
  return useFetch("Admin/Users", ["admin", "users", params], {
    params,
    placeholderData: keepPreviousData,
  });
}

// admin dashboard: one tiny paged request per role, read only totalCount
export function useUserCounts() {
  const filters = [...ROLE_LIST.map((role) => ({ role })), { isBlocked: true }];

  const results = useQueries({
    queries: filters.map((filter) => ({
      queryKey: ["admin", "users", "count", filter],
      queryFn: async () => {
        const response = await axiosInstance.get("Admin/Users", { params: { ...filter, pageSize: 1 } });
        return response.data.totalCount;
      },
    })),
  });

  const counts = Object.fromEntries(ROLE_LIST.map((role, i) => [role, results[i].data ?? 0]));
  return {
    counts,
    blocked: results.at(-1).data ?? 0,
    total: ROLE_LIST.reduce((sum, role) => sum + counts[role], 0),
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
    error: results.find((r) => r.error)?.error,
  };
}

export function useCreateUser(options = {}) {
  return usePost("Admin/Users", {
    invalidate,
    toastError: false,
    successMessage: (user) => `${user.fullName} created`,
    ...options,
  });
}

export function useUpdateUser(options = {}) {
  return usePut(null, { invalidate, toastError: false, successMessage: "User updated", ...options });
}

export function useChangeRole(options = {}) {
  return usePatch(null, {
    invalidate,
    toastError: false,
    successMessage: (user) => `${user.fullName} is now ${user.role}`,
    ...options,
  });
}

export function useResetPassword(options = {}) {
  return usePatch(null, { toastError: false, successMessage: "Password reset", ...options });
}

export function useSetBlocked(options = {}) {
  return usePatch(null, {
    invalidate,
    successMessage: (user) => `${user.fullName} ${user.isBlocked ? "blocked" : "unblocked"}`,
    ...options,
  });
}

export function useDeleteUser(options = {}) {
  return useDelete(null, { invalidate, successMessage: "User deleted", ...options });
}

// director: dropdown of managers / employees for the project form and team
export function useUserOptions(role) {
  return useFetch("Director/Users", ["director", "user-options", role], {
    params: { role },
    staleTime: 60_000,
  });
}
