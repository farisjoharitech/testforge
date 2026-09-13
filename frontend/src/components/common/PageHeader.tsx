import {
  Box,
  Breadcrumbs,
  Link,
  Stack,
  Typography,
} from '@mui/material';

import {
  Link as RouterLink,
} from 'react-router-dom';

import type {
  ReactNode,
} from 'react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
}: PageHeaderProps) {
  return (
    <Stack spacing={2}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs>
          {breadcrumbs.map(
            (item, index) => {
              const isLast =
                index ===
                breadcrumbs.length - 1;

              if (
                item.to &&
                !isLast
              ) {
                return (
                  <Link
                    key={`${item.label}-${index}`}
                    component={
                      RouterLink
                    }
                    to={item.to}
                    underline="hover"
                    color="inherit"
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <Typography
                  key={`${item.label}-${index}`}
                  color={
                    isLast
                      ? 'text.primary'
                      : 'text.secondary'
                  }
                >
                  {item.label}
                </Typography>
              );
            },
          )}
        </Breadcrumbs>
      )}

      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        spacing={2}
        sx={{
          justifyContent:
            'space-between',

          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
          >
            {title}
          </Typography>

          {description && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>

        {actions && (
          <Box>
            {actions}
          </Box>
        )}
      </Stack>
    </Stack>
  );
}