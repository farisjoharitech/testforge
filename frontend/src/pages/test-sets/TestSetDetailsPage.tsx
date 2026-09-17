import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ArrowBack,
  Delete,
  Edit,
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
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  automationApi,
} from '../../api/automationApi';

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

export default function TestSetDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { testSetId } = useParams();
  const id = Number(testSetId);
  const state = location.state as LocationState | null;

  const [testSet, setTestSet] = useState<TestSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(id)) {
      setError('Invalid Test Set ID.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTestSet(await testSetApi.getById(id));
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load Test Set.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRun = async () => {
    if (!testSet) return;

    try {
      setRunning(true);
      setError(null);

      const run = await automationApi.executeTestSet(testSet.id);

      navigate(`/automation/runs/${run.id}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to start Test Set run.'));
      setRunning(false);
    }
  };

  const handleDelete = async () => {
    if (!testSet) return;
    if (!window.confirm(`Delete Test Set "${testSet.name}"?`)) return;

    try {
      setDeleting(true);
      await testSetApi.delete(testSet.id);
      navigate('/test-sets', {
        state: { message: 'Test Set deleted successfully.' },
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete Test Set.'));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
        <CircularProgress />
        <Typography color="text.secondary">Loading Test Set...</Typography>
      </Stack>
    );
  }

  if (!testSet) {
    return (
      <Box>
        <Alert severity="error">{error ?? 'Test Set not found.'}</Alert>
      </Box>
    );
  }

  const members = [...testSet.members].sort((a, b) => a.itemOrder - b.itemOrder);

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/test-sets')}
        sx={{ mb: 1 }}
      >
        Test Sets
      </Button>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'flex-start' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h4">{testSet.name}</Typography>
          <Typography color="text.secondary">
            {testSet.testSetId} • {testSet.testPlanBusinessId} — {testSet.testPlanName}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            startIcon={running ? <CircularProgress size={16} color="inherit" /> : <PlayArrow />}
            disabled={running || deleting || testSet.memberCount === 0}
            onClick={() => void handleRun()}
          >
            {running ? 'Starting...' : 'Run Test Set'}
          </Button>
          <Button
            startIcon={<Refresh />}
            disabled={running || deleting}
            onClick={() => void load()}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            disabled={running || deleting}
            onClick={() => navigate(`/test-sets/${testSet.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            color="error"
            startIcon={<Delete />}
            disabled={running || deleting}
            onClick={() => void handleDelete()}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      {state?.message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {state.message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.25}>
              <Typography variant="h6">Test Set Summary</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label={`${testSet.memberCount} Test Case${testSet.memberCount === 1 ? '' : 's'}`}
                />
                <Chip variant="outlined" label={testSet.testPlanBusinessId} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {testSet.description?.trim() || 'No description.'}
              </Typography>
              <Alert severity="info">
                Run Test Set executes these Test Cases sequentially in the saved order.
                All members are validated before the Automation Run is created.
              </Alert>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Ordered Test Cases
            </Typography>

            <Stack divider={<Divider flexItem />}>
              {members.map(member => (
                <Stack
                  key={member.id}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  sx={{ py: 1.5 }}
                >
                  <Chip size="small" label={member.itemOrder} />
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700}>
                      {member.testCaseBusinessId} — {member.testCaseName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.scenarioBusinessId}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.75}>
                    <Chip size="small" label={member.automationType} />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={member.automationStatus}
                    />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
