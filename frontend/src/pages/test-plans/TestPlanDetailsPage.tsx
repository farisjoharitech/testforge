import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Add,
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
  hierarchyMonitoringApi,
} from '../../api/hierarchyMonitoringApi';

import {
  requirementApi,
} from '../../api/requirementApi';

import {
  testPlanApi,
} from '../../api/testPlanApi';

import DeleteConfirmationDialog from '../../components/common/DeleteConfirmationDialog';

import {
  PageHeader,
} from '../../components/common/PageHeader';

import CreateRequirementDialog from '../../components/requirements/CreateRequirementDialog';

import TestPlanMonitoringPanel from '../../components/monitoring/TestPlanMonitoringPanel';

import EditTestPlanDialog from '../../components/test-plans/EditTestPlanDialog';

import type {
  TestPlanMonitoring,
} from '../../types/hierarchyMonitoring';

import type {
  Requirement,
} from '../../types/requirement';

import type {
  TestPlan,
} from '../../types/testPlan';

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

function getRequirementStatusColor(
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

function getTestPlanStatusColor(
    status: string,
):
    | 'default'
    | 'primary'
    | 'success'
    | 'warning' {
  switch (status) {
    case 'ACTIVE':
      return 'primary';

    case 'COMPLETED':
      return 'success';

    case 'DRAFT':
      return 'warning';

    default:
      return 'default';
  }
}

function getApprovalStatusColor(
    status: string,
):
    | 'default'
    | 'success'
    | 'warning'
    | 'error' {
  switch (status) {
    case 'APPROVED':
      return 'success';

    case 'REJECTED':
      return 'error';

    case 'PENDING':
      return 'warning';

    default:
      return 'default';
  }
}

export default function TestPlanDetailsPage() {
  const navigate =
      useNavigate();

  const {
    testPlanId,
  } = useParams<{
    testPlanId: string;
  }>();

  const [
    testPlan,
    setTestPlan,
  ] = useState<
      TestPlan | null
  >(null);

  const [
    requirements,
    setRequirements,
  ] = useState<
      Requirement[]
  >([]);

  const [
    monitoring,
    setMonitoring,
  ] = useState<
      TestPlanMonitoring | null
  >(null);

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
            if (!testPlanId) {
              setError(
                  'Test Plan ID is missing.',
              );

              setLoading(false);

              return;
            }

            try {
              if (isRefresh) {
                setRefreshing(true);
              } else {
                setLoading(true);
              }

              setError(null);

              const [
                testPlanResponse,
                requirementResponse,
                monitoringResponse,
              ] =
                  await Promise.all([
                    testPlanApi
                        .getTestPlanByBusinessId(
                            testPlanId,
                        ),

                    requirementApi
                        .getRequirementsByTestPlan(
                            testPlanId,
                        ),

                    hierarchyMonitoringApi
                        .getTestPlanMonitoring(
                            testPlanId,
                        ),
                  ]);

              setTestPlan(
                  testPlanResponse,
              );

              setRequirements(
                  requirementResponse,
              );

              setMonitoring(
                  monitoringResponse,
              );
            } catch (err) {
              console.error(
                  'Failed to load Test Plan details:',
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
                    'Unable to load the Test Plan details or Requirements.',
                );
              }
            } finally {
              setLoading(false);
              setRefreshing(false);
            }
          },
          [testPlanId],
      );

  useEffect(
      () => {
        void loadPage();
      },
      [loadPage],
  );

  const handleRequirementCreated =
      (
          requirement:
          Requirement,
      ) => {
        setCreateDialogOpen(
            false,
        );

        setRequirements(
            (
                current,
            ) => [
              ...current,
              requirement,
            ],
        );

        setSuccessMessage(
            `Requirement "${requirement.requirementId}" created successfully.`,
        );

        void loadPage(true);
      };

  const handleTestPlanUpdated =
      (
          updatedTestPlan:
          TestPlan,
      ) => {
        setTestPlan(
            updatedTestPlan,
        );

        setEditDialogOpen(
            false,
        );

        setSuccessMessage(
            `Test Plan "${updatedTestPlan.testPlanId}" updated successfully.`,
        );
      };

  const handleDelete =
      async () => {
        if (!testPlan) {
          return;
        }

        try {
          setDeleting(true);

          setDeleteError(
              null,
          );

          await testPlanApi
              .deleteTestPlan(
                  testPlan.id,
              );

          navigate(
              '/test-plans',
          );
        } catch (err) {
          console.error(
              'Failed to delete Test Plan:',
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
                'Unable to delete the Test Plan. Delete its child Requirements first.',
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
                Plan...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
    );
  }

  if (
      error &&
      !testPlan
  ) {
    return (
        <Stack
            spacing={3}
        >
          <Alert
              severity="error"
          >
            {error}
          </Alert>

          <Stack
              direction="row"
              spacing={1}
          >
            <Button
                variant="outlined"
                onClick={() =>
                    navigate(
                        '/test-plans',
                    )
                }
            >
              Back to Test Plans
            </Button>

            <Button
                variant="contained"
                onClick={() =>
                    void loadPage()
                }
            >
              Try Again
            </Button>
          </Stack>
        </Stack>
    );
  }

  if (!testPlan) {
    return null;
  }

  return (
      <Stack
          spacing={3}
      >
        <PageHeader
            title={
              testPlan.testPlanId
            }
            description={
              testPlan.name
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
                testPlan.testPlanId,
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
                  Add Requirement
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
                    Test Plan
                    Information
                  </Typography>

                  <Typography
                      variant="body2"
                      color="text.secondary"
                  >
                    Core Test Plan
                    configuration and
                    lifecycle status.
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
                        testPlan.status
                      }
                      color={getTestPlanStatusColor(
                          testPlan.status,
                      )}
                      variant="outlined"
                  />

                  <Chip
                      label={
                        testPlan.approvalStatus
                      }
                      color={getApprovalStatusColor(
                          testPlan.approvalStatus,
                      )}
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
                    Test Plan ID
                  </Typography>

                  <Typography
                      fontWeight={600}
                  >
                    {
                      testPlan.testPlanId
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Name
                  </Typography>

                  <Typography>
                    {
                      testPlan.name
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Version
                  </Typography>

                  <Typography>
                    {displayValue(
                        testPlan.version,
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Project
                  </Typography>

                  <Typography>
                    {displayValue(
                        `${testPlan.projectName} (${testPlan.projectBusinessId})`,
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Application
                  </Typography>

                  <Typography>
                    {displayValue(
                        testPlan.application,
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Environment
                  </Typography>

                  <Typography>
                    {displayValue(
                        testPlan.environment,
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="caption"
                      color="text.secondary"
                  >
                    Prepared By
                  </Typography>

                  <Typography>
                    {displayValue(
                        testPlan.preparedBy,
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
                        testPlan.createdAt,
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
                        testPlan.updatedAt,
                    )}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {monitoring && (
            <TestPlanMonitoringPanel
                monitoring={monitoring}
            />
        )}

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
              Requirements
            </Typography>

            <Typography
                color="text.secondary"
            >
              Requirements linked
              to this Test Plan.
            </Typography>
          </Box>

          <Chip
              label={`${requirements.length} requirement${
                  requirements.length ===
                  1
                      ? ''
                      : 's'
              }`}
              variant="outlined"
          />
        </Box>

        {requirements.length ===
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
                    No Requirements
                    yet
                  </Typography>

                  <Typography
                      color="text.secondary"
                  >
                    Add the first
                    Requirement to this
                    Test Plan.
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
                    Add Requirement
                  </Button>
                </Stack>
              </CardContent>
            </Card>
        ) : (
            <Stack
                spacing={2}
            >
              {requirements.map(
                  (
                      requirement,
                  ) => (
                      <Card
                          key={
                            requirement.id
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
                                    requirement.requirementId
                                  }
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    sx={{
                                      mt: 0.5,
                                      whiteSpace:
                                          'pre-wrap',
                                    }}
                                >
                                  {
                                    requirement.description
                                  }
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
                                    color={getRequirementStatusColor(
                                        requirement.status,
                                    )}
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

                                <Typography
                                    variant="body2"
                                >
                                  {formatDate(
                                      requirement.updatedAt,
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
                                          `/requirements/${encodeURIComponent(
                                              requirement.requirementId,
                                          )}`,
                                      )
                                  }
                              >
                                Open Requirement
                              </Button>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                  ),
              )}
            </Stack>
        )}

        <CreateRequirementDialog
            open={
              createDialogOpen
            }
            testPlanId={
              testPlan.testPlanId
            }
            onClose={() =>
                setCreateDialogOpen(
                    false,
                )
            }
            onCreated={
              handleRequirementCreated
            }
        />

        <EditTestPlanDialog
            open={
              editDialogOpen
            }
            testPlan={
              testPlan
            }
            onClose={() =>
                setEditDialogOpen(
                    false,
                )
            }
            onUpdated={
              handleTestPlanUpdated
            }
        />

        <DeleteConfirmationDialog
            open={
              deleteDialogOpen
            }
            title="Delete Test Plan?"
            entityName={
              testPlan.testPlanId
            }
            description="A Test Plan cannot be deleted while child Requirements still reference it. Delete the child lifecycle records first."
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