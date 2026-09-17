import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowBack,
  Assessment,
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

export default function AutomationRunDetailsPage() {
  const navigate = useNavigate();
  const { runId } = useParams<{ runId: string }>();

  const [run, setRun] = useState<AutomationRun | null>(null);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      } else if (!run) {
        setLoading(true);
      }

      setError(null);

      const [updatedRun, updatedExecutions] = await Promise.all([
        automationApi.getRun(numericRunId),
        automationApi.getRunExecutions(numericRunId),
      ]);

      setRun(updatedRun);
      setExecutions(updatedExecutions);
      return updatedRun;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [numericRunId, run]);

  useEffect(() => {
    void loadRun();
    // loadRun intentionally changes as run changes; numericRunId is the stable load key.
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

  const progress = useMemo(
    () => run && run.totalExecutions > 0
      ? (run.completedExecutions / run.totalExecutions) * 100
      : 0,
    [run],
  );

  if (loading && !run) {
    return (
      <Box sx={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!run) {
    return (
      <Stack spacing={2}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/automation')} sx={{ alignSelf: 'flex-start' }}>
          Back to Automation
        </Button>
        <Alert severity="error">{error || 'Automation Run not found.'}</Alert>
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

      {error && <Alert severity="error">{error}</Alert>}

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              spacing={1.5}
            >
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Automation Run
                </Typography>
                <Typography variant="h6" fontWeight={750}>
                  {run.runId}
                </Typography>
              </Box>

              <Chip
                label={run.status}
                color={getRunColor(run.status)}
                variant={run.status === 'RUNNING' ? 'filled' : 'outlined'}
              />
            </Stack>

            <LinearProgress variant="determinate" value={Math.min(100, progress)} />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 1.5,
              }}
            >
              <Metric label="Total" value={run.totalExecutions} />
              <Metric label="Completed" value={run.completedExecutions} />
              <Metric label="Passed" value={run.passedExecutions} />
              <Metric label="Failed" value={run.failedExecutions} />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={1.5}>
        <Typography variant="h6" fontWeight={700}>
          Test Case Executions
        </Typography>

        {executions.length === 0 ? (
          <Alert severity="info">
            The Run has started. The first child execution will appear when its Test Case begins.
          </Alert>
        ) : (
          executions.map((execution) => (
            <Card key={execution.id} variant="outlined">
              <CardContent>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Box>
                    <Typography fontWeight={750}>
                      {execution.testCaseBusinessId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {execution.executionId}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={execution.status}
                      color={getExecutionColor(execution.status)}
                      variant="outlined"
                    />

                    <Button
                      size="small"
                      startIcon={<Assessment />}
                      onClick={() => navigate(`/results/${execution.id}`)}
                    >
                      Result
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
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
