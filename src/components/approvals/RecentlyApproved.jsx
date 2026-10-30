import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import useRecentApprovalsStore from "../../store/useRecentApprovalsStore";
import { useReopenEntry } from "../../hooks/approvalHooks/useApprovals";
import ReviewCommentDialog from "./ReviewCommentDialog";
import { formatHours, formatWeekday, timeAgo } from "../../utils/format";

// director only: entries approved in this session, with Reopen (Approved → Rejected, hours leave the budget)
function RecentlyApproved() {
  const { entries, remove, clear } = useRecentApprovalsStore();
  const [reopening, setReopening] = useState(null);
  const { mutation: reopen, serverError } = useReopenEntry({
    onSuccess: () => {
      remove(reopening.id);
      setReopening(null);
    },
  });

  if (entries.length === 0) return null;

  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader
        title="Approved this session"
        subheader="Reopen sends an approved entry back to the employee and removes its hours from the budget."
        slotProps={{ title: { variant: "h6" } }}
        action={
          <Tooltip title="Clear list">
            <IconButton onClick={clear} aria-label="Clear list">
              <ClearAllIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <List disablePadding>
        {entries.map((entry) => (
          <ListItem
            key={entry.id}
            divider
            secondaryAction={
              <Button size="small" color="warning" startIcon={<UndoIcon />} onClick={() => setReopening(entry)}>
                Reopen
              </Button>
            }
            sx={{ pr: 14 }}
          >
            <ListItemText
              primary={
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  <Typography fontWeight={600}>{entry.employeeName}</Typography>
                  <Typography color="text.secondary">
                    {formatHours(entry.hours)} on {entry.projectCode}
                  </Typography>
                </Stack>
              }
              secondary={`${formatWeekday(entry.workDate)} · approved ${timeAgo(entry.approvedAt)}`}
            />
          </ListItem>
        ))}
      </List>

      <ReviewCommentDialog
        open={!!reopening}
        title="Reopen approved entry"
        description={
          reopening &&
          `${reopening.employeeName} · ${formatHours(reopening.hours)} on ${reopening.projectCode}. The entry goes back to Rejected and its hours no longer count as actual.`
        }
        confirmLabel="Reopen"
        loading={reopen.isPending}
        serverError={serverError}
        onSubmit={(comment) => reopen.mutate({ url: `Director/TimeEntries/${reopening.id}/reopen`, data: { comment } })}
        onClose={() => setReopening(null)}
      />
    </Card>
  );
}

export default RecentlyApproved;
