import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../store/useAuthStore";
import useRecentApprovalsStore from "../../store/useRecentApprovalsStore";

// the API has no logout endpoint: dropping the token ends the session on this device
export default function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useCallback(() => {
    logout();
    useRecentApprovalsStore.getState().clear();
    queryClient.clear();
    navigate("/auth/login", { replace: true });
  }, [logout, queryClient, navigate]);
}
