import {
  useCallback,
  useEffect,
  useMemo,
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
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import {
  useNavigate,
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
  AutomationRun,
  AutomationRunStatus,
} from '../../types/automation';

import type {
  TestCase,
} from '../../types/testCase';

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to start the multi-test automation run.';
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

export default function AutomationMultiRunPage() {
  const navigate = useNavigate();

  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [run, setRun] = useState<AutomationRun | null>(null);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEligible = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await testCaseApi.getAutomationEligible();

      setTestCases(
        response.filter(
          (testCase) =>
            testCase.automatable &&
            testCase.automationType !== 'MANUAL' &&
            testCase.automationStatus !== 'NOT_APPLICABLE',
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEligible();
  }, [loadEligible]);

  const selectedTestCases = useMemo(
    () =>
      testCases.filter((testCase) =>
        selectedIds.includes(testCase.id),
      ),
    [selectedIds, testCases],
  );

  const toggleTestCase = (testCaseId: number) => {
    if (run?.status === 'RUNNING' || starting) {
      return;
    }

    setSelectedIds((current) =>
      current.includes(testCaseId)
        ? current.filter((id) => id !== testCaseId)
        : [...current, testCaseId],
    );
  };

  const refreshRun = useCallback(
    async (runId: number) => {
      const [updatedRun, updatedExecutions] = await Promise.all([
        automationApi.getRun(runId),
        automationApi.getRunExecutions(runId),
      ]);

      setRun(updatedRun);
      setExecutions(updatedExecutions);
      return updatedRun;
    },
    [],
  );

  useEffect(() => {
    if (!run || run.status !== 'RUNNING') {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      void refreshRun(run.id).catch((err) => {
        setError(getErrorMessage(err));
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshRun, run]);

  const handleStart = async () => {
    if (selectedIds.length < 2) {
      setError('Select at least two Test Cases.');
      return;
    }

    try {
      setStarting(true);
      setError(null);
      setExecutions([]);

      const startedRun = await automationApi.executeMultipleTestCases({
        testCaseIds: selectedIds,
      });

      setRun(startedRun);
      await refreshRun(startedRun.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setStarting(false);
    }
  };

  const progress = run && run.totalExecutions > 0
    ? (run.completedExecutions / run.totalExecutions) * 100
    : 0;

  if (loading) {
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

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Run Multiple Test Cases"
        description="Select two or more automation-ready Test Cases. TestForge validates the complete selection first, then executes them sequentially inside one Automation Run."
        breadcrumbs={[
          { label: 'Automation', to: '/automation' },
          { label: 'Multi-Test Run' },
        ]}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/automation')}
          >
            Back
          </Button>
        }
      />

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      {!run && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Select Test Cases
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Selected: {selectedIds.length}. Each selected Test Case must already have a generated, non-stale Automation Script.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => void loadEligible()}
                  >
                    Refresh
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={
                      starting
                        ? <CircularProgress size={18} color="inherit" />
                        : <PlayArrow />
                    }
                    disabled={selectedIds.length < 2 || starting}
                    onClick={() => void handleStart()}
                  >
                    {starting ? 'Starting...' : `Run ${selectedIds.length} Tests`}
                  </Button>
                </Stack>
              </Stack>

              <Divider />

              {testCases.length === 0 ? (
                <Alert severity="info">
                  No automation-eligible Test Cases are available.
                </Alert>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: 1.5,
                  }}
                >
                  {testCases.map((testCase) => (
                    <Card
                      key={testCase.id}
                      variant="outlined"
                      sx={{
                        borderColor: selectedIds.includes(testCase.id)
                          ? 'primary.main'
                          : undefined,
                      }}
                    >
                      <CardContent>
                        <FormControlLabel
                          sx={{
                            m: 0,
                            width: '100%',
                            alignItems: 'flex-start',
                          }}
                          control={
                            <Checkbox
                              checked={selectedIds.includes(testCase.id)}
                              onChange={() => toggleTestCase(testCase.id)}
                            />
                          }
                          label={
                            <Stack spacing={0.5} sx={{ pt: 0.5 }}>
                              <Typography fontWeight={700}>
                                {testCase.testCaseId} — {testCase.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {testCase.scenarioBusinessId} • {testCase.automationType} • {testCase.automationStatus}
                              </Typography>
                            </Stack>
                          }
                        />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {run && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Automation Run
                  </Typography>
                  <Typography fontFamily="monospace" fontWeight={700}>
                    {run.runId}
                  </Typography>
                </Box>

                <Chip
                  label={run.status}
                  color={getRunColor(run.status)}
                  sx={{ alignSelf: 'flex-start' }}
                />
              </Stack>

              <LinearProgress variant="determinate" value={progress} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(4, minmax(0, 1fr))',
                  },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">Total</Typography>
                  <Typography variant="h5" fontWeight={700}>{run.totalExecutions}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Completed</Typography>
                  <Typography variant="h5" fontWeight={700}>{run.completedExecutions}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Passed</Typography>
                  <Typography variant="h5" fontWeight={700}>{run.passedExecutions}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Failed</Typography>
                  <Typography variant="h5" fontWeight={700}>{run.failedExecutions}</Typography>
                </Box>
              </Box>

              <Divider />

              <Typography variant="subtitle1" fontWeight={700}>
                Executions
              </Typography>

              {executions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Waiting for the first Test Case execution to start...
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {executions.map((execution) => (
                    <Card key={execution.id} variant="outlined">
                      <CardContent>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          spacing={2}
                        >
                          <Box>
                            <Typography fontWeight={700}>
                              {execution.testCaseBusinessId}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                              {execution.executionId}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              size="small"
                              label={execution.status}
                              color={getExecutionColor(execution.status)}
                            />

                            {execution.status !== 'RUNNING' && (
                              <Button
                                size="small"
                                startIcon={<Assessment />}
                                onClick={() =>
                                  navigate(
                                    `/results/${encodeURIComponent(execution.executionId)}`,
                                  )
                                }
                              >
                                Result
                              </Button>
                            )}
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}

              {run.status !== 'RUNNING' && (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setRun(null);
                      setExecutions([]);
                      setSelectedIds([]);
                    }}
                  >
                    Start Another Run
                  </Button>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {!run && selectedTestCases.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          {selectedTestCases.length} Test Cases selected. Execution is sequential in Task 36.25F; parallel execution is intentionally deferred.
        </Typography>
      )}
    </Stack>
  );
}
