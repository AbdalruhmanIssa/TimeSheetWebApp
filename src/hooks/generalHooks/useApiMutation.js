import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../Api/axiosInstance";
import { getErrorMessage } from "../../utils/errors";

/**
 * One mutation hook for POST / PUT / PATCH / DELETE.
 * mutate(data) sends to the fixed url; mutate({ url, data }) sends to a url built per call (ids).
 *
 * options:
 *  - invalidate: query keys to refetch after success (e.g. [["employee"]])
 *  - successMessage: string or (response, variables) => string
 *  - onSuccess(response, variables)
 *  - toastError: false when the form shows `serverError` inline instead
 */
export default function useApiMutation(method, url, options = {}) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const dynamic = payload && typeof payload === "object" && "url" in payload;
      const response = await axiosInstance.request({
        method,
        url: dynamic ? payload.url : url,
        data: dynamic ? payload.data : payload,
      });
      return response.data;
    },

    onMutate: () => setServerError(""),

    onSuccess: (response, variables) => {
      // refetch in the background; the buttons don't wait for every list to reload
      (options.invalidate ?? []).forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      const message =
        typeof options.successMessage === "function"
          ? options.successMessage(response, variables)
          : options.successMessage;
      if (message) toast.success(message);
      options.onSuccess?.(response, variables);
    },

    onError: (error) => {
      const message = getErrorMessage(error);
      setServerError(message);
      if (options.toastError !== false) toast.error(message);
    },
  });

  return { mutation, serverError, setServerError };
}

export const usePost = (url, options) => useApiMutation("post", url, options);
export const usePut = (url, options) => useApiMutation("put", url, options);
export const usePatch = (url, options) => useApiMutation("patch", url, options);
export const useDelete = (url, options) => useApiMutation("delete", url, options);
