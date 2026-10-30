import { useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, CardHeader, Stack, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import BlockIcon from "@mui/icons-material/Block";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import useAuthStore from "../../../store/useAuthStore";
import { useUserCounts } from "../../../hooks/userHooks/useUsers";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";
import { DashboardLoadingState, ErrorState } from "../../../components/requestStates/RequestStates";
import { ROLE_LIST } from "../../../utils/constants";

const roleColors = { Admin: "#22c3a6", Director: "#4f8cff", Manager: "#38bdf8", Employee: "#a78bfa" };
const roleHints = {
  Admin: "Manage accounts",
  Director: "Own clients and projects",
  Manager: "First approval",
  Employee: "Log hours",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { counts, blocked, total, isLoading, isError, error } = useUserCounts();

  if (isLoading) return <DashboardLoadingState />;
  if (isError) return <ErrorState error={error} />;

  return (
    <Box>
      <PageHeader
        eyebrow="Admin dashboard"
        title={`Hello, ${user.fullName.split(" ")[0]}`}
        subtitle="Who has access, and with which role."
        actions={
          <Button variant="contained" startIcon={<PersonAddAlt1OutlinedIcon />} onClick={() => navigate("/admin/users")}>
            Manage users
          </Button>
        }
      />

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
        <StatCard
          label="Total users"
          value={total}
          hint="Across all roles"
          icon={<PeopleAltOutlinedIcon fontSize="small" />}
          onClick={() => navigate("/admin/users")}
        />
        <StatCard
          label="Blocked"
          value={blocked}
          hint="Can't log in until unblocked"
          icon={<BlockIcon fontSize="small" />}
          color="error"
          onClick={() => navigate("/admin/users?isBlocked=true")}
        />
      </Box>

      <Box sx={{ display: "grid", gap: 2, mt: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" } }}>
        <Card>
          <CardHeader title="Users by role" slotProps={{ title: { variant: "h6" } }} />
          <CardContent sx={{ pt: 0 }}>
            <PieChart
              height={280}
              series={[
                {
                  data: ROLE_LIST.map((role, i) => ({ id: i, value: counts[role], label: role, color: roleColors[role] })),
                  innerRadius: 70,
                  paddingAngle: 2,
                  cornerRadius: 4,
                },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Roles" slotProps={{ title: { variant: "h6" } }} />
          <Stack>
            {ROLE_LIST.map((role) => (
              <Stack
                key={role}
                direction="row"
                alignItems="center"
                spacing={2}
                onClick={() => navigate(`/admin/users?role=${role}`)}
                sx={{ px: 2, py: 1.75, borderTop: 1, borderColor: "divider", cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
              >
                <Box sx={{ width: 10, height: 36, borderRadius: 1, bgcolor: roleColors[role] }} />
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>{role}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {roleHints[role]}
                  </Typography>
                </Box>
                <Typography variant="h6">{counts[role]}</Typography>
              </Stack>
            ))}
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
