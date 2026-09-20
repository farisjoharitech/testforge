import { useCallback, useEffect, useState } from 'react';
import { Add, Delete, Download, Edit } from '@mui/icons-material';
import { Alert, Button, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError, apiErrorMessage } from '../../api/apiClient';
import { moduleApi } from '../../api/moduleApi';
import { requirementApi } from '../../api/requirementApi';
import { PageHeader } from '../../components/common/PageHeader';
import { WorkspaceCollection } from '../../components/common/WorkspaceCollection';
import DeleteConfirmationDialog from '../../components/common/DeleteConfirmationDialog';
import ModuleDialog from '../../components/modules/ModuleDialog';
import CreateRequirementDialog from '../../components/requirements/CreateRequirementDialog';
import ExportTestDesignDialog from '../../components/test-design/ExportTestDesignDialog';
import type { Module } from '../../types/module';
import type { Requirement } from '../../types/requirement';

export default function ModuleDetailsPage() {
  const { moduleId } = useParams<{ moduleId: string }>(); const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null); const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false); const [editOpen, setEditOpen] = useState(false); const [deleteOpen, setDeleteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const load = useCallback(async () => { if (!moduleId) return; try { setLoading(true); setError(null); const [m, r] = await Promise.all([moduleApi.getByBusinessId(moduleId), requirementApi.getRequirementsByModule(moduleId)]); setModule(m); setRequirements(r); } catch (e) { setError(e instanceof ApiError ? e.message : 'Unable to load Module.'); } finally { setLoading(false); } }, [moduleId]);
  useEffect(() => { void load(); }, [load]);
  if (loading && !module) return <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack>;
  if (!module) return <Alert severity="error">{error ?? 'Module not found.'}</Alert>;
  return <Stack spacing={2.5}>
    <PageHeader title={module.name} description={module.description ?? undefined} breadcrumbs={[{ label: 'Projects', to: '/projects' }, { label: module.projectName, to: `/projects/${encodeURIComponent(module.projectBusinessId)}` }, { label: module.testPlanName, to: `/test-plans/${encodeURIComponent(module.testPlanBusinessId)}` }, { label: module.name }]} actions={<Stack direction="row" spacing={1}><Button startIcon={<Download />} onClick={() => setExportOpen(true)}>Export Excel</Button><Button startIcon={<Edit />} onClick={() => setEditOpen(true)}>Edit</Button><Button color="error" startIcon={<Delete />} onClick={() => setDeleteOpen(true)}>Delete</Button></Stack>} />
    {error && <Alert severity="error">{error}</Alert>}
    <WorkspaceCollection title="Requirements" totalCount={requirements.length} filteredCount={requirements.length} searchValue="" searchPlaceholder="Requirements" onSearchChange={() => {}} page={1} pageSize={25} onPageChange={() => {}} onPageSizeChange={() => {}} actions={<Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>Create Requirement</Button>}>
      <Stack spacing={1}>{requirements.map((r) => <Card key={r.id} variant="outlined"><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography fontWeight={700}>{r.description}</Typography><Stack direction="row" spacing={1}><Chip size="small" label={r.priority} /><Chip size="small" label={r.status} /><Button onClick={() => navigate(`/requirements/${encodeURIComponent(r.requirementId)}`)}>Open</Button></Stack></Stack></CardContent></Card>)}</Stack>
    </WorkspaceCollection>
    <CreateRequirementDialog open={createOpen} moduleId={module.moduleId} onClose={() => setCreateOpen(false)} onCreated={(r) => { setCreateOpen(false); setRequirements((c) => [...c, r]); }} />
    <ModuleDialog open={editOpen} testPlanId={module.testPlanBusinessId} module={module} onClose={() => setEditOpen(false)} onSaved={(m) => { setModule(m); setEditOpen(false); }} />
    <ExportTestDesignDialog open={exportOpen} project={{ projectId: module.projectBusinessId, name: module.projectName }} testPlan={{ testPlanId: module.testPlanBusinessId, name: module.testPlanName }} module={module} onClose={() => setExportOpen(false)} />
    <DeleteConfirmationDialog open={deleteOpen} title="Delete Module?" entityName={module.name} resourceType="MODULE" resourceId={module.id} blockerActionPath={`/automation/management?project=${encodeURIComponent(module.projectBusinessId)}`} deleting={false} error={null} onClose={() => setDeleteOpen(false)} onConfirm={() => void moduleApi.delete(module.id).then(() => navigate(`/projects/${encodeURIComponent(module.projectBusinessId)}`)).catch((e) => setError(apiErrorMessage(e, 'Unable to delete Module.')))} />
  </Stack>;
}
