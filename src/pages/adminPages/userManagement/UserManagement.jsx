import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PageHeader from "../../../components/common/PageHeader";
import TablePager from "../../../components/common/TablePager";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { ChangeRoleDialog, ResetPasswordDialog, UserFormDialog } from "../../../components/users/UserDialogs";
import { EmptyState, ErrorState, LoadingState } from "../../../components/requestStates/RequestStates";
import { useDeleteUser, useSetBlocked, useUsers } from "../../../hooks/userHooks/useUsers";
import useDebounce from "../../../hooks/generalHooks/useDebounce";
import useAuthStore from "../../../store/useAuthStore";
import { DEFAULT_PAGE_SIZE, ROLE_LIST } from "../../../utils/constants";
import { initials } from "../../../utils/format";

const roleColor = { Admin: "secondary", Director: "primary", Manager: "info", Employee: "default" };

function UserManagement() {
  const me = useAuthStore((state) => state.user);
  // role / blocked filters live in the url so the dashboard can link to them
  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get("role") ?? "";
  const blocked = searchParams.get("isBlocked") ?? "";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const debouncedSearch = useDebounce(search);

  const [menu, setMenu] = useState({ anchor: null, user: null });
  const [form, setForm] = useState({ open: false, user: null });
  const [roleUser, setRoleUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useUsers({
    role,
    isBlocked: blocked,
    search: debouncedSearch.trim(),
    page,
    pageSize,
  });
  const { mutation: setBlocked } = useSetBlocked();
  const { mutation: remove } = useDeleteUser({ onSuccess: () => setDeleting(null) });

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
    setPage(1);
  };

  const closeMenu = () => setMenu({ anchor: null, user: null });
  const act = (fn) => () => {
    fn(menu.user);
    closeMenu();
  };
  // the API refuses to let an admin block, delete or re-role themselves
  const isMe = menu.user?.id === me.id;

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Create accounts and give each person one role."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setForm({ open: true, user: null })}>
            New user
          </Button>
        }
      />

      <Card>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <TextField
            placeholder="Search name, username or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            sx={{ flex: 1, minWidth: 240 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField select label="Role" value={role} onChange={(e) => setFilter("role", e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="">All roles</MenuItem>
            {ROLE_LIST.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Status" value={blocked} onChange={(e) => setFilter("isBlocked", e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="">Everyone</MenuItem>
            <MenuItem value="false">Active</MenuItem>
            <MenuItem value="true">Blocked</MenuItem>
          </TextField>
        </Stack>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <Box sx={{ p: 2 }}>
            <ErrorState error={error} onRetry={refetch} />
          </Box>
        ) : data.items.length === 0 ? (
          <EmptyState title="No users match" message="Try another search or filter." />
        ) : (
          <>
            <TableContainer sx={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: "primary.dark" }}>{initials(user.fullName)}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {user.fullName}
                              {user.id === me.id && (
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {" "}
                                  (you)
                                </Typography>
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              @{user.userName}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phoneNumber || "—"}</TableCell>
                      <TableCell>
                        <Chip size="small" label={user.role ?? "No role"} color={roleColor[user.role] ?? "default"} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={user.isBlocked ? "Blocked" : "Active"}
                          color={user.isBlocked ? "error" : "success"}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => setMenu({ anchor: e.currentTarget, user })}
                          aria-label={`Actions for ${user.fullName}`}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePager
              data={data}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </>
        )}
      </Card>

      <Menu anchorEl={menu.anchor} open={!!menu.anchor} onClose={closeMenu}>
        <MenuItem onClick={act((user) => setForm({ open: true, user }))}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit details</ListItemText>
        </MenuItem>
        <MenuItem onClick={act(setRoleUser)} disabled={isMe}>
          <ListItemIcon>
            <BadgeOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change role</ListItemText>
        </MenuItem>
        <MenuItem onClick={act(setPasswordUser)}>
          <ListItemIcon>
            <KeyOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reset password</ListItemText>
        </MenuItem>
        {menu.user?.isBlocked ? (
          <MenuItem onClick={act((user) => setBlocked.mutate({ url: `Admin/Users/${user.id}/unblock` }))}>
            <ListItemIcon>
              <LockOpenIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Unblock</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={act((user) => setBlocked.mutate({ url: `Admin/Users/${user.id}/block` }))} disabled={isMe}>
            <ListItemIcon>
              <BlockIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Block</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={act(setDeleting)} disabled={isMe} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <UserFormDialog open={form.open} user={form.user} onClose={() => setForm({ open: false, user: null })} />
      <ChangeRoleDialog key={roleUser?.id ?? "none"} user={roleUser} onClose={() => setRoleUser(null)} />
      <ResetPasswordDialog user={passwordUser} onClose={() => setPasswordUser(null)} />
      <ConfirmDialog
        open={!!deleting}
        title={`Delete ${deleting?.fullName}?`}
        message="This can't be undone. Users who already have projects, entries or reviews can't be deleted; block them instead."
        confirmLabel="Delete"
        confirmColor="error"
        loading={remove.isPending}
        onConfirm={() => remove.mutate({ url: `Admin/Users/${deleting.id}` })}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
}

export default UserManagement;
