import { Box, Stack, Typography } from "@mui/material";

function PageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Typography variant="overline" color="primary.main" sx={{ lineHeight: 1.6 }}>
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h5" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0, flexWrap: "wrap", rowGap: 1 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

export default PageHeader;
