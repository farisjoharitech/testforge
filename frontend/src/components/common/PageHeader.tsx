import type { ReactNode } from 'react';

import {
  Box,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  const supportingText = description ?? subtitle;

  return (
    <Stack spacing={1.25}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            '& .MuiBreadcrumbs-li': { fontSize: '0.8rem' },
            color: 'text.secondary',
          }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            if (item.to && !isLast) {
              return (
                <MuiLink
                  key={`${item.label}-${index}`}
                  component={RouterLink}
                  to={item.to}
                  underline="hover"
                  color="inherit"
                >
                  {item.label}
                </MuiLink>
              );
            }

            return (
              <Typography
                key={`${item.label}-${index}`}
                variant="caption"
                color={isLast ? 'text.primary' : 'text.secondary'}
                fontWeight={isLast ? 600 : 400}
              >
                {item.label}
              </Typography>
            );
          })}
        </Breadcrumbs>
      )}

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
