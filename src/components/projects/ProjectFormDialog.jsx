import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { ProjectSchema } from "../../validations/schemas";
import { useCreateProject, useUpdateProject } from "../../hooks/projectHooks/useProjects";
import { useClients } from "../../hooks/clientHooks/useClients";
import { useUserOptions } from "../../hooks/userHooks/useUsers";
import FormError from "../common/FormError";

const emptyValues = {
  name: "",
  description: "",
  clientId: "",
  managerId: "",
  budgetHours: "",
  startDate: "",
  endDate: "",
  employeeIds: [],
};

/**
 * Director: create a project (with its first team) or edit one.
 * The budget is locked once the project has an approved entry; the API refuses the change, the form says why.
 */
function ProjectFormDialog({ open, project, onClose, onCreated }) {
  const isEdit = !!project;
  const { data: clients } = useClients({ page: 1, pageSize: 100 });
  const { data: managers = [] } = useUserOptions("Manager");
  const { data: employees = [] } = useUserOptions("Employee");

  const create = useCreateProject({ onSuccess: (created) => (onCreated ? onCreated(created) : onClose()) });
  const update = useUpdateProject({ onSuccess: onClose });
  const { mutation, serverError, setServerError } = isEdit ? update : create;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(ProjectSchema), defaultValues: emptyValues });

  useEffect(() => {
    if (!open) return;
    setServerError("");
    reset(
      project
        ? {
            name: project.name,
            description: project.description ?? "",
            clientId: project.clientId,
            managerId: project.managerId,
            budgetHours: project.budgetHours,
            startDate: project.startDate,
            endDate: project.endDate ?? "",
            employeeIds: [],
          }
        : emptyValues,
    );
  }, [open, project, reset, setServerError]);

  // an inactive client isn't in the active list, but an existing project may still point at it
  const clientOptions = [...(clients?.items ?? [])];
  if (project && !clientOptions.some((c) => c.id === project.clientId)) {
    clientOptions.push({ id: project.clientId, name: `${project.clientName} (inactive)` });
  }

  const onSubmit = (values) => {
    const data = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
      clientId: values.clientId,
      managerId: values.managerId,
      budgetHours: values.budgetHours,
      startDate: values.startDate,
      endDate: values.endDate || null,
    };
    if (isEdit) mutation.mutate({ url: `Director/Projects/${project.id}`, data });
    else mutation.mutate({ ...data, employeeIds: values.employeeIds });
  };

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose} maxWidth="md">
      <DialogTitle>{isEdit ? `Edit ${project.code}` : "New project"}</DialogTitle>
      <DialogContent>
        <FormError message={serverError} />
        {isEdit && project.isBudgetLocked && (
          <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
            The budget is locked: this project already has approved hours. A new deal means a new project.
          </Alert>
        )}

        <Stack component="form" id="project-form" spacing={2.5} sx={{ pt: 1 }} onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Name"
            fullWidth
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message ?? "Unique across all projects"}
          />
          <TextField
            label="Description"
            multiline
            minRows={2}
            fullWidth
            {...register("description")}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Controller
              name="clientId"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Client" fullWidth error={!!errors.clientId} helperText={errors.clientId?.message}>
                  {clientOptions.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="managerId"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Manager" fullWidth error={!!errors.managerId} helperText={errors.managerId?.message}>
                  {managers.map((manager) => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {manager.fullName} (@{manager.userName})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Budget (hours)"
              type="number"
              fullWidth
              disabled={isEdit && project.isBudgetLocked}
              {...register("budgetHours")}
              slotProps={{ htmlInput: { min: 0.01, step: 1 } }}
              error={!!errors.budgetHours}
              helperText={errors.budgetHours?.message}
            />
            <TextField
              label="Start date"
              type="date"
              fullWidth
              {...register("startDate")}
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.startDate}
              helperText={errors.startDate?.message}
            />
            <TextField
              label="End date (optional)"
              type="date"
              fullWidth
              {...register("endDate")}
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.endDate}
              helperText={errors.endDate?.message}
            />
          </Stack>
          {!isEdit && (
            <Controller
              name="employeeIds"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={employees}
                  getOptionLabel={(option) => `${option.fullName} (@${option.userName})`}
                  value={employees.filter((e) => field.value.includes(e.id))}
                  onChange={(_, value) => field.onChange(value.map((e) => e.id))}
                  renderInput={(params) => (
                    <TextField {...params} label="Team (optional)" helperText="Only employees can log hours. You can add more later." />
                  )}
                />
              )}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" form="project-form" variant="contained" loading={mutation.isPending}>
          {isEdit ? "Save changes" : "Create project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProjectFormDialog;
