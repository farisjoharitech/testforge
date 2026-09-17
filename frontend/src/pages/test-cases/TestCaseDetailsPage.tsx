import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  Add,
  Assessment,
  AutoAwesome,
  Code,
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
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../../api/apiClient';
import { automationApi } from '../../api/automationApi';
import { testCaseApi } from '../../api/testCaseApi';
import { testStepApi } from '../../api/testStepApi';
import DeleteConfirmationDialog from '../../components/common/DeleteConfirmationDialog';
import { PageHeader } from '../../components/common/PageHeader';
import { WorkspaceCollection } from '../../components/common/WorkspaceCollection';
import EditTestCaseDialog from '../../components/test-cases/EditTestCaseDialog';
import CreateTestStepDialog from '../../components/test-steps/CreateTestStepDialog';
import EditTestStepDialog from '../../components/test-steps/EditTestStepDialog';
import type { AutomationExecution, AutomationScript } from '../../types/automation';
import type { TestCase } from '../../types/testCase';
import type { TestStep } from '../../types/testStep';

function priorityColor(priority: string): 'default' | 'primary' | 'warning' | 'error' {
  if (priority === 'CRITICAL') return 'error';
  if (priority === 'HIGH') return 'warning';
  if (priority === 'MEDIUM') return 'primary';
  return 'default';
}

function statusColor(status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  if (status === 'ACTIVE') return 'primary';
  if (status === 'APPROVED' || status === 'AUTOMATED' || status === 'PASSED') return 'success';
  if (status === 'REJECTED' || status === 'FAILED' || status === 'ERROR') return 'error';
  if (status === 'DRAFT' || status === 'RUNNING' || status === 'TIMED_OUT') return 'warning';
  return 'default';
}

function label(value: string): string {
  return value.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ').replace('Ui Api', 'UI + API').replace(/^Ui$/, 'UI').replace(/^Api$/, 'API');
}

function displayValue(value: string | null | undefined): string {
  return value?.trim() || 'Not specified';
}

function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export default function TestCaseDetailsPage() {
  const navigate = useNavigate();
  const { testCaseId } = useParams<{ testCaseId: string }>();

  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [automationScript, setAutomationScript] = useState<AutomationScript | null>(null);
  const [latestExecution, setLatestExecution] = useState<AutomationExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingTestStep, setEditingTestStep] = useState<TestStep | null>(null);
  const [deletingTestStep, setDeletingTestStep] = useState<TestStep | null>(null);
  const [deletingStep, setDeletingStep] = useState(false);
  const [deleteStepError, setDeleteStepError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const loadAutomationWorkspace = useCallback(async (numericTestCaseId: number) => {
    try {
      const script = await automationApi.getScriptByTestCase(numericTestCaseId);
      setAutomationScript(script);
      try {
        setLatestExecution(await automationApi.getLatestExecution(script.id));
      } catch (executionError) {
        if (isNotFound(executionError)) setLatestExecution(null);
        else throw executionError;
      }
    } catch (scriptError) {
      if (isNotFound(scriptError)) {
        setAutomationScript(null);
        setLatestExecution(null);
      } else {
        throw scriptError;
      }
    }
  }, []);

  const loadPage = useCallback(async (refresh = false) => {
    if (!testCaseId) {
      setError('Test Case ID is missing.');
      setLoading(false);
      return;
    }
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const [caseResponse, stepResponse] = await Promise.all([
        testCaseApi.getTestCaseByBusinessId(testCaseId),
        testStepApi.getByTestCase(testCaseId),
      ]);
      setTestCase(caseResponse);
      setTestSteps([...stepResponse].sort((a, b) => a.stepOrder - b.stepOrder));
      if (caseResponse.automatable && caseResponse.automationType !== 'MANUAL') {
        await loadAutomationWorkspace(caseResponse.id);
      } else {
        setAutomationScript(null);
        setLatestExecution(null);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load Test Case workspace.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadAutomationWorkspace, testCaseId]);

  useEffect(() => { void loadPage(); }, [loadPage]);
  useEffect(() => { setPage(1); }, [deferredSearch, pageSize]);

  const filteredSteps = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return testSteps;
    return testSteps.filter((step) => [step.action, step.target, step.inputValue, step.expectedResult, String(step.stepOrder)]
      .some((value) => value?.toLowerCase().includes(q)));
  }, [deferredSearch, testSteps]);

  const visibleSteps = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSteps.slice(start, start + pageSize);
  }, [filteredSteps, page, pageSize]);

  const automationReady = Boolean(testCase?.automatable && testCase.automationType !== 'MANUAL' && testSteps.length > 0);

  const workflowMessage = useMemo(() => {
    if (!testCase) return '';
    if (!testCase.automatable || testCase.automationType === 'MANUAL') return 'Manual Test Case. Enable automation only when this case is stable and worth automating.';
    if (testSteps.length === 0) return 'Add at least one Test Step before building automation.';
    if (!automationScript) return 'Ready for automation. Build the Playwright actions from the Test Steps.';
    if (testCase.automationStatus === 'SCRIPT_GENERATED') return 'Generated script is ready to review or execute.';
    if (testCase.automationStatus === 'RUNNING') return 'Automation is currently running.';
    if (testCase.automationStatus === 'AUTOMATED') return 'Automation is available. Review the latest result or run it again.';
    return 'Continue the automation workflow.';
  }, [automationScript, testCase, testSteps.length]);

  const handleDeleteTestCase = async () => {
    if (!testCase) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      await testCaseApi.deleteTestCase(testCase.id);
      navigate(`/scenarios/${encodeURIComponent(testCase.scenarioBusinessId)}`);
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Unable to delete the Test Case. Delete Test Steps or related automation first.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteTestStep = async () => {
    if (!deletingTestStep) return;
    try {
      setDeletingStep(true);
      setDeleteStepError(null);
      await testStepApi.deleteTestStep(deletingTestStep.id);
      setTestSteps((current) => current.filter((step) => step.id !== deletingTestStep.id));
      setSuccessMessage('Test Step deleted successfully.');
      setDeletingTestStep(null);
    } catch (err) {
      setDeleteStepError(err instanceof ApiError ? err.message : 'Unable to delete Test Step.');
    } finally {
      setDeletingStep(false);
    }
  };

  if (loading && !testCase) {
    return <Stack spacing={2} sx={{ minHeight: 320, alignItems: 'center', justifyContent: 'center' }}><CircularProgress /><Typography color="text.secondary">Loading Test Case...</Typography></Stack>;
  }
  if (!testCase) return <Alert severity="error">{error || 'Test Case not found.'}</Alert>;

  const automationLabel = testCase.automatable ? `${label(testCase.automationType)} · ${label(testCase.automationStatus)}` : 'Manual';

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title={testCase.name}
        breadcrumbs={[
          { label: 'Test Plans', to: '/test-plans' },
          { label: 'Test Scenario', to: `/scenarios/${encodeURIComponent(testCase.scenarioBusinessId)}` },
          { label: 'Test Case' },
        ]}
        actions={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip size="small" label={label(testCase.testType)} variant="outlined" />
            <Chip size="small" label={testCase.priority} color={priorityColor(testCase.priority)} variant="outlined" />
            <Chip size="small" label={testCase.status} color={statusColor(testCase.status)} variant="outlined" />
            <Chip size="small" label={automationLabel} color={testCase.automatable ? 'success' : 'default'} variant="outlined" />
            <Button size="small" startIcon={<Refresh />} disabled={refreshing} onClick={() => void loadPage(true)}>Refresh</Button>
            <Button size="small" startIcon={<Edit />} onClick={() => setEditDialogOpen(true)}>Edit</Button>
            <Button size="small" color="error" startIcon={<Delete />} onClick={() => setDeleteDialogOpen(true)}>Delete</Button>
          </Stack>
        }
      />

      {successMessage && <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ py: 1.75, '&:last-child': { pb: 1.75 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 2.5 }}>
            <Box><Typography variant="caption" color="text.secondary">Preconditions</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{displayValue(testCase.preconditions)}</Typography></Box>
            <Box><Typography variant="caption" color="text.secondary">Test Data</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{displayValue(testCase.testData)}</Typography></Box>
            <Box><Typography variant="caption" color="text.secondary">Expected Result</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{testCase.expectedResult}</Typography></Box>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ py: 1.75, '&:last-child': { pb: 1.75 } }}>
          <Stack spacing={1.5}>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', lg: 'center' }} justifyContent="space-between">
              <Box>
                <Typography fontWeight={800}>Automation workflow</Typography>
                <Typography variant="body2" color="text.secondary">{workflowMessage}</Typography>
              </Box>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button size="small" variant="outlined" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>Create Test Step</Button>
                <Button size="small" variant={automationScript ? 'outlined' : 'contained'} startIcon={<AutoAwesome />} disabled={!automationReady} onClick={() => navigate(`/automation/${encodeURIComponent(testCase.testCaseId)}`)}>Automation Builder</Button>
                <Button size="small" variant="outlined" startIcon={<Code />} disabled={!automationScript} onClick={() => navigate(`/automation/${encodeURIComponent(testCase.testCaseId)}/script`)}>Generated Script</Button>
                <Button size="small" variant="outlined" startIcon={<PlayArrow />} disabled={!automationScript} onClick={() => navigate(`/automation/${encodeURIComponent(testCase.testCaseId)}/execute`)}>Run Test Case</Button>
                {latestExecution && <Button size="small" startIcon={<Assessment />} onClick={() => navigate(`/results/${latestExecution.id}`)}>Latest Result</Button>}
              </Stack>
            </Stack>
            {latestExecution && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">Latest run</Typography>
                <Chip size="small" label={latestExecution.status} color={statusColor(latestExecution.status)} variant="outlined" />
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <WorkspaceCollection
        title="Test Steps"
        totalCount={testSteps.length}
        filteredCount={filteredSteps.length}
        searchValue={search}
        searchPlaceholder="Search steps by action, target, input or expected result..."
        onSearchChange={setSearch}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        actions={<Button variant="contained" size="small" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>Create Test Step</Button>}
      >
        {testSteps.length === 0 ? (
          <Card variant="outlined"><CardContent><Stack spacing={1.5} alignItems="center" sx={{ py: 5 }}><Typography fontWeight={700}>No Test Steps yet</Typography><Typography variant="body2" color="text.secondary">Define the execution flow before building automation.</Typography><Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>Add First Step</Button></Stack></CardContent></Card>
        ) : filteredSteps.length === 0 ? (
          <Alert severity="info">No Test Steps match your search.</Alert>
        ) : (
          <Stack spacing={0.75}>
            {visibleSteps.map((step) => (
              <Card key={step.id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                    <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
                      <Chip size="small" label={step.stepOrder} color="primary" sx={{ minWidth: 38 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={700}>{step.action}</Typography>
                        {(step.target || step.inputValue || step.expectedResult) && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'anywhere' }}>
                            {[
                              step.target ? `Target: ${step.target}` : null,
                              step.inputValue ? `Input: ${step.inputValue}` : null,
                              step.expectedResult ? `Expected: ${step.expectedResult}` : null,
                            ].filter(Boolean).join(' · ')}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      <Button size="small" startIcon={<Edit />} onClick={() => setEditingTestStep(step)}>Edit</Button>
                      <Button size="small" color="error" startIcon={<Delete />} onClick={() => { setDeleteStepError(null); setDeletingTestStep(step); }}>Delete</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </WorkspaceCollection>

      <CreateTestStepDialog
        open={createDialogOpen}
        testCaseId={testCase.testCaseId}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={(step) => {
          setCreateDialogOpen(false);
          setTestSteps((current) => [...current, step].sort((a, b) => a.stepOrder - b.stepOrder));
          setSuccessMessage('Test Step created successfully.');
        }}
      />
      <EditTestCaseDialog
        open={editDialogOpen}
        testCase={testCase}
        onClose={() => setEditDialogOpen(false)}
        onUpdated={(updated) => {
          setTestCase(updated);
          setEditDialogOpen(false);
          setSuccessMessage('Test Case updated successfully.');
          void loadPage(true);
        }}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Test Case?"
        entityName={testCase.name}
        description="A Test Case cannot be deleted while Test Steps or automation records still reference it."
        deleting={deleting}
        error={deleteError}
        onClose={() => { if (!deleting) { setDeleteDialogOpen(false); setDeleteError(null); } }}
        onConfirm={() => void handleDeleteTestCase()}
      />
      {editingTestStep && (
        <EditTestStepDialog
          open
          testStep={editingTestStep}
          onClose={() => setEditingTestStep(null)}
          onUpdated={(updated) => {
            setTestSteps((current) => current.map((step) => step.id === updated.id ? updated : step).sort((a, b) => a.stepOrder - b.stepOrder));
            setEditingTestStep(null);
            setSuccessMessage('Test Step updated successfully.');
          }}
        />
      )}
      {deletingTestStep && (
        <DeleteConfirmationDialog
          open
          title="Delete Test Step?"
          entityName={`Step ${deletingTestStep.stepOrder}`}
          description="This Test Step will be permanently deleted."
          deleting={deletingStep}
          error={deleteStepError}
          onClose={() => { if (!deletingStep) { setDeletingTestStep(null); setDeleteStepError(null); } }}
          onConfirm={() => void handleDeleteTestStep()}
        />
      )}
    </Stack>
  );
}
