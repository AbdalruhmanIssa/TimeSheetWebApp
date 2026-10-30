import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import PageHeader from "../../../components/common/PageHeader";
import TablePager from "../../../components/common/TablePager";
import BudgetImpact from "../../../components/approvals/BudgetImpact";
import ReviewCommentDialog from "../../../components/approvals/ReviewCommentDialog";
import BulkResultDialog from "../../../components/approvals/BulkResultDialog";
import RecentlyApproved from "../../../components/approvals/RecentlyApproved";
import { EmptyState, ErrorState, LoadingState } from "../../../components/requestStates/RequestStates";
import {
  useApproveEntry,
  useBulkApprove,
  usePendingReviews,
  useRejectEntry,
} from "../../../hooks/approvalHooks/useApprovals";
import useRecentApprovalsStore from "../../../store/useRecentApprovalsStore";
import { formatDateTime, formatHours, formatWeekday, timeAgo } from "../../../utils/format";

// the approve / reject buttons stay visible when the table scrolls sideways on narrow screens
const stickyRight = { position: "sticky", right: 0, bgcolor: "background.paper", zIndex: 1 };

// area: "Manager" (first approval) or "Director" (final approval, sees budget impact, can reopen)
function Approvals({ area }) {
  const isDirector = area === "Director";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selected, setSelected] = useState([]);
  const [rejecting, setRejecting] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const addRecent = useRecentApprovalsStore((state) => state.add);

  const { data, isLoading, isError, error, refetch, isPlaceholderData } = usePendingReviews(area, { page, pageSize });
  const items = data?.items ?? [];
  const selectedOnPage = selected.filter((id) => items.some((e) => e.id === id));

  const remember = (entries) => {
    if (isDirector) addRecent(entries);
  };

  const { mutation: approve } = useApproveEntry(area, {
    onSuccess: (_, { entry }) => {
      remember([entry]);
      setSelected((ids) => ids.filter((id) => id !== entry.id));
    },
  });
  const { mutation: reject, serverError: rejectError } = useRejectEntry(area, {
    onSuccess: () => setRejecting(null),
  });
  const { mutation: bulk } = useBulkApprove(area, {
    onSuccess: (result) => {
      remember(items.filter((e) => result.approved.includes(e.id)));
      setSelected([]);
      setBulkResult({ result, entries: items });
    },
  });

  const approveOne = (entry) => approve.mutate({ url: `${area}/TimeEntries/${entry.id}/approve`, entry });
  const busyId = approve.isPending ? approve.variables?.entry?.id : null;

  const toggle = (id) => setSelected((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  const allSelected = items.length > 0 && selectedOnPage.length === items.length;
  const toggleAll = () => setSelected(allSelected ? [] : items.map((e) => e.id));

  const selectedHours = items.filter((e) => selectedOnPage.includes(e.id)).reduce((sum, e) => sum + e.hours, 0);
  const overBudgetCount = items.filter((e) => e.budgetImpact?.wouldExceedBudget).length;

  return (
    <Box>
      <PageHeader
        title="Approvals"
        subtitle={
          isDirector
            ? "Final approval. Approved hours count against the project budget."
            : "First approval on your projects. Approved entries move on to the director."
        }
        actions={
          <Button
            variant="contained"
            startIcon={<DoneAllIcon />}
            disabled={selectedOnPage.length === 0}
            loading={bulk.isPending}
            onClick={() => bulk.mutate({ ids: selectedOnPage })}
          >
            Approve selected{selectedOnPage.length ? ` (${selectedOnPage.length})` : ""}
          </Button>
        }
      />

      {isDirector && overBudgetCount > 0 && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
          {overBudgetCount} {overBudgetCount === 1 ? "entry on this page would" : "entries on this page would"} push a
          project over its budget if approved.
        </Alert>
      )}

      <Card>
        {selectedOnPage.length > 0 && (
          <Box sx={{ px: 2, py: 1.25, bgcolor: "action.selected" }}>
            <Typography variant="body2">
              {selectedOnPage.length} selected · {formatHours(selectedHours)}
            </Typography>
          </Box>
        )}

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <Box sx={{ p: 2 }}>
            <ErrorState error={error} onRetry={refetch} />
          </Box>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<TaskAltIcon sx={{ fontSize: 44, color: "success.main" }} />}
            title="All caught up"
            message="No entries are waiting for your review. This page refreshes on its own."
          />
        ) : (
          <>
            <TableContainer sx={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={allSelected}
                        indeterminate={selectedOnPage.length > 0 && !allSelected}
                        onChange={toggleAll}
                        slotProps={{ input: { "aria-label": "Select all on this page" } }}
                      />
                    </TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell align="right" sx={stickyRight}>
                      Review
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((entry) => (
                    <TableRow key={entry.id} hover selected={selectedOnPage.includes(entry.id)}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedOnPage.includes(entry.id)}
                          onChange={() => toggle(entry.id)}
                          slotProps={{ input: { "aria-label": `Select entry of ${entry.employeeName}` } }}
                        />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography variant="body2">{entry.employeeName}</Typography>
                        {isDirector && entry.managerApprovedBy && (
                          <Tooltip title={`Manager approval ${timeAgo(entry.managerApprovedAt)}`}>
                            <Typography variant="caption" color="text.secondary">
                              ✓ {entry.managerApprovedBy}
                            </Typography>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography variant="body2" fontWeight={600}>
                          {entry.projectCode}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entry.projectName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography variant="body2">{formatWeekday(entry.workDate)}</Typography>
                        <Tooltip title={`Submitted ${formatDateTime(entry.submittedAt)}`}>
                          <Typography variant="caption" color="text.secondary">
                            sent {timeAgo(entry.submittedAt)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        <Typography variant="body2" fontWeight={600}>
                          {formatHours(entry.hours)}
                        </Typography>
                        {isDirector && <BudgetImpact impact={entry.budgetImpact} />}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 0, width: "30%" }}>
                        <Typography variant="body2" color="text.secondary" noWrap title={entry.notes ?? ""}>
                          {entry.notes || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={stickyRight}>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Approve">
                            <span>
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => approveOne(entry)}
                                disabled={approve.isPending}
                                loading={busyId === entry.id}
                                aria-label="Approve"
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton color="error" size="small" onClick={() => setRejecting(entry)} aria-label="Reject">
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
              pageSizeOptions={[20, 50, 100]}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </>
        )}
      </Card>

      {isDirector && <RecentlyApproved />}

      <ReviewCommentDialog
        open={!!rejecting}
        title="Reject entry"
        description={
          rejecting &&
          `${rejecting.employeeName} · ${formatHours(rejecting.hours)} on ${rejecting.projectCode} for ${formatWeekday(rejecting.workDate)}. The employee will see your comment and can fix and resubmit.`
        }
        confirmLabel="Reject"
        loading={reject.isPending}
        serverError={rejectError}
        onSubmit={(comment) =>
          reject.mutate({ url: `${area}/TimeEntries/${rejecting.id}/reject`, data: { comment } })
        }
        onClose={() => setRejecting(null)}
      />
      <BulkResultDialog
        result={bulkResult?.result}
        entries={bulkResult?.entries}
        onClose={() => setBulkResult(null)}
      />
    </Box>
  );
}

export default Approvals;
