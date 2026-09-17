import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import {
  Save,
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

interface EditTestStepDialogProps {
  open: boolean;
  testStep: TestStep;
  onClose: () => void;
  onUpdated: (
    testStep: TestStep,
  ) => void;
}

export default function EditTestStepDialog({
  open,
  testStep,
  onClose,
  onUpdated,
}: EditTestStepDialogProps) {
  const [
    stepOrder,
    setStepOrder,
  ] = useState(
    testStep.stepOrder,
  );

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

  useEffect(
    () => {
      if (!open) {
        return;
      }

      setStepOrder(
        testStep.stepOrder,
      );

      setAction(
        testStep.action,
      );

      setTarget(
        testStep.target ?? '',
      );

      setInputValue(
        testStep.inputValue ??
          '',
      );

      setExpectedResult(
        testStep.expectedResult ??
          '',
      );

      setError(null);
    },
    [
      open,
      testStep,
    ],
  );

  const optionalValue = (
    value: string,
  ): string | undefined => {
    const trimmed =
      value.trim();

    return trimmed ||
      undefined;
  };

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const trimmedAction =
        action.trim();

      if (
        !Number.isInteger(
          stepOrder,
        ) ||
        stepOrder < 1
      ) {
        setError(
          'Step Order must be a whole number of at least 1.',
        );

        return;
      }

      if (!trimmedAction) {
        setError(
          'Test Step action is required.',
        );

        return;
      }

      try {
        setSubmitting(true);
        setError(null);

        const updated =
          await testStepApi
            .updateTestStep(
              testStep.id,
              {
                stepOrder,

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

        onUpdated(updated);
      } catch (err) {
        if (
          err instanceof
          ApiError
        ) {
          setError(
            err.message,
          );
        } else {
          setError(
            'Unable to update Test Step.',
          );
        }
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <Dialog
      open={open}
      onClose={
        submitting
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Edit Test Step
      </DialogTitle>

      <DialogContent>
        <form
          id="edit-test-step-form"
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
              >
                {error}
              </Alert>
            )}

            <Alert
              severity="info"
              variant="outlined"
            >
              Test Step ID{' '}
              <strong>
                {
                  testStep.testStepId
                }
              </strong>{' '}
              cannot be changed.
            </Alert>

            <TextField
              label="Step Order"
              required
              type="number"
              value={
                stepOrder
              }
              inputProps={{
                min: 1,
                step: 1,
              }}
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                setStepOrder(
                  Number(
                    event.target
                      .value,
                  ),
                )
              }
            />

            <TextField
              label="Action"
              required
              multiline
              minRows={3}
              value={action}
              inputProps={{
                maxLength:
                  1000,
              }}
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                setAction(
                  event.target.value,
                )
              }
            />

            <TextField
              label="Target (Optional)"
              multiline
              minRows={2}
              value={target}
              inputProps={{
                maxLength:
                  500,
              }}
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                setTarget(
                  event.target.value,
                )
              }
            />

            <TextField
              label="Input Value (Optional)"
              multiline
              minRows={2}
              value={
                inputValue
              }
              inputProps={{
                maxLength:
                  2000,
              }}
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                setInputValue(
                  event.target.value,
                )
              }
            />

            <TextField
              label="Expected Result (Optional)"
              multiline
              minRows={3}
              value={
                expectedResult
              }
              inputProps={{
                maxLength:
                  2000,
              }}
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                setExpectedResult(
                  event.target.value,
                )
              }
            />
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
            onClose
          }
        >
          Cancel
        </Button>

        <Button
          type="submit"
          form="edit-test-step-form"
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
              <Save />
            )
          }
        >
          {submitting
            ? 'Saving...'
            : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}