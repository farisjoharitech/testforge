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
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';

import {
  ApiError,
} from '../../api/apiClient';

import {
  testCaseApi,
} from '../../api/testCaseApi';

import type {
  AutomationStatus,
  AutomationType,
  TestCase,
  TestCasePriority,
  TestCaseStatus,
  TestType,
} from '../../types/testCase';

interface EditTestCaseDialogProps {
  open: boolean;
  testCase: TestCase;
  onClose: () => void;
  onUpdated: (
    testCase: TestCase,
  ) => void;
}

const priorities:
  TestCasePriority[] = [
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL',
  ];

const statuses:
  TestCaseStatus[] = [
    'DRAFT',
    'ACTIVE',
    'APPROVED',
    'REJECTED',
    'ARCHIVED',
  ];

const testTypes:
  TestType[] = [
    'SMOKE',
    'SANITY',
    'REGRESSION',
    'FUNCTIONAL',
    'INTEGRATION',
    'END_TO_END',
    'POSITIVE',
    'NEGATIVE',
  ];

const automationTypes:
  AutomationType[] = [
    'UI',
    'API',
    'UI_API',
  ];

const automationStatuses:
  AutomationStatus[] = [
    'NOT_AUTOMATED',
    'SCRIPT_GENERATED',
    'READY',
    'RUNNING',
    'AUTOMATED',
  ];

export default function EditTestCaseDialog({
  open,
  testCase,
  onClose,
  onUpdated,
}: EditTestCaseDialogProps) {
  const [
    name,
    setName,
  ] = useState('');

  const [
    preconditions,
    setPreconditions,
  ] = useState('');

  const [
    testData,
    setTestData,
  ] = useState('');

  const [
    expectedResult,
    setExpectedResult,
  ] = useState('');

  const [
    priority,
    setPriority,
  ] = useState<TestCasePriority>(
    'MEDIUM',
  );

  const [
    testType,
    setTestType,
  ] = useState<TestType>(
    'FUNCTIONAL',
  );

  const [
    automatable,
    setAutomatable,
  ] = useState(false);

  const [
    automationType,
    setAutomationType,
  ] = useState<AutomationType>(
    'MANUAL',
  );

  const [
    automationStatus,
    setAutomationStatus,
  ] = useState<AutomationStatus>(
    'NOT_APPLICABLE',
  );

  const [
    status,
    setStatus,
  ] = useState<TestCaseStatus>(
    'DRAFT',
  );

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

      setName(
        testCase.name,
      );

      setPreconditions(
        testCase.preconditions ??
          '',
      );

      setTestData(
        testCase.testData ??
          '',
      );

      setExpectedResult(
        testCase.expectedResult,
      );

      setPriority(
        testCase.priority,
      );

      setTestType(
        testCase.testType,
      );

      setAutomatable(
        testCase.automatable,
      );

      setAutomationType(
        testCase.automationType,
      );

      setAutomationStatus(
        testCase.automationStatus,
      );

      setStatus(
        testCase.status,
      );

      setError(null);
    },
    [
      open,
      testCase,
    ],
  );

  const handleAutomatableChange =
    (
      checked: boolean,
    ) => {
      setAutomatable(
        checked,
      );

      if (checked) {
        setAutomationType(
          'UI',
        );

        setAutomationStatus(
          'NOT_AUTOMATED',
        );
      } else {
        setAutomationType(
          'MANUAL',
        );

        setAutomationStatus(
          'NOT_APPLICABLE',
        );
      }
    };

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

      const trimmedName =
        name.trim();

      const trimmedExpected =
        expectedResult.trim();

      if (!trimmedName) {
        setError(
          'Name is required.',
        );

        return;
      }

      if (!trimmedExpected) {
        setError(
          'Expected Result is required.',
        );

        return;
      }

      try {
        setSubmitting(true);
        setError(null);

        const updated =
          await testCaseApi
            .updateTestCase(
              testCase.id,
              {
                name:
                  trimmedName,

                preconditions:
                  optionalValue(
                    preconditions,
                  ),

                testData:
                  optionalValue(
                    testData,
                  ),

                expectedResult:
                  trimmedExpected,

                priority,
                testType,
                automatable,
                automationType,
                automationStatus,
                status,
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
            'Unable to update Test Case.',
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
        Edit Test Case
      </DialogTitle>

      <DialogContent>
        <form
          id="edit-test-case-form"
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
              Test Case ID{' '}
              <strong>
                {
                  testCase.testCaseId
                }
              </strong>{' '}
              cannot be changed.
            </Alert>

            <TextField
              label="Name"
              required
              value={name}
              inputProps={{
                maxLength: 255,
              }}
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                setName(
                  event.target.value,
                )
              }
            />

            <TextField
              label="Preconditions"
              multiline
              minRows={3}
              value={
                preconditions
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
                setPreconditions(
                  event.target.value,
                )
              }
            />

            <TextField
              label="Test Data"
              multiline
              minRows={3}
              value={testData}
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
                setTestData(
                  event.target.value,
                )
              }
            />

            <TextField
              label="Expected Result"
              required
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

            <TextField
              select
              label="Priority"
              value={priority}
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                setPriority(
                  event.target
                    .value as
                    TestCasePriority,
                )
              }
            >
              {priorities.map(
                (
                  option,
                ) => (
                  <MenuItem
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {option}
                  </MenuItem>
                ),
              )}
            </TextField>

            <TextField
              select
              label="Test Type"
              value={testType}
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                setTestType(
                  event.target
                    .value as
                    TestType,
                )
              }
            >
              {testTypes.map(
                (
                  option,
                ) => (
                  <MenuItem
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {option}
                  </MenuItem>
                ),
              )}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={
                    automatable
                  }
                  disabled={
                    submitting
                  }
                  onChange={(
                    event,
                  ) =>
                    handleAutomatableChange(
                      event.target
                        .checked,
                    )
                  }
                />
              }
              label="Automatable"
            />

            <TextField
              select
              label="Automation Type"
              value={
                automationType
              }
              disabled={
                submitting ||
                !automatable
              }
              onChange={(
                event,
              ) =>
                setAutomationType(
                  event.target
                    .value as
                    AutomationType,
                )
              }
            >
              {!automatable ? (
                <MenuItem
                  value="MANUAL"
                >
                  MANUAL
                </MenuItem>
              ) : (
                automationTypes.map(
                  (
                    option,
                  ) => (
                    <MenuItem
                      key={
                        option
                      }
                      value={
                        option
                      }
                    >
                      {option}
                    </MenuItem>
                  ),
                )
              )}
            </TextField>

            <TextField
              select
              label="Automation Status"
              value={
                automationStatus
              }
              disabled={
                submitting ||
                !automatable
              }
              onChange={(
                event,
              ) =>
                setAutomationStatus(
                  event.target
                    .value as
                    AutomationStatus,
                )
              }
            >
              {!automatable ? (
                <MenuItem
                  value="NOT_APPLICABLE"
                >
                  NOT_APPLICABLE
                </MenuItem>
              ) : (
                automationStatuses.map(
                  (
                    option,
                  ) => (
                    <MenuItem
                      key={
                        option
                      }
                      value={
                        option
                      }
                    >
                      {option}
                    </MenuItem>
                  ),
                )
              )}
            </TextField>

            <TextField
              select
              label="Status"
              value={status}
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                setStatus(
                  event.target
                    .value as
                    TestCaseStatus,
                )
              }
            >
              {statuses.map(
                (
                  option,
                ) => (
                  <MenuItem
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {option}
                  </MenuItem>
                ),
              )}
            </TextField>
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
          form="edit-test-case-form"
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