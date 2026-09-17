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
  testSetApi,
} from '../../api/testSetApi';

import type {
  TestSet,
} from '../../types/testSet';

import {
  getErrorMessage,
} from '../../utils/errorMessage';

interface LocationState {
  message?: string;
}

export default function TestSetListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const [testSets, setTestSets] = useState<TestSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setTestSets(await testSetApi.getAll());
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load Test Sets.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h4">Test Sets</Typography>
          <Typography color="text.secondary">
            Save ordered groups of automation-ready Test Cases for repeated use.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            disabled={loading}
            onClick={() => void load()}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/test-sets/new')}
          >
            Create Test Set
          </Button>
        </Stack>
      </Stack>

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
        <Card variant="outlined">
          <CardContent>
            <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
              <CircularProgress />
              <Typography color="text.secondary">
                Loading Test Sets...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : testSets.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Stack alignItems="center" spacing={1.5} sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="h6">No Test Sets yet</Typography>
              <Typography color="text.secondary">
                Create a reusable selection of automation-ready Test Cases.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/test-sets/new')}
              >
                Create Test Set
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
          {testSets.map(testSet => (
            <Card key={testSet.id} variant="outlined">
              <CardContent>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      {testSet.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {testSet.testSetId}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      label={`${testSet.memberCount} Test Case${testSet.memberCount === 1 ? '' : 's'}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={testSet.testPlanBusinessId}
                    />
                  </Stack>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Test Plan
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {testSet.testPlanName}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minHeight: 40 }}
                  >
                    {testSet.description?.trim() || 'No description.'}
                  </Typography>

                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate(`/test-sets/${testSet.id}`)}
                  >
                    View Test Set
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
