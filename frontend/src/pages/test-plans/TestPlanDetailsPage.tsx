import { useCallback, useEffect, useState } from 'react';
import { Add, ArrowForward, Delete, Download, Edit, Refresh } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError, apiErrorMessage } from '../../api/apiClient';
import { moduleApi } from '../../api/moduleApi';
import { testPlanApi } from '../../api/testPlanApi';
import DeleteConfirmationDialog from '../../components/common/DeleteConfirmationDialog';
import { PageHeader } from '../../components/common/PageHeader';
import { WorkspaceCollection } from '../../components/common/WorkspaceCollection';
import ModuleDialog from '../../components/modules/ModuleDialog';
import EditTestPlanDialog from '../../components/test-plans/EditTestPlanDialog';
import ExportTestDesignDialog from '../../components/test-design/ExportTestDesignDialog';
import type { Module } from '../../types/module';
import type { TestPlan } from '../../types/testPlan';

export default function TestPlanDetailsPage() {
  const { testPlanId } = useParams<{ testPlanId: string }>(); const navigate = useNavigate();
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null); const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null); const [editOpen, setEditOpen] = useState(false);
  const [moduleOpen, setModuleOpen] = useState(false); const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false); const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingModule, setDeletingModule] = useState<Module | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const load = useCallback(async (refresh = false) => { if (!testPlanId) return; try { refresh ? setRefreshing(true) : setLoading(true); setError(null); const [plan, moduleList] = await Promise.all([testPlanApi.getTestPlanByBusinessId(testPlanId), moduleApi.getByTestPlan(testPlanId)]); setTestPlan(plan); setModules(moduleList); } catch (e) { setError(e instanceof ApiError ? e.message : 'Unable to load Test Plan.'); } finally { setLoading(false); setRefreshing(false); } }, [testPlanId]);
  useEffect(() => { void load(); }, [load]);
  if (loading && !testPlan) return <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack>;
  if (!testPlan) return <Alert severity="error">{error ?? 'Test Plan not found.'}</Alert>;
  const managementPath = `/automation/management?project=${encodeURIComponent(testPlan.projectBusinessId)}`;
  return <Stack spacing={2.5}>
    <PageHeader title={testPlan.name} breadcrumbs={[{ label: 'Projects', to: '/projects' }, { label: testPlan.projectName, to: `/projects/${encodeURIComponent(testPlan.projectBusinessId)}` }, { label: testPlan.name }]} actions={<Stack direction="row" spacing={1}><Button startIcon={<Download />} onClick={() => setExportOpen(true)}>Export Excel</Button><Button startIcon={<Refresh />} disabled={refreshing} onClick={() => void load(true)}>Refresh</Button><Button startIcon={<Edit />} onClick={() => setEditOpen(true)}>Edit</Button><Button color="error" startIcon={<Delete />} onClick={() => setDeleteOpen(true)}>Delete</Button></Stack>} />
    {error && <Alert severity="error">{error}</Alert>}
    <WorkspaceCollection title="Modules" totalCount={modules.length} filteredCount={modules.length} searchValue="" searchPlaceholder="Modules" onSearchChange={() => {}} page={1} pageSize={25} onPageChange={() => {}} onPageSizeChange={() => {}} actions={<Button variant="contained" startIcon={<Add />} onClick={() => { setEditingModule(null); setModuleOpen(true); }}>Create Module</Button>}>
      <Stack spacing={1}>{modules.map(module => <Card key={module.id} variant="outlined"><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography fontWeight={700}>{module.name}</Typography><Typography variant="caption" color="text.secondary">{module.description || module.moduleId}</Typography></Box><Stack direction="row" spacing={1}><Button startIcon={<Edit />} onClick={() => { setEditingModule(module); setModuleOpen(true); }}>Edit</Button><Button color="error" onClick={() => setDeletingModule(module)}>Delete</Button><Button endIcon={<ArrowForward />} onClick={() => navigate(`/modules/${encodeURIComponent(module.moduleId)}`)}>Open</Button></Stack></Stack></CardContent></Card>)}</Stack>
    </WorkspaceCollection>
    <ModuleDialog open={moduleOpen} testPlanId={testPlan.testPlanId} module={editingModule} onClose={() => setModuleOpen(false)} onSaved={saved => { setModules(current => [...current.filter(module => module.id !== saved.id), saved].sort((a, b) => a.id - b.id)); setModuleOpen(false); }} />
    <EditTestPlanDialog open={editOpen} testPlan={testPlan} onClose={() => setEditOpen(false)} onUpdated={updated => { setTestPlan(updated); setEditOpen(false); }} />
    <ExportTestDesignDialog open={exportOpen} project={{ projectId: testPlan.projectBusinessId, name: testPlan.projectName }} testPlan={testPlan} onClose={() => setExportOpen(false)} />
    <DeleteConfirmationDialog open={deleteOpen} title="Delete Test Plan?" entityName={testPlan.name} resourceType="TEST_PLAN" resourceId={testPlan.id} blockerActionPath={managementPath} error={deleteError} onClose={() => setDeleteOpen(false)} onConfirm={() => void testPlanApi.deleteTestPlan(testPlan.id).then(() => navigate(`/projects/${encodeURIComponent(testPlan.projectBusinessId)}`)).catch(e => setDeleteError(apiErrorMessage(e, 'Unable to delete Test Plan.')))} />
    {deletingModule && <DeleteConfirmationDialog open title="Delete Module?" entityName={deletingModule.name} resourceType="MODULE" resourceId={deletingModule.id} blockerActionPath={managementPath} onClose={() => setDeletingModule(null)} onConfirm={() => void moduleApi.delete(deletingModule.id).then(() => { setModules(current => current.filter(module => module.id !== deletingModule.id)); setDeletingModule(null); }).catch(e => setError(apiErrorMessage(e, 'Unable to delete Module.')))} />}
  </Stack>;
}
