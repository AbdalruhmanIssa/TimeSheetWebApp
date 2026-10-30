import { keepPreviousData } from "@tanstack/react-query";
import useFetch from "../generalHooks/useFetch";
import { usePatch, usePost, usePut, useDelete } from "../generalHooks/useApiMutation";

const invalidate = [["director", "clients"]];

export function useClients(params) {
  return useFetch("Director/Clients", ["director", "clients", params], {
    params,
    placeholderData: keepPreviousData,
  });
}

export function useCreateClient(options = {}) {
  return usePost("Director/Clients", {
    invalidate,
    toastError: false,
    successMessage: "Client created",
    ...options,
  });
}

export function useUpdateClient(options = {}) {
  return usePut(null, { invalidate, toastError: false, successMessage: "Client updated", ...options });
}

// clients are never deleted: DELETE soft-disables, PATCH activate brings them back
export function useDeactivateClient(options = {}) {
  return useDelete(null, { invalidate, successMessage: "Client deactivated", ...options });
}

export function useActivateClient(options = {}) {
  return usePatch(null, { invalidate, successMessage: "Client activated", ...options });
}
