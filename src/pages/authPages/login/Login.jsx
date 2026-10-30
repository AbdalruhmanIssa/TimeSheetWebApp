import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import useLogin from "../../../hooks/authHooks/useLogin";
import { LoginSchema } from "../../../validations/schemas";
import FormError from "../../../components/common/FormError";

// the API seeds these users in its Development environment (see the API README)
const DEMO_ACCOUNTS = [
  { role: "Director", userName: "khaled", password: "Director@1234" },
  { role: "Manager", userName: "omar", password: "Manager@1234" },
  { role: "Employee", userName: "ahmad", password: "Employee@1234" },
  { role: "Admin", userName: "admin", password: "Admin@1234" },
];
const showDemo = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_ACCOUNTS === "true";

function Login() {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const { mutation, serverError } = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues: { emailOrUserName: "", password: "" },
  });

  const onSubmit = (values) => mutation.mutate(values);

  // one click fills the form and signs in
  const signInAs = (account) => {
    setValue("emailOrUserName", account.userName);
    setValue("password", account.password);
    mutation.mutate({ emailOrUserName: account.userName, password: account.password });
  };

  return (
    <Box>
      <Typography variant="h4">Welcome back</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
        Sign in with the account your admin created for you.
      </Typography>

      {searchParams.get("expired") && !serverError && (
        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          Your session ended. Please sign in again.
        </Alert>
      )}
      <FormError message={serverError} />

      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email or username"
          autoComplete="username"
          autoFocus
          fullWidth
          size="medium"
          {...register("emailOrUserName")}
          error={!!errors.emailOrUserName}
          helperText={errors.emailOrUserName?.message}
        />
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          fullWidth
          size="medium"
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button type="submit" variant="contained" size="large" loading={mutation.isPending}>
          Sign in
        </Button>
      </Stack>

      {showDemo && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Demo accounts · click to sign in
            </Typography>
          </Divider>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", justifyContent: "center" }}>
            {DEMO_ACCOUNTS.map((account) => (
              <Chip
                key={account.role}
                label={`${account.role} · ${account.userName}`}
                onClick={() => signInAs(account)}
                disabled={mutation.isPending}
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

export default Login;
