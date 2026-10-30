import { Alert } from "@mui/material";

// the API's business-rule message (e.g. "You already logged 10 h on 30 Oct") shown inside a form
function FormError({ message }) {
  if (!message) return null;
  return (
    <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
      {message}
    </Alert>
  );
}

export default FormError;
