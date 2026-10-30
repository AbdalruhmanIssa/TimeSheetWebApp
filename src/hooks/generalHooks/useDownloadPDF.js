import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosInstance from "../../Api/axiosInstance";
import { cleanParams } from "../../utils/query";

async function blobErrorMessage(error) {
  // with responseType "blob" the JSON error body arrives as a Blob
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text()).message;
    } catch {
      /* not JSON */
    }
  }
  return null;
}

export default function useDownloadPDF() {
  return useMutation({
    mutationFn: async ({ url, params }) => {
      const response = await axiosInstance.get(url, {
        params: cleanParams(params),
        responseType: "blob",
      });
      return response.data;
    },

    onSuccess: (blob, { fileName }) => {
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(href);
      toast.success("PDF downloaded");
    },

    onError: async (error) => {
      toast.error((await blobErrorMessage(error)) || "Failed to download the PDF");
    },
  });
}
