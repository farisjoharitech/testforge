import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Add,
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
  status?: string,
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

export default function TestPlanListPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const locationState =
    location.state as
      | LocationState
      | null;

  const [
    testPlans,
    setTestPlans,
  ] = useState<TestPlan[]>(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const loadTestPlans =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await testPlanApi
              .getTestPlans({
                page: 0,
                size: 20,
              });

          const plans =
            Array.isArray(
              response,
            )
              ? response
              : response.content ??
                [];

          setTestPlans(
            plans,
          );
        } catch (err) {
          console.error(
            'Failed to load test plans:',
            err,
          );

          setError(
            'Unable to load test plans. Make sure the backend is running.',
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(
    () => {
      void loadTestPlans();
    },
    [loadTestPlans],
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems:
            'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Test Plans
          </Typography>

          <Typography
            color="text.secondary"
          >
            Create and manage
            test plans for
            your projects.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={
              <Refresh />
            }
            disabled={
              loading
            }
            onClick={() =>
              void loadTestPlans()
            }
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={
              <Add />
            }
            onClick={() =>
              navigate(
                '/test-plans/new',
              )
            }
          >
            Create Test Plan
          </Button>
        </Stack>
      </Box>

      {locationState
        ?.message && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
          }}
        >
          {
            locationState
              .message
          }
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
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
                minHeight: 280,
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
                Loading test
                plans...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : testPlans.length ===
        0 ? (
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Stack
              spacing={1}
              sx={{
                minHeight: 280,
                alignItems:
                  'center',
                justifyContent:
                  'center',
              }}
            >
              <Typography
                variant="h6"
              >
                No test plans yet
              </Typography>

              <Typography
                color="text.secondary"
              >
                Create your first
                test plan to begin
                the testing
                lifecycle.
              </Typography>

              <Chip
                label="Step 1 — Create Test Plan"
                color="primary"
                variant="outlined"
              />

              <Button
                sx={{
                  mt: 2,
                }}
                variant="contained"
                startIcon={
                  <Add />
                }
                onClick={() =>
                  navigate(
                    '/test-plans/new',
                  )
                }
              >
                Create Test Plan
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Stack
          spacing={2}
        >
          {testPlans.map(
            (
              testPlan,
              index,
            ) => (
              <Card
                key={
                  testPlan.id ??
                  testPlan.testPlanId ??
                  index
                }
                variant="outlined"
                sx={{
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display:
                        'flex',
                      alignItems:
                        'flex-start',
                      justifyContent:
                        'space-between',
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={
                          700
                        }
                      >
                        {
                          testPlan.name
                        }
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                        }}
                      >
                        {testPlan.description ||
                          'No description'}
                      </Typography>

                      {testPlan.testPlanId && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 1,
                          }}
                        >
                          ID:{' '}
                          {
                            testPlan.testPlanId
                          }
                        </Typography>
                      )}

                      {testPlan.approvalStatus && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                          }}
                        >
                          Approval:{' '}
                          {
                            testPlan.approvalStatus
                          }
                        </Typography>
                      )}
                    </Box>

                    <Chip
                      label={
                        testPlan.status ??
                        'UNKNOWN'
                      }
                      color={getStatusColor(
                        testPlan.status,
                      )}
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            ),
          )}
        </Stack>
      )}
    </Box>
  );
}