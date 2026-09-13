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
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
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

interface CreateTestCaseDialogProps {
  open: boolean;

  scenarioId: string;

  onClose: () => void;

  onCreated: (
    testCase: TestCase,
  ) => void;
}

export default function CreateTestCaseDialog({
  open,
  scenarioId,
  onClose,
  onCreated,
}: CreateTestCaseDialogProps) {
  const [
    testCaseId,
    setTestCaseId,
  ] = useState('');

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
    automationStatus,
    setAutomationStatus,
  ] =
    useState<AutomationStatus>(
      'NOT_APPLICABLE',
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

  const resetForm =
    () => {
      setTestCaseId('');
      setName('');
      setPreconditions('');
      setTestData('');
      setExpectedResult('');

      setPriority(
        'MEDIUM',
      );

      setTestType(
        'FUNCTIONAL',
      );

      setAutomatable(
        false,
      );

      setAutomationType(
        'MANUAL',
      );

      setAutomationStatus(
        'NOT_APPLICABLE',
      );

      setStatus(
        'DRAFT',
      );

      setError(null);
    };

  useEffect(
    () => {
      if (open) {
        resetForm();
      }
    },
    [open],
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

        return;
      }

      setAutomationType(
        'MANUAL',
      );

      setAutomationStatus(
        'NOT_APPLICABLE',
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

      const trimmedTestCaseId =
        testCaseId.trim();

      const trimmedName =
        name.trim();

      const trimmedExpectedResult =
        expectedResult.trim();

      if (!trimmedTestCaseId) {
        setError(
          'Test Case ID is required.',
        );

        return;
      }

      if (
        trimmedTestCaseId.length >
        50
      ) {
        setError(
          'Test Case ID must not exceed 50 characters.',
        );

        return;
      }

      if (!trimmedName) {
        setError(
          'Name is required.',
        );

        return;
      }

      if (
        trimmedName.length >
        255
      ) {
        setError(
          'Name must not exceed 255 characters.',
        );

        return;
      }

      if (
        preconditions.length >
        2000
      ) {
        setError(
          'Preconditions must not exceed 2000 characters.',
        );

        return;
      }

      if (
        testData.length >
        2000
      ) {
        setError(
          'Test Data must not exceed 2000 characters.',
        );

        return;
      }

      if (
        !trimmedExpectedResult
      ) {
        setError(
          'Expected Result is required.',
        );

        return;
      }

      if (
        trimmedExpectedResult
          .length >
        2000
      ) {
        setError(
          'Expected Result must not exceed 2000 characters.',
        );

        return;
      }

      if (
        !automatable &&
        automationType !==
          'MANUAL'
      ) {
        setError(
          'Non-automatable Test Cases must use Automation Type MANUAL.',
        );

        return;
      }

      if (
        !automatable &&
        automationStatus !==
          'NOT_APPLICABLE'
      ) {
        setError(
          'Non-automatable Test Cases must use Automation Status NOT_APPLICABLE.',
        );

        return;
      }

      if (
        automatable &&
        automationType ===
          'MANUAL'
      ) {
        setError(
          'Automatable Test Cases cannot use Automation Type MANUAL.',
        );

        return;
      }

      if (
        automatable &&
        automationStatus ===
          'NOT_APPLICABLE'
      ) {
        setError(
          'Automatable Test Cases cannot use Automation Status NOT_APPLICABLE.',
        );

        return;
      }

      try {
        setSubmitting(
          true,
        );

        const created =
          await testCaseApi
            .createTestCase(
              scenarioId,
              {
                testCaseId:
                  trimmedTestCaseId,

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
                  trimmedExpectedResult,

                priority,

                testType,

                automatable,

                automationType,

                automationStatus,

                status,
              },
            );

        resetForm();

        onCreated(
          created,
        );
      } catch (err) {
        console.error(
          'Failed to create Test Case:',
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
          'An unexpected error occurred while creating the Test Case.',
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
        Add Test Case
      </DialogTitle>

      <DialogContent>
        <form
          id="create-test-case-form"
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
              label="Test Case ID"
              required
              fullWidth
              disabled={
                submitting
              }
              value={
                testCaseId
              }
              inputProps={{
                maxLength: 50,
              }}
              helperText="Test Case ID must be unique."
              placeholder="Example: TC-LOGIN-001"
              onChange={(
                event,
              ) =>
                setTestCaseId(
                  event.target
                    .value,
                )
              }
            />

            <TextField
              label="Name"
              required
              fullWidth
              disabled={
                submitting
              }
              value={name}
              inputProps={{
                maxLength: 255,
              }}
              placeholder="Example: Successful login with valid credentials"
              onChange={(
                event,
              ) =>
                setName(
                  event.target
                    .value,
                )
              }
            />

            <TextField
              label="Preconditions"
              fullWidth
              multiline
              minRows={3}
              disabled={
                submitting
              }
              value={
                preconditions
              }
              inputProps={{
                maxLength:
                  2000,
              }}
              placeholder="Example: User account exists and is active."
              onChange={(
                event,
              ) =>
                setPreconditions(
                  event.target
                    .value,
                )
              }
            />

            <TextField
              label="Test Data"
              fullWidth
              multiline
              minRows={3}
              disabled={
                submitting
              }
              value={
                testData
              }
              inputProps={{
                maxLength:
                  2000,
              }}
              placeholder="Example: username=test.user, password=Password123"
              onChange={(
                event,
              ) =>
                setTestData(
                  event.target
                    .value,
                )
              }
            />

            <TextField
              label="Expected Result"
              required
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
              placeholder="Example: User is authenticated and redirected to the dashboard."
              onChange={(
                event,
              ) =>
                setExpectedResult(
                  event.target
                    .value,
                )
              }
            />

            <FormControl
              fullWidth
            >
              <InputLabel>
                Priority
              </InputLabel>

              <Select
                label="Priority"
                value={
                  priority
                }
                disabled={
                  submitting
                }
                onChange={(
                  event,
                ) =>
                  setPriority(
                    event.target
                      .value as TestCasePriority,
                  )
                }
              >
                <MenuItem
                  value="LOW"
                >
                  Low
                </MenuItem>

                <MenuItem
                  value="MEDIUM"
                >
                  Medium
                </MenuItem>

                <MenuItem
                  value="HIGH"
                >
                  High
                </MenuItem>

                <MenuItem
                  value="CRITICAL"
                >
                  Critical
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl
              fullWidth
            >
              <InputLabel>
                Test Type
              </InputLabel>

              <Select
                label="Test Type"
                value={
                  testType
                }
                disabled={
                  submitting
                }
                onChange={(
                  event,
                ) =>
                  setTestType(
                    event.target
                      .value as TestType,
                  )
                }
              >
                <MenuItem
                  value="SMOKE"
                >
                  Smoke
                </MenuItem>

                <MenuItem
                  value="SANITY"
                >
                  Sanity
                </MenuItem>

                <MenuItem
                  value="REGRESSION"
                >
                  Regression
                </MenuItem>

                <MenuItem
                  value="FUNCTIONAL"
                >
                  Functional
                </MenuItem>

                <MenuItem
                  value="INTEGRATION"
                >
                  Integration
                </MenuItem>

                <MenuItem
                  value="END_TO_END"
                >
                  End To End
                </MenuItem>

                <MenuItem
                  value="POSITIVE"
                >
                  Positive
                </MenuItem>

                <MenuItem
                  value="NEGATIVE"
                >
                  Negative
                </MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
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

            <FormControl
              fullWidth
            >
              <InputLabel>
                Automation Type
              </InputLabel>

              <Select
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
                      .value as AutomationType,
                  )
                }
              >
                {!automatable && (
                  <MenuItem
                    value="MANUAL"
                  >
                    Manual
                  </MenuItem>
                )}

                {automatable && (
                  <MenuItem
                    value="UI"
                  >
                    UI
                  </MenuItem>
                )}

                {automatable && (
                  <MenuItem
                    value="API"
                  >
                    API
                  </MenuItem>
                )}

                {automatable && (
                  <MenuItem
                    value="UI_API"
                  >
                    UI + API
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
            >
              <InputLabel>
                Automation Status
              </InputLabel>

              <Select
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
                      .value as AutomationStatus,
                  )
                }
              >
                {!automatable && (
                  <MenuItem
                    value="NOT_APPLICABLE"
                  >
                    Not Applicable
                  </MenuItem>
                )}

                {automatable && (
                  <MenuItem
                    value="NOT_AUTOMATED"
                  >
                    Not Automated
                  </MenuItem>
                )}

                {automatable && (
                  <MenuItem
                    value="SCRIPT_GENERATED"
                  >
                    Script Generated
                  </MenuItem>
                )}

                {automatable && (
                  <MenuItem
                    value="READY"
                  >
                    Ready
                  </MenuItem>
                )}

                {automatable && (
                  <MenuItem
                    value="RUNNING"
                  >
                    Running
                  </MenuItem>
                )}

                {automatable && (
                  <MenuItem
                    value="AUTOMATED"
                  >
                    Automated
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
            >
              <InputLabel>
                Status
              </InputLabel>

              <Select
                label="Status"
                value={
                  status
                }
                disabled={
                  submitting
                }
                onChange={(
                  event,
                ) =>
                  setStatus(
                    event.target
                      .value as TestCaseStatus,
                  )
                }
              >
                <MenuItem
                  value="DRAFT"
                >
                  Draft
                </MenuItem>

                <MenuItem
                  value="ACTIVE"
                >
                  Active
                </MenuItem>

                <MenuItem
                  value="APPROVED"
                >
                  Approved
                </MenuItem>

                <MenuItem
                  value="REJECTED"
                >
                  Rejected
                </MenuItem>

                <MenuItem
                  value="ARCHIVED"
                >
                  Archived
                </MenuItem>
              </Select>
            </FormControl>

            <Alert
              severity="info"
              variant="outlined"
            >
              Test Case will be
              created under Test
              Scenario{' '}
              <strong>
                {scenarioId}
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
          form="create-test-case-form"
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
            : 'Create Test Case'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}