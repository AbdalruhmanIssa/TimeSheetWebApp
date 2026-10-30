import {
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import useLogout from "../../hooks/authHooks/useLogout";
import { initials } from "../../utils/format";
import { NAV_ITEMS } from "./navItems";
import { PendingBadge, RejectedBadge } from "./NavBadges";
import Brand from "./Brand";

function ItemBadge({ badge, role }) {
  if (badge === "pending") return <PendingBadge area={role} />;
  if (badge === "rejected") return <RejectedBadge />;
  return null;
}

function SideNav({ onNavigate }) {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const items = NAV_ITEMS[user.role] ?? [];

  return (
    <Stack sx={{ height: "100%" }}>
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Brand />
      </Box>

      <Typography variant="overline" color="text.secondary" sx={{ px: 3, pt: 1 }}>
        {user.role}
      </Typography>

      <List sx={{ px: 1.5, flex: 1 }}>
        {items.map(({ label, to, icon: Icon, end, badge }) => (
          <ListItemButton
            key={to}
            component={NavLink}
            to={to}
            end={end}
            onClick={onNavigate}
            sx={(theme) => ({
              borderRadius: 2,
              mb: 0.5,
              color: "text.secondary",
              "& .MuiListItemIcon-root": { color: "inherit", minWidth: 38 },
              "&.active": {
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                "& .MuiListItemText-primary": { fontWeight: 600 },
              },
            })}
          >
            <ListItemIcon>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={label} />
            <Box sx={{ pr: 1.5 }}>
              <ItemBadge badge={badge} role={user.role} />
            </Box>
          </ListItemButton>
        ))}
      </List>

      <Divider />
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.dark", fontSize: 14 }}>
          {initials(user.fullName)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {user.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            @{user.userName}
          </Typography>
        </Box>
        <Tooltip title="Log out">
          <IconButton onClick={logout} size="small" aria-label="Log out">
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

export default SideNav;
