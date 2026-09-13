import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Add,
  ArrowBack,
  ArrowForward,
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
  testScenarioApi,
} from '../../api/testScenarioApi';

import DeleteConfirmationDialog from '../../components/common/DeleteConfirmationDialog';

import {
  PageHeader,
} from '../../components/common/PageHeader';

import CreateTestCaseDialog from '../../components/test-cases/CreateTestCaseDialog';

import EditTestScenarioDialog from '../../components/scenarios/EditTestScenarioDialog';

import type {
  TestCase,
} from '../../types/testCase';

import type {
  TestScenario,
} from '../../types/testScenario';

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

export default function ScenarioDetailsPage() {
  const navigate =
    useNavigate();

  const {
    scenarioId,
  } = useParams<{
    scenarioId: string;
  }>();

  const [
    scenario,
    setScenario,
  ] = useState<
    TestScenario | null
  >(null);

  const [
    testCases,
    setTestCases,
  ] = useState<
    TestCase[]
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

  const loadPage =
    useCallback(
      async (
        isRefresh = false,
      ) => {
        if (!scenarioId) {
          setError(
            'Scenario ID is missing.',
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
            scenarioResponse,
            testCaseResponse,
          ] =
            await Promise.all([
              testScenarioApi
                .getTestScenarioByBusinessId(
                  scenarioId,
                ),

              testCaseApi
                .getByScenario(
                  scenarioId,
                ),
            ]);

          setScenario(
            scenarioResponse,
          );

          setTestCases(
            testCaseResponse,
          );
        } catch (err) {
          console.error(
            'Failed to load Scenario details:',
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
              'Unable to load the Test Scenario details or Test Cases.',
            );
          }
        } finally {
          setLoading(false);

          setRefreshing(
            false,
          );
        }
      },
      [scenarioId],
    );

  useEffect(
    () => {
      void loadPage();
    },
    [loadPage],
  );

  const handleTestCaseCreated =
    (
      testCase:
        TestCase,
    ) => {
      setCreateDialogOpen(
        false,
      );

      setSuccessMessage(
        `Test Case "${testCase.testCaseId}" created successfully.`,
      );

      setTestCases(
        (
          current,
        ) => [
          ...current,
          testCase,
        ],
      );
    };

  const handleScenarioUpdated =
    (
      updatedScenario:
        TestScenario,
    ) => {
      setScenario(
        updatedScenario,
      );

      setEditDialogOpen(
        false,
      );

      setSuccessMessage(
        `Test Scenario "${updatedScenario.scenarioId}" updated successfully.`,
      );
    };

  const handleDelete =
    async () => {
      if (!scenario) {
        return;
      }

      try {
        setDeleting(true);

        setDeleteError(
          null,
        );

        await testScenarioApi
          .deleteTestScenario(
            scenario.id,
          );

        navigate(
          `/requirements/${encodeURIComponent(
            scenario.requirementBusinessId,
          )}`,
        );
      } catch (err) {
        console.error(
          'Failed to delete Test Scenario:',
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
            'Unable to delete the Test Scenario. Delete its Test Cases first.',
          );
        }
      } finally {
        setDeleting(false);
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
              Scenario...
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (
    error &&
    !scenario
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

  if (!scenario) {
    return null;
  }

  return (
    <Stack
      spacing={3}
    >
      <PageHeader
        title={
          scenario.scenarioId
        }
        description={
          scenario.description
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
              scenario.requirementBusinessId,

            to:
              `/requirements/${encodeURIComponent(
                scenario.requirementBusinessId,
              )}`,
          },

          {
            label:
              scenario.scenarioId,
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
              Add Test Case
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
                  Test Scenario
                  Information
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Scenario details
                  and automation
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
                    scenario.testType,
                  )}
                  variant="outlined"
                />

                <Chip
                  label={
                    scenario.priority
                  }
                  color={getPriorityColor(
                    scenario.priority,
                  )}
                  variant="outlined"
                />

                <Chip
                  label={
                    scenario.status
                  }
                  color={getStatusColor(
                    scenario.status,
                  )}
                  variant="outlined"
                />

                <Chip
                  label={
                    scenario.automatable
                      ? 'Automatable'
                      : 'Manual'
                  }
                  color={
                    scenario.automatable
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
                Description
              </Typography>

              <Typography
                sx={{
                  whiteSpace:
                    'pre-wrap',
                }}
              >
                {
                  scenario.description
                }
              </Typography>
            </Box>

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
                  Scenario ID
                </Typography>

                <Typography
                  fontWeight={600}
                >
                  {
                    scenario.scenarioId
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Requirement
                </Typography>

                <Typography>
                  {
                    scenario.requirementBusinessId
                  }
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
                    scenario.createdAt,
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
                    scenario.updatedAt,
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
            Test Cases
          </Typography>

          <Typography
            color="text.secondary"
          >
            Test Cases linked to
            this Test Scenario.
          </Typography>
        </Box>

        <Chip
          label={`${testCases.length} test case${
            testCases.length ===
            1
              ? ''
              : 's'
          }`}
          variant="outlined"
        />
      </Box>

      {testCases.length ===
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
                No Test Cases yet
              </Typography>

              <Typography
                color="text.secondary"
              >
                Create the first
                Test Case for this
                Scenario.
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
                Add Test Case
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Stack
          spacing={2}
        >
          {testCases.map(
            (
              testCase,
            ) => (
              <Card
                key={
                  testCase.id
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
                          flex: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={
                            700
                          }
                        >
                          {
                            testCase.testCaseId
                          }
                        </Typography>

                        <Typography
                          fontWeight={600}
                          sx={{
                            mt: 0.5,
                          }}
                        >
                          {
                            testCase.name
                          }
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          flexWrap:
                            'wrap',

                          justifyContent:
                            'flex-end',
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
                          variant="body2"
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
                          variant="body2"
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
                          variant="body2"
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

                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Automation Type
                        </Typography>

                        <Typography
                          variant="body2"
                        >
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

                        <Typography
                          variant="body2"
                        >
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

                        <Typography
                          variant="body2"
                        >
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

                        <Typography
                          variant="body2"
                        >
                          {formatDate(
                            testCase.updatedAt,
                          )}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display:
                          'flex',

                        justifyContent:
                          'flex-end',
                      }}
                    >
                      <Button
                        endIcon={
                          <ArrowForward />
                        }
                        onClick={() =>
                          navigate(
                            `/test-cases/${encodeURIComponent(
                              testCase.testCaseId,
                            )}`,
                          )
                        }
                      >
                        Open Test Case
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ),
          )}
        </Stack>
      )}

      <CreateTestCaseDialog
        open={
          createDialogOpen
        }
        scenarioId={
          scenario.scenarioId
        }
        onClose={() =>
          setCreateDialogOpen(
            false,
          )
        }
        onCreated={
          handleTestCaseCreated
        }
      />

      <EditTestScenarioDialog
        open={
          editDialogOpen
        }
        scenario={
          scenario
        }
        onClose={() =>
          setEditDialogOpen(
            false,
          )
        }
        onUpdated={
          handleScenarioUpdated
        }
      />

      <DeleteConfirmationDialog
        open={
          deleteDialogOpen
        }
        title="Delete Test Scenario?"
        entityName={
          scenario.scenarioId
        }
        description="A Test Scenario cannot be deleted while Test Cases still reference it. Delete the child lifecycle records first."
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
          void handleDelete()
        }
      />
    </Stack>
  );
}