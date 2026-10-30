import { Box, Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

function StatCard({ label, value, hint, icon, color = "primary", onClick }) {
  const content = (
    <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.5, fontVariantNumeric: "tabular-nums" }}>
            {value}
          </Typography>
        </Box>
        {icon && (
          <Box
            sx={(theme) => ({
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              color: `${color}.main`,
              bgcolor: alpha(theme.palette[color].main, 0.14),
            })}
          >
            {icon}
          </Box>
        )}
      </Stack>
      {hint && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          {hint}
        </Typography>
      )}
    </CardContent>
  );

  return (
    <Card sx={{ height: "100%" }}>
      {onClick ? (
        <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}

export default StatCard;
