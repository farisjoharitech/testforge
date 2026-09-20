import { useEffect, useState } from 'react';
import { Add, Delete, Download, Edit, PlayArrow, Refresh, Settings } from '@mui/icons-material';
import { Alert, Button, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { ApiError, apiErrorMessage } from '../../api/apiClient';
import { testSuiteApi } from '../../api/testSuiteApi';
import { suiteReportingApi } from '../../api/suiteReportingApi';
import TestSuiteDialog from '../../components/automation/TestSuiteDialog';
import DeleteConfirmationDialog from '../../components/common/DeleteConfirmationDialog';
import type { Project } from '../../types/project';
import type { SuiteRun, TestSuite, TestSuiteRequest } from '../../types/testSuite';
import type { SuiteReportSummary } from '../../types/suiteReporting';
import { assertSuiteProject, useAutomationSuites } from './useAutomationSuites';

function runSummary(suite: TestSuite, run: SuiteRun): SuiteReportSummary {
  if (run.testSuiteId !== suite.id) throw new ApiError('Suite Run does not belong to this Test Suite.', 409);
  return { testSuiteId: suite.id, suiteName: suite.name, latestRunId: run.id, latestStatus: run.status,
    latestExecutionTime: run.startedAt, total: run.total, passed: run.passed, failed: run.failed,
    skipped: run.skipped, durationMs: run.durationMs };
}

export default function AutomationManagementPage({ project }: { project: Project }) {
  const { suites, setSuites, candidates, latest, setLatest, loading, error, setError, alive, refresh } = useAutomationSuites(project, true);
  const [editing, setEditing] = useState<TestSuite | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [pollingStopped, setPollingStopped] = useState(false);
  const [deletingSuite, setDeletingSuite] = useState<TestSuite | null>(null);

  useEffect(() => {
    if (pollingStopped) return;
    const running = suites.filter(s => ['RUNNING', 'PENDING'].includes(latest[s.id]?.latestStatus ?? ''));
    if (!running.length) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const updates = await Promise.all(running.map(async s => runSummary(s,
          await suiteReportingApi.detail(project.projectId, latest[s.id].latestRunId!))));
        if (active) setLatest(v => ({ ...v, ...Object.fromEntries(updates.map(r => [r.testSuiteId, r])) }));
      } catch (e) {
        if (active) { setPollingStopped(true); setError(apiErrorMessage(e, 'Unable to refresh Suite Runs. Use Refresh to retry.')); }
      }
    }, 1000);
    return () => { active = false; window.clearTimeout(timer); };
  }, [project.projectId, suites, latest, pollingStopped, setLatest, setError]);

  const save = async (request: TestSuiteRequest) => {
    try {
      setSaving(true); setDialogError(null);
      if (editing) assertSuiteProject(editing, project);
      const saved = editing ? await testSuiteApi.update(editing.id, request) : await testSuiteApi.create(project.projectId, request);
      assertSuiteProject(saved, project);
      if (alive.current) { setSuites(v => [...v.filter(s => s.id !== saved.id), saved].sort((a, b) => a.id - b.id)); setEditing(undefined); }
    } catch (e) { if (alive.current) setDialogError(apiErrorMessage(e, 'Unable to save Test Suite.')); }
    finally { if (alive.current) setSaving(false); }
  };

  const action = async (suite: TestSuite, kind: 'run' | 'export' | 'delete') => {
    try {
      assertSuiteProject(suite, project);
      setBusy(suite.id); setError(null);
      if (kind === 'run') {
        const summary = runSummary(suite, await testSuiteApi.run(project.projectId, suite.id));
        if (alive.current) { setLatest(v => ({ ...v, [suite.id]: summary })); setPollingStopped(false); }
      } else if (kind === 'export') {
        const download = await testSuiteApi.export(project.projectId, suite.id);
        if (!alive.current) return;
        const url = URL.createObjectURL(download.blob);
        const anchor = document.createElement('a');
        anchor.href = url; anchor.download = download.fileName; anchor.click();
        URL.revokeObjectURL(url);
      } else {
        await testSuiteApi.delete(suite.id);
        if (alive.current) setSuites(v => v.filter(s => s.id !== suite.id));
      }
    } catch (e) { if (alive.current) setError(apiErrorMessage(e, `Unable to ${kind} Test Suite.`)); }
    finally { if (alive.current) setBusy(null); }
  };

  if (loading) return <CircularProgress aria-label="Loading Test Suites" />;
  return <Stack spacing={2}>
    <Stack direction="row" spacing={1} justifyContent="space-between">
      <Typography variant="h6">Test Suites · {project.name}</Typography>
      <Stack direction="row" spacing={1}>
        <Button startIcon={<Refresh />} disabled={busy !== null} onClick={() => { setPollingStopped(false); refresh(); }}>Refresh</Button>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setDialogError(null); setEditing(null); }}>Create Test Suite</Button>
      </Stack>
    </Stack>
    {error && <Alert severity="error">{error}</Alert>}
    {!suites.length && !error && <Alert severity="info">No Test Suites for this Project. Create one from its automation-eligible Scenarios.</Alert>}
    {suites.map(suite => {
      const run = latest[suite.id];
      const eligible = suite.scenarios.filter(s => candidates.some(c => c.id === s.id)).length;
      const running = ['RUNNING', 'PENDING'].includes(run?.latestStatus ?? '');
      return <Card key={suite.id} variant="outlined"><CardContent><Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="h6">{suite.name}</Typography>
          <Chip size="small" label={run?.latestStatus ?? 'NOT RUN'} color={run?.latestStatus === 'PASSED' ? 'success' : run?.latestStatus === 'FAILED' ? 'error' : 'default'} />
        </Stack>
        {suite.description && <Typography color="text.secondary">{suite.description}</Typography>}
        <Typography variant="body2">{suite.scenarios.length} selected Scenarios · {suite.executionMode === 'PARALLEL' ? 'Parallel' : 'Sequential'} execution · {suite.tags.join(', ') || 'No tags'}</Typography>
        <Typography variant="body2" color={eligible === suite.scenarios.length && eligible > 0 ? 'text.secondary' : 'warning.main'}>
          Automation eligibility: {eligible}/{suite.scenarios.length} Scenarios. Generated script readiness is validated when running or exporting.
        </Typography>
        {run?.latestExecutionTime && <Typography variant="body2">Last run: {new Date(run.latestExecutionTime).toLocaleString()} · {run.passed}/{run.total} passed</Typography>}
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button startIcon={<PlayArrow />} disabled={busy !== null || running || !eligible || eligible !== suite.scenarios.length} onClick={() => void action(suite, 'run')}>Run Suite</Button>
          <Button startIcon={<Download />} disabled={busy !== null} onClick={() => void action(suite, 'export')}>Export for CI/CD</Button>
          <Button startIcon={<Edit />} disabled={busy !== null} onClick={() => { setDialogError(null); setEditing(suite); }}>Edit Suite</Button>
          <Button component={Link} startIcon={<Settings />} to={`/automation/configuration?${new URLSearchParams({ project: project.projectId, suite: String(suite.id) })}`}>Configure</Button>
          <Button color="error" startIcon={<Delete />} disabled={busy !== null} onClick={() => setDeletingSuite(suite)}>Delete</Button>
        </Stack>
      </Stack></CardContent></Card>;
    })}
    {editing !== undefined && <TestSuiteDialog suite={editing} candidates={candidates} saving={saving} error={dialogError}
      onClose={() => setEditing(undefined)} onSave={request => void save(request)} />}
    {deletingSuite && <DeleteConfirmationDialog open title="Delete Test Suite?" entityName={deletingSuite.name}
      resourceType="TEST_SUITE" resourceId={deletingSuite.id} deleting={busy === deletingSuite.id} error={error}
      onClose={() => setDeletingSuite(null)} onConfirm={() => void (async () => { try { setBusy(deletingSuite.id); setError(null); await testSuiteApi.delete(deletingSuite.id); if (alive.current) { setSuites(v => v.filter(s => s.id !== deletingSuite.id)); setDeletingSuite(null); } } catch (e) { if (alive.current) setError(apiErrorMessage(e, 'Unable to delete Test Suite.')); } finally { if (alive.current) setBusy(null); } })()} />}
  </Stack>;
}
