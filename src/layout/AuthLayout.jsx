import { Box, Stack, Typography } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import useAuthStore from "../store/useAuthStore";
import Brand from "../components/navigation/Brand";
import { ROLE_HOME } from "../utils/constants";

const highlights = [
  "Log hours on the projects you're assigned to",
  "Two-step approval: manager, then director",
  "Live budget tracking with reports and PDF export",
];

function AuthLayout() {
  const user = useAuthStore((state) => state.user);
  if (user && ROLE_HOME[user.role]) return <Navigate to={ROLE_HOME[user.role]} replace />;

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" } }}>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 20% 20%, rgba(79,140,255,0.35), transparent 45%), radial-gradient(circle at 80% 80%, rgba(34,195,166,0.25), transparent 45%), #0d1527",
          borderRight: 1,
          borderColor: "divider",
        }}
      >
        <Brand size="large" />
        <Box sx={{ maxWidth: 460 }}>
          <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1.15 }}>
            Every hour, accounted for.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2, mb: 4 }}>
            Track project hours, approve them in two steps, and see where every budget stands.
          </Typography>
          <Stack spacing={1.5}>
            {highlights.map((text) => (
              <Stack key={text} direction="row" spacing={1.5} alignItems="center">
                <CheckCircleOutlineIcon color="secondary" fontSize="small" />
                <Typography>{text}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} TimeSheet
        </Typography>
      </Box>

      <Box sx={{ display: "grid", placeItems: "center", p: { xs: 2, sm: 4 }, bgcolor: "background.default" }}>
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Box sx={{ display: { md: "none" }, mb: 4 }}>
            <Brand size="large" />
          </Box>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default AuthLayout;
