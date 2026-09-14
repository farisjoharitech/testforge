import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import {
  Add,
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
  TextField,
} from '@mui/material';

import {
  ApiError,
} from '../../api/apiClient';

import {
  testStepApi,
} from '../../api/testStepApi';

import type {
  TestStep,
} from '../../types/testStep';

interface CreateTestStepDialogProps {
  open: boolean;

  testCaseId: string;

  onClose: () => void;

  onCreated: (
      testStep: TestStep,
  ) => void;
}

export default function CreateTestStepDialog({
                                               open,
                                               testCaseId,
                                               onClose,
                                               onCreated,
                                             }: CreateTestStepDialogProps) {
  const [
    action,
    setAction,
  ] = useState('');

  const [
    target,
    setTarget,
  ] = useState('');

  const [
    inputValue,
    setInputValue,
  ] = useState('');

  const [
    expectedResult,
    setExpectedResult,
  ] = useState('');

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
      string | null
  >(null);

  const resetForm =
      () => {

        setAction('');

        setTarget('');

        setInputValue('');

        setExpectedResult('');

        setError(null);
      };

  useEffect(
      () => {
        if (open) {
          resetForm();
        }
      },
      [
        open,
      ],
  );

  const optionalValue =
      (
          value: string,
      ):
          | string
          | undefined => {
        const trimmed =
            value.trim();

        return trimmed ||
            undefined;
      };

  const handleClose =
      () => {
        if (submitting) {
          return;
        }

        resetForm();

        onClose();
      };

  const handleSubmit =
      async (
          event:
          FormEvent<HTMLFormElement>,
      ) => {
        event.preventDefault();

        setError(null);

        const trimmedAction =
            action.trim();

        if (!trimmedAction) {
          setError(
              'Action is required.',
          );

          return;
        }

        if (
            trimmedAction.length >
            1000
        ) {
          setError(
              'Action must not exceed 1000 characters.',
          );

          return;
        }

        if (
            target.length >
            500
        ) {
          setError(
              'Target must not exceed 500 characters.',
          );

          return;
        }

        if (
            inputValue.length >
            2000
        ) {
          setError(
              'Input Value must not exceed 2000 characters.',
          );

          return;
        }

        if (
            expectedResult.length >
            2000
        ) {
          setError(
              'Expected Result must not exceed 2000 characters.',
          );

          return;
        }

        try {
          setSubmitting(
              true,
          );

          const created =
              await testStepApi
                  .createTestStep(
                      testCaseId,
                      {
                        action:
                        trimmedAction,

                        target:
                            optionalValue(
                                target,
                            ),

                        inputValue:
                            optionalValue(
                                inputValue,
                            ),

                        expectedResult:
                            optionalValue(
                                expectedResult,
                            ),
                      },
                  );

          resetForm();

          onCreated(
              created,
          );
        } catch (err) {
          console.error(
              'Failed to create Test Step:',
              err,
          );

          if (
              err instanceof
              ApiError
          ) {
            setError(
                err.message ||
                `Backend returned HTTP ${err.status}.`,
            );

            return;
          }

          if (
              err instanceof
              TypeError
          ) {
            setError(
                'Unable to connect to the backend. Make sure TestForge backend is running.',
            );

            return;
          }

          setError(
              'An unexpected error occurred while creating the Test Step.',
          );
        } finally {
          setSubmitting(
              false,
          );
        }
      };

  return (
      <Dialog
          open={open}
          onClose={
            handleClose
          }
          fullWidth
          maxWidth="md"
      >
        <DialogTitle>
          Add Test Step
        </DialogTitle>

        <DialogContent>
          <form
              id="create-test-step-form"
              onSubmit={
                handleSubmit
              }
          >
            <Stack
                spacing={3}
                sx={{
                  pt: 1,
                }}
            >
              {error && (
                  <Alert
                      severity="error"
                      onClose={() =>
                          setError(null)
                      }
                  >
                    {error}
                  </Alert>
              )}

              <TextField
                  label="Action"
                  required
                  fullWidth
                  multiline
                  minRows={3}
                  disabled={
                    submitting
                  }
                  value={
                    action
                  }
                  inputProps={{
                    maxLength:
                        1000,
                  }}
                  placeholder="Example: Enter the valid username and password."
                  onChange={(
                      event,
                  ) =>
                      setAction(
                          event.target
                              .value,
                      )
                  }
              />

              <TextField
                  label="Target"
                  fullWidth
                  multiline
                  minRows={2}
                  disabled={
                    submitting
                  }
                  value={
                    target
                  }
                  inputProps={{
                    maxLength:
                        500,
                  }}
                  helperText="Optional. Example: username field, Login button, /api/login."
                  placeholder="Example: username field"
                  onChange={(
                      event,
                  ) =>
                      setTarget(
                          event.target
                              .value,
                      )
                  }
              />

              <TextField
                  label="Input Value"
                  fullWidth
                  multiline
                  minRows={2}
                  disabled={
                    submitting
                  }
                  value={
                    inputValue
                  }
                  inputProps={{
                    maxLength:
                        2000,
                  }}
                  helperText="Optional input used by this step."
                  placeholder="Example: test.user@example.com"
                  onChange={(
                      event,
                  ) =>
                      setInputValue(
                          event.target
                              .value,
                      )
                  }
              />

              <TextField
                  label="Expected Result"
                  fullWidth
                  multiline
                  minRows={3}
                  disabled={
                    submitting
                  }
                  value={
                    expectedResult
                  }
                  inputProps={{
                    maxLength:
                        2000,
                  }}
                  helperText="Optional expected result for this individual Test Step."
                  placeholder="Example: Credentials are accepted."
                  onChange={(
                      event,
                  ) =>
                      setExpectedResult(
                          event.target
                              .value,
                      )
                  }
              />

              <Alert
                  severity="info"
                  variant="outlined"
              >
                Test Step will be
                created under Test
                Case{' '}
                <strong>
                  {testCaseId}
                </strong>
                .
              </Alert>
            </Stack>
          </form>
        </DialogContent>

        <DialogActions
            sx={{
              px: 3,
              pb: 3,
            }}
        >
          <Button
              disabled={
                submitting
              }
              onClick={
                handleClose
              }
          >
            Cancel
          </Button>

          <Button
              type="submit"
              form="create-test-step-form"
              variant="contained"
              disabled={
                submitting
              }
              startIcon={
                submitting ? (
                    <CircularProgress
                        size={18}
                        color="inherit"
                    />
                ) : (
                    <Add />
                )
              }
          >
            {submitting
                ? 'Creating...'
                : 'Create Test Step'}
          </Button>
        </DialogActions>
      </Dialog>
  );
}