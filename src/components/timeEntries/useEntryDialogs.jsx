import { useState } from "react";
import { useCancelEntry } from "../../hooks/employeeHooks/useEmployee";
import TimeEntryFormDialog from "./TimeEntryFormDialog";
import EntryHistoryDialog from "./EntryHistoryDialog";
import ConfirmDialog from "../common/ConfirmDialog";
import { formatDate, formatHours } from "../../utils/format";

// the log / edit / cancel / history dialogs, shared by the employee dashboard and the My time page
export default function useEntryDialogs({ today, remainingToday }) {
  const [form, setForm] = useState({ open: false, entry: null });
  const [historyEntry, setHistoryEntry] = useState(null);
  const [cancelEntry, setCancelEntry] = useState(null);
  const { mutation: cancel } = useCancelEntry({ onSuccess: () => setCancelEntry(null) });

  const dialogs = (
    <>
      <TimeEntryFormDialog
        open={form.open}
        entry={form.entry}
        today={today}
        remainingToday={remainingToday}
        onClose={() => setForm({ open: false, entry: null })}
      />
      <EntryHistoryDialog entry={historyEntry} onClose={() => setHistoryEntry(null)} />
      <ConfirmDialog
        open={!!cancelEntry}
        title="Cancel this entry?"
        message={
          cancelEntry &&
          `${formatHours(cancelEntry.hours)} on ${cancelEntry.projectCode} for ${formatDate(cancelEntry.workDate)} will be withdrawn. You can log that day again afterwards.`
        }
        confirmLabel="Cancel entry"
        confirmColor="error"
        loading={cancel.isPending}
        onConfirm={() => cancel.mutate({ url: `Employee/TimeEntries/${cancelEntry.id}` })}
        onClose={() => setCancelEntry(null)}
      />
    </>
  );

  return {
    dialogs,
    openNew: () => setForm({ open: true, entry: null }),
    openEdit: (entry) => setForm({ open: true, entry }),
    openHistory: setHistoryEntry,
    openCancel: setCancelEntry,
  };
}
