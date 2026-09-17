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
  ] =
    useState<TestCasePriority>(
      'MEDIUM',
    );

  const [
    testType,
    setTestType,
  ] =
    useState<TestType>(
      'FUNCTIONAL',
    );

  const [
    automatable,
    setAutomatable,
  ] = useState(false);

  const [
    automationType,
    setAutomationType,
  ] =
    useState<AutomationType>(
      'MANUAL',
    );

  const [
    status,
    setStatus,
  ] =
    useState<TestCaseStatus>(
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
        testCase.preconditions
        ?? '',
      );

      setTestData(
        testCase.testData
        ?? '',
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
        /*
         * Preserve a valid
         * automation type when
         * possible.
         */
        if (
          automationType
          === 'MANUAL'
        ) {
          setAutomationType(
            'UI',
          );
        }

        return;
      }

      setAutomationType(
        'MANUAL',
      );
    };

  const optionalValue =
    (
      value: string,
    ):
      | string
      | undefined => {
      const trimmed =
        value.trim();

      return (
        trimmed
        || undefined
      );
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
          'Test Case name is required.',
        );

        return;
      }

      if (
        trimmedName.length
        > 255
      ) {
        setError(
          'Name must not exceed 255 characters.',
        );

        return;
      }

      if (
        preconditions.length
        > 2000
      ) {
        setError(
          'Preconditions must not exceed 2000 characters.',
        );

        return;
      }

      if (
        testData.length
        > 2000
      ) {
        setError(
          'Test Data must not exceed 2000 characters.',
        );

        return;
      }

      if (!trimmedExpected) {
        setError(
          'Expected Result is required.',
        );

        return;
      }

      if (
        trimmedExpected.length
        > 2000
      ) {
        setError(
          'Expected Result must not exceed 2000 characters.',
        );

        return;
      }

      if (
        !automatable
        && automationType
          !== 'MANUAL'
      ) {
        setError(
          'Non-automatable Test Cases must use Automation Type MANUAL.',
        );

        return;
      }

      if (
        automatable
        && automationType
          === 'MANUAL'
      ) {
        setError(
          'Automatable Test Cases cannot use Automation Type MANUAL.',
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

                status,
              },
            );

        onUpdated(
          updated,
        );
      } catch (err) {
        console.error(
          'Failed to update Test Case:',
          err,
        );

        if (
          err instanceof
          ApiError
        ) {
          setError(
            err.message,
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
          'Unable to update Test Case.',
        );
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
                onClose={() =>
                  setError(null)
                }
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
              label="Test Case Name"
              required
              fullWidth
              value={name}
              inputProps={{
                maxLength: 255,
              }}
              disabled={
                submitting
              }
              onChange={event =>
                setName(
                  event.target.value,
                )
              }
            />

            <TextField
              label="Preconditions (Optional)"
              multiline
              minRows={3}
              fullWidth
              value={
                preconditions
              }
              inputProps={{
                maxLength: 2000,
              }}
              disabled={
                submitting
              }
              onChange={event =>
                setPreconditions(
                  event.target.value,
                )
              }
            />

            <TextField
              label="Test Data (Optional)"
              multiline
              minRows={3}
              fullWidth
              value={testData}
              inputProps={{
                maxLength: 2000,
              }}
              disabled={
                submitting
              }
              onChange={event =>
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
              fullWidth
              value={
                expectedResult
              }
              inputProps={{
                maxLength: 2000,
              }}
              disabled={
                submitting
              }
              onChange={event =>
                setExpectedResult(
                  event.target.value,
                )
              }
            />

            <TextField
              select
              fullWidth
              label="Test Case Priority"
              value={priority}
              disabled={
                submitting
              }
              onChange={event =>
                setPriority(
                  event.target
                    .value as
                    TestCasePriority,
                )
              }
            >
              {priorities.map(
                option => (
                  <MenuItem
                    key={option}
                    value={option}
                  >
                    {option}
                  </MenuItem>
                ),
              )}
            </TextField>

            <TextField
              select
              fullWidth
              label="Test Type"
              value={testType}
              disabled={
                submitting
              }
              onChange={event =>
                setTestType(
                  event.target
                    .value as
                    TestType,
                )
              }
            >
              {testTypes.map(
                option => (
                  <MenuItem
                    key={option}
                    value={option}
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
                  onChange={event =>
                    handleAutomatableChange(
                      event.target
                        .checked,
                    )
                  }
                />
              }
              label="Automation Eligible"
            />

            <TextField
              select
              fullWidth
              label="Automation Scope"
              value={
                automationType
              }
              disabled={
                submitting
                || !automatable
              }
              onChange={event =>
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
                  option => (
                    <MenuItem
                      key={option}
                      value={option}
                    >
                      {option}
                    </MenuItem>
                  ),
                )
              )}
            </TextField>

            {/*
             * Display lifecycle
             * state but do not let
             * normal CRUD modify it.
             */}
            <TextField
              fullWidth
              label="Automation Status"
              value={
                testCase
                  .automationStatus
              }
              disabled
              helperText={
                testCase.automationStatus
                === 'RUNNING'
                  ? 'Automation is currently running. Automation configuration cannot be changed until execution finishes.'
                  : 'Managed automatically by script generation and execution.'
              }
            />

            <Alert
              severity="info"
              variant="outlined"
            >
              Changing Automatable or
              Automation Type resets
              the automation lifecycle
              to{' '}
              <strong>
                NOT_AUTOMATED
              </strong>{' '}
              when appropriate.
              Existing lifecycle
              status is otherwise
              preserved.
            </Alert>

            <TextField
              select
              fullWidth
              label="Test Case Status"
              value={status}
              disabled={
                submitting
              }
              onChange={event =>
                setStatus(
                  event.target
                    .value as
                    TestCaseStatus,
                )
              }
            >
              {statuses.map(
                option => (
                  <MenuItem
                    key={option}
                    value={option}
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
            submitting
              ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              )
              : (
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