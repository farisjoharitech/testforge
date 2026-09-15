import type { ReactNode } from 'react';

import Search from '@mui/icons-material/Search';
import {
  Box,
  FormControl,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

interface WorkspaceCollectionProps {
  title: string;
  totalCount: number;
  filteredCount: number;
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  children: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
}

export function WorkspaceCollection({
  title,
  totalCount,
  filteredCount,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  children,
  filters,
  actions,
}: WorkspaceCollectionProps) {
  const pageCount = Math.max(1, Math.ceil(filteredCount / pageSize));
  const start = filteredCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, filteredCount);

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {totalCount.toLocaleString()} total
            {filteredCount !== totalCount ? ` · ${filteredCount.toLocaleString()} matching` : ''}
          </Typography>
        </Box>
        {actions}
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <TextField
          size="small"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          sx={{ flex: 1, minWidth: { md: 280 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
              ),
            },
          }}
        />
        {filters}
        <FormControl size="small" sx={{ minWidth: 105 }}>
          <Select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            <MenuItem value={25}>25 / page</MenuItem>
            <MenuItem value={50}>50 / page</MenuItem>
            <MenuItem value={100}>100 / page</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {children}

      {filteredCount > 0 && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Typography variant="caption" color="text.secondary">
            Showing {start.toLocaleString()}–{end.toLocaleString()} of {filteredCount.toLocaleString()}
          </Typography>
          {pageCount > 1 && (
            <Pagination
              page={page}
              count={pageCount}
              onChange={(_, value) => onPageChange(value)}
              size="small"
              siblingCount={1}
              boundaryCount={1}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
}
