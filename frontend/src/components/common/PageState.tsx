import type {
  ReactNode,
} from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';

import {
  Refresh,
} from '@mui/icons-material';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = 'Loading...',
}: LoadingStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        py: 8,
      }}
    >
      <Stack
        spacing={2}
        sx={{
          alignItems: 'center',
        }}
      >
        <CircularProgress />

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {message}
        </Typography>
      </Stack>
    </Box>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Stack
        spacing={1.5}
        sx={{
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: 520,
          }}
        >
          {description}
        </Typography>

        {
          action
          && (
            <Box
              sx={{
                pt: 1,
              }}
            >
              {action}
            </Box>
          )
        }
      </Stack>
    </Box>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      action={
        onRetry
          ? (
              <Button
                color="inherit"
                size="small"
                startIcon={
                  <Refresh />
                }
                onClick={
                  onRetry
                }
              >
                Retry
              </Button>
            )
          : undefined
      }
    >
      {message}
    </Alert>
  );
}