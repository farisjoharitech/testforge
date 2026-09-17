import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowBack,
  ArrowDownward,
  ArrowUpward,
  Save,
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
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  testPlanApi,
} from '../../api/testPlanApi';

import {
  testSetApi,
} from '../../api/testSetApi';

import type {
  TestPlan,
} from '../../types/testPlan';

import type {
  TestSetCandidate,
} from '../../types/testSet';

import {
  getErrorMessage,
} from '../../utils/errorMessage';

export default function TestSetFormPage() {
  const navigate = useNavigate();
  const { testSetId } = useParams();
  const editId = testSetId ? Number(testSetId) : null;
  const editing = editId !== null && Number.isFinite(editId);

  const [plans, setPlans] = useState<TestPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [candidates, setCandidates] = useState<TestSetCandidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoading(true);
        setError(null);

        const loadedPlans = await testPlanApi.getTestPlans();
        setPlans(loadedPlans);

        if (editing && editId !== null) {
          const testSet = await testSetApi.getById(editId);
          setSelectedPlanId(testSet.testPlanId);
          setName(testSet.name);
          setDescription(testSet.description ?? '');
          setSelectedIds(
            [...testSet.members]
              .sort((a, b) => a.itemOrder - b.itemOrder)
              .map(member => member.testCaseId),
          );
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load Test Set form.'));
      } finally {
        setLoading(false);
      }
    };

    void loadInitial();
  }, [editId, editing]);

  const loadCandidates = useCallback(async (planId: number) => {
    try {
      setCandidateLoading(true);
      setError(null);
      setCandidates(await testSetApi.getCandidates(planId));
    } catch (err) {
      setCandidates([]);
      setError(getErrorMessage(err, 'Unable to load Test Case candidates.'));
    } finally {
      setCandidateLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof selectedPlanId === 'number') {
      void loadCandidates(selectedPlanId);
    } else {
      setCandidates([]);
    }
  }, [loadCandidates, selectedPlanId]);

  const candidateById = useMemo(
    () => new Map(candidates.map(candidate => [candidate.id, candidate])),
    [candidates],
  );

  const toggle = (id: number) => {
    setSelectedIds(current => (
      current.includes(id)
        ? current.filter(value => value !== id)
        : [...current, id]
    ));
  };

  const move = (id: number, direction: -1 | 1) => {
    setSelectedIds(current => {
      const index = current.indexOf(id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }
      const copy = [...current];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  };

  const handlePlanChange = (value: number) => {
    setSelectedPlanId(value);
    setSelectedIds([]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Test Set name is required.');
      return;
    }
    if (typeof selectedPlanId !== 'number') {
      setError('Select a Test Plan.');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Select at least one Test Case.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const saved = editing && editId !== null
        ? await testSetApi.update(editId, {
            name: name.trim(),
            description: description.trim() || null,
            testCaseIds: selectedIds,
          })
        : await testSetApi.create({
            testPlanId: selectedPlanId,
            name: name.trim(),
            description: description.trim() || null,
            testCaseIds: selectedIds,
          });

      navigate(`/test-sets/${saved.id}`, {
        state: {
          message: editing
            ? 'Test Set updated successfully.'
            : 'Test Set created successfully.',
        },
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save Test Set.'));
    } finally {
      setSaving(false);
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

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(editing && editId !== null ? `/test-sets/${editId}` : '/test-sets')}
        >
          Back
        </Button>
      </Stack>

      <Typography variant="h4">
        {editing ? 'Edit Test Set' : 'Create Test Set'}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>
        Save an ordered reusable selection of automation-ready Test Cases from one Test Plan.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={2}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Test Set Details</Typography>

              <FormControl fullWidth disabled={editing}>
                <InputLabel id="test-set-plan-label">Test Plan</InputLabel>
                <Select
                  labelId="test-set-plan-label"
                  label="Test Plan"
                  value={selectedPlanId}
                  onChange={event => handlePlanChange(Number(event.target.value))}
                >
                  {plans.map(plan => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.testPlanId} — {plan.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Test Set Name"
                value={name}
                onChange={event => setName(event.target.value)}
                inputProps={{ maxLength: 255 }}
                required
                fullWidth
              />

              <TextField
                label="Description"
                value={description}
                onChange={event => setDescription(event.target.value)}
                inputProps={{ maxLength: 2000 }}
                multiline
                minRows={3}
                fullWidth
              />
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="h6">Available Test Cases</Typography>
                <Typography variant="body2" color="text.secondary">
                  Only automatable UI, API, and UI+API Test Cases from the selected Test Plan are shown.
                </Typography>
              </Box>

              {typeof selectedPlanId !== 'number' ? (
                <Alert severity="info">Select a Test Plan first.</Alert>
              ) : candidateLoading ? (
                <Stack alignItems="center" sx={{ py: 3 }}>
                  <CircularProgress size={28} />
                </Stack>
              ) : candidates.length === 0 ? (
                <Alert severity="warning">
                  This Test Plan has no automation-eligible Test Cases.
                </Alert>
              ) : (
                <List disablePadding>
                  {candidates.map(candidate => {
                    const checked = selectedIds.includes(candidate.id);
                    return (
                      <ListItem key={candidate.id} disablePadding divider>
                        <ListItemButton onClick={() => toggle(candidate.id)}>
                          <Checkbox checked={checked} tabIndex={-1} disableRipple />
                          <ListItemText
                            primary={`${candidate.testCaseId} — ${candidate.name}`}
                            secondary={`${candidate.scenarioBusinessId} • ${candidate.automationType} • ${candidate.automationStatus}`}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="h6">
                  Selected Order ({selectedIds.length})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This order is saved with the Test Set and will be used by Task 36.25M execution.
                </Typography>
              </Box>

              {selectedIds.length === 0 ? (
                <Alert severity="info">No Test Cases selected.</Alert>
              ) : (
                <Stack spacing={1}>
                  {selectedIds.map((id, index) => {
                    const candidate = candidateById.get(id);
                    return (
                      <Stack
                        key={id}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}
                      >
                        <Chip size="small" label={index + 1} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700}>
                            {candidate?.testCaseId ?? `Test Case ${id}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {candidate?.name ?? 'Loading Test Case...'}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          aria-label="Move up"
                          disabled={index === 0}
                          onClick={() => move(id, -1)}
                        >
                          <ArrowUpward fontSize="small" />
                        </Button>
                        <Button
                          size="small"
                          aria-label="Move down"
                          disabled={index === selectedIds.length - 1}
                          onClick={() => move(id, 1)}
                        >
                          <ArrowDownward fontSize="small" />
                        </Button>
                      </Stack>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => navigate('/test-sets')} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Test Set'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
