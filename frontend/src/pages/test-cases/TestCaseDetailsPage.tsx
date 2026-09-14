import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Add,
  ArrowBack,
  Delete,
  Edit,
  Refresh,
} from '@mui/icons-material';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ApiError,
} from '../../api/apiClient';

import {
  testCaseApi,
} from '../../api/testCaseApi';

import {
  testStepApi,
} from '../../api/testStepApi';

import DeleteConfirmationDialog from '../../components/common/DeleteConfirmationDialog';

import {
  PageHeader,
} from '../../components/common/PageHeader';

import EditTestCaseDialog from '../../components/test-cases/EditTestCaseDialog';

import CreateTestStepDialog from '../../components/test-steps/CreateTestStepDialog';

import EditTestStepDialog from '../../components/test-steps/EditTestStepDialog';

import type {
  TestCase,
} from '../../types/testCase';

import type {
  TestStep,
} from '../../types/testStep';

function displayValue(
    value:
        | string
        | null
        | undefined,
): string {
  return value?.trim() ||
      'Not specified';
}

function formatDate(
    value:
        | string
        | null
        | undefined,
): string {
  if (!value) {
    return 'Not specified';
  }

  const date =
      new Date(value);

  if (
      Number.isNaN(
          date.getTime(),
      )
  ) {
    return value;
  }

  return date.toLocaleString();
}

function getPriorityColor(
    priority: string,
):
    | 'default'
    | 'primary'
    | 'warning'
    | 'error' {
  switch (priority) {
    case 'CRITICAL':
      return 'error';

    case 'HIGH':
      return 'warning';

    case 'MEDIUM':
      return 'primary';

    default:
      return 'default';
  }
}

function getStatusColor(
    status: string,
):
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'error' {
  switch (status) {
    case 'ACTIVE':
      return 'primary';

    case 'APPROVED':
      return 'success';

    case 'REJECTED':
      return 'error';

    case 'DRAFT':
      return 'warning';

    default:
      return 'default';
  }
}

function getTestTypeLabel(
    testType: string,
): string {
  switch (testType) {
    case 'END_TO_END':
      return 'End To End';

    case 'SMOKE':
      return 'Smoke';

    case 'SANITY':
      return 'Sanity';

    case 'REGRESSION':
      return 'Regression';

    case 'FUNCTIONAL':
      return 'Functional';

    case 'INTEGRATION':
      return 'Integration';

    case 'POSITIVE':
      return 'Positive';

    case 'NEGATIVE':
      return 'Negative';

    default:
      return testType;
  }
}

function getAutomationTypeLabel(
    automationType: string,
): string {
  switch (automationType) {
    case 'UI_API':
      return 'UI + API';

    case 'UI':
      return 'UI';

    case 'API':
      return 'API';

    case 'MANUAL':
      return 'Manual';

    default:
      return automationType;
  }
}

function getAutomationStatusLabel(
    automationStatus: string,
): string {
  switch (automationStatus) {
    case 'NOT_APPLICABLE':
      return 'Not Applicable';

    case 'NOT_AUTOMATED':
      return 'Not Automated';

    case 'SCRIPT_GENERATED':
      return 'Script Generated';

    case 'READY':
      return 'Ready';

    case 'RUNNING':
      return 'Running';

    case 'AUTOMATED':
      return 'Automated';

    default:
      return automationStatus;
  }
}

export default function TestCaseDetailsPage() {
  const navigate =
      useNavigate();

  const {
    testCaseId,
  } = useParams<{
    testCaseId: string;
  }>();

  const [
    testCase,
    setTestCase,
  ] = useState<
      TestCase | null
  >(null);

  const [
    testSteps,
    setTestSteps,
  ] = useState<
      TestStep[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
      string | null
  >(null);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<
      string | null
  >(null);

  const [
    createDialogOpen,
    setCreateDialogOpen,
  ] = useState(false);

  const [
    editDialogOpen,
    setEditDialogOpen,
  ] = useState(false);

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState<
      string | null
  >(null);

  const [
    editingTestStep,
    setEditingTestStep,
  ] = useState<
      TestStep | null
  >(null);

  const [
    deletingTestStep,
    setDeletingTestStep,
  ] = useState<
      TestStep | null
  >(null);

  const [
    deletingStep,
    setDeletingStep,
  ] = useState(false);

  const [
    deleteStepError,
    setDeleteStepError,
  ] = useState<
      string | null
  >(null);

  const loadPage =
      useCallback(
          async (
              isRefresh = false,
          ) => {
            if (!testCaseId) {
              setError(
                  'Test Case ID is missing.',
              );

              setLoading(false);

              return;
            }

            try {
              if (isRefresh) {
                setRefreshing(
                    true,
                );
              } else {
                setLoading(
                    true,
                );
              }

              setError(null);

              const [
                testCaseResponse,
                testStepResponse,
              ] =
                  await Promise.all([
                    testCaseApi
                        .getTestCaseByBusinessId(
                            testCaseId,
                        ),

                    testStepApi
                        .getByTestCase(
                            testCaseId,
                        ),
                  ]);

              setTestCase(
                  testCaseResponse,
              );

              setTestSteps(
                  testStepResponse,
              );
            } catch (err) {
              console.error(
                  'Failed to load Test Case details:',
                  err,
              );

              if (
                  err instanceof
                  ApiError
              ) {
                setError(
                    err.message,
                );
              } else {
                setError(
                    'Unable to load the Test Case details or Test Steps.',
                );
              }
            } finally {
              setLoading(false);

              setRefreshing(
                  false,
              );
            }
          },
          [testCaseId],
      );

  useEffect(
      () => {
        void loadPage();
      },
      [loadPage],
  );

  const handleTestStepCreated =
      (
          testStep:
          TestStep,
      ) => {
        setCreateDialogOpen(
            false,
        );

        setSuccessMessage(
            `Test Step "${testStep.testStepId}" created successfully.`,
        );

        setTestSteps(
            (
                currentSteps,
            ) =>
                [
                  ...currentSteps,
                  testStep,
                ].sort(
                    (
                        first,
                        second,
                    ) =>
                        first.stepOrder -
                        second.stepOrder,
                ),
        );
      };

  const handleTestCaseUpdated =
      (
          updatedTestCase:
          TestCase,
      ) => {
        setTestCase(
            updatedTestCase,
        );

        setEditDialogOpen(
            false,
        );

        setSuccessMessage(
            `Test Case "${updatedTestCase.testCaseId}" updated successfully.`,
        );
      };

  const handleDeleteTestCase =
      async () => {
        if (!testCase) {
          return;
        }

        try {
          setDeleting(true);

          setDeleteError(
              null,
          );

          await testCaseApi
              .deleteTestCase(
                  testCase.id,
              );

          navigate(
              `/scenarios/${encodeURIComponent(
                  testCase.scenarioBusinessId,
              )}`,
          );
        } catch (err) {
          console.error(
              'Failed to delete Test Case:',
              err,
          );

          if (
              err instanceof
              ApiError
          ) {
            setDeleteError(
                err.message,
            );
          } else {
            setDeleteError(
                'Unable to delete the Test Case. Delete its Test Steps or related automation records first.',
            );
          }
        } finally {
          setDeleting(false);
        }
      };

  const handleTestStepUpdated =
      (
          updatedTestStep:
          TestStep,
      ) => {
        setTestSteps(
            (
                current,
            ) =>
                current
                    .map(
                        (
                            step,
                        ) =>
                            step.id ===
                            updatedTestStep.id
                                ? updatedTestStep
                                : step,
                    )
                    .sort(
                        (
                            first,
                            second,
                        ) =>
                            first.stepOrder -
                            second.stepOrder,
                    ),
        );

        setEditingTestStep(
            null,
        );

        setSuccessMessage(
            `Test Step "${updatedTestStep.testStepId}" updated successfully.`,
        );
      };

  const handleDeleteTestStep =
      async () => {
        if (
            !deletingTestStep
        ) {
          return;
        }

        try {
          setDeletingStep(
              true,
          );

          setDeleteStepError(
              null,
          );

          await testStepApi
              .deleteTestStep(
                  deletingTestStep.id,
              );

          setTestSteps(
              (
                  current,
              ) =>
                  current.filter(
                      (
                          step,
                      ) =>
                          step.id !==
                          deletingTestStep.id,
                  ),
          );

          setSuccessMessage(
              `Test Step "${deletingTestStep.testStepId}" deleted successfully.`,
          );

          setDeletingTestStep(
              null,
          );
        } catch (err) {
          console.error(
              'Failed to delete Test Step:',
              err,
          );

          if (
              err instanceof
              ApiError
          ) {
            setDeleteStepError(
                err.message,
            );
          } else {
            setDeleteStepError(
                'Unable to delete the Test Step.',
            );
          }
        } finally {
          setDeletingStep(
              false,
          );
        }
      };

  if (loading) {
    return (
        <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
            }}
        >
          <CardContent>
            <Stack
                spacing={2}
                sx={{
                  minHeight: 320,
                  alignItems:
                      'center',
                  justifyContent:
                      'center',
                }}
            >
              <CircularProgress />

              <Typography
                  color="text.secondary"
              >
                Loading Test
                Case...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
    );
  }

  if (
      error &&
      !testCase
  ) {
    return (
        <Stack
            spacing={3}
        >
          <Button
              startIcon={
                <ArrowBack />
              }
              onClick={() =>
                  navigate(
                      '/test-plans',
                  )
              }
              sx={{
                alignSelf:
                    'flex-start',
              }}
          >
            Back
          </Button>

          <Alert
              severity="error"
          >
            {error}
          </Alert>

          <Button
              variant="contained"
              onClick={() =>
                  void loadPage()
              }
              sx={{
                alignSelf:
                    'flex-start',
              }}
          >
            Try Again
          </Button>
        </Stack>
    );
  }

  if (!testCase) {
    return null;
  }

  return (
      <Stack
          spacing={3}
      >
        <PageHeader
            title={
              testCase.testCaseId
            }
            description={
              testCase.name
            }
            breadcrumbs={[
              {
                label:
                    'Test Plans',
                to:
                    '/test-plans',
              },

              {
                label:
                testCase.scenarioBusinessId,

                to:
                    `/scenarios/${encodeURIComponent(
                        testCase.scenarioBusinessId,
                    )}`,
              },

              {
                label:
                testCase.testCaseId,
              },
            ]}
            actions={
              <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={1}
              >
                <Button
                    variant="outlined"
                    startIcon={
                      <Refresh />
                    }
                    disabled={
                      refreshing
                    }
                    onClick={() =>
                        void loadPage(
                            true,
                        )
                    }
                >
                  {refreshing
                      ? 'Refreshing...'
                      : 'Refresh'}
                </Button>

                <Button
                    variant="outlined"
                    startIcon={
                      <Edit />
                    }
                    onClick={() =>
                        setEditDialogOpen(
                            true,
                        )
                    }
                >
                  Edit
                </Button>

                <Button
                    color="error"
                    variant="outlined"
                    startIcon={
                      <Delete />
                    }
                    onClick={() => {
                      setDeleteError(
                          null,
                      );

                      setDeleteDialogOpen(
                          true,
                      );
                    }}
                >
                  Delete
                </Button>

                <Button
                    variant="contained"
                    startIcon={
                      <Add />
                    }
                    onClick={() =>
                        setCreateDialogOpen(
                            true,
                        )
                    }
                >
                  Add Test Step
                </Button>
              </Stack>
            }
        />

        {successMessage && (
            <Alert
                severity="success"
                onClose={() =>
                    setSuccessMessage(
                        null,
                    )
                }
            >
              {successMessage}
            </Alert>
        )}

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

        <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
            }}
        >
          <CardContent>
            <Stack
                spacing={3}
            >
              <Box
                  sx={{
                    display:
                        'flex',

                    justifyContent:
                        'space-between',

                    alignItems:
                        'flex-start',

                    gap: 2,

                    flexWrap:
                        'wrap',
                  }}
              >
                <Box>
                  <Typography
                      variant="h6"
                      fontWeight={700}
                  >
                    Test Case
                    Information
                  </Typography>

                  <Typography
                      variant="body2"
                      color="text.secondary"
                  >
                    Test Case
                    definition and
                    automation
                    metadata.
                  </Typography>
                </Box>

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      flexWrap:
                          'wrap',
                    }}
                >
                  <Chip
                      label={getTestTypeLabel(
                          testCase.testType,
                      )}
                      variant="outlined"
                  />

                  <Chip
                      label={
                        testCase.priority
                      }
                      color={getPriorityColor(
                          testCase.priority,
                      )}
                      variant="outlined"
                  />

                  <Chip
                      label={
                        testCase.status
                      }
                      color={getStatusColor(
                          testCase.status,
                      )}
                      variant="outlined"
                  />

                  <Chip
                      label={
                        testCase.automatable
                            ? 'Automatable'
                            : 'Manual'
                      }
                      color={
                        testCase.automatable
                            ? 'success'
                            : 'default'
                      }
                      variant="outlined"
                  />
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                  Name
                </Typography>

                <Typography>
                  {testCase.name}
                </Typography>
              </Box>

              <Box
                  sx={{
                    display:
                        'grid',

                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(3, 1fr)',
                    },

                    gap: 3,
                  }}
              >
                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Preconditions
                  </Typography>

                  <Typography
                      sx={{
                        whiteSpace:
                            'pre-wrap',
                      }}
                  >
                    {displayValue(
                        testCase.preconditions,
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Test Data
                  </Typography>

                  <Typography
                      sx={{
                        whiteSpace:
                            'pre-wrap',
                      }}
                  >
                    {displayValue(
                        testCase.testData,
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Expected Result
                  </Typography>

                  <Typography
                      sx={{
                        whiteSpace:
                            'pre-wrap',
                      }}
                  >
                    {
                      testCase.expectedResult
                    }
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box
                  sx={{
                    display:
                        'grid',

                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(4, 1fr)',
                    },

                    gap: 3,
                  }}
              >
                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Test Case ID
                  </Typography>

                  <Typography
                      fontWeight={600}
                  >
                    {
                      testCase.testCaseId
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Scenario
                  </Typography>

                  <Typography>
                    {
                      testCase.scenarioBusinessId
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Automation Type
                  </Typography>

                  <Typography>
                    {getAutomationTypeLabel(
                        testCase.automationType,
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Automation Status
                  </Typography>

                  <Typography>
                    {getAutomationStatusLabel(
                        testCase.automationStatus,
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Created
                  </Typography>

                  <Typography>
                    {formatDate(
                        testCase.createdAt,
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Updated
                  </Typography>

                  <Typography>
                    {formatDate(
                        testCase.updatedAt,
                    )}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Box
            sx={{
              display: 'flex',

              justifyContent:
                  'space-between',

              alignItems:
                  'center',

              gap: 2,

              flexWrap:
                  'wrap',
            }}
        >
          <Box>
            <Typography
                variant="h5"
                fontWeight={700}
            >
              Test Steps
            </Typography>

            <Typography
                color="text.secondary"
            >
              Ordered execution
              steps for this Test
              Case.
            </Typography>
          </Box>

          <Chip
              label={`${testSteps.length} step${
                  testSteps.length ===
                  1
                      ? ''
                      : 's'
              }`}
              variant="outlined"
          />
        </Box>

        {testSteps.length ===
        0 ? (
            <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                }}
            >
              <CardContent>
                <Stack
                    spacing={2}
                    sx={{
                      minHeight: 250,

                      alignItems:
                          'center',

                      justifyContent:
                          'center',

                      textAlign:
                          'center',
                    }}
                >
                  <Typography
                      variant="h6"
                  >
                    No Test Steps yet
                  </Typography>

                  <Typography
                      color="text.secondary"
                  >
                    Create the first
                    execution step
                    for this Test
                    Case.
                  </Typography>

                  <Button
                      variant="contained"
                      startIcon={
                        <Add />
                      }
                      onClick={() =>
                          setCreateDialogOpen(
                              true,
                          )
                      }
                  >
                    Add Test Step
                  </Button>
                </Stack>
              </CardContent>
            </Card>
        ) : (
            <Stack
                spacing={2}
            >
              {testSteps.map(
                  (
                      testStep,
                  ) => (
                      <Card
                          key={
                            testStep.id
                          }
                          variant="outlined"
                          sx={{
                            borderRadius: 3,
                          }}
                      >
                        <CardContent>
                          <Stack
                              spacing={2}
                          >
                            <Box
                                sx={{
                                  display:
                                      'flex',

                                  justifyContent:
                                      'space-between',

                                  alignItems:
                                      'flex-start',

                                  gap: 2,

                                  flexWrap:
                                      'wrap',
                                }}
                            >
                              <Box
                                  sx={{
                                    display:
                                        'flex',

                                    alignItems:
                                        'center',

                                    gap: 2,

                                    flex: 1,

                                    flexWrap:
                                        'wrap',
                                  }}
                              >
                                <Chip
                                    label={`Step ${testStep.stepOrder}`}
                                    color="primary"
                                />

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                  {
                                    testStep.testStepId
                                  }
                                </Typography>
                              </Box>

                              <Stack
                                  direction="row"
                                  spacing={1}
                              >
                                <Button
                                    size="small"
                                    startIcon={
                                      <Edit />
                                    }
                                    onClick={() =>
                                        setEditingTestStep(
                                            testStep,
                                        )
                                    }
                                >
                                  Edit
                                </Button>

                                <Button
                                    size="small"
                                    color="error"
                                    startIcon={
                                      <Delete />
                                    }
                                    onClick={() => {
                                      setDeleteStepError(
                                          null,
                                      );

                                      setDeletingTestStep(
                                          testStep,
                                      );
                                    }}
                                >
                                  Delete
                                </Button>
                              </Stack>
                            </Box>

                            <Divider />

                            <Box>
                              <Typography
                                  variant="caption"
                                  color="text.secondary"
                              >
                                Action
                              </Typography>

                              <Typography
                                  sx={{
                                    whiteSpace:
                                        'pre-wrap',
                                  }}
                              >
                                {
                                  testStep.action
                                }
                              </Typography>
                            </Box>

                            <Box
                                sx={{
                                  display:
                                      'grid',

                                  gridTemplateColumns: {
                                    xs: '1fr',
                                    md: 'repeat(3, 1fr)',
                                  },

                                  gap: 3,
                                }}
                            >
                              <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                  Target
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                      whiteSpace:
                                          'pre-wrap',
                                    }}
                                >
                                  {displayValue(
                                      testStep.target,
                                  )}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                  Input Value
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                      whiteSpace:
                                          'pre-wrap',
                                    }}
                                >
                                  {displayValue(
                                      testStep.inputValue,
                                  )}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                  Expected Result
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                      whiteSpace:
                                          'pre-wrap',
                                    }}
                                >
                                  {displayValue(
                                      testStep.expectedResult,
                                  )}
                                </Typography>
                              </Box>
                            </Box>

                            <Divider />

                            <Box
                                sx={{
                                  display:
                                      'grid',

                                  gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)',
                                  },

                                  gap: 2,
                                }}
                            >
                              <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                  Created
                                </Typography>

                                <Typography
                                    variant="body2"
                                >
                                  {formatDate(
                                      testStep.createdAt,
                                  )}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                  Updated
                                </Typography>

                                <Typography
                                    variant="body2"
                                >
                                  {formatDate(
                                      testStep.updatedAt,
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                  ),
              )}
            </Stack>
        )}

        <CreateTestStepDialog
            open={
              createDialogOpen
            }
            testCaseId={
              testCase.testCaseId
            }
            onClose={() =>
                setCreateDialogOpen(
                    false,
                )
            }
            onCreated={
              handleTestStepCreated
            }
        />

        <EditTestCaseDialog
            open={
              editDialogOpen
            }
            testCase={
              testCase
            }
            onClose={() =>
                setEditDialogOpen(
                    false,
                )
            }
            onUpdated={
              handleTestCaseUpdated
            }
        />

        <DeleteConfirmationDialog
            open={
              deleteDialogOpen
            }
            title="Delete Test Case?"
            entityName={
              testCase.testCaseId
            }
            description="A Test Case cannot be deleted while Test Steps or related automation records still reference it."
            deleting={
              deleting
            }
            error={
              deleteError
            }
            onClose={() => {
              if (deleting) {
                return;
              }

              setDeleteDialogOpen(
                  false,
              );

              setDeleteError(
                  null,
              );
            }}
            onConfirm={() =>
                void handleDeleteTestCase()
            }
        />

        {editingTestStep && (
            <EditTestStepDialog
                open
                testStep={
                  editingTestStep
                }
                onClose={() =>
                    setEditingTestStep(
                        null,
                    )
                }
                onUpdated={
                  handleTestStepUpdated
                }
            />
        )}

        {deletingTestStep && (
            <DeleteConfirmationDialog
                open
                title="Delete Test Step?"
                entityName={
                  deletingTestStep.testStepId
                }
                description={`Step ${deletingTestStep.stepOrder} will be permanently deleted.`}
                deleting={
                  deletingStep
                }
                error={
                  deleteStepError
                }
                onClose={() => {
                  if (
                      deletingStep
                  ) {
                    return;
                  }

                  setDeletingTestStep(
                      null,
                  );

                  setDeleteStepError(
                      null,
                  );
                }}
                onConfirm={() =>
                    void handleDeleteTestStep()
                }
            />
        )}
      </Stack>
  );
}