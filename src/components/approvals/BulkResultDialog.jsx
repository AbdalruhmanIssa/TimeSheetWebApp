import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

// bulk approve handles each entry on its own: some may pass while others fail (already reviewed, out of scope…)
function BulkResultDialog({ result, entries, onClose }) {
  const byId = Object.fromEntries((entries ?? []).map((e) => [e.id, e]));
  const describe = (id) => {
    const entry = byId[id];
    return entry ? `${entry.employeeName} · ${entry.projectCode} · ${entry.workDate}` : id;
  };

  return (
    <Dialog open={!!result} onClose={onClose}>
      <DialogTitle>Bulk approval result</DialogTitle>
      <DialogContent>
        {result && (
          <>
            <Alert severity={result.failed.length ? "warning" : "success"} variant="outlined" sx={{ mb: 2 }}>
              {result.approved.length} approved
              {result.failed.length ? `, ${result.failed.length} could not be approved` : ""}.
            </Alert>
            {result.failed.length > 0 && (
              <List dense disablePadding>
                {result.failed.map((failure) => (
                  <ListItem key={failure.id} divider disableGutters>
                    <ListItemText
                      primary={describe(failure.id)}
                      secondary={failure.reason}
                      slotProps={{ secondary: { color: "error.main" } }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BulkResultDialog;
