import { create } from "zustand";
import { readSession, saveSession, clearSession } from "../utils/session";

// the logged-in user comes from the JWT claims (Id, Name, FullName, Email, Role)
const useAuthStore = create((set) => ({
  ...readSession(),

  login: (token) => {
    set(saveSession(token));
  },

  logout: () => {
    clearSession();
    set({ token: null, user: null });
  },
}));

export default useAuthStore;
