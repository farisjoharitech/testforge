import {
  Delete,
} from '@mui/icons-material';

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

interface DeleteConfirmationDialogProps {
  open: boolean;
  title: string;
  entityName: string;
  description?: string;
  deleting?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationDialog({
  open,
  title,
  entityName,
  description,
  deleting = false,
  error,
  onClose,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={
        deleting
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {title}
      </DialogTitle>

      <DialogContent>
        <Stack
          spacing={2}
          sx={{
            pt: 1,
          }}
        >
          {error && (
            <Alert
              severity="error"
            >
              {error}
            </Alert>
          )}

          <Typography>
            You are about to
            permanently delete:
          </Typography>

          <Typography
            variant="h6"
            fontWeight={700}
          >
            {entityName}
          </Typography>

          {description && (
            <Alert
              severity="warning"
              variant="outlined"
            >
              {description}
            </Alert>
          )}

          <Typography
            color="text.secondary"
          >
            This action cannot be
            undone.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Button
          disabled={deleting}
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          color="error"
          variant="contained"
          disabled={deleting}
          startIcon={
            deleting ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <Delete />
            )
          }
          onClick={onConfirm}
        >
          {deleting
            ? 'Deleting...'
            : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}