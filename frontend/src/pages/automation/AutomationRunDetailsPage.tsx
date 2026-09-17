import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ArrowBack,
  Assessment,
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
  LinearProgress,
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
  PageHeader,
} from '../../components/common/PageHeader';

import type {
  AutomationExecution,
  AutomationExecutionStatus,
  AutomationRun,
  AutomationRunEvent,
  AutomationRunStatus,
} from '../../types/automation';

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to load Automation Run.';
}

function getRunColor(
  status: AutomationRunStatus,
): 'primary' | 'success' | 'error' | 'warning' | 'default' {
  switch (status) {
    case 'RUNNING':
      return 'primary';
    case 'PASSED':
      return 'success';
    case 'PARTIAL':
      return 'warning';
    case 'FAILED':
    case 'TIMED_OUT':
    case 'ERROR':
      return 'error';
    default:
      return 'default';
  }
}

function getExecutionColor(
  status: AutomationExecutionStatus,
): 'primary' | 'success' | 'error' | 'warning' | 'default' {
  switch (status) {
    case 'RUNNING':
      return 'primary';
    case 'PASSED':
      return 'success';
    case 'TIMED_OUT':
      return 'warning';
    case 'FAILED':
    case 'ERROR':
      return 'error';
    default:
      return 'default';
  }
}

function runTypeLabel(run: AutomationRun): string {
  switch (run.runType) {
    case 'SCENARIO':
      return 'Scenario Run';
    case 'MULTI_TEST_CASE':
      return 'Multi-Test Run';
    case 'TEST_PLAN':
      return 'Test Plan Run';
    case 'TEST_SET':
      return 'Test Set Run';
    case 'SINGLE_TEST_CASE':
    default:
      return 'Automation Run';
  }
}

function formatDate(value?: string | null): string {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString();
}

function formatDuration(durationMs?: number | null): string {
  if (durationMs === null || durationMs === undefined) {
    return '—';
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  if (durationMs < 60_000) {
    return `${(durationMs / 1000).toFixed(2)} s`;
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${seconds}s`;
}

function getExecutionDuration(execution: AutomationExecution): number | null {
  if (execution.durationMs !== null && execution.durationMs !== undefined) {
    return execution.durationMs;
  }

  if (execution.status === 'RUNNING' && execution.startedAt) {
    const startedAt = new Date(execution.startedAt).getTime();

    if (!Number.isNaN(startedAt)) {
      return Math.max(0, Date.now() - startedAt);
    }
  }

  return null;
}

export default function AutomationRunDetailsPage() {
  const navigate = useNavigate();
  const { runId } = useParams<{ runId: string }>();

  const [run, setRun] = useState<AutomationRun | null>(null);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveLog, setLiveLog] = useState('');
  const [liveLogExecutionId, setLiveLogExecutionId] = useState<number | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [structuredEvents, setStructuredEvents] = useState<AutomationRunEvent[]>([]);
  const [structuredStreamConnected, setStructuredStreamConnected] = useState(false);
  const [, setClockTick] = useState(0);

  const liveLogRef = useRef<HTMLPreElement | null>(null);
  const numericRunId = Number(runId);

  const loadRun = useCallback(async (showRefresh = false) => {
    if (!Number.isInteger(numericRunId) || numericRunId <= 0) {
      setError('Automation Run ID is invalid.');
      setLoading(false);
      return null;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      }

      setError(null);

      const [updatedRun, updatedExecutions] = await Promise.all([
        automationApi.getRun(numericRunId),
        automationApi.getRunExecutions(numericRunId),
      ]);

      setRun(updatedRun);
      setExecutions(updatedExecutions);
      setLastUpdatedAt(new Date());

      return updatedRun;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [numericRunId]);

  useEffect(() => {
    void loadRun();
    // numericRunId is the page load key. Polling handles subsequent updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericRunId]);

  useEffect(() => {
    if (!run || run.status !== 'RUNNING') {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      void loadRun(false);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [loadRun, run]);

  useEffect(() => {
    if (!run || run.status !== 'RUNNING') {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setClockTick((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [run]);

  useEffect(() => {
    if (!Number.isInteger(numericRunId) || numericRunId <= 0) {
      return undefined;
    }

    setStructuredEvents([]);
    setStructuredStreamConnected(false);

    const eventSource = new EventSource(
      automationApi.getRunEventStreamUrl(numericRunId),
    );

    eventSource.onopen = () => {
      setStructuredStreamConnected(true);
    };

    const handleRunEvent = (event: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(event.data) as AutomationRunEvent;

        setStructuredEvents((current) => {
          if (current.some((item) => item.sequence === parsed.sequence)) {
            return current;
          }

          return [...current, parsed]
            .sort((left, right) => left.sequence - right.sequence)
            .slice(-500);
        });

        if (parsed.eventType === 'RUN_COMPLETED') {
          void loadRun(false);
          eventSource.close();
          setStructuredStreamConnected(false);
        }
      } catch {
        // Ignore malformed event payloads; normal polling remains the fallback.
      }
    };

    eventSource.addEventListener(
      'run-event',
      handleRunEvent as EventListener,
    );

    eventSource.onerror = () => {
      setStructuredStreamConnected(false);
    };

    return () => {
      eventSource.close();
      setStructuredStreamConnected(false);
    };
  }, [loadRun, numericRunId]);

  const activeExecution = useMemo(
    () => executions.find((execution) => execution.status === 'RUNNING') ?? null,
    [executions],
  );

  useEffect(() => {
    if (!activeExecution) {
      setLiveLogExecutionId(null);
      setLiveLog('');
      return undefined;
    }

    setLiveLogExecutionId(activeExecution.id);
    setLiveLog(activeExecution.logOutput ?? '');

    const eventSource = new EventSource(
      automationApi.getExecutionLogStreamUrl(activeExecution.id),
    );

    const handleSnapshot = (event: MessageEvent<string>) => {
      setLiveLog(event.data ?? '');
    };

    const handleLog = (event: MessageEvent<string>) => {
      setLiveLog((current) => `${current}${event.data}\n`);
    };

    const handleComplete = () => {
      eventSource.close();
      void loadRun(false);
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

    eventSource.onerror = () => {
      // Parent/child polling remains the fallback if SSE disconnects.
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [activeExecution?.id, activeExecution?.status, loadRun]);

  useEffect(() => {
    if (!liveLogRef.current) {
      return;
    }

    liveLogRef.current.scrollTop = liveLogRef.current.scrollHeight;
  }, [liveLog]);

  const progress = useMemo(
    () => run && run.totalExecutions > 0
      ? (run.completedExecutions / run.totalExecutions) * 100
      : 0,
    [run],
  );

  const waitingCount = useMemo(() => {
    if (!run) {
      return 0;
    }

    return Math.max(
      0,
      run.totalExecutions - run.completedExecutions - (activeExecution ? 1 : 0),
    );
  }, [activeExecution, run]);

  const activeStructuredStep = useMemo(() => {
    if (!activeExecution) {
      return null;
    }

    const executionEvents = structuredEvents.filter(
      (event) => event.executionId === activeExecution.id,
    );

    for (let index = executionEvents.length - 1; index >= 0; index -= 1) {
      const event = executionEvents[index];

      if (event.eventType === 'STEP_STARTED') {
        const laterCompletion = executionEvents
          .slice(index + 1)
          .some(
            (later) =>
              later.stepOrder === event.stepOrder
              && (later.eventType === 'STEP_PASSED' || later.eventType === 'STEP_FAILED'),
          );

        if (!laterCompletion) {
          return event;
        }
      }
    }

    return null;
  }, [activeExecution, structuredEvents]);

  if (loading && !run) {
    return (
      <Box
        sx={{
          minHeight: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!run) {
    return (
      <Stack spacing={2}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/automation')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to Automation
        </Button>

        <Alert severity="error">
          {error || 'Automation Run not found.'}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title={runTypeLabel(run)}
        description={`${run.runId} • ${run.runType.replaceAll('_', ' ')}`}
        breadcrumbs={[
          { label: 'Automation', to: '/automation' },
          { label: 'Run' },
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              disabled={refreshing}
              onClick={() => void loadRun(true)}
            >
              Refresh
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/automation')}
            >
              Automation
            </Button>
          </Stack>
        }
      />

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2.5}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Automation Run
                </Typography>

                <Typography variant="h6" fontWeight={750} fontFamily="monospace">
                  {run.runId}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Started {formatDate(run.startedAt)}
                  {run.finishedAt ? ` • Finished ${formatDate(run.finishedAt)}` : ''}
                </Typography>
              </Box>

              <Stack spacing={0.75} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                <Chip
                  label={run.status}
                  color={getRunColor(run.status)}
                  variant={run.status === 'RUNNING' ? 'filled' : 'outlined'}
                />

                <Chip
                  size="small"
                  label={structuredStreamConnected ? 'Structured events live' : 'Structured events reconnecting'}
                  color={structuredStreamConnected ? 'success' : 'default'}
                  variant="outlined"
                />

                <Typography variant="caption" color="text.secondary">
                  {run.status === 'RUNNING'
                    ? 'Live • refreshing every second'
                    : 'Run complete'}
                </Typography>

                {lastUpdatedAt && (
                  <Typography variant="caption" color="text.secondary">
                    Last updated {lastUpdatedAt.toLocaleTimeString()}
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 0.75 }}
              >
                <Typography variant="body2" fontWeight={700}>
                  Overall progress
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {run.completedExecutions} / {run.totalExecutions} completed • {Math.round(progress)}%
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={Math.min(100, progress)}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(5, minmax(0, 1fr))',
                },
                gap: 1.5,
              }}
            >
              <Metric label="Total" value={run.totalExecutions} />
              <Metric label="Completed" value={run.completedExecutions} />
              <Metric label="Passed" value={run.passedExecutions} />
              <Metric label="Failed" value={run.failedExecutions} />
              <Metric label="Waiting" value={waitingCount} />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {run.status === 'RUNNING' && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Currently Running
                  </Typography>

                  {activeExecution ? (
                    <>
                      <Typography variant="h6" fontWeight={750}>
                        {activeExecution.testCaseBusinessId}
                      </Typography>

                      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        {activeExecution.executionId}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="h6" fontWeight={750}>
                      Preparing next Test Case…
                    </Typography>
                  )}
                </Box>

                {activeExecution && (
                  <Stack alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={0.5}>
                    <Chip
                      size="small"
                      label="RUNNING"
                      color="primary"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Elapsed {formatDuration(getExecutionDuration(activeExecution))}
                    </Typography>
                  </Stack>
                )}
              </Stack>

              {activeExecution && (
                <>
                  <Divider />

                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Structured Step Progress
                    </Typography>

                    {activeStructuredStep ? (
                      <Stack spacing={0.5}>
                        <Typography fontWeight={750}>
                          Step {activeStructuredStep.stepOrder} • {activeStructuredStep.actionType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                          {activeStructuredStep.automationStepId}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Waiting for the next structured step event…
                      </Typography>
                    )}
                  </Box>

                  <Divider />

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Terminal fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Live execution log
                    </Typography>
                  </Stack>

                  <Box
                    ref={liveLogRef}
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      minHeight: 160,
                      maxHeight: 320,
                      overflow: 'auto',
                      borderRadius: 1,
                      bgcolor: 'grey.950',
                      color: 'grey.100',
                      fontFamily: 'monospace',
                      fontSize: 12,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {liveLogExecutionId === activeExecution.id && liveLog
                      ? liveLog
                      : 'Waiting for execution output…'}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Logs use the existing execution SSE stream. Parent Run and child statuses continue polling as a fallback.
                  </Typography>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              spacing={1}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Structured Live Events
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  First-class Test Case and Automation Step events from the Run SSE stream.
                </Typography>
              </Box>
              <Chip
                size="small"
                label={`${structuredEvents.length} events`}
                variant="outlined"
                sx={{ alignSelf: 'flex-start' }}
              />
            </Stack>

            {structuredEvents.length === 0 ? (
              <Alert severity="info">
                Waiting for structured Run events…
              </Alert>
            ) : (
              <Stack spacing={1}>
                {structuredEvents.slice(-12).reverse().map((event) => (
                  <StructuredEventRow key={event.sequence} event={event} />
                ))}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Test Case Executions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Child executions appear in execution order. Sequential runs create the next child when it starts.
            </Typography>
          </Box>

          <Chip
            size="small"
            label={`${executions.length} created`}
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
          />
        </Stack>

        {executions.length === 0 ? (
          <Alert severity="info">
            The Run has started. The first child execution will appear when its Test Case begins.
          </Alert>
        ) : (
          executions.map((execution, index) => (
            <ExecutionCard
              key={execution.id}
              execution={execution}
              sequence={index + 1}
              onOpenResult={() =>
                navigate(
                  `/results/${encodeURIComponent(execution.executionId)}`,
                )
              }
            />
          ))
        )}

        {waitingCount > 0 && run.status === 'RUNNING' && (
          <Card variant="outlined" sx={{ borderStyle: 'dashed' }}>
            <CardContent>
              <Typography fontWeight={700}>
                {waitingCount} Test {waitingCount === 1 ? 'Case is' : 'Cases are'} waiting to start
              </Typography>
              <Typography variant="body2" color="text.secondary">
                TestForge is executing this Run sequentially. Pending child records are created as their Test Cases begin.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>

      {run.status !== 'RUNNING' && (
        <Alert
          severity={
            run.status === 'PASSED'
              ? 'success'
              : run.status === 'PARTIAL'
                ? 'warning'
                : 'error'
          }
        >
          Run finished with status <strong>{run.status}</strong>.{' '}
          {run.passedExecutions} passed and {run.failedExecutions} failed out of{' '}
          {run.totalExecutions} Test Case executions.
        </Alert>
      )}
    </Stack>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={750}>
        {value}
      </Typography>
    </Box>
  );
}

function ExecutionCard({
  execution,
  sequence,
  onOpenResult,
}: {
  execution: AutomationExecution;
  sequence: number;
  onOpenResult: () => void;
}) {
  const isFinished = execution.status !== 'RUNNING';

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  minWidth: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                  fontWeight: 750,
                }}
              >
                {sequence}
              </Box>

              <Box>
                <Typography fontWeight={750}>
                  {execution.testCaseBusinessId}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                  {execution.executionId}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={execution.status}
                color={getExecutionColor(execution.status)}
                variant={execution.status === 'RUNNING' ? 'filled' : 'outlined'}
              />

              {isFinished && (
                <Button
                  size="small"
                  startIcon={<Assessment />}
                  onClick={onOpenResult}
                >
                  Result
                </Button>
              )}
            </Stack>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 1.5,
            }}
          >
            <Detail label="Started" value={formatDate(execution.startedAt)} />
            <Detail label="Finished" value={formatDate(execution.finishedAt)} />
            <Detail label="Duration" value={formatDuration(getExecutionDuration(execution))} />
          </Box>

          {execution.errorMessage && (
            <Alert severity="error">
              {execution.errorMessage}
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function StructuredEventRow({ event }: { event: AutomationRunEvent }) {
  const severity: 'primary' | 'success' | 'error' | 'default' =
    event.eventType === 'STEP_FAILED'
      ? 'error'
      : event.eventType === 'STEP_PASSED' || event.eventType === 'RUN_COMPLETED'
        ? 'success'
        : event.eventType === 'STEP_STARTED'
          ? 'primary'
          : 'default';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '180px 1fr auto' },
        gap: 1,
        alignItems: 'center',
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Chip
        size="small"
        label={event.eventType}
        color={severity}
        variant="outlined"
        sx={{ justifySelf: 'start' }}
      />

      <Box>
        <Typography variant="body2" fontWeight={650}>
          {event.testCaseBusinessId || event.runBusinessId}
          {event.stepOrder ? ` • Step ${event.stepOrder}` : ''}
          {event.actionType ? ` • ${event.actionType}` : ''}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {event.automationStepId || event.message || 'Run event'}
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary">
        {formatDate(event.occurredAt)}
      </Typography>
    </Box>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}
