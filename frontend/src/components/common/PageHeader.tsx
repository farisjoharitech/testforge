import type { ReactNode } from 'react';

import {
  Box,
  Stack,
  Typography,
} from '@mui/material';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;

  /**
   * Kept for source compatibility with pages created before Task 36.26.
   * Breadcrumb rendering is now centralized in AppLayout/AppBreadcrumbs,
   * so individual pages no longer create a second breadcrumb row.
   */
  breadcrumbs?: BreadcrumbItem[];

  actions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  description,
  actions,
}: PageHeaderProps) {
  const supportingText = description ?? subtitle;

  return (
    <Stack spacing={1.25}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              overflowWrap: 'anywhere',
            }}
          >
            {title}
          </Typography>

          {supportingText && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 0.75, maxWidth: 900, whiteSpace: 'pre-wrap' }}
            >
              {supportingText}
            </Typography>
          )}
        </Box>

        {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
      </Stack>
    </Stack>
  );
}
