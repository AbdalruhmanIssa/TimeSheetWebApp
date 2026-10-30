import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { TimeEntrySchema } from "../../validations/schemas";
import { useMyProjects, useSubmitEntry, useUpdateEntry } from "../../hooks/employeeHooks/useEmployee";
import FormError from "../common/FormError";
import { formatHours } from "../../utils/format";

const emptyValues = (today) => ({ projectId: "", workDate: today ?? "", hours: "", notes: "" });

/**
 * Log new hours, or edit an entry that is still PendingManager or was Rejected.
 * `today` is the API's business date (from the employee dashboard), so the picker never allows a future day.
 */
function TimeEntryFormDialog({ open, onClose, entry, today, remainingToday }) {
  const isEdit = !!entry;
  const { data: projects = [] } = useMyProjects();
  const submit = useSubmitEntry({ onSuccess: onClose });
  const update = useUpdateEntry({ onSuccess: onClose });
  const { mutation, serverError, setServerError } = isEdit ? update : submit;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(TimeEntrySchema), defaultValues: emptyValues(today) });

  useEffect(() => {
    if (!open) return;
    setServerError("");
    reset(
      entry
        ? { projectId: entry.projectId, workDate: entry.workDate, hours: entry.hours, notes: entry.notes ?? "" }
        : emptyValues(today),
    );
  }, [open, entry, today, reset, setServerError]);

  // an entry may sit on a project the employee was since removed from; keep it selectable while editing
  const options =
    entry && !projects.some((p) => p.id === entry.projectId)
      ? [...projects, { id: entry.projectId, code: entry.projectCode, name: entry.projectName }]
      : projects;

  const workDate = useWatch({ control, name: "workDate" });

  const onSubmit = ({ projectId, workDate, hours, notes }) => {
    const data = { projectId, workDate, hours, notes: notes?.trim() || null };
    if (isEdit) mutation.mutate({ url: `Employee/TimeEntries/${entry.id}`, data });
    else mutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose}>
      <DialogTitle>{isEdit ? "Edit entry" : "Log hours"}</DialogTitle>
      <DialogContent>
        {entry?.status === "Rejected" && (
          <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
            Rejected by the {entry.rejectedAtLevel?.toLowerCase() ?? "reviewer"}
            {entry.rejectionComment ? `: “${entry.rejectionComment}”` : "."} Saving sends it back to your manager.
          </Alert>
        )}
        <FormError message={serverError} />

        <Stack component="form" id="time-entry-form" spacing={2.5} sx={{ pt: 1 }} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="projectId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Project"
                fullWidth
                error={!!errors.projectId}
                helperText={
                  errors.projectId?.message ?? (options.length === 0 ? "You aren't assigned to any active project." : " ")
                }
              >
                {options.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.code} — {project.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              {...register("workDate")}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: today } }}
              error={!!errors.workDate}
              helperText={errors.workDate?.message ?? " "}
            />
            <TextField
              label="Hours"
              type="number"
              fullWidth
              {...register("hours")}
              slotProps={{ htmlInput: { min: 0.25, max: 12, step: 0.25 } }}
              error={!!errors.hours}
              helperText={
                errors.hours?.message ??
                (!isEdit && workDate === today && remainingToday !== undefined
                  ? `${formatHours(remainingToday)} left today`
                  : " ")
              }
            />
          </Stack>
          <TextField
            label="Notes"
            placeholder="What did you work on? Several tasks can go in one entry."
            multiline
            minRows={3}
            fullWidth
            {...register("notes")}
            error={!!errors.notes}
            helperText={errors.notes?.message}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" form="time-entry-form" variant="contained" loading={mutation.isPending}>
          {isEdit ? (entry.status === "Rejected" ? "Save & resubmit" : "Save") : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TimeEntryFormDialog;
