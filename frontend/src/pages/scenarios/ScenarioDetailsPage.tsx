import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Add, ArrowForward, Delete, Edit, Refresh } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../../api/apiClient';
import { testCaseApi } from '../../api/testCaseApi';
import { testScenarioApi } from '../../api/testScenarioApi';
import DeleteConfirmationDialog from '../../components/common/DeleteConfirmationDialog';
import { PageHeader } from '../../components/common/PageHeader';
import { WorkspaceCollection } from '../../components/common/WorkspaceCollection';
import CreateTestCaseDialog from '../../components/test-cases/CreateTestCaseDialog';
import EditTestScenarioDialog from '../../components/scenarios/EditTestScenarioDialog';
import type { TestCase } from '../../types/testCase';
import type { TestScenario } from '../../types/testScenario';

function priorityColor(priority: string): 'default' | 'primary' | 'warning' | 'error' {
  if (priority === 'CRITICAL') return 'error';
  if (priority === 'HIGH') return 'warning';
  if (priority === 'MEDIUM') return 'primary';
  return 'default';
}

function statusColor(status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  if (status === 'ACTIVE') return 'primary';
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED') return 'error';
  if (status === 'DRAFT') return 'warning';
  return 'default';
}

function label(value: string): string {
  return value.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ').replace('Ui Api', 'UI + API').replace(/^Ui$/, 'UI').replace(/^Api$/, 'API');
}

export default function ScenarioDetailsPage() {
  const navigate = useNavigate();
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [scenario, setScenario] = useState<TestScenario | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [automationFilter, setAutomationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const loadPage = useCallback(async (refresh = false) => {
    if (!scenarioId) {
      setError('Test Scenario ID is missing.');
      setLoading(false);
      return;
    }
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const [scenarioResponse, testCaseResponse] = await Promise.all([
        testScenarioApi.getTestScenarioByBusinessId(scenarioId),
        testCaseApi.getByScenario(scenarioId),
      ]);
      setScenario(scenarioResponse);
      setTestCases(testCaseResponse);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load Test Scenario workspace.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [scenarioId]);

  useEffect(() => { void loadPage(); }, [loadPage]);
  useEffect(() => { setPage(1); }, [automationFilter, deferredSearch, statusFilter, pageSize]);

  const filteredCases = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return testCases.filter((testCase) => {
      const searchMatch = !q || [testCase.name, testCase.testCaseId, testCase.expectedResult].some((value) => value?.toLowerCase().includes(q));
      const automationMatch = automationFilter === 'ALL'
        || (automationFilter === 'MANUAL' ? !testCase.automatable || testCase.automationType === 'MANUAL' : testCase.automationType === automationFilter);
      const statusMatch = statusFilter === 'ALL' || testCase.status === statusFilter;
      return searchMatch && automationMatch && statusMatch;
    });
  }, [automationFilter, deferredSearch, statusFilter, testCases]);

  const visibleCases = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, page, pageSize]);

  const handleDelete = async () => {
    if (!scenario) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      await testScenarioApi.deleteTestScenario(scenario.id);
      navigate(`/requirements/${encodeURIComponent(scenario.requirementBusinessId)}`);
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Unable to delete Test Scenario. Delete its Test Cases first.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !scenario) {
    return <Stack spacing={2} sx={{ minHeight: 320, alignItems: 'center', justifyContent: 'center' }}><CircularProgress /><Typography color="text.secondary">Loading Test Scenario...</Typography></Stack>;
  }
  if (!scenario) return <Alert severity="error">{error || 'Test Scenario not found.'}</Alert>;

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title={scenario.description}
        breadcrumbs={[
          { label: 'Test Plans', to: '/test-plans' },
          { label: 'Requirement', to: `/requirements/${encodeURIComponent(scenario.requirementBusinessId)}` },
          { label: 'Test Scenario' },
        ]}
        actions={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip size="small" label={label(scenario.testType)} variant="outlined" />
            <Chip size="small" label={scenario.priority} color={priorityColor(scenario.priority)} variant="outlined" />
            <Chip size="small" label={scenario.status} color={statusColor(scenario.status)} variant="outlined" />
            <Button size="small" startIcon={<Refresh />} disabled={refreshing} onClick={() => void loadPage(true)}>Refresh</Button>
            <Button size="small" startIcon={<Edit />} onClick={() => setEditDialogOpen(true)}>Edit</Button>
            <Button size="small" color="error" startIcon={<Delete />} onClick={() => setDeleteDialogOpen(true)}>Delete</Button>
          </Stack>
        }
      />

      {successMessage && <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <WorkspaceCollection
        title="Test Cases"
        totalCount={testCases.length}
        filteredCount={filteredCases.length}
        searchValue={search}
        searchPlaceholder="Search Test Cases by name or expected result..."
        onSearchChange={setSearch}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        filters={
          <Stack direction="row" spacing={1}>
            <Select size="small" value={automationFilter} onChange={(event) => setAutomationFilter(event.target.value)} sx={{ minWidth: 130 }}>
              <MenuItem value="ALL">All automation</MenuItem><MenuItem value="MANUAL">Manual</MenuItem><MenuItem value="UI">UI</MenuItem><MenuItem value="API">API</MenuItem><MenuItem value="UI_API">UI + API</MenuItem>
            </Select>
            <Select size="small" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} sx={{ minWidth: 120 }}>
              <MenuItem value="ALL">All statuses</MenuItem><MenuItem value="DRAFT">Draft</MenuItem><MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="APPROVED">Approved</MenuItem><MenuItem value="REJECTED">Rejected</MenuItem><MenuItem value="ARCHIVED">Archived</MenuItem>
            </Select>
          </Stack>
        }
        actions={<Button variant="contained" size="small" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>Add Test Case</Button>}
      >
        {testCases.length === 0 ? (
          <Card variant="outlined"><CardContent><Stack spacing={1.5} alignItems="center" sx={{ py: 5 }}><Typography fontWeight={700}>No Test Cases yet</Typography><Typography variant="body2" color="text.secondary">Create the first executable Test Case for this Scenario.</Typography><Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>Add Test Case</Button></Stack></CardContent></Card>
        ) : filteredCases.length === 0 ? (
          <Alert severity="info">No Test Cases match the current search or filters.</Alert>
        ) : (
          <Stack spacing={1}>
            {visibleCases.map((testCase) => (
              <Card key={testCase.id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography fontWeight={750}>{testCase.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>Expected: {testCase.expectedResult}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip size="small" label={testCase.priority} color={priorityColor(testCase.priority)} variant="outlined" />
                      <Chip size="small" label={testCase.automatable ? label(testCase.automationType) : 'Manual'} color={testCase.automatable ? 'success' : 'default'} variant="outlined" />
                      <Chip size="small" label={testCase.status} color={statusColor(testCase.status)} variant="outlined" />
                      <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate(`/test-cases/${encodeURIComponent(testCase.testCaseId)}`)}>Open</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </WorkspaceCollection>

      <CreateTestCaseDialog
        open={createDialogOpen}
        scenarioId={scenario.scenarioId}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={(created) => {
          setCreateDialogOpen(false);
          setTestCases((current) => [...current, created]);
          setSuccessMessage('Test Case created successfully.');
        }}
      />
      <EditTestScenarioDialog
        open={editDialogOpen}
        scenario={scenario}
        onClose={() => setEditDialogOpen(false)}
        onUpdated={(updated) => {
          setScenario(updated);
          setEditDialogOpen(false);
          setSuccessMessage('Test Scenario updated successfully.');
        }}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Test Scenario?"
        entityName={scenario.description}
        description="A Test Scenario cannot be deleted while Test Cases still reference it."
        deleting={deleting}
        error={deleteError}
        onClose={() => { if (!deleting) { setDeleteDialogOpen(false); setDeleteError(null); } }}
        onConfirm={() => void handleDelete()}
      />
    </Stack>
  );
}
