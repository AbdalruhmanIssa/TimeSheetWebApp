import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "./layout/AuthLayout.jsx";
import DashboardLayout from "./layout/DashboardLayout.jsx";
import Login from "./pages/authPages/login/Login.jsx";
import EmployeeDashboard from "./pages/employeePages/employeeDashboard/EmployeeDashboard.jsx";
import MyEntries from "./pages/employeePages/myEntries/MyEntries.jsx";
import ReviewerDashboard from "./pages/sharedPages/reviewerDashboard/ReviewerDashboard.jsx";
import Approvals from "./pages/sharedPages/approvals/Approvals.jsx";
import Projects from "./pages/sharedPages/projects/Projects.jsx";
import ProjectDetails from "./pages/sharedPages/projectDetails/ProjectDetails.jsx";
import Clients from "./pages/directorPages/clients/Clients.jsx";
import Portfolio from "./pages/directorPages/portfolio/Portfolio.jsx";
import AdminDashboard from "./pages/adminPages/adminDashboard/AdminDashboard.jsx";
import UserManagement from "./pages/adminPages/userManagement/UserManagement.jsx";
import NotFound from "./components/requestStates/NotFound.jsx";
import useAuthStore from "./store/useAuthStore.js";
import { ROLE_HOME } from "./utils/constants.js";

// "/" sends each user to their own area
function RoleRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={ROLE_HOME[user?.role] ?? "/auth/login"} replace />;
}

// Manager and Director share the approval, project and report pages; `area` picks the API area
const reviewerRoutes = (area) => [
  { index: true, element: <ReviewerDashboard key={area} area={area} /> },
  { path: "approvals", element: <Approvals key={area} area={area} /> },
  { path: "projects", element: <Projects key={area} area={area} /> },
  { path: "projects/:id", element: <ProjectDetails key={area} area={area} /> },
];

const router = createBrowserRouter([
  { path: "/", element: <RoleRedirect /> },
  {
    path: "auth/",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: "login", element: <Login /> },
    ],
  },
  {
    path: "employee/",
    element: <DashboardLayout role="Employee" />,
    children: [
      { index: true, element: <EmployeeDashboard /> },
      { path: "entries", element: <MyEntries /> },
    ],
  },
  {
    path: "manager/",
    element: <DashboardLayout role="Manager" />,
    children: reviewerRoutes("Manager"),
  },
  {
    path: "director/",
    element: <DashboardLayout role="Director" />,
    children: [
      ...reviewerRoutes("Director"),
      { path: "portfolio", element: <Portfolio /> },
      { path: "clients", element: <Clients /> },
    ],
  },
  {
    path: "admin/",
    element: <DashboardLayout role="Admin" />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "users", element: <UserManagement /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
