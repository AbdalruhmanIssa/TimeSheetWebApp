import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { CreateUserSchema, ResetPasswordSchema, UpdateUserSchema } from "../../validations/schemas";
import { useChangeRole, useCreateUser, useResetPassword, useUpdateUser } from "../../hooks/userHooks/useUsers";
import FormError from "../common/FormError";
import { ROLE_LIST } from "../../utils/constants";

const emptyUser = { fullName: "", email: "", userName: "", phoneNumber: "", password: "", role: "Employee" };

// create: all fields incl. password + role; edit: profile fields only (role and password have their own dialogs)
export function UserFormDialog({ open, user, onClose }) {
  const isEdit = !!user;
  const create = useCreateUser({ onSuccess: onClose });
  const update = useUpdateUser({ onSuccess: onClose });
  const { mutation, serverError, setServerError } = isEdit ? update : create;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(isEdit ? UpdateUserSchema : CreateUserSchema), defaultValues: emptyUser });

  useEffect(() => {
    if (!open) return;
    setServerError("");
    reset(user ? { ...emptyUser, ...user, phoneNumber: user.phoneNumber ?? "" } : emptyUser);
  }, [open, user, reset, setServerError]);

  const onSubmit = (values) => {
    const profile = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      userName: values.userName.trim(),
      phoneNumber: values.phoneNumber?.trim() || null,
    };
    if (isEdit) mutation.mutate({ url: `Admin/Users/${user.id}`, data: profile });
    else mutation.mutate({ ...profile, password: values.password, role: values.role });
  };

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose}>
      <DialogTitle>{isEdit ? `Edit ${user.fullName}` : "New user"}</DialogTitle>
      <DialogContent>
        <FormError message={serverError} />
        <Stack component="form" id="user-form" spacing={2.5} sx={{ pt: 1 }} onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField label="Full name" fullWidth autoFocus {...register("fullName")} error={!!errors.fullName} helperText={errors.fullName?.message} />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="Username" fullWidth {...register("userName")} error={!!errors.userName} helperText={errors.userName?.message} />
            <TextField label="Phone (optional)" fullWidth {...register("phoneNumber")} error={!!errors.phoneNumber} helperText={errors.phoneNumber?.message} />
          </Stack>
          <TextField label="Email" type="email" fullWidth {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
          {!isEdit && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Password"
                type="password"
                autoComplete="new-password"
                fullWidth
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message ?? "8+ chars with upper, lower and a number"}
              />
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Role" fullWidth error={!!errors.role} helperText={errors.role?.message ?? " "}>
                    {ROLE_LIST.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" form="user-form" variant="contained" loading={mutation.isPending}>
          {isEdit ? "Save" : "Create user"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// mount with key={user.id} so the picked role starts from the user's current role
export function ChangeRoleDialog({ user, onClose }) {
  const [role, setRole] = useState(user?.role ?? "");
  const { mutation, serverError } = useChangeRole({ onSuccess: onClose });

  return (
    <Dialog open={!!user} onClose={mutation.isPending ? undefined : onClose} maxWidth="xs">
      <DialogTitle>Change role</DialogTitle>
      <DialogContent>
        <FormError message={serverError} />
        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          {user?.fullName} will be signed out and must log in again with the new role.
        </Alert>
        <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)} fullWidth>
          {ROLE_LIST.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!role || role === user?.role}
          loading={mutation.isPending}
          onClick={() => mutation.mutate({ url: `Admin/Users/${user.id}/role`, data: { role } })}
        >
          Change role
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function ResetPasswordDialog({ user, onClose }) {
  const { mutation, serverError, setServerError } = useResetPassword({ onSuccess: onClose });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(ResetPasswordSchema), defaultValues: { newPassword: "", confirmPassword: "" } });

  useEffect(() => {
    if (user) {
      reset({ newPassword: "", confirmPassword: "" });
      setServerError("");
    }
  }, [user, reset, setServerError]);

  return (
    <Dialog open={!!user} onClose={mutation.isPending ? undefined : onClose} maxWidth="xs">
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent>
        <FormError message={serverError} />
        <Stack
          component="form"
          id="reset-password-form"
          spacing={2.5}
          sx={{ pt: 1 }}
          noValidate
          onSubmit={handleSubmit(({ newPassword }) =>
            mutation.mutate({ url: `Admin/Users/${user.id}/password`, data: { newPassword } }),
          )}
        >
          <TextField
            label={`New password for ${user?.userName ?? ""}`}
            type="password"
            autoComplete="new-password"
            fullWidth
            autoFocus
            {...register("newPassword")}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message ?? "8+ chars with upper, lower and a number"}
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            fullWidth
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" form="reset-password-form" variant="contained" loading={mutation.isPending}>
          Reset password
        </Button>
      </DialogActions>
    </Dialog>
  );
}
