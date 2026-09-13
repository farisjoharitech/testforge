import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ArrowBack,
  Assessment,
  PlayArrow,
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
  automationApi,
} from '../../api/automationApi';

import {
  testCaseApi,
} from '../../api/testCaseApi';

import {
  PageHeader,
} from '../../components/common/PageHeader';

import type {
  AutomationExecution,
  AutomationExecutionStatus,
  AutomationScript,
  GeneratedScript,
} from '../../types/automation';

import type {
  TestCase,
} from '../../types/testCase';

function getErrorMessage(
  error: unknown,
): string {

  if (
    error instanceof ApiError
  ) {
    return error.message;
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return 'Unexpected error occurred.';
}

function getStatusColor(
  status: AutomationExecutionStatus,
):
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'default' {

  switch (status) {

    case 'RUNNING':
      return 'primary';

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

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(
    durationMs / 1000
  ).toFixed(2)} s`;
}

export default function AutomationExecutionPage() {

  const navigate =
    useNavigate();

  const {
    testCaseId,
  } =
    useParams<{
      testCaseId: string;
    }>();

  const [
    testCase,
    setTestCase,
  ] =
    useState<
      TestCase | null
    >(
      null,
    );

  const [
    script,
    setScript,
  ] =
    useState<
      AutomationScript | null
    >(
      null,
    );

  const [
    generated,
    setGenerated,
  ] =
    useState<
      GeneratedScript | null
    >(
      null,
    );

  const [
    latestExecution,
    setLatestExecution,
  ] =
    useState<
      AutomationExecution | null
    >(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    executing,
    setExecuting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const loadPage =
    useCallback(
      async () => {

        if (!testCaseId) {

          setError(
            'Test Case ID is missing.',
          );

          setLoading(
            false,
          );

          return;
        }

        try {

          setLoading(
            true,
          );

          setError(
            null,
          );

          const loadedTestCase =
            await testCaseApi
              .getTestCaseByBusinessId(
                testCaseId,
              );

          setTestCase(
            loadedTestCase,
          );

          const loadedScript =
            await automationApi
              .getScriptByTestCase(
                loadedTestCase.id,
              );

          setScript(
            loadedScript,
          );

          const loadedGenerated =
            await automationApi
              .getGeneratedScript(
                loadedScript.id,
              );

          setGenerated(
            loadedGenerated,
          );

          try {

            const loadedExecution =
              await automationApi
                .getLatestExecution(
                  loadedScript.id,
                );

            setLatestExecution(
              loadedExecution,
            );

          } catch (
            latestError
          ) {

            if (
              latestError instanceof ApiError
              && latestError.status === 404
            ) {

              setLatestExecution(
                null,
              );

            } else {

              throw latestError;
            }
          }

        } catch (err) {

          console.error(
            err,
          );

          setError(
            getErrorMessage(
              err,
            ),
          );

        } finally {

          setLoading(
            false,
          );
        }
      },
      [
        testCaseId,
      ],
    );

  useEffect(
    () => {

      void loadPage();
    },
    [
      loadPage,
    ],
  );

  const handleExecute =
    async () => {

      if (
        !script
        || !testCaseId
      ) {
        return;
      }

      try {

        setExecuting(
          true,
        );

        setError(
          null,
        );

        setSuccessMessage(
          null,
        );

        const execution =
          await automationApi
            .executeScript(
              script.id,
            );

        setLatestExecution(
          execution,
        );

        const refreshedTestCase =
          await testCaseApi
            .getTestCaseByBusinessId(
              testCaseId,
            );

        setTestCase(
          refreshedTestCase,
        );

        if (
          execution.status ===
          'PASSED'
        ) {

          setSuccessMessage(
            'Automation execution passed successfully.',
          );

        } else {

          setSuccessMessage(
            `Automation execution completed with status ${execution.status}.`,
          );
        }

      } catch (err) {

        console.error(
          err,
        );

        setError(
          getErrorMessage(
            err,
          ),
        );

      } finally {

        setExecuting(
          false,
        );
      }
    };

  if (loading) {

    return (
      <Box
        sx={{
          minHeight: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (
    !testCase
    || !script
    || !generated
  ) {

    return (
      <Stack
        spacing={3}
      >
        <PageHeader
          title="Automation Execution"
          description="Unable to load automation execution."
        />

        <Alert
          severity="error"
        >
          {
            error
            ?? 'Automation execution information could not be loaded.'
          }
        </Alert>

        <Button
          variant="outlined"
          startIcon={
            <ArrowBack />
          }
          onClick={() =>
            navigate(
              '/automation',
            )
          }
        >
          Back to Automation
        </Button>
      </Stack>
    );
  }

  const canExecute =
    !generated.stale
    && !executing;

  return (
    <Stack
      spacing={3}
    >
      <PageHeader
        title="Automation Execution"
        description={`Run generated Playwright Java automation for ${testCase.testCaseId}.`}
        actions={
          <Stack
            direction="row"
            spacing={1}
          >
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
              Results
            </Button>

            <Button
              variant="outlined"
              startIcon={
                <ArrowBack />
              }
              onClick={() =>
                navigate(
                  `/automation/${encodeURIComponent(
                    testCase.testCaseId,
                  )}/script`,
                )
              }
            >
              Script
            </Button>
          </Stack>
        }
      />

      {error && (
        <Alert
          severity="error"
        >
          {error}
        </Alert>
      )}

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

      {generated.stale && (
        <Alert
          severity="warning"
        >
          Generated source is stale.
          Return to Script Generation
          and regenerate it before
          executing.
        </Alert>
      )}

      <Card
        variant="outlined"
      >
        <CardContent>
          <Stack
            spacing={2}
          >
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Execution
            </Typography>

            <Divider />

            <Box
              sx={{
                display:
                  'grid',
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
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Test Case
                </Typography>

                <Typography
                  fontWeight={700}
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
                  Automation Script
                </Typography>

                <Typography
                  fontWeight={700}
                >
                  {
                    script.automationScriptId
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Generated Class
                </Typography>

                <Typography
                  fontFamily="monospace"
                >
                  {
                    generated.className
                  }
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Test Case Status
                </Typography>

                <Typography>
                  {
                    testCase.automationStatus
                  }
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
            >
              <Button
                variant="contained"
                startIcon={
                  executing
                    ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    )
                    : (
                      <PlayArrow />
                    )
                }
                disabled={
                  !canExecute
                }
                onClick={() =>
                  void handleExecute()
                }
              >
                {
                  executing
                    ? 'Running...'
                    : latestExecution
                      ? 'Run Again'
                      : 'Run Automation'
                }
              </Button>

              <Button
                variant="outlined"
                startIcon={
                  <Refresh />
                }
                disabled={
                  executing
                }
                onClick={() =>
                  void loadPage()
                }
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {latestExecution && (
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
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                  >
                    Latest Execution
                  </Typography>

                  <Typography
                    variant="h6"
                    fontFamily="monospace"
                    fontWeight={700}
                  >
                    {
                      latestExecution.executionId
                    }
                  </Typography>
                </Box>

                <Chip
                  label={
                    latestExecution.status
                  }
                  color={
                    getStatusColor(
                      latestExecution.status,
                    )
                  }
                  sx={{
                    alignSelf:
                      'flex-start',
                  }}
                />
              </Stack>

              <Divider />

              <Box
                sx={{
                  display:
                    'grid',
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
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Started
                  </Typography>

                  <Typography>
                    {
                      formatDate(
                        latestExecution.startedAt,
                      )
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Finished
                  </Typography>

                  <Typography>
                    {
                      formatDate(
                        latestExecution.finishedAt,
                      )
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Duration
                  </Typography>

                  <Typography>
                    {
                      formatDuration(
                        latestExecution.durationMs,
                      )
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Exit Code
                  </Typography>

                  <Typography>
                    {
                      latestExecution.exitCode
                      ?? '—'
                    }
                  </Typography>
                </Box>
              </Box>

              {latestExecution.errorMessage && (
                <Alert
                  severity="error"
                >
                  {
                    latestExecution.errorMessage
                  }
                </Alert>
              )}

              {latestExecution.status !==
                'RUNNING' && (
                <Box>
                  <Button
                    variant="contained"
                    startIcon={
                      <Assessment />
                    }
                    onClick={() =>
                      navigate(
                        `/results/${encodeURIComponent(
                          latestExecution.executionId,
                        )}`,
                      )
                    }
                  >
                    View Result
                  </Button>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}