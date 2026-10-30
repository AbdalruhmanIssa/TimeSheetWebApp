import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BlockIcon from "@mui/icons-material/Block";
import RestoreIcon from "@mui/icons-material/Restore";
import PageHeader from "../../../components/common/PageHeader";
import TablePager from "../../../components/common/TablePager";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import ClientFormDialog from "../../../components/clients/ClientFormDialog";
import { EmptyState, ErrorState, LoadingState } from "../../../components/requestStates/RequestStates";
import { useActivateClient, useClients, useDeactivateClient } from "../../../hooks/clientHooks/useClients";
import useDebounce from "../../../hooks/generalHooks/useDebounce";
import { DEFAULT_PAGE_SIZE } from "../../../utils/constants";

function Clients() {
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [form, setForm] = useState({ open: false, client: null });
  const [deactivating, setDeactivating] = useState(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useClients({
    search: debouncedSearch.trim(),
    includeInactive,
    page,
    pageSize,
  });
  const { mutation: deactivate } = useDeactivateClient({ onSuccess: () => setDeactivating(null) });
  const { mutation: activate } = useActivateClient();

  return (
    <Box>
      <PageHeader
        title="Clients"
        subtitle="The companies your projects are for. Clients are deactivated, never deleted."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setForm({ open: true, client: null })}>
            New client
          </Button>
        }
      />

      <Card>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <TextField
            placeholder="Search clients"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            sx={{ flex: 1, maxWidth: 420 }}
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
          <FormControlLabel
            control={
              <Switch
                checked={includeInactive}
                onChange={(e) => {
                  setIncludeInactive(e.target.checked);
                  setPage(1);
                }}
              />
            }
            label="Show inactive"
          />
        </Stack>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <Box sx={{ p: 2 }}>
            <ErrorState error={error} onRetry={refetch} />
          </Box>
        ) : data.items.length === 0 ? (
          <EmptyState title={search ? "No clients match" : "No clients yet"} message="Add a client before creating its projects." />
        ) : (
          <>
            <TableContainer sx={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((client) => (
                    <TableRow key={client.id} hover sx={{ opacity: client.isActive ? 1 : 0.6 }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {client.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{client.contactName || "—"}</TableCell>
                      <TableCell>{client.contactEmail || "—"}</TableCell>
                      <TableCell>{client.phone || "—"}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={client.isActive ? "Active" : "Inactive"}
                          color={client.isActive ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => setForm({ open: true, client })} aria-label="Edit">
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {client.isActive ? (
                            <Tooltip title="Deactivate">
                              <IconButton size="small" color="error" onClick={() => setDeactivating(client)} aria-label="Deactivate">
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Activate">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => activate.mutate({ url: `Director/Clients/${client.id}/activate` })}
                                aria-label="Activate"
                              >
                                <RestoreIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
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

      <ClientFormDialog open={form.open} client={form.client} onClose={() => setForm({ open: false, client: null })} />
      <ConfirmDialog
        open={!!deactivating}
        title={`Deactivate ${deactivating?.name}?`}
        message="Existing projects keep working; the client just won't be offered for new projects. You can activate it again any time."
        confirmLabel="Deactivate"
        confirmColor="error"
        loading={deactivate.isPending}
        onConfirm={() => deactivate.mutate({ url: `Director/Clients/${deactivating.id}` })}
        onClose={() => setDeactivating(null)}
      />
    </Box>
  );
}

export default Clients;
