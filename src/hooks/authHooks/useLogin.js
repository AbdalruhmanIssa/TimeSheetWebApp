import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../store/useAuthStore";
import { usePost } from "../generalHooks/useApiMutation";
import { ROLE_HOME } from "../../utils/constants";

export default function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  // the API answers { token, expiresAtUtc }; the user (id, name, role) is read from the token claims
  const handleLoginSuccess = (response) => {
    queryClient.clear(); // never show the previous user's cached data
    login(response.token);
    const role = useAuthStore.getState().user?.role;
    navigate(ROLE_HOME[role] ?? "/", { replace: true });
  };

  return usePost("Identity/Auths/login", { toastError: false, onSuccess: handleLoginSuccess });
}
