// The API answers every error as { success: false, message }.
export function getErrorMessage(error, fallback = "Something went wrong.") {
  if (!error) return fallback;
  if (!error.response) {
    return error.code === "ERR_NETWORK"
      ? "Can't reach the server. Is the API running?"
      : error.message || fallback;
  }
  const data = error.response.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.errors) return Object.values(data.errors)[0]?.[0] || fallback;
  if (error.response.status === 403) return "You don't have permission to do that.";
  if (error.response.status === 404) return "Not found.";
  return fallback;
}
