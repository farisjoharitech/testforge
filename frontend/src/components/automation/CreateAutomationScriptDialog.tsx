import {
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

import type {
  CreateAutomationScriptRequest,
} from '../../types/automation';

import type {
  TestCase,
} from '../../types/testCase';

interface CreateAutomationScriptDialogProps {
  open: boolean;
  testCase: TestCase;
  creating?: boolean;
  error?: string | null;
  onClose: () => void;
  onCreate: (
    request: CreateAutomationScriptRequest,
  ) => void;
}

function buildDefaultScriptId(
  testCaseId: string,
): string {
  const normalized =
    testCaseId
      .replace(
        /[^A-Za-z0-9-_]/g,
        '-',
      )
      .toUpperCase();

  return `AUTO-${normalized}`
    .slice(0, 50);
}

export default function CreateAutomationScriptDialog({
  open,
  testCase,
  creating = false,
  error,
  onClose,
  onCreate,
}: CreateAutomationScriptDialogProps) {
  const [
    automationScriptId,
    setAutomationScriptId,
  ] = useState('');

  const [
    name,
    setName,
  ] = useState('');

  const [
    validationError,
    setValidationError,
  ] = useState<
    string | null
  >(null);

  useEffect(
    () => {
      if (!open) {
        return;
      }

      setAutomationScriptId(
        buildDefaultScriptId(
          testCase.testCaseId,
        ),
      );

      setName(
        `${testCase.name} Automation`,
      );

      setValidationError(null);
    },
    [
      open,
      testCase,
    ],
  );

  const handleSubmit = () => {
    const trimmedId =
      automationScriptId.trim();

    const trimmedName =
      name.trim();

    if (!trimmedId) {
      setValidationError(
        'Automation Script ID is required.',
      );

      return;
    }

    if (
      trimmedId.length > 50
    ) {
      setValidationError(
        'Automation Script ID must not exceed 50 characters.',
      );

      return;
    }

    if (!trimmedName) {
      setValidationError(
        'Automation Script name is required.',
      );

      return;
    }

    if (
      trimmedName.length > 255
    ) {
      setValidationError(
        'Automation Script name must not exceed 255 characters.',
      );

      return;
    }

    setValidationError(null);

    onCreate({
      automationScriptId:
        trimmedId,

      name:
        trimmedName,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={
        creating
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Create Automation Script
      </DialogTitle>

      <DialogContent>
        <Stack
          spacing={2}
          sx={{
            pt: 1,
          }}
        >
          {(error ||
            validationError) && (
            <Alert
              severity="error"
            >
              {error ??
                validationError}
            </Alert>
          )}

          <TextField
            label="Test Case"
            value={
              `${testCase.testCaseId} — ${testCase.name}`
            }
            disabled
            fullWidth
          />

          <TextField
            label="Automation Script ID"
            value={
              automationScriptId
            }
            onChange={(
              event,
            ) =>
              setAutomationScriptId(
                event.target.value,
              )
            }
            required
            fullWidth
            inputProps={{
              maxLength: 50,
            }}
            helperText={`${automationScriptId.length}/50`}
          />

          <TextField
            label="Name"
            value={
              name
            }
            onChange={(
              event,
            ) =>
              setName(
                event.target.value,
              )
            }
            required
            fullWidth
            inputProps={{
              maxLength: 255,
            }}
            helperText={`${name.length}/255`}
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Button
          disabled={creating}
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={creating}
          onClick={handleSubmit}
          startIcon={
            creating ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : undefined
          }
        >
          {creating
            ? 'Creating...'
            : 'Create Script'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}