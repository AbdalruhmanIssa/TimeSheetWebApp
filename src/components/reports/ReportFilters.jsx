import { Button, MenuItem, Stack, TextField } from "@mui/material";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { GROUP_BY } from "../../utils/constants";

// from / to are optional: the API defaults to project start → today
function ReportFilters({ filters, onChange, onDownload, downloading }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
      <TextField label="From" type="date" value={filters.from} onChange={set("from")} slotProps={{ inputLabel: { shrink: true } }} />
      <TextField label="To" type="date" value={filters.to} onChange={set("to")} slotProps={{ inputLabel: { shrink: true } }} />
      <TextField select label="Group by" value={filters.groupBy} onChange={set("groupBy")} sx={{ minWidth: 130 }}>
        {GROUP_BY.map((g) => (
          <MenuItem key={g.value} value={g.value}>
            {g.label}
          </MenuItem>
        ))}
      </TextField>
      <Button
        variant="outlined"
        startIcon={<PictureAsPdfOutlinedIcon />}
        onClick={onDownload}
        loading={downloading}
        sx={{ whiteSpace: "nowrap" }}
      >
        Export PDF
      </Button>
    </Stack>
  );
}

export default ReportFilters;
