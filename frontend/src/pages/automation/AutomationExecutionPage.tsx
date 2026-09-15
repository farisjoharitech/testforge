import {
  useCallback,
  useEffect,
  useRef,
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

  const [
    liveLog,
    setLiveLog,
  ] =
    useState('');

  const liveLogRef =
    useRef<HTMLPreElement | null>(
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

            setLiveLog(
              loadedExecution.logOutput ?? '',
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

              setLiveLog('');

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


  useEffect(
    () => {

      if (
        !latestExecution
        || latestExecution.status !==
          'RUNNING'
      ) {
        return;
      }

      let cancelled =
        false;

      const pollExecution =
        async () => {

          try {

            const refreshedExecution =
              await automationApi
                .getExecution(
                  latestExecution.id,
                );

            if (cancelled) {
              return;
            }

            setLatestExecution(
              refreshedExecution,
            );

            if (
              refreshedExecution.status !==
              'RUNNING'
            ) {
              setLiveLog(
                refreshedExecution.logOutput ?? '',
              );
            }

            if (
              refreshedExecution.status !==
              'RUNNING'
            ) {

              setExecuting(
                false,
              );

              if (testCaseId) {
                const refreshedTestCase =
                  await testCaseApi
                    .getTestCaseByBusinessId(
                      testCaseId,
                    );

                if (!cancelled) {
                  setTestCase(
                    refreshedTestCase,
                  );
                }
              }

              if (!cancelled) {
                setSuccessMessage(
                  refreshedExecution.status ===
                    'PASSED'
                    ? 'Automation execution passed successfully.'
                    : `Automation execution completed with status ${refreshedExecution.status}.`,
                );
              }
            }

          } catch (pollError) {

            if (!cancelled) {
              console.error(
                pollError,
              );
            }
          }
        };

      void pollExecution();

      const intervalId =
        window.setInterval(
          () => {
            void pollExecution();
          },
          1000,
        );

      return () => {
        cancelled =
          true;

        window.clearInterval(
          intervalId,
        );
      };
    },
    [
      latestExecution?.id,
      latestExecution?.status,
      testCaseId,
    ],
  );

  useEffect(
    () => {

      if (
        !latestExecution
        || latestExecution.status !==
          'RUNNING'
      ) {
        return;
      }

      const eventSource =
        new EventSource(
          automationApi
            .getExecutionLogStreamUrl(
              latestExecution.id,
            ),
        );

      const handleSnapshot =
        (event: MessageEvent<string>) => {
          setLiveLog(
            event.data ?? '',
          );
        };

      const handleLog =
        (event: MessageEvent<string>) => {
          setLiveLog(
            (current) =>
              current + event.data + '\n',
          );
        };

      const handleComplete =
        () => {
          eventSource.close();
        };

      eventSource.addEventListener(
        'snapshot',
        handleSnapshot as EventListener,
      );

      eventSource.addEventListener(
        'log',
        handleLog as EventListener,
      );

      eventSource.addEventListener(
        'complete',
        handleComplete as EventListener,
      );

      eventSource.onerror =
        () => {
          // Database polling remains active as a fallback.
          eventSource.close();
        };

      return () => {
        eventSource.close();
      };
    },
    [
      latestExecution?.id,
      latestExecution?.status,
    ],
  );

  useEffect(
    () => {

      if (
        !liveLogRef.current
      ) {
        return;
      }

      liveLogRef.current.scrollTop =
        liveLogRef.current.scrollHeight;
    },
    [
      liveLog,
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

        setLiveLog(
          execution.logOutput ?? '',
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
          'RUNNING'
        ) {

          setSuccessMessage(
            'Automation execution started. Live logs are updating below.',
          );

        } else if (
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

  const executionRunning =
    latestExecution?.status ===
    'RUNNING';

  const canExecute =
    !generated.stale
    && !executing
    && !executionRunning;

  return (
    <Stack
      spacing={3}
    >
      <PageHeader
        title={testCase.name}
        description="Automation Execution · Run and observe the generated Playwright Java automation."
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
                  {testCase.name}
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
                  {script.name}
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
                    variant="body2"
                    color="text.secondary"
                    fontFamily="monospace"
                    fontWeight={600}
                    sx={{ overflowWrap: 'anywhere' }}
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

              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                  sx={{
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                    >
                      Live Execution Log
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Updates automatically while Playwright is running.
                    </Typography>
                  </Box>

                  {latestExecution.status ===
                    'RUNNING' && (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <CircularProgress
                        size={16}
                      />

                      <Typography
                        variant="caption"
                        fontWeight={700}
                      >
                        RUNNING
                      </Typography>
                    </Stack>
                  )}
                </Stack>

                <Box
                  ref={liveLogRef}
                  component="pre"
                  aria-live="polite"
                  sx={{
                    m: 0,
                    p: 2,
                    minHeight: 220,
                    maxHeight: 520,
                    overflow: 'auto',
                    bgcolor: '#0B1020',
                    color: '#F8FAFC',
                    border: '1px solid #334155',
                    borderRadius: 1,
                    fontFamily:
                      '"Cascadia Code", "Consolas", monospace',
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {
                    liveLog
                    || (
                      latestExecution.status ===
                        'RUNNING'
                        ? '[TestForge] Execution started. Waiting for process output...'
                        : '(no execution log output)'
                    )
                  }
                </Box>
              </Box>

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