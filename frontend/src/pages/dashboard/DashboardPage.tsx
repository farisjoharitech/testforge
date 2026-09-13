import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  Assessment,
  Autorenew,
  CheckCircle,
  Code,
  Description,
  ErrorOutlineOutlined,
  Refresh,
  Science,
  Speed,
  TimerOff,
  Visibility,
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
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import {
  useNavigate,
} from 'react-router-dom';

import {
  dashboardApi,
} from '../../api/dashboardApi';

import {
  PageHeader,
} from '../../components/common/PageHeader';

import type {
  AutomationTypeSummary,
  DashboardSummary,
  ExecutionStatusSummary,
  RecentExecution,
} from '../../types/dashboard';

import type {
  AutomationResultStatus,
} from '../../types/automationResult';

interface MetricCardProps {
  title: string;

  value:
    | number
    | string;

  description:
    string;

  icon:
    ReactNode;
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: MetricCardProps) {

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          spacing={2}
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                mt: 0.75,
              }}
            >
              {value}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mt: 0.75,
              }}
            >
              {description}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor:
                'action.hover',
              color:
                'primary.main',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function formatPercentage(
  value: number,
): string {

  return `${value.toFixed(2)}%`;
}

function formatDate(
  value:
    | string
    | null,
): string {

  if (!value) {
    return '—';
  }

  return new Date(
    value,
  ).toLocaleString();
}

function formatDuration(
  durationMs:
    | number
    | null,
): string {

  if (
    durationMs === null
    || durationMs === undefined
  ) {
    return '—';
  }

  if (
    durationMs < 1000
  ) {
    return `${durationMs} ms`;
  }

  const seconds =
    durationMs / 1000;

  if (
    seconds < 60
  ) {
    return `${seconds.toFixed(
      2,
    )} s`;
  }

  const minutes =
    Math.floor(
      seconds / 60,
    );

  const remainingSeconds =
    Math.round(
      seconds % 60,
    );

  return (
    `${minutes}m `
    + `${remainingSeconds}s`
  );
}

function getStatusColor(
  status:
    AutomationResultStatus,
):
  | 'success'
  | 'error'
  | 'warning'
  | 'default' {

  switch (status) {

    case 'PASSED':
      return 'success';

    case 'FAILED':
      return 'error';

    case 'TIMED_OUT':
      return 'warning';

    case 'ERROR':
      return 'error';

    default:
      return 'default';
  }
}

function getErrorMessage(
  error: unknown,
): string {

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return (
    'Unable to load dashboard data.'
  );
}

function calculateBarPercentage(
  value: number,
  total: number,
): number {

  if (
    total <= 0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (
        value
        / total
      )
      * 100,
    ),
  );
}

interface AutomationTypeRowProps {
  label: string;

  value: number;

  total: number;
}

function AutomationTypeRow({
  label,
  value,
  total,
}: AutomationTypeRowProps) {

  const percentage =
    calculateBarPercentage(
      value,
      total,
    );

  return (
    <Stack
      spacing={0.75}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography
          variant="body2"
          fontWeight={600}
        >
          {label}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {value}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 999,
        }}
      />
    </Stack>
  );
}

export default function DashboardPage() {

  const navigate =
    useNavigate();

  const [
    summary,
    setSummary,
  ] =
    useState<
      DashboardSummary
      | null
    >(null);

  const [
    executionStatus,
    setExecutionStatus,
  ] =
    useState<
      ExecutionStatusSummary
      | null
    >(null);

  const [
    automationTypes,
    setAutomationTypes,
  ] =
    useState<
      AutomationTypeSummary
      | null
    >(null);

  const [
    recentResults,
    setRecentResults,
  ] =
    useState<
      RecentExecution[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const loadDashboard =
    useCallback(
      async () => {

        try {

          setLoading(true);

          setError(null);

          const [
            loadedSummary,
            loadedExecutionStatus,
            loadedAutomationTypes,
            loadedRecentResults,
          ] =
            await Promise.all([
              dashboardApi
                .getSummary(),

              dashboardApi
                .getExecutionStatus(),

              dashboardApi
                .getAutomationTypes(),

              dashboardApi
                .getRecentResults(),
            ]);

          setSummary(
            loadedSummary,
          );

          setExecutionStatus(
            loadedExecutionStatus,
          );

          setAutomationTypes(
            loadedAutomationTypes,
          );

          setRecentResults(
            loadedRecentResults,
          );

        } catch (err) {

          console.error(
            'Failed to load Dashboard:',
            err,
          );

          setError(
            getErrorMessage(
              err,
            ),
          );

        } finally {

          setLoading(false);
        }
      },
      [],
    );

  useEffect(
    () => {

      void loadDashboard();

    },
    [
      loadDashboard,
    ],
  );

  return (
    <Stack
      spacing={3}
    >
      <PageHeader
        title="Dashboard"
        description="Overview of TestForge test management, automation coverage, execution health, and recent results."
        actions={
          <Button
            variant="outlined"
            startIcon={
              <Refresh />
            }
            disabled={
              loading
            }
            onClick={() =>
              void loadDashboard()
            }
          >
            Refresh
          </Button>
        }
      />

      {error && (
        <Alert
          severity="error"
        >
          {error}
        </Alert>
      )}

      {loading && !summary ? (

        <Card
          variant="outlined"
        >
          <CardContent>
            <Stack
              spacing={2}
              alignItems="center"
              justifyContent="center"
              sx={{
                minHeight: 240,
              }}
            >
              <CircularProgress />

              <Typography
                color="text.secondary"
              >
                Loading Dashboard...
              </Typography>
            </Stack>
          </CardContent>
        </Card>

      ) : (
        <>

          {/*
           * ===============================================
           * TEST MANAGEMENT SUMMARY
           * ===============================================
           */}

          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mb: 2,
              }}
            >
              Test Management
            </Typography>

            <Box
              sx={{
                display: 'grid',

                gridTemplateColumns: {
                  xs:
                    '1fr',

                  sm:
                    'repeat(2, minmax(0, 1fr))',

                  lg:
                    'repeat(4, minmax(0, 1fr))',
                },

                gap: 2,
              }}
            >
              <MetricCard
                title="Total Test Cases"
                value={
                  summary
                    ?.totalTestCases
                  ?? 0
                }
                description="All Test Cases in TestForge"
                icon={
                  <Description />
                }
              />

              <MetricCard
                title="Automatable"
                value={
                  summary
                    ?.automatableTestCases
                  ?? 0
                }
                description="Test Cases eligible for automation"
                icon={
                  <Science />
                }
              />

              <MetricCard
                title="Automated"
                value={
                  summary
                    ?.automatedTestCases
                  ?? 0
                }
                description="Test Cases that completed automation successfully"
                icon={
                  <CheckCircle />
                }
              />

              <MetricCard
                title="Automation Coverage"
                value={
                  formatPercentage(
                    summary
                      ?.automationCoveragePercentage
                    ?? 0,
                  )
                }
                description="Automated ÷ Automatable Test Cases"
                icon={
                  <Speed />
                }
              />
            </Box>
          </Box>

          {/*
           * ===============================================
           * AUTOMATION COVERAGE
           * ===============================================
           */}

          <Card
            variant="outlined"
          >
            <CardContent>
              <Stack
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Automation Coverage
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Percentage of automatable Test Cases that have completed automation successfully.
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={
                    Math.min(
                      100,
                      Math.max(
                        0,
                        summary
                          ?.automationCoveragePercentage
                        ?? 0,
                      ),
                    )
                  }
                  sx={{
                    height: 12,
                    borderRadius: 999,
                  }}
                />

                <Stack
                  direction={{
                    xs:
                      'column',

                    sm:
                      'row',
                  }}
                  spacing={2}
                  justifyContent="space-between"
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {
                      summary
                        ?.automatedTestCases
                      ?? 0
                    }
                    {' '}
                    automated of
                    {' '}
                    {
                      summary
                        ?.automatableTestCases
                      ?? 0
                    }
                    {' '}
                    automatable Test Cases
                  </Typography>

                  <Typography
                    variant="body2"
                    fontWeight={700}
                  >
                    {
                      formatPercentage(
                        summary
                          ?.automationCoveragePercentage
                        ?? 0,
                      )
                    }
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/*
           * ===============================================
           * SCRIPT SUMMARY
           * ===============================================
           */}

          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                md:
                  'repeat(2, minmax(0, 1fr))',
              },

              gap: 2,
            }}
          >
            <MetricCard
              title="Automation Scripts"
              value={
                summary
                  ?.totalAutomationScripts
                ?? 0
              }
              description="Automation Builder scripts created"
              icon={
                <Code />
              }
            />

            <MetricCard
              title="Generated Scripts"
              value={
                summary
                  ?.generatedScripts
                ?? 0
              }
              description="Scripts with generated Playwright Java source"
              icon={
                <Autorenew />
              }
            />
          </Box>

          {/*
           * ===============================================
           * EXECUTION HEALTH
           * ===============================================
           */}

          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mb: 2,
              }}
            >
              Execution Health
            </Typography>

            <Box
              sx={{
                display: 'grid',

                gridTemplateColumns: {
                  xs:
                    '1fr',

                  sm:
                    'repeat(2, minmax(0, 1fr))',

                  lg:
                    'repeat(3, minmax(0, 1fr))',
                },

                gap: 2,
              }}
            >
              <MetricCard
                title="Completed Executions"
                value={
                  executionStatus
                    ?.totalExecutions
                  ?? 0
                }
                description="Final executions excluding RUNNING"
                icon={
                  <Assessment />
                }
              />

              <MetricCard
                title="Passed"
                value={
                  executionStatus
                    ?.passed
                  ?? 0
                }
                description="Successful automation executions"
                icon={
                  <CheckCircle />
                }
              />

              <MetricCard
                title="Failed"
                value={
                  executionStatus
                    ?.failed
                  ?? 0
                }
                description="Completed executions with failed tests"
                icon={
                  <ErrorOutlineOutlined />
                }
              />

              <MetricCard
                title="Timed Out"
                value={
                  executionStatus
                    ?.timedOut
                  ?? 0
                }
                description="Executions exceeding the configured timeout"
                icon={
                  <TimerOff />
                }
              />

              <MetricCard
                title="Errors"
                value={
                  executionStatus
                    ?.errors
                  ?? 0
                }
                description="Execution infrastructure or runtime errors"
                icon={
                  <ErrorOutlineOutlined />
                }
              />

              <MetricCard
                title="Pass Rate"
                value={
                  formatPercentage(
                    executionStatus
                      ?.passRatePercentage
                    ?? 0,
                  )
                }
                description="Passed ÷ all completed executions"
                icon={
                  <Speed />
                }
              />
            </Box>
          </Box>

          {/*
           * ===============================================
           * AUTOMATION TYPE + QUICK ACTIONS
           * ===============================================
           */}

          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                lg:
                  'minmax(0, 1.25fr) minmax(320px, 0.75fr)',
              },

              gap: 2,
            }}
          >
            <Card
              variant="outlined"
            >
              <CardContent>
                <Stack
                  spacing={3}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                    >
                      Automation Types
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Distribution of automatable Test Cases.
                    </Typography>
                  </Box>

                  <AutomationTypeRow
                    label="UI"
                    value={
                      automationTypes
                        ?.ui
                      ?? 0
                    }
                    total={
                      automationTypes
                        ?.totalAutomatable
                      ?? 0
                    }
                  />

                  <AutomationTypeRow
                    label="API"
                    value={
                      automationTypes
                        ?.api
                      ?? 0
                    }
                    total={
                      automationTypes
                        ?.totalAutomatable
                      ?? 0
                    }
                  />

                  <AutomationTypeRow
                    label="UI + API"
                    value={
                      automationTypes
                        ?.uiApi
                      ?? 0
                    }
                    total={
                      automationTypes
                        ?.totalAutomatable
                      ?? 0
                    }
                  />

                  <Divider />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total automatable:
                    {' '}
                    <strong>
                      {
                        automationTypes
                          ?.totalAutomatable
                        ?? 0
                      }
                    </strong>
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            <Card
              variant="outlined"
            >
              <CardContent>
                <Stack
                  spacing={2}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                    >
                      Quick Actions
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Jump to key TestForge workflows.
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    startIcon={
                      <Description />
                    }
                    onClick={() =>
                      navigate(
                        '/test-plans',
                      )
                    }
                  >
                    Test Plans
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={
                      <Science />
                    }
                    onClick={() =>
                      navigate(
                        '/automation',
                      )
                    }
                  >
                    Automation
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={
                      <Assessment />
                    }
                    onClick={() =>
                      navigate(
                        '/results',
                      )
                    }
                  >
                    Automation Results
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/*
           * ===============================================
           * RECENT RESULTS
           * ===============================================
           */}

          <Card
            variant="outlined"
          >
            <CardContent>
              <Stack
                spacing={2}
              >
                <Stack
                  direction={{
                    xs:
                      'column',

                    sm:
                      'row',
                  }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{
                    xs:
                      'stretch',

                    sm:
                      'center',
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                    >
                      Recent Results
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Latest completed automation executions.
                    </Typography>
                  </Box>

                  <Button
                    variant="text"
                    onClick={() =>
                      navigate(
                        '/results',
                      )
                    }
                  >
                    View All Results
                  </Button>
                </Stack>

                {recentResults.length === 0 ? (

                  <Alert
                    severity="info"
                  >
                    No completed automation executions yet.
                  </Alert>

                ) : (

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            Test Case
                          </TableCell>

                          <TableCell>
                            Execution
                          </TableCell>

                          <TableCell>
                            Status
                          </TableCell>

                          <TableCell>
                            Duration
                          </TableCell>

                          <TableCell>
                            Started
                          </TableCell>

                          <TableCell
                            align="right"
                          >
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {recentResults.map(
                          result => (

                            <TableRow
                              key={
                                result.executionId
                              }
                              hover
                            >
                              <TableCell>
                                <Stack
                                  spacing={0.25}
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight={700}
                                  >
                                    {
                                      result
                                        .testCaseBusinessId
                                    }
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {
                                      result
                                        .testCaseName
                                    }
                                  </Typography>
                                </Stack>
                              </TableCell>

                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily:
                                      'monospace',
                                  }}
                                >
                                  {
                                    result
                                      .executionId
                                  }
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  size="small"
                                  label={
                                    result.status
                                  }
                                  color={
                                    getStatusColor(
                                      result.status,
                                    )
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                {
                                  formatDuration(
                                    result.durationMs,
                                  )
                                }
                              </TableCell>

                              <TableCell>
                                {
                                  formatDate(
                                    result.startedAt,
                                  )
                                }
                              </TableCell>

                              <TableCell
                                align="right"
                              >
                                <Button
                                  size="small"
                                  startIcon={
                                    <Visibility />
                                  }
                                  onClick={() =>
                                    navigate(
                                      `/results/${encodeURIComponent(
                                        result.executionId,
                                      )}`,
                                    )
                                  }
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>

                          ),
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                )}
              </Stack>
            </CardContent>
          </Card>

        </>
      )}
    </Stack>
  );
}