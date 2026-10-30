import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { ClientSchema } from "../../validations/schemas";
import { useCreateClient, useUpdateClient } from "../../hooks/clientHooks/useClients";
import FormError from "../common/FormError";

const emptyValues = { name: "", contactName: "", contactEmail: "", phone: "" };

function ClientFormDialog({ open, client, onClose }) {
  const isEdit = !!client;
  const create = useCreateClient({ onSuccess: onClose });
  const update = useUpdateClient({ onSuccess: onClose });
  const { mutation, serverError, setServerError } = isEdit ? update : create;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(ClientSchema), defaultValues: emptyValues });

  useEffect(() => {
    if (!open) return;
    setServerError("");
    reset(
      client
        ? {
            name: client.name,
            contactName: client.contactName ?? "",
            contactEmail: client.contactEmail ?? "",
            phone: client.phone ?? "",
          }
        : emptyValues,
    );
  }, [open, client, reset, setServerError]);

  const onSubmit = (values) => {
    // optional fields go as null, not "", so the API's [EmailAddress] / [Phone] checks skip them
    const data = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v?.trim() || null]));
    if (isEdit) mutation.mutate({ url: `Director/Clients/${client.id}`, data });
    else mutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose}>
      <DialogTitle>{isEdit ? "Edit client" : "New client"}</DialogTitle>
      <DialogContent>
        <FormError message={serverError} />
        <Stack component="form" id="client-form" spacing={2.5} sx={{ pt: 1 }} onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField label="Company name" fullWidth autoFocus {...register("name")} error={!!errors.name} helperText={errors.name?.message} />
          <TextField
            label="Contact person"
            fullWidth
            {...register("contactName")}
            error={!!errors.contactName}
            helperText={errors.contactName?.message}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Contact email"
              type="email"
              fullWidth
              {...register("contactEmail")}
              error={!!errors.contactEmail}
              helperText={errors.contactEmail?.message}
            />
            <TextField label="Phone" fullWidth {...register("phone")} error={!!errors.phone} helperText={errors.phone?.message} />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" form="client-form" variant="contained" loading={mutation.isPending}>
          {isEdit ? "Save" : "Create client"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ClientFormDialog;
