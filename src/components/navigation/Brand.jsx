import { Box, Stack, Typography } from "@mui/material";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";

function Brand({ size = "medium" }) {
  const large = size === "large";
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Box
        sx={{
          width: large ? 44 : 34,
          height: large ? 44 : 34,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(135deg, #4f8cff 0%, #22c3a6 100%)",
          color: "#fff",
        }}
      >
        <AccessTimeFilledIcon fontSize={large ? "medium" : "small"} />
      </Box>
      <Typography variant={large ? "h5" : "h6"} fontWeight={700} letterSpacing={0.2}>
        TimeSheet
      </Typography>
    </Stack>
  );
}

export default Brand;
