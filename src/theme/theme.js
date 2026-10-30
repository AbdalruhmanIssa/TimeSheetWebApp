import { alpha, createTheme } from "@mui/material/styles";

const textSecondary = "#94a3b8";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#4f8cff" },
    secondary: { main: "#22c3a6" },
    success: { main: "#22c55e" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
    info: { main: "#38bdf8" },
    background: { default: "#0b1220", paper: "#111a2e" },
    divider: "rgba(148, 163, 184, 0.14)",
    text: { primary: "#e6ebf5", secondary: textSecondary },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCard: { defaultProps: { variant: "outlined" } },
    MuiButton: { defaultProps: { disableElevation: true } },
    // labels always sit on the border: forms use uncontrolled inputs (register / reset / setValue),
    // and MUI can't see those value changes to float the label itself
    // displayEmpty: filter selects show their "All …" item for the "" value
    MuiTextField: {
      defaultProps: { size: "small", slotProps: { inputLabel: { shrink: true }, select: { displayEmpty: true } } },
    },
    MuiSelect: { defaultProps: { size: "small" } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: textSecondary,
          fontWeight: 600,
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: 0.4,
          whiteSpace: "nowrap",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.MuiTableRow-hover:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
        }),
      },
    },
    MuiDialog: { defaultProps: { fullWidth: true, maxWidth: "sm" } },
  },
});

export default theme;
