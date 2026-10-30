import { IconButton, Stack, Tooltip } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DoDisturbOnOutlinedIcon from "@mui/icons-material/DoDisturbOnOutlined";
import HistoryIcon from "@mui/icons-material/History";

// the API rules: edit while PendingManager or Rejected, cancel only while PendingManager
export const canEdit = (entry) => entry.status === "PendingManager" || entry.status === "Rejected";
export const canCancel = (entry) => entry.status === "PendingManager";

function EntryActions({ entry, onEdit, onCancel, onHistory }) {
  return (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      <Tooltip title="History">
        <IconButton size="small" onClick={() => onHistory(entry)} aria-label="History">
          <HistoryIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {canEdit(entry) && (
        <Tooltip title={entry.status === "Rejected" ? "Fix & resubmit" : "Edit"}>
          <IconButton size="small" onClick={() => onEdit(entry)} aria-label="Edit" color="primary">
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {canCancel(entry) && (
        <Tooltip title="Cancel entry">
          <IconButton size="small" onClick={() => onCancel(entry)} aria-label="Cancel entry" color="error">
            <DoDisturbOnOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

export default EntryActions;
