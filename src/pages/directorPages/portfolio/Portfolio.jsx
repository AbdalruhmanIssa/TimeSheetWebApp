import { useState } from "react";
import { Box, Card, MenuItem, Stack, TextField, Typography } from "@mui/material";
import PageHeader from "../../../components/common/PageHeader";
import TablePager from "../../../components/common/TablePager";
import PortfolioTable from "../../../components/reports/PortfolioTable";
import { EmptyState, ErrorState, LoadingState } from "../../../components/requestStates/RequestStates";
import { usePortfolio } from "../../../hooks/reportHooks/useReports";
import { DEFAULT_PAGE_SIZE, PROJECT_STATUS } from "../../../utils/constants";

function Portfolio() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = usePortfolio({ status, page, pageSize });

  return (
    <Box>
      <PageHeader
        title="Portfolio"
        subtitle="Every project you direct. Exceeded and projected-to-exceed projects come first."
      />

      <Card>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <TextField
            select
            label="Project status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {Object.entries(PROJECT_STATUS).map(([value, meta]) => (
              <MenuItem key={value} value={value}>
                {meta.label}
              </MenuItem>
            ))}
          </TextField>
          {data && (
            <Typography variant="body2" color="text.secondary">
              {data.totalCount} projects
            </Typography>
          )}
        </Stack>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <Box sx={{ p: 2 }}>
            <ErrorState error={error} onRetry={refetch} />
          </Box>
        ) : data.items.length === 0 ? (
          <EmptyState title="No projects" message="Projects you create show up here with their budget health." />
        ) : (
          <Box sx={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
            <PortfolioTable items={data.items} />
            <TablePager
              data={data}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </Box>
        )}
      </Card>
    </Box>
  );
}

export default Portfolio;
