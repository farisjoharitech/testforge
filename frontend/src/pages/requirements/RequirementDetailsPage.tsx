import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Add,
  ArrowBack,
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
  requirementApi,
} from '../../api/requirementApi';

import {
  testScenarioApi,
} from '../../api/testScenarioApi';

import {
  PageHeader,
} from '../../components/common/PageHeader';

import CreateTestScenarioDialog from '../../components/scenarios/CreateTestScenarioDialog';

import type {
  Requirement,
} from '../../types/requirement';

import type {
  TestScenario,
} from '../../types/testScenario';

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

export default function RequirementDetailsPage() {
  const navigate =
    useNavigate();

  const {
    requirementId,
  } = useParams<{
    requirementId: string;
  }>();

  const [
    requirement,
    setRequirement,
  ] = useState<
    Requirement | null
  >(null);

  const [
    scenarios,
    setScenarios,
  ] = useState<
    TestScenario[]
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

  const loadPage =
    useCallback(
      async (
        isRefresh = false,
      ) => {
        if (
          !requirementId
        ) {
          setError(
            'Requirement ID is missing.',
          );

          setLoading(false);

          return;
        }

        try {
          if (
            isRefresh
          ) {
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
            requirementResponse,
            scenarioResponse,
          ] =
            await Promise.all([
              requirementApi
                .getRequirementByBusinessId(
                  requirementId,
                ),

              testScenarioApi
                .getByRequirement(
                  requirementId,
                ),
            ]);

          setRequirement(
            requirementResponse,
          );

          setScenarios(
            scenarioResponse,
          );
        } catch (err) {
          console.error(
            'Failed to load Requirement details:',
            err,
          );

          setError(
            'Unable to load the Requirement details or Test Scenarios.',
          );
        } finally {
          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }
      },
      [requirementId],
    );

  useEffect(
    () => {
      void loadPage();
    },
    [loadPage],
  );

  const handleScenarioCreated =
    (
      scenario:
        TestScenario,
    ) => {
      setCreateDialogOpen(
        false,
      );

      setSuccessMessage(
        `Test Scenario "${scenario.scenarioId}" created successfully.`,
      );

      setScenarios(
        (
          currentScenarios,
        ) => [
          ...currentScenarios,
          scenario,
        ],
      );
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
              Loading
              Requirement...
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (
    error &&
    !requirement
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
          Back to Test Plans
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

  if (!requirement) {
    return null;
  }

  return (
    <Stack
      spacing={3}
    >
      <PageHeader
        title={
          requirement.requirementId
        }
        description={
          requirement.description
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
              requirement
                .testPlanBusinessId,

            to:
              `/test-plans/${encodeURIComponent(
                requirement
                  .testPlanBusinessId,
              )}`,
          },

          {
            label:
              requirement
                .requirementId,
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
              Add Test Scenario
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
                  fontWeight={
                    700
                  }
                >
                  Requirement
                  Information
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Requirement
                  details and
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
                  label={
                    requirement.priority
                  }
                  color={getPriorityColor(
                    requirement.priority,
                  )}
                  variant="outlined"
                />

                <Chip
                  label={
                    requirement.status
                  }
                  color={getStatusColor(
                    requirement.status,
                  )}
                  variant="outlined"
                />

                <Chip
                  label={
                    requirement.automatable
                      ? 'Automatable'
                      : 'Manual'
                  }
                  color={
                    requirement.automatable
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

              <Typography>
                {
                  requirement.description
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
                  Requirement ID
                </Typography>

                <Typography
                  fontWeight={
                    600
                  }
                >
                  {
                    requirement.requirementId
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Test Plan
                </Typography>

                <Typography>
                  {
                    requirement.testPlanBusinessId
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
                    requirement.createdAt,
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
                    requirement.updatedAt,
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
            Test Scenarios
          </Typography>

          <Typography
            color="text.secondary"
          >
            Test Scenarios linked
            to this Requirement.
          </Typography>
        </Box>

        <Chip
          label={`${scenarios.length} scenario${
            scenarios.length ===
            1
              ? ''
              : 's'
          }`}
          variant="outlined"
        />
      </Box>

      {scenarios.length ===
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
                No Test Scenarios
                yet
              </Typography>

              <Typography
                color="text.secondary"
              >
                Create the first
                Test Scenario for
                this Requirement.
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
                Add Test Scenario
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Stack
          spacing={2}
        >
          {scenarios.map(
            (
              scenario,
            ) => (
              <Card
                key={
                  scenario.id
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
                            scenario.scenarioId
                          }
                        </Typography>

                        <Typography
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                          }}
                        >
                          {
                            scenario.description
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

                        <Typography
                          variant="body2"
                        >
                          {formatDate(
                            scenario.updatedAt,
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

      <CreateTestScenarioDialog
        open={
          createDialogOpen
        }
        requirementId={
          requirement.requirementId
        }
        onClose={() =>
          setCreateDialogOpen(
            false,
          )
        }
        onCreated={
          handleScenarioCreated
        }
      />
    </Stack>
  );
}