import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

// badge: which live counter to show next to the item (see SideNav)
export const NAV_ITEMS = {
  Employee: [
    { label: "Dashboard", to: "/employee", icon: DashboardOutlinedIcon, end: true },
    { label: "My time", to: "/employee/entries", icon: ScheduleOutlinedIcon, badge: "rejected" },
  ],
  Manager: [
    { label: "Dashboard", to: "/manager", icon: DashboardOutlinedIcon, end: true },
    { label: "Approvals", to: "/manager/approvals", icon: FactCheckOutlinedIcon, badge: "pending" },
    { label: "Projects", to: "/manager/projects", icon: FolderOutlinedIcon },
  ],
  Director: [
    { label: "Dashboard", to: "/director", icon: DashboardOutlinedIcon, end: true },
    { label: "Approvals", to: "/director/approvals", icon: FactCheckOutlinedIcon, badge: "pending" },
    { label: "Projects", to: "/director/projects", icon: FolderOutlinedIcon },
    { label: "Portfolio", to: "/director/portfolio", icon: InsightsOutlinedIcon },
    { label: "Clients", to: "/director/clients", icon: BusinessOutlinedIcon },
  ],
  Admin: [
    { label: "Dashboard", to: "/admin", icon: DashboardOutlinedIcon, end: true },
    { label: "Users", to: "/admin/users", icon: PeopleAltOutlinedIcon },
  ],
};
