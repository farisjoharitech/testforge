import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ArrowBack,
  PlayArrow,
  Refresh,
  Terminal,
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

function formatDuration(
  durationMs:
    | number
    | null
    | undefined,
): string {
  if (
    durationMs === null ||
    durationMs === undefined
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

  return `${seconds.toFixed(2)} s`;
}

function executionColor(
  status:
    AutomationExecution['status'],
):
  | 'default'
  | 'primary'
  | 'success'
  | 'error'
  | 'warning' {
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
    useState<TestCase | null>(
      null,
    );

  const [
    script,
    setScript,
  ] =
    useState<AutomationScript | null>(
      null,
    );

  const [
    generated,
    setGenerated,
  ] =
    useState<GeneratedScript | null>(
      null,
    );

  const [
    execution,
    setExecution,
  ] =
    useState<AutomationExecution | null>(
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
    useState<string | null>(
      null,
    );

  const loadPage =
    useCallback(
      async () => {
        if (
          !testCaseId
        ) {
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
            const latestExecution =
              await automationApi
                .getLatestExecution(
                  loadedScript.id,
                );

            setExecution(
              latestExecution,
            );
          } catch (
            latestError
          ) {
            if (
              latestError instanceof
                ApiError &&
              latestError.status ===
                404
            ) {
              setExecution(
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

        const result =
          await automationApi
            .executeScript(
              script.id,
            );

        setExecution(
          result,
        );

        /*
         * Reload Test Case so automationStatus
         * becomes AUTOMATED or READY.
         */
        if (
          testCaseId
        ) {
          const refreshed =
            await testCaseApi
              .getTestCaseByBusinessId(
                testCaseId,
              );

          setTestCase(
            refreshed,
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

  if (
    loading
  ) {
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
    !testCase ||
    !script ||
    !generated ||
    !testCaseId
  ) {
    return (
      <Stack spacing={3}>
        <PageHeader
          title="Automation Execution"
          description="Unable to load Automation Execution."
        />

        <Alert
          severity="error"
        >
          {error ??
            'Generated automation could not be loaded.'}
        </Alert>

        <Box>
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
            Back
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Automation Execution"
        description={`Execute generated Playwright automation for ${testCase.testCaseId}.`}
        breadcrumbs={[
          {
            label:
              'Automation',
            to:
              '/automation',
          },
          {
            label:
              testCase.testCaseId,
            to:
              `/automation/${encodeURIComponent(
                testCase.testCaseId,
              )}`,
          },
          {
            label:
              'Script Generation',
            to:
              `/automation/${encodeURIComponent(
                testCase.testCaseId,
              )}/script`,
          },
          {
            label:
              'Execution',
          },
        ]}
        actions={
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
            Back to Script
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

      {generated.stale && (
        <Alert
          severity="warning"
        >
          The generated source is stale.
          Return to Script Generation and
          regenerate it before executing.
        </Alert>
      )}

      <Card
        variant="outlined"
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction={{
                xs: 'column',
                md: 'row',
              }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                >
                  Test Case
                </Typography>

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  {
                    testCase.testCaseId
                  }
                  {' — '}
                  {
                    testCase.name
                  }
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
              >
                <Chip
                  label={
                    testCase.automationType ===
                    'UI_API'
                      ? 'UI + API'
                      : testCase.automationType
                  }
                  variant="outlined"
                />

                <Chip
                  label={
                    testCase.automationStatus
                  }
                  color={
                    testCase.automationStatus ===
                    'AUTOMATED'
                      ? 'success'
                      : 'default'
                  }
                  variant="outlined"
                />
              </Stack>
            </Stack>

            <Divider />

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
                Generated At
              </Typography>

              <Typography>
                {new Date(
                  generated.generatedAt,
                ).toLocaleString()}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
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
                executing ||
                generated.stale
              }
              onClick={() =>
                void handleExecute()
              }
              sx={{
                alignSelf:
                  'flex-start',
              }}
            >
              {executing
                ? 'Executing...'
                : execution
                  ? 'Run Again'
                  : 'Run Automation'}
            </Button>

            {executing && (
              <Alert
                severity="info"
                icon={
                  <Terminal />
                }
              >
                The generated automation is
                running. TestForge is
                waiting for the isolated
                execution process to
                finish.
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {!execution ? (
        <Alert
          severity="info"
        >
          This automation has not been
          executed yet.
        </Alert>
      ) : (
        <Card
          variant="outlined"
        >
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction={{
                  xs: 'column',
                  md: 'row',
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
                    fontWeight={700}
                  >
                    {
                      execution.executionId
                    }
                  </Typography>
                </Box>

                <Chip
                  label={
                    execution.status
                  }
                  color={
                    executionColor(
                      execution.status,
                    )
                  }
                />
              </Stack>

              {execution.status ===
                'PASSED' && (
                <Alert
                  severity="success"
                >
                  Automation execution
                  passed successfully.
                </Alert>
              )}

              {execution.status ===
                'FAILED' && (
                <Alert
                  severity="error"
                >
                  The generated automation
                  executed but the test
                  failed.
                </Alert>
              )}

              {execution.status ===
                'TIMED_OUT' && (
                <Alert
                  severity="warning"
                >
                  Automation execution
                  exceeded the configured
                  timeout.
                </Alert>
              )}

              {execution.status ===
                'ERROR' && (
                <Alert
                  severity="error"
                >
                  TestForge could not
                  complete the automation
                  execution.
                </Alert>
              )}

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
                    {new Date(
                      execution.startedAt,
                    ).toLocaleString()}
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
                    {execution.finishedAt
                      ? new Date(
                          execution.finishedAt,
                        ).toLocaleString()
                      : '—'}
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
                    {formatDuration(
                      execution.durationMs,
                    )}
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
                    {execution.exitCode ??
                      '—'}
                  </Typography>
                </Box>
              </Box>

              {execution.errorMessage && (
                <Alert
                  severity="error"
                  variant="outlined"
                >
                  {
                    execution.errorMessage
                  }
                </Alert>
              )}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Execution Log
                </Typography>

                <Button
                  size="small"
                  startIcon={
                    <Refresh />
                  }
                  onClick={() =>
                    void loadPage()
                  }
                >
                  Refresh
                </Button>
              </Stack>

              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  bgcolor:
                    'grey.950',
                  color:
                    'grey.100',
                  borderRadius: 1,
                  fontFamily:
                    'monospace',
                  fontSize: 12,
                  lineHeight: 1.55,
                  maxHeight: 650,
                  overflow: 'auto',
                  whiteSpace:
                    'pre-wrap',
                  overflowWrap:
                    'anywhere',
                }}
              >
                {execution.logOutput ||
                  '(no execution log)'}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}