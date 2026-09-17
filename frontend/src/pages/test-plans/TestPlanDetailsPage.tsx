import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { AccountTree, Add, ArrowForward, Delete, Edit, PlayArrow, Refresh } from '@mui/icons-material';
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
import { hierarchyMonitoringApi } from '../../api/hierarchyMonitoringApi';
import { automationApi } from '../../api/automationApi';
import { requirementApi } from '../../api/requirementApi';
import { testPlanApi } from '../../api/testPlanApi';
import DeleteConfirmationDialog from '../../components/common/DeleteConfirmationDialog';
import { PageHeader } from '../../components/common/PageHeader';
import { QualityStrip } from '../../components/common/QualityStrip';
import { WorkspaceCollection } from '../../components/common/WorkspaceCollection';
import CreateRequirementDialog from '../../components/requirements/CreateRequirementDialog';
import EditTestPlanDialog from '../../components/test-plans/EditTestPlanDialog';
import type { TestPlanMonitoring } from '../../types/hierarchyMonitoring';
import type { Requirement } from '../../types/requirement';
import type { TestPlan } from '../../types/testPlan';

function priorityColor(priority: string): 'default' | 'primary' | 'warning' | 'error' {
  if (priority === 'CRITICAL') return 'error';
  if (priority === 'HIGH') return 'warning';
  if (priority === 'MEDIUM') return 'primary';
  return 'default';
}

function statusColor(status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  if (status === 'ACTIVE') return 'primary';
  if (status === 'APPROVED' || status === 'COMPLETED') return 'success';
  if (status === 'REJECTED') return 'error';
  if (status === 'DRAFT' || status === 'PENDING') return 'warning';
  return 'default';
}

export default function TestPlanDetailsPage() {
  const navigate = useNavigate();
  const { testPlanId } = useParams<{ testPlanId: string }>();
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [monitoring, setMonitoring] = useState<TestPlanMonitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningPlan, setRunningPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const loadPage = useCallback(async (refresh = false) => {
    if (!testPlanId) {
      setError('Test Plan ID is missing.');
      setLoading(false);
      return;
    }
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const [planResponse, requirementResponse, monitoringResponse] = await Promise.all([
        testPlanApi.getTestPlanByBusinessId(testPlanId),
        requirementApi.getRequirementsByTestPlan(testPlanId),
        hierarchyMonitoringApi.getTestPlanMonitoring(testPlanId),
      ]);
      setTestPlan(planResponse);
      setRequirements(requirementResponse);
      setMonitoring(monitoringResponse);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load Test Plan workspace.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [testPlanId]);

  useEffect(() => { void loadPage(); }, [loadPage]);
  useEffect(() => { setPage(1); }, [deferredSearch, priorityFilter, statusFilter, pageSize]);

  const filteredRequirements = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return requirements.filter((requirement) => {
      const searchMatch = !q || requirement.description.toLowerCase().includes(q) || requirement.requirementId.toLowerCase().includes(q);
      const priorityMatch = priorityFilter === 'ALL' || requirement.priority === priorityFilter;
      const statusMatch = statusFilter === 'ALL' || requirement.status === statusFilter;
      return searchMatch && priorityMatch && statusMatch;
    });
  }, [deferredSearch, priorityFilter, requirements, statusFilter]);

  const visibleRequirements = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRequirements.slice(start, start + pageSize);
  }, [filteredRequirements, page, pageSize]);

  const handleRunTestPlan = async () => {
    if (!testPlan || runningPlan) return;

    try {
      setRunningPlan(true);
      setError(null);

      const run = await automationApi.executeTestPlan(testPlan.id);
      navigate(`/automation/runs/${run.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to start Test Plan automation run.',
      );
    } finally {
      setRunningPlan(false);
    }
  };

  const handleDelete = async () => {
    if (!testPlan) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      await testPlanApi.deleteTestPlan(testPlan.id);
      navigate(`/projects/${encodeURIComponent(testPlan.projectBusinessId)}`);
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Unable to delete Test Plan. Delete its Requirements first.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !testPlan) {
    return <Stack spacing={2} sx={{ minHeight: 320, alignItems: 'center', justifyContent: 'center' }}><CircularProgress /><Typography color="text.secondary">Loading Test Plan...</Typography></Stack>;
  }
  if (!testPlan) return <Alert severity="error">{error || 'Test Plan not found.'}</Alert>;

  const context = [testPlan.projectName, testPlan.application, testPlan.environment, testPlan.version ? `v${testPlan.version}` : null].filter(Boolean).join(' · ');

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title={testPlan.name}
        description={context || undefined}
        breadcrumbs={[
          { label: 'Projects', to: '/projects' },
          { label: testPlan.projectName, to: `/projects/${encodeURIComponent(testPlan.projectBusinessId)}` },
          { label: testPlan.name },
        ]}
        actions={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip size="small" label={testPlan.status} color={statusColor(testPlan.status)} variant="outlined" />
            <Chip size="small" label={testPlan.approvalStatus} color={statusColor(testPlan.approvalStatus)} variant="outlined" />
            <Button
            size="small"
            variant="contained"
            startIcon={<AccountTree />}
            onClick={() =>
              navigate(`/test-plans/${encodeURIComponent(testPlan.testPlanId)}/design`)
            }
          >
            Design Workspace
          </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={runningPlan ? <CircularProgress size={16} /> : <PlayArrow />}
              disabled={runningPlan}
              onClick={() => void handleRunTestPlan()}
            >
              {runningPlan ? 'Starting Run...' : 'Run Test Plan'}
            </Button>
          <Button size="small" startIcon={<Refresh />} disabled={refreshing} onClick={() => void loadPage(true)}>Refresh</Button>
            <Button size="small" startIcon={<Edit />} onClick={() => setEditDialogOpen(true)}>Edit</Button>
            <Button size="small" color="error" startIcon={<Delete />} onClick={() => setDeleteDialogOpen(true)}>Delete</Button>
          </Stack>
        }
      />

      {successMessage && <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      {monitoring && (
        <QualityStrip
          automationCoveragePercentage={monitoring.summary.automationCoveragePercentage}
          passRatePercentage={monitoring.summary.passRatePercentage}
          needsAttentionTestCases={monitoring.summary.needsAttentionTestCases}
          notRunTestCases={monitoring.summary.notRunTestCases}
          manualTestCases={monitoring.summary.manualTestCases}
          onNeedsAttention={() => navigate(`/monitoring/test-plan/${encodeURIComponent(testPlan.testPlanId)}/test-cases?status=NEEDS_ATTENTION`)}
          onNotRun={() => navigate(`/monitoring/test-plan/${encodeURIComponent(testPlan.testPlanId)}/test-cases?status=NOT_RUN`)}
        />
      )}

      <WorkspaceCollection
        title="Requirements"
        totalCount={requirements.length}
        filteredCount={filteredRequirements.length}
        searchValue={search}
        searchPlaceholder="Search requirements..."
        onSearchChange={setSearch}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        filters={
          <Stack direction="row" spacing={1}>
            <Select size="small" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} sx={{ minWidth: 120 }}>
              <MenuItem value="ALL">All priorities</MenuItem><MenuItem value="CRITICAL">Critical</MenuItem><MenuItem value="HIGH">High</MenuItem><MenuItem value="MEDIUM">Medium</MenuItem><MenuItem value="LOW">Low</MenuItem>
            </Select>
            <Select size="small" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} sx={{ minWidth: 120 }}>
              <MenuItem value="ALL">All statuses</MenuItem><MenuItem value="DRAFT">Draft</MenuItem><MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="APPROVED">Approved</MenuItem><MenuItem value="REJECTED">Rejected</MenuItem><MenuItem value="ARCHIVED">Archived</MenuItem>
            </Select>
          </Stack>
        }
        actions={<Button variant="contained" size="small" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>Create Requirement</Button>}
      >
        {requirements.length === 0 ? (
          <Card variant="outlined"><CardContent><Stack spacing={1.5} alignItems="center" sx={{ py: 5 }}><Typography fontWeight={700}>No Requirements yet</Typography><Typography variant="body2" color="text.secondary">Create the first Requirement for this Test Plan.</Typography><Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>Create Requirement</Button></Stack></CardContent></Card>
        ) : filteredRequirements.length === 0 ? (
          <Alert severity="info">No Requirements match the current search or filters.</Alert>
        ) : (
          <Stack spacing={1}>
            {visibleRequirements.map((requirement) => (
              <Card key={requirement.id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography fontWeight={700} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{requirement.description}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip size="small" label={requirement.priority} color={priorityColor(requirement.priority)} variant="outlined" />
                      <Chip size="small" label={requirement.status} color={statusColor(requirement.status)} variant="outlined" />
                      <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate(`/requirements/${encodeURIComponent(requirement.requirementId)}`)}>Open</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </WorkspaceCollection>

      <CreateRequirementDialog
        open={createDialogOpen}
        testPlanId={testPlan.testPlanId}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={(created) => {
          setCreateDialogOpen(false);
          setRequirements((current) => [...current, created]);
          setSuccessMessage('Requirement created successfully.');
          void loadPage(true);
        }}
      />
      <EditTestPlanDialog
        open={editDialogOpen}
        testPlan={testPlan}
        onClose={() => setEditDialogOpen(false)}
        onUpdated={(updated) => {
          setTestPlan(updated);
          setEditDialogOpen(false);
          setSuccessMessage('Test Plan updated successfully.');
          void loadPage(true);
        }}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Test Plan?"
        entityName={testPlan.name}
        description="A Test Plan cannot be deleted while Requirements still reference it."
        deleting={deleting}
        error={deleteError}
        onClose={() => { if (!deleting) { setDeleteDialogOpen(false); setDeleteError(null); } }}
        onConfirm={() => void handleDelete()}
      />
    </Stack>
  );
}
