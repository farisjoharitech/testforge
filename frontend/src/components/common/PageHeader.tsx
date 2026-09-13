import type {
  ReactNode,
} from 'react';

import {
  Box,
  Stack,
  Typography,
} from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <Stack
      direction={{
        xs: 'column',
        sm: 'row',
      }}
      spacing={2}
      sx={{
        alignItems: {
          xs: 'stretch',
          sm: 'center',
        },
        justifyContent:
          'space-between',
      }}
    >
      <Box>
        <Typography
          variant="h4"
          fontWeight={700}
        >
          {title}
        </Typography>

        {
          subtitle
          && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              {subtitle}
            </Typography>
          )
        }
      </Box>

      {
        actions
        && (
          <Box>
            {actions}
          </Box>
        )
      }
    </Stack>
  );
}