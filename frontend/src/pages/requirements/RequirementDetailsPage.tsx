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
import { hierarchyMonitoringApi } from '../../api/hierarchyMonitoringApi';
import { requirementApi } from '../../api/requirementApi';
import { testScenarioApi } from '../../api/testScenarioApi';
import DeleteConfirmationDialog from '../../components/common/DeleteConfirmationDialog';
import { PageHeader } from '../../components/common/PageHeader';
import { QualityStrip } from '../../components/common/QualityStrip';
import { WorkspaceCollection } from '../../components/common/WorkspaceCollection';
import EditRequirementDialog from '../../components/requirements/EditRequirementDialog';
import CreateTestScenarioDialog from '../../components/scenarios/CreateTestScenarioDialog';
import type { RequirementMonitoring } from '../../types/hierarchyMonitoring';
import type { Requirement } from '../../types/requirement';
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

function typeLabel(value: string): string {
  return value.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export default function RequirementDetailsPage() {
  const navigate = useNavigate();
  const { requirementId } = useParams<{ requirementId: string }>();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [monitoring, setMonitoring] = useState<RequirementMonitoring | null>(null);
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
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const loadPage = useCallback(async (refresh = false) => {
    if (!requirementId) {
      setError('Requirement ID is missing.');
      setLoading(false);
      return;
    }
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const [requirementResponse, scenarioResponse, monitoringResponse] = await Promise.all([
        requirementApi.getRequirementByBusinessId(requirementId),
        testScenarioApi.getByRequirement(requirementId),
        hierarchyMonitoringApi.getRequirementMonitoring(requirementId),
      ]);
      setRequirement(requirementResponse);
      setScenarios(scenarioResponse);
      setMonitoring(monitoringResponse);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load Requirement workspace.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [requirementId]);

  useEffect(() => { void loadPage(); }, [loadPage]);
  useEffect(() => { setPage(1); }, [deferredSearch, typeFilter, statusFilter, pageSize]);

  const filteredScenarios = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return scenarios.filter((scenario) => {
      const searchMatch = !q || scenario.description.toLowerCase().includes(q) || scenario.scenarioId.toLowerCase().includes(q);
      const typeMatch = typeFilter === 'ALL' || scenario.testType === typeFilter;
      const statusMatch = statusFilter === 'ALL' || scenario.status === statusFilter;
      return searchMatch && typeMatch && statusMatch;
    });
  }, [deferredSearch, scenarios, statusFilter, typeFilter]);

  const visibleScenarios = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredScenarios.slice(start, start + pageSize);
  }, [filteredScenarios, page, pageSize]);

  const handleDelete = async () => {
    if (!requirement) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      await requirementApi.deleteRequirement(requirement.id);
      navigate(`/test-plans/${encodeURIComponent(requirement.testPlanBusinessId)}`);
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Unable to delete Requirement. Delete its Test Scenarios first.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !requirement) {
    return <Stack spacing={2} sx={{ minHeight: 320, alignItems: 'center', justifyContent: 'center' }}><CircularProgress /><Typography color="text.secondary">Loading Requirement...</Typography></Stack>;
  }
  if (!requirement) return <Alert severity="error">{error || 'Requirement not found.'}</Alert>;

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title={requirement.description}
        breadcrumbs={[
          { label: 'Test Plans', to: '/test-plans' },
          { label: 'Test Plan', to: `/test-plans/${encodeURIComponent(requirement.testPlanBusinessId)}` },
          { label: 'Requirement' },
        ]}
        actions={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip size="small" label={requirement.priority} color={priorityColor(requirement.priority)} variant="outlined" />
            <Chip size="small" label={requirement.status} color={statusColor(requirement.status)} variant="outlined" />
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
          onNeedsAttention={() => navigate(`/monitoring/requirement/${encodeURIComponent(requirement.requirementId)}/test-cases?status=NEEDS_ATTENTION`)}
          onNotRun={() => navigate(`/monitoring/requirement/${encodeURIComponent(requirement.requirementId)}/test-cases?status=NOT_RUN`)}
        />
      )}

      <WorkspaceCollection
        title="Test Scenarios"
        totalCount={scenarios.length}
        filteredCount={filteredScenarios.length}
        searchValue={search}
        searchPlaceholder="Search Test Scenarios..."
        onSearchChange={setSearch}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        filters={
          <Stack direction="row" spacing={1}>
            <Select size="small" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} sx={{ minWidth: 135 }}>
              <MenuItem value="ALL">All test types</MenuItem>
              {['SMOKE','SANITY','REGRESSION','FUNCTIONAL','INTEGRATION','END_TO_END','POSITIVE','NEGATIVE'].map((value) => <MenuItem key={value} value={value}>{typeLabel(value)}</MenuItem>)}
            </Select>
            <Select size="small" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} sx={{ minWidth: 120 }}>
              <MenuItem value="ALL">All statuses</MenuItem><MenuItem value="DRAFT">Draft</MenuItem><MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="APPROVED">Approved</MenuItem><MenuItem value="REJECTED">Rejected</MenuItem><MenuItem value="ARCHIVED">Archived</MenuItem>
            </Select>
          </Stack>
        }
        actions={<Button variant="contained" size="small" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>Add Scenario</Button>}
      >
        {scenarios.length === 0 ? (
          <Card variant="outlined"><CardContent><Stack spacing={1.5} alignItems="center" sx={{ py: 5 }}><Typography fontWeight={700}>No Test Scenarios yet</Typography><Typography variant="body2" color="text.secondary">Create the first scenario for this Requirement.</Typography><Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>Create Test Scenario</Button></Stack></CardContent></Card>
        ) : filteredScenarios.length === 0 ? (
          <Alert severity="info">No Test Scenarios match the current search or filters.</Alert>
        ) : (
          <Stack spacing={1}>
            {visibleScenarios.map((scenario) => (
              <Card key={scenario.id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography fontWeight={700} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{scenario.description}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip size="small" label={typeLabel(scenario.testType)} variant="outlined" />
                      <Chip size="small" label={scenario.priority} color={priorityColor(scenario.priority)} variant="outlined" />
                      <Chip size="small" label={scenario.status} color={statusColor(scenario.status)} variant="outlined" />
                      <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate(`/scenarios/${encodeURIComponent(scenario.scenarioId)}`)}>Open</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </WorkspaceCollection>

      <CreateTestScenarioDialog
        open={createDialogOpen}
        requirementId={requirement.requirementId}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={(created) => {
          setCreateDialogOpen(false);
          setScenarios((current) => [...current, created]);
          setSuccessMessage('Test Scenario created successfully.');
          void loadPage(true);
        }}
      />
      <EditRequirementDialog
        open={editDialogOpen}
        requirement={requirement}
        onClose={() => setEditDialogOpen(false)}
        onUpdated={(updated) => {
          setRequirement(updated);
          setEditDialogOpen(false);
          setSuccessMessage('Requirement updated successfully.');
        }}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Requirement?"
        entityName={requirement.description}
        description="A Requirement cannot be deleted while Test Scenarios still reference it."
        deleting={deleting}
        error={deleteError}
        onClose={() => { if (!deleting) { setDeleteDialogOpen(false); setDeleteError(null); } }}
        onConfirm={() => void handleDelete()}
      />
    </Stack>
  );
}
