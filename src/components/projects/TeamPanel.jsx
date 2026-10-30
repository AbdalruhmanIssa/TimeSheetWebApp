import { useState } from "react";
import {
  Autocomplete,
  Avatar,
  Button,
  Card,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Tooltip,
} from "@mui/material";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import { useAssignEmployees, useRemoveEmployee } from "../../hooks/projectHooks/useProjects";
import { useUserOptions } from "../../hooks/userHooks/useUsers";
import ConfirmDialog from "../common/ConfirmDialog";
import FormError from "../common/FormError";
import { EmptyState } from "../requestStates/RequestStates";
import { formatDate, initials } from "../../utils/format";

// mounted only while open, so every opening starts with an empty pick and no old error
function AssignEmployeesDialog({ open, project, onClose }) {
  const { data: employees = [] } = useUserOptions("Employee");
  const [picked, setPicked] = useState([]);
  const { mutation, serverError } = useAssignEmployees({ onSuccess: onClose });

  // the API rejects the whole request if someone is already active on the team, so hide them;
  // removed employees stay listed (assigning them again re-activates their row)
  const activeIds = new Set(project.employees.filter((e) => e.isActive).map((e) => e.employeeId));
  const options = employees.filter((e) => !activeIds.has(e.id));

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose}>
      <DialogTitle>Add employees to {project.code}</DialogTitle>
      <DialogContent>
        <FormError message={serverError} />
        <Autocomplete
          multiple
          options={options}
          value={picked}
          onChange={(_, value) => setPicked(value)}
          getOptionLabel={(o) => `${o.fullName} (@${o.userName})`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => <TextField {...params} label="Employees" autoFocus sx={{ mt: 1 }} />}
          noOptionsText="Every employee is already on this team"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={picked.length === 0}
          loading={mutation.isPending}
          onClick={() =>
            mutation.mutate({ url: `Director/Projects/${project.id}/employees`, data: { employeeIds: picked.map((e) => e.id) } })
          }
        >
          Add {picked.length || ""}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// the project's employees; the director can add or remove (removal keeps their history)
function TeamPanel({ project, canEdit }) {
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const { mutation: remove } = useRemoveEmployee({ onSuccess: () => setRemoving(null) });

  const team = [...project.employees].sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.fullName.localeCompare(b.fullName));

  return (
    <Card>
      <CardHeader
        title="Team"
        subheader={`${project.employees.filter((e) => e.isActive).length} active employees`}
        slotProps={{ title: { variant: "h6" } }}
        action={
          canEdit && (
            <Button startIcon={<PersonAddAlt1OutlinedIcon />} onClick={() => setAdding(true)}>
              Add employees
            </Button>
          )
        }
      />
      {team.length === 0 ? (
        <EmptyState title="No one on this project yet" message="Employees must be on the team to log hours here." />
      ) : (
        <List disablePadding>
          {team.map((member) => (
            <ListItem
              key={member.employeeId}
              divider
              sx={{ opacity: member.isActive ? 1 : 0.55 }}
              secondaryAction={
                canEdit &&
                member.isActive && (
                  <Tooltip title="Remove from project">
                    <IconButton edge="end" color="error" onClick={() => setRemoving(member)} aria-label="Remove from project">
                      <PersonRemoveOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "primary.dark", fontSize: 14 }}>{initials(member.fullName)}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
                    {member.fullName}
                    {!member.isActive && <Chip label="Removed" size="small" sx={{ ml: 1 }} />}
                  </>
                }
                secondary={`@${member.userName} · assigned ${formatDate(member.assignedAt.slice(0, 10))}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      {canEdit && adding && <AssignEmployeesDialog open project={project} onClose={() => setAdding(false)} />}
      <ConfirmDialog
        open={!!removing}
        title={`Remove ${removing?.fullName}?`}
        message="They won't be able to log new hours on this project. Their past entries and history stay. You can add them back later."
        confirmLabel="Remove"
        confirmColor="error"
        loading={remove.isPending}
        onConfirm={() => remove.mutate({ url: `Director/Projects/${project.id}/employees/${removing.employeeId}` })}
        onClose={() => setRemoving(null)}
      />
    </Card>
  );
}

export default TeamPanel;
