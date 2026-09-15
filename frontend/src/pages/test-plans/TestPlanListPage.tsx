import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Add,
  ArrowForward,
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
  Stack,
  Typography,
} from '@mui/material';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  testPlanApi,
} from '../../api/testPlanApi';

import type {
  TestPlan,
} from '../../types/testPlan';

interface LocationState {
  message?: string;
}

function getStatusColor(
    status: string,
):
    | 'default'
    | 'primary'
    | 'success'
    | 'warning' {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'COMPLETED':
      return 'primary';
    case 'DRAFT':
      return 'warning';
    default:
      return 'default';
  }
}

function getApprovalColor(
    approvalStatus: string,
):
    | 'default'
    | 'success'
    | 'warning'
    | 'error' {
  switch (approvalStatus) {
    case 'APPROVED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
      return 'error';
    default:
      return 'default';
  }
}

function displayValue(
    value: string | null | undefined,
): string {
  return value?.trim() || '—';
}

interface MetaItemProps {
  label: string;
  value: string;
}

function MetaItem({ label, value }: MetaItemProps) {
  return (
      <Box sx={{ minWidth: 0 }}>
        <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              lineHeight: 1.05,
              fontSize: '0.66rem',
              textTransform: 'uppercase',
              letterSpacing: 0.35,
            }}
        >
          {label}
        </Typography>

        <Typography
            variant="body2"
            fontWeight={600}
            title={value}
            sx={{
              mt: 0.25,
              lineHeight: 1.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
        >
          {value}
        </Typography>
      </Box>
  );
}

export default function TestPlanListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTestPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setTestPlans(await testPlanApi.getTestPlans());
    } catch (err) {
      console.error('Failed to load test plans:', err);
      setError(
          'Unable to load test plans. Make sure the backend is running.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTestPlans();
  }, [loadTestPlans]);

  return (
      <Box>
        <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              mb: 2.25,
            }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Test Plans
            </Typography>
            <Typography color="text.secondary">
              Create and manage TestForge test plans.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
                size="small"
                variant="outlined"
                startIcon={<Refresh />}
                disabled={loading}
                onClick={() => void loadTestPlans()}
            >
              Refresh
            </Button>

            <Button
                size="small"
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/test-plans/new')}
            >
              Create Test Plan
            </Button>
          </Stack>
        </Box>

        {locationState?.message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {locationState.message}
            </Alert>
        )}

        {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
        )}

        {loading ? (
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack
                    spacing={2}
                    sx={{
                      minHeight: 220,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                >
                  <CircularProgress />
                  <Typography color="text.secondary">
                    Loading test plans...
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
        ) : testPlans.length === 0 ? (
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack
                    spacing={1.5}
                    sx={{
                      minHeight: 220,
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                    }}
                >
                  <Typography variant="h6">No test plans yet</Typography>
                  <Typography color="text.secondary">
                    Create your first test plan to begin the testing lifecycle.
                  </Typography>
                  <Button
                      size="small"
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/test-plans/new')}
                  >
                    Create Test Plan
                  </Button>
                </Stack>
              </CardContent>
            </Card>
        ) : (
            <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(2, minmax(0, 1fr))',
                    xl: 'repeat(3, minmax(0, 1fr))',
                  },
                  gap: 1.5,
                }}
            >
              {testPlans.map(testPlan => (
                  <Card
                      key={testPlan.id}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        height: '100%',
                      }}
                  >
                    <CardContent
                        sx={{
                          p: 1.75,
                          '&:last-child': { pb: 1.75 },
                          height: '100%',
                        }}
                    >
                      <Stack spacing={1.25} sx={{ height: '100%' }}>
                        <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: 1,
                            }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                                variant="h6"
                                fontWeight={800}
                                title={testPlan.name}
                                sx={{
                                  fontSize: '1.05rem',
                                  lineHeight: 1.2,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                            >
                              {testPlan.name}
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: '0.7rem' }}
                            >
                              {testPlan.testPlanId}
                            </Typography>
                          </Box>

                          <Stack
                              direction="row"
                              spacing={0.5}
                              sx={{ flexShrink: 0 }}
                          >
                            <Chip
                                size="small"
                                label={testPlan.status}
                                color={getStatusColor(testPlan.status)}
                                variant="outlined"
                                sx={{ height: 23 }}
                            />
                            <Chip
                                size="small"
                                label={testPlan.approvalStatus}
                                color={getApprovalColor(
                                    testPlan.approvalStatus,
                                )}
                                variant="outlined"
                                sx={{ height: 23 }}
                            />
                          </Stack>
                        </Box>

                        <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                              columnGap: 1.5,
                              rowGap: 1,
                            }}
                        >
                          <MetaItem
                              label="Project"
                              value={displayValue(testPlan.projectName)}
                          />
                          <MetaItem
                              label="Environment"
                              value={displayValue(testPlan.environment)}
                          />
                          <MetaItem
                              label="Application"
                              value={displayValue(testPlan.application)}
                          />
                          <MetaItem
                              label="Version"
                              value={displayValue(testPlan.version)}
                          />
                        </Box>

                        <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              mt: 'auto',
                            }}
                        >
                          <Button
                              size="small"
                              endIcon={<ArrowForward />}
                              onClick={() =>
                                  navigate(
                                      `/test-plans/${encodeURIComponent(
                                          testPlan.testPlanId,
                                      )}`,
                                  )
                              }
                          >
                            Open
                          </Button>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
              ))}
            </Box>
        )}
      </Box>
  );
}
