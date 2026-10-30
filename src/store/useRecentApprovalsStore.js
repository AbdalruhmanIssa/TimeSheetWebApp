import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const MAX_ITEMS = 25;

// The API has no "list approved entries" endpoint for directors, so the entries a director
// approves in this browser session are remembered here to offer Reopen on them.
const useRecentApprovalsStore = create(
  persist(
    (set) => ({
      entries: [],

      add: (approved) =>
        set((state) => {
          const ids = new Set(approved.map((e) => e.id));
          const stamped = approved.map((e) => ({ ...e, approvedAt: new Date().toISOString() }));
          return { entries: [...stamped, ...state.entries.filter((e) => !ids.has(e.id))].slice(0, MAX_ITEMS) };
        }),

      remove: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),

      clear: () => set({ entries: [] }),
    }),
    { name: "timesheet_recent_approvals", storage: createJSONStorage(() => sessionStorage) },
  ),
);

export default useRecentApprovalsStore;
