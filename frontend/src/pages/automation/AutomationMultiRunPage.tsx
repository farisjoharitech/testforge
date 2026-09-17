import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowBack,
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
  CircularProgress,
  Divider,
  FormControlLabel,
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

export default function AutomationMultiRunPage() {
  const navigate = useNavigate();

  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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
    if (starting) {
      return;
    }

    setSelectedIds((current) =>
      current.includes(testCaseId)
        ? current.filter((id) => id !== testCaseId)
        : [...current, testCaseId],
    );
  };

  const handleStart = async () => {
    if (selectedIds.length < 2) {
      setError('Select at least two Test Cases.');
      return;
    }

    try {
      setStarting(true);
      setError(null);

      const startedRun = await automationApi.executeMultipleTestCases({
        testCaseIds: selectedIds,
      });

      navigate(`/automation/runs/${startedRun.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setStarting(false);
    }
  };

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
        description="Select two or more automation-ready Test Cases. TestForge validates the complete selection first, then opens the shared live Run dashboard."
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
                  disabled={starting}
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
                            disabled={starting}
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

      {selectedTestCases.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          {selectedTestCases.length} Test Cases selected. Task 36.25I monitors the resulting sequential Run on the shared live dashboard; parallel execution remains intentionally deferred.
        </Typography>
      )}
    </Stack>
  );
}
