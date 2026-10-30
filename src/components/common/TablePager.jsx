import { TablePagination } from "@mui/material";

// MUI pages are 0-based, the API's are 1-based
function TablePager({ data, page, pageSize, onPageChange, onPageSizeChange, pageSizeOptions = [10, 20, 50] }) {
  return (
    <TablePagination
      component="div"
      count={data?.totalCount ?? 0}
      page={data?.totalCount ? page - 1 : 0}
      rowsPerPage={pageSize}
      rowsPerPageOptions={pageSizeOptions}
      onPageChange={(_, next) => onPageChange(next + 1)}
      onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
      sx={{ borderTop: 1, borderColor: "divider" }}
    />
  );
}

export default TablePager;
