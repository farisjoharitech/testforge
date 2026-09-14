import {
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import {
  ArrowBack,
  Save,
} from '@mui/icons-material';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  useNavigate,
} from 'react-router-dom';

import {
  ApiError,
} from '../../api/apiClient';

import {
  testPlanApi,
} from '../../api/testPlanApi';

import type {
  ApprovalStatus,
  CreateTestPlanRequest,
  TestPlanStatus,
} from '../../types/testPlan';

const DEFAULT_APPROVAL_STATUS:
    ApprovalStatus =
    'PENDING';


function optionalValue(
    value: string,
): string | undefined {
  const trimmedValue =
      value.trim();

  return trimmedValue ||
      undefined;
}

export default function CreateTestPlanPage() {
  const navigate =
      useNavigate();

  const [
    name,
    setName,
  ] = useState('');

  const [
    version,
    setVersion,
  ] = useState('');

  const [
    project,
    setProject,
  ] = useState('');

  const [
    application,
    setApplication,
  ] = useState('');

  const [
    environment,
    setEnvironment,
  ] = useState('');

  const [
    preparedBy,
    setPreparedBy,
  ] = useState('');

  const [
    status,
    setStatus,
  ] =
      useState<TestPlanStatus>(
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

  const trimmedName =
      name.trim();

  const nameError =
      useMemo(
          () => {
            if (!trimmedName) {
              return 'Test Plan Name is required.';
            }

            if (
                trimmedName.length >
                255
            ) {
              return 'Test Plan Name must not exceed 255 characters.';
            }

            return '';
          },
          [trimmedName],
      );

  const handleSubmit =
      async (
          event:
          FormEvent<HTMLFormElement>,
      ) => {
        event.preventDefault();

        setError(null);

        if (nameError) {
          setError(
              nameError,
          );

          return;
        }

        const request:
            CreateTestPlanRequest =
            {
              name:
              trimmedName,

              version:
                  optionalValue(
                      version,
                  ),

              project:
                  optionalValue(
                      project,
                  ),

              application:
                  optionalValue(
                      application,
                  ),

              environment:
                  optionalValue(
                      environment,
                  ),

              preparedBy:
                  optionalValue(
                      preparedBy,
                  ),

              status,

              approvalStatus:
              DEFAULT_APPROVAL_STATUS,
            };

        try {
          setSubmitting(
              true,
          );

          const createdTestPlan =
              await testPlanApi
                  .createTestPlan(
                      request,
                  );

          navigate(
              '/test-plans',
              {
                replace: true,

                state: {
                  message:
                      `Test plan "${createdTestPlan.name}" created successfully.`,
                },
              },
          );
        } catch (err) {
          console.error(
              'Failed to create test plan:',
              err,
          );

          if (
              err instanceof
              ApiError
          ) {
            if (
                err.status ===
                400
            ) {
              setError(
                  err.message ||
                  'Please check the form values.',
              );

              return;
            }

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
                'Unable to connect to the backend. Make sure TestForge backend is running on port 8080.',
            );

            return;
          }

          setError(
              'An unexpected error occurred while creating the test plan.',
          );
        } finally {
          setSubmitting(
              false,
          );
        }
      };

  return (
      <Box
          sx={{
            maxWidth: 900,
            mx: 'auto',
          }}
      >
        <Button
            startIcon={
              <ArrowBack />
            }
            disabled={
              submitting
            }
            onClick={() =>
                navigate(
                    '/test-plans',
                )
            }
            sx={{
              mb: 2,
            }}
        >
          Back to Test Plans
        </Button>

        <Box
            sx={{
              mb: 3,
            }}
        >
          <Typography
              variant="h4"
              fontWeight={700}
              gutterBottom
          >
            Create Test Plan
          </Typography>

          <Typography
              color="text.secondary"
          >
            Create the test plan
            that will contain
            requirements,
            scenarios,
            test cases and
            automation.
          </Typography>
        </Box>

        {error && (
            <Alert
                severity="error"
                sx={{
                  mb: 3,
                }}
                onClose={() =>
                    setError(null)
                }
            >
              {error}
            </Alert>
        )}

        <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
            }}
        >
          <CardContent
              sx={{
                p: 4,
              }}
          >
            <Box
                component="form"
                onSubmit={
                  handleSubmit
                }
            >
              <Stack
                  spacing={3}
              >
                <TextField
                    label="Test Plan Name"
                    required
                    fullWidth
                    disabled={
                      submitting
                    }
                    value={name}
                    inputProps={{
                      maxLength: 255,
                    }}
                    onChange={(
                        event,
                    ) =>
                        setName(
                            event
                                .target
                                .value,
                        )
                    }
                    placeholder="Example: Customer Portal Regression"
                    error={
                      Boolean(
                          name &&
                          nameError,
                      )
                    }
                    helperText={
                      name &&
                      nameError
                          ? nameError
                          : undefined
                    }
                />

                <TextField
                    label="Version"
                    fullWidth
                    disabled={
                      submitting
                    }
                    value={
                      version
                    }
                    inputProps={{
                      maxLength: 50,
                    }}
                    onChange={(
                        event,
                    ) =>
                        setVersion(
                            event
                                .target
                                .value,
                        )
                    }
                    placeholder="Example: 1.0"
                />

                <TextField
                    label="Project"
                    fullWidth
                    disabled={
                      submitting
                    }
                    value={
                      project
                    }
                    inputProps={{
                      maxLength: 255,
                    }}
                    onChange={(
                        event,
                    ) =>
                        setProject(
                            event
                                .target
                                .value,
                        )
                    }
                    placeholder="Example: TestForge"
                />

                <TextField
                    label="Application"
                    fullWidth
                    disabled={
                      submitting
                    }
                    value={
                      application
                    }
                    inputProps={{
                      maxLength: 255,
                    }}
                    onChange={(
                        event,
                    ) =>
                        setApplication(
                            event
                                .target
                                .value,
                        )
                    }
                    placeholder="Example: TestForge"
                />

                <TextField
                    label="Environment"
                    fullWidth
                    disabled={
                      submitting
                    }
                    value={
                      environment
                    }
                    inputProps={{
                      maxLength: 100,
                    }}
                    onChange={(
                        event,
                    ) =>
                        setEnvironment(
                            event
                                .target
                                .value,
                        )
                    }
                    placeholder="Example: LOCAL, DEV, QA"
                />

                <TextField
                    label="Prepared By"
                    fullWidth
                    disabled={
                      submitting
                    }
                    value={
                      preparedBy
                    }
                    inputProps={{
                      maxLength: 255,
                    }}
                    onChange={(
                        event,
                    ) =>
                        setPreparedBy(
                            event
                                .target
                                .value,
                        )
                    }
                    placeholder="Example: QA Team"
                />

                <FormControl
                    fullWidth
                >
                  <InputLabel>
                    Status
                  </InputLabel>

                  <Select
                      value={
                        status
                      }
                      label="Status"
                      disabled={
                        submitting
                      }
                      onChange={(
                          event,
                      ) =>
                          setStatus(
                              event
                                  .target
                                  .value as TestPlanStatus,
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
                        value="COMPLETED"
                    >
                      Completed
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
                  New Test Plans
                  start with approval
                  status{' '}
                  <strong>
                    {
                      DEFAULT_APPROVAL_STATUS
                    }
                  </strong>
                  .
                </Alert>

                <Box
                    sx={{
                      display:
                          'flex',

                      justifyContent:
                          'flex-end',

                      gap: 2,

                      pt: 2,
                    }}
                >
                  <Button
                      variant="outlined"
                      disabled={
                        submitting
                      }
                      onClick={() =>
                          navigate(
                              '/test-plans',
                          )
                      }
                  >
                    Cancel
                  </Button>

                  <Button
                      type="submit"
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
                        ? 'Creating...'
                        : 'Create Test Plan'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
  );
}