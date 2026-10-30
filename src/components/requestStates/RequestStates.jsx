import { Box, Button, CircularProgress, Paper, Skeleton, Stack, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { getErrorMessage } from "../../utils/errors";

export function LoadingState({ label = "Loading…", minHeight = 240 }) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight }}>
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

export function DashboardLoadingState() {
  return (
    <Box>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={112} />
        ))}
      </Box>
      <Skeleton variant="rounded" height={320} sx={{ mt: 2 }} />
    </Box>
  );
}

export function ErrorState({ error, onRetry, title = "Couldn't load this" }) {
  return (
    <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
      <ErrorOutlineIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {getErrorMessage(error)}
      </Typography>
      {onRetry && (
        <Button onClick={() => onRetry()} variant="outlined" sx={{ mt: 2 }}>
          Try again
        </Button>
      )}
    </Paper>
  );
}

export function EmptyState({ title = "Nothing here yet", message, action, icon }) {
  return (
    <Stack alignItems="center" spacing={1} sx={{ py: 6, px: 2, textAlign: "center" }}>
      {icon ?? <InboxOutlinedIcon sx={{ fontSize: 40, color: "text.secondary" }} />}
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {message}
        </Typography>
      )}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  );
}
