import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEntryHistory } from "../../hooks/employeeHooks/useEmployee";
import { EmptyState, ErrorState, LoadingState } from "../requestStates/RequestStates";
import StatusChip from "../common/StatusChip";
import { formatDate, formatDateTime, formatHours } from "../../utils/format";
import { REVIEW_DECISION } from "../../utils/constants";

// every review decision on an entry, oldest first (rejections, approvals, reopenings)
function EntryHistoryDialog({ entry, onClose }) {
  const { data = [], isLoading, isError, error, refetch } = useEntryHistory(entry?.id);

  return (
    <Dialog open={!!entry} onClose={onClose}>
      <DialogTitle>Entry history</DialogTitle>
      <DialogContent>
        {entry && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={600}>
                  {entry.projectCode} — {entry.projectName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(entry.workDate)} · {formatHours(entry.hours)} · submitted {formatDateTime(entry.submittedAt)}
                </Typography>
              </Box>
              <StatusChip value={entry.status} />
            </Stack>
          </Paper>
        )}

        {isLoading && <LoadingState minHeight={120} />}
        {isError && <ErrorState error={error} onRetry={refetch} />}
        {!isLoading && !isError && data.length === 0 && (
          <EmptyState title="No reviews yet" message="Nobody has reviewed this entry so far." />
        )}

        <Stack spacing={0}>
          {data.map((review, index) => {
            const color = REVIEW_DECISION[review.decision]?.color ?? "primary";
            const last = index === data.length - 1;
            return (
              <Stack key={`${review.reviewedAt}-${index}`} direction="row" spacing={2}>
                <Stack alignItems="center" sx={{ pt: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: `${color}.main`, flexShrink: 0 }} />
                  {!last && <Box sx={{ width: 2, flex: 1, bgcolor: "divider", my: 0.5 }} />}
                </Stack>
                <Box sx={{ pb: last ? 0 : 2.5, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                    <StatusChip type="decision" value={review.decision} />
                    <Typography variant="body2" color="text.secondary">
                      by {review.reviewerName} ({review.level.toLowerCase()})
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(review.reviewedAt)}
                  </Typography>
                  {review.comment && (
                    <Typography variant="body2" sx={{ mt: 0.75, whiteSpace: "pre-wrap" }}>
                      “{review.comment}”
                    </Typography>
                  )}
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default EntryHistoryDialog;
