import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        px: 2,
        bgcolor: "background.default",
      }}
    >
      <Box>
        <Typography variant="h1" fontWeight={800} color="primary.main" sx={{ fontSize: { xs: 72, md: 112 } }}>
          404
        </Typography>
        <Typography variant="h5">This page doesn't exist</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          The link may be wrong, or the page belongs to another role.
        </Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 3 }}>
          Back to my dashboard
        </Button>
      </Box>
    </Box>
  );
}

export default NotFound;
