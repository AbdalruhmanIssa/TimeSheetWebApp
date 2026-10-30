import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../Api/axiosInstance";
import { cleanParams } from "../../utils/query";

// options can carry `params` (query string) plus any react-query option
export default function useFetch(url, queryKey, options = {}) {
  const { params, ...queryOptions } = options;

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await axiosInstance.get(url, { params: cleanParams(params) });
      return response.data;
    },
    ...queryOptions,
  });
}
