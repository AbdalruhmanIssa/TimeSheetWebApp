import { useEffect, useState } from "react";
import { AppBar, Box, Drawer, IconButton, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useLogout from "../hooks/authHooks/useLogout";
import SideNav from "../components/navigation/SideNav";
import Brand from "../components/navigation/Brand";
import { ROLE_HOME } from "../utils/constants";

const DRAWER_WIDTH = 248;

// one layout per role area: /employee, /manager, /director, /admin
function DashboardLayout({ role }) {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // the token has a fixed expiry; log out the moment it passes instead of waiting for a 401
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(logout, Math.max(user.expiresAt - Date.now(), 0));
    return () => clearTimeout(timer);
  }, [user, logout]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!user) return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={ROLE_HOME[user.role] ?? "/auth/login"} replace />;

  const paperSx = {
    width: DRAWER_WIDTH,
    boxSizing: "border-box",
    bgcolor: "background.paper",
    borderRight: 1,
    borderColor: "divider",
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ display: { md: "none" }, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu" sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <Brand />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": paperSx }}
      >
        <SideNav onNavigate={() => setMobileOpen(false)} />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{ display: { xs: "none", md: "block" }, width: DRAWER_WIDTH, flexShrink: 0, "& .MuiDrawer-paper": paperSx }}
      >
        <SideNav />
      </Drawer>

      <Box component="main" sx={{ flex: 1, minWidth: 0, px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 10, md: 4 } }}>
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
