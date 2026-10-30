import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Bounce, ToastContainer } from "react-toastify";
import router from "./route.jsx";
import theme from "./theme/theme.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // 4xx answers (404 out of scope, 400 bad filter) will not change on a retry.
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer
          position="top-center"
          autoClose={4000}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          theme="dark"
          transition={Bounce}
        />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
