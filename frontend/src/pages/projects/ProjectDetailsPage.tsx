import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Add, ArrowBack, ArrowForward, Delete, Edit, Refresh } from '@mui/icons-material';
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
import { projectApi } from '../../api/projectApi';
import DeleteConfirmationDialog from '../../components/common/DeleteConfirmationDialog';
import { PageHeader } from '../../components/common/PageHeader';
import { QualityStrip } from '../../components/common/QualityStrip';
import { WorkspaceCollection } from '../../components/common/WorkspaceCollection';
import EditProjectDialog from '../../components/projects/EditProjectDialog';
import type { Project } from '../../types/project';
import type { ProjectMonitoring } from '../../types/projectMonitoring';
import type { TestPlan } from '../../types/testPlan';

function statusColor(status: string): 'default' | 'primary' | 'success' | 'warning' {
  if (status === 'ACTIVE') return 'success';
  if (status === 'COMPLETED') return 'primary';
  if (status === 'DRAFT' || status === 'ON_HOLD') return 'warning';
  return 'default';
}

export default function ProjectDetailsPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [monitoring, setMonitoring] = useState<ProjectMonitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const loadPage = useCallback(async (refresh = false) => {
    if (!projectId) {
      setError('Project ID is missing.');
      setLoading(false);
      return;
    }
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const [projectResponse, testPlanResponse, monitoringResponse] = await Promise.all([
        projectApi.getProjectByBusinessId(projectId),
        projectApi.getProjectTestPlans(projectId),
        projectApi.getProjectMonitoring(projectId),
      ]);
      setProject(projectResponse);
      setTestPlans(testPlanResponse);
      setMonitoring(monitoringResponse);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load Project workspace.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => { void loadPage(); }, [loadPage]);
  useEffect(() => { setPage(1); }, [deferredSearch, statusFilter, pageSize]);

  const filteredPlans = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return testPlans.filter((plan) => {
      const matchesSearch = !q || [plan.name, plan.testPlanId, plan.application, plan.environment, plan.version]
        .some((value) => value?.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'ALL' || plan.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [deferredSearch, statusFilter, testPlans]);

  const visiblePlans = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPlans.slice(start, start + pageSize);
  }, [filteredPlans, page, pageSize]);

  const handleDelete = async () => {
    if (!project) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      await projectApi.deleteProject(project.id);
      navigate('/projects');
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Unable to delete Project.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !project) {
    return <Stack spacing={2} sx={{ minHeight: 320, alignItems: 'center', justifyContent: 'center' }}><CircularProgress /><Typography color="text.secondary">Loading Project...</Typography></Stack>;
  }

  if (!project) {
    return <Stack spacing={2}><Alert severity="error">{error || 'Project not found.'}</Alert><Button startIcon={<ArrowBack />} onClick={() => navigate('/projects')}>Back to Projects</Button></Stack>;
  }

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title={project.name}
        description={project.description?.trim() || undefined}
        breadcrumbs={[{ label: 'Projects', to: '/projects' }, { label: project.name }]}
        actions={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip size="small" label={project.status} color={statusColor(project.status)} variant="outlined" />
            <Button size="small" startIcon={<Refresh />} disabled={refreshing} onClick={() => void loadPage(true)}>Refresh</Button>
            <Button size="small" startIcon={<Edit />} onClick={() => setEditOpen(true)}>Edit</Button>
            <Button size="small" color="error" startIcon={<Delete />} onClick={() => setDeleteOpen(true)}>Delete</Button>
          </Stack>
        }
      />

      {successMessage && <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {monitoring && (
        <QualityStrip
          automationCoveragePercentage={monitoring.automationCoveragePercentage}
          passRatePercentage={monitoring.passRatePercentage}
          needsAttentionTestCases={monitoring.needsAttentionTestCases}
          notRunTestCases={monitoring.notRunTestCases}
          manualTestCases={monitoring.manualTestCases}
          onNeedsAttention={() => navigate(`/monitoring/project/${encodeURIComponent(project.projectId)}/test-cases?status=NEEDS_ATTENTION`)}
          onNotRun={() => navigate(`/monitoring/project/${encodeURIComponent(project.projectId)}/test-cases?status=NOT_RUN`)}
        />
      )}

      <WorkspaceCollection
        title="Test Plans"
        totalCount={testPlans.length}
        filteredCount={filteredPlans.length}
        searchValue={search}
        searchPlaceholder="Search Test Plans by name, application, environment..."
        onSearchChange={setSearch}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        filters={
          <Select size="small" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} sx={{ minWidth: 130 }}>
            <MenuItem value="ALL">All statuses</MenuItem>
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="ARCHIVED">Archived</MenuItem>
          </Select>
        }
        actions={<Button variant="contained" size="small" startIcon={<Add />} onClick={() => navigate(`/test-plans/new?projectId=${encodeURIComponent(project.projectId)}`)}>New Test Plan</Button>}
      >
        {testPlans.length === 0 ? (
          <Card variant="outlined"><CardContent><Stack spacing={1.5} alignItems="center" sx={{ py: 5 }}><Typography fontWeight={700}>No Test Plans yet</Typography><Typography variant="body2" color="text.secondary">Create the first plan for this Project.</Typography><Button variant="contained" startIcon={<Add />} onClick={() => navigate(`/test-plans/new?projectId=${encodeURIComponent(project.projectId)}`)}>Create Test Plan</Button></Stack></CardContent></Card>
        ) : filteredPlans.length === 0 ? (
          <Alert severity="info">No Test Plans match the current search or filter.</Alert>
        ) : (
          <Stack spacing={1}>
            {visiblePlans.map((plan) => (
              <Card key={plan.id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={750} noWrap>{plan.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[plan.application, plan.environment, plan.version ? `v${plan.version}` : null].filter(Boolean).join(' · ') || 'No environment metadata'}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip size="small" label={plan.status} color={statusColor(plan.status)} variant="outlined" />
                      <Chip size="small" label={plan.approvalStatus} variant="outlined" />
                      <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate(`/test-plans/${encodeURIComponent(plan.testPlanId)}`)}>Open</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </WorkspaceCollection>

      <EditProjectDialog
        open={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
        onUpdated={(updated) => {
          setProject(updated);
          setEditOpen(false);
          setSuccessMessage(`Project "${updated.name}" updated successfully.`);
        }}
      />
      <DeleteConfirmationDialog
        open={deleteOpen}
        title="Delete Project?"
        entityName={project.name}
        description="A Project cannot be deleted while Test Plans still reference it."
        deleting={deleting}
        error={deleteError}
        onClose={() => { if (!deleting) { setDeleteOpen(false); setDeleteError(null); } }}
        onConfirm={() => void handleDelete()}
      />
    </Stack>
  );
}
