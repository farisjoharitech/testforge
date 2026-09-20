import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  Add,
  Delete,
  Edit,
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
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ApiError, apiErrorMessage } from '../../api/apiClient';
import { automationApi } from '../../api/automationApi';
import { testCaseApi } from '../../api/testCaseApi';
import { testScenarioApi } from '../../api/testScenarioApi';
import { testStepApi } from '../../api/testStepApi';
import DeleteConfirmationDialog from '../../components/common/DeleteConfirmationDialog';
import { PageHeader } from '../../components/common/PageHeader';
import { WorkspaceCollection } from '../../components/common/WorkspaceCollection';
import EditTestCaseDialog from '../../components/test-cases/EditTestCaseDialog';
import CreateTestStepDialog from '../../components/test-steps/CreateTestStepDialog';
import StepAutomationSummary from '../../components/test-steps/StepAutomationSummary';
import EditTestStepDialog from '../../components/test-steps/EditTestStepDialog';
import type {
  AutomationStep,
} from '../../types/automation';
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
  const [searchParams] = useSearchParams();
  const openedLink = useRef<string | null>(null);
  const { testCaseId } = useParams<{ testCaseId: string }>();

  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [automationSteps, setAutomationSteps] = useState<AutomationStep[]>([]);
  const [scenarioAutomatable, setScenarioAutomatable] = useState(false);
  const [automationLoaded, setAutomationLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deletingCaseRef = useRef(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<"automation" | undefined>();
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
      setAutomationSteps(await automationApi.getSteps(script.id));
    } catch (err) {
      if (isNotFound(err)) setAutomationSteps([]);
      else throw err;
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
      setAutomationLoaded(false);
      const [caseResponse, stepResponse] = await Promise.all([
        testCaseApi.getTestCaseByBusinessId(testCaseId),
        testStepApi.getByTestCase(testCaseId),
      ]);
      setTestCase(caseResponse);
      setTestSteps([...stepResponse].sort((a, b) => a.stepOrder - b.stepOrder));
      const scenario = await testScenarioApi.getTestScenario(caseResponse.scenarioId);
      setScenarioAutomatable(scenario.automatable);
      await loadAutomationWorkspace(caseResponse.id);
      setAutomationLoaded(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to load Test Case workspace.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadAutomationWorkspace, testCaseId]);

  useEffect(() => { void loadPage(); }, [loadPage]);
  useEffect(() => { setPage(1); }, [deferredSearch, pageSize]);

  useEffect(() => {
    const linkedStep = searchParams.get('automationStep');
    if (!automationLoaded || !linkedStep || openedLink.current === linkedStep) return;
    const step = testSteps.find(s => s.testStepId === linkedStep);
    if (step) { openedLink.current = linkedStep; setEditingSection('automation'); setEditingTestStep(step); }
  }, [automationLoaded, testSteps, searchParams]);

  const filteredSteps = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return testSteps;
    return testSteps.filter((step) => [step.action, step.target, step.expectedResult, String(step.stepOrder)]
      .some((value) => value?.toLowerCase().includes(q)));
  }, [deferredSearch, testSteps]);

  const visibleSteps = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSteps.slice(start, start + pageSize);
  }, [filteredSteps, page, pageSize]);

  const openDeleteDialog = () => { setDeleteError(null); setDeleteDialogOpen(true); };

  const handleDeleteTestCase = async () => {
    if (!testCase || deletingCaseRef.current) return;
    deletingCaseRef.current = true;
    try {
      setDeleting(true);
      setDeleteError(null);
      await testCaseApi.deleteTestCase(testCase.id);
      navigate(`/scenarios/${encodeURIComponent(testCase.scenarioBusinessId)}`);
    } catch (err) {
      setDeleteError(apiErrorMessage(err, 'Unable to delete the Test Case.'));
    } finally {
      deletingCaseRef.current = false;
      setDeleting(false);
    }
  };

  const editStep = (step: TestStep, section?: "automation") => {
    setEditingSection(section); setEditingTestStep(step);
  };
  const openDeleteTestStep = (step: TestStep) => { setDeleteStepError(null); setDeletingTestStep(step); };

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
      setDeleteStepError(apiErrorMessage(err, 'Unable to delete Test Step.'));
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
            <Button size="small" color="error" startIcon={<Delete />} onClick={() => void openDeleteDialog()}>Delete</Button>
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

      <WorkspaceCollection
        title="Test Steps"
        totalCount={testSteps.length}
        filteredCount={filteredSteps.length}
        searchValue={search}
        searchPlaceholder="Search steps by action, target or expected result..."
        onSearchChange={setSearch}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        actions={<Button variant="contained" size="small" startIcon={<Add />} disabled={!automationLoaded || refreshing} onClick={() => setCreateDialogOpen(true)}>Create Test Step</Button>}
      >
        {testSteps.length === 0 ? (
          <Card variant="outlined"><CardContent><Stack spacing={1.5} alignItems="center" sx={{ py: 5 }}><Typography fontWeight={700}>No Test Steps yet</Typography><Typography variant="body2" color="text.secondary">Create a Test Step and optionally configure its automation in the same dialog.</Typography></Stack></CardContent></Card>
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
                        <Chip size="small" variant="outlined" sx={{ my: 0.5 }}
                          disabled={!automationLoaded || refreshing}
                          onClick={() => editStep(step, "automation")}
                          title="View, edit or remove this Step's automation"
                          label={!automationLoaded ? "Automation unavailable" : automationSteps.some(a => a.sourceTestStepId === step.id) ? "AUTOMATED - 1 action" : "MANUAL"}
                          color={automationSteps.some(a => a.sourceTestStepId === step.id) ? "success" : "default"} />
                        {automationSteps.filter(a => a.sourceTestStepId === step.id).map(a => <Box key={a.id} sx={{ my: 1 }}>
                          <Chip size="small" label={a.actionType.includes('API_') ? 'API' : 'UI'} />
                          <StepAutomationSummary step={a} />
                          <Button size="small" onClick={() => editStep(step, 'automation')}>Edit / Remove Automation</Button>
                        </Box>)}
                        {(step.target || step.inputValue || step.expectedResult) && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'anywhere' }}>
                            {[
                              step.target ? `Target: ${step.target}` : null,
                              step.inputValue ? 'Input: ********' : null,
                              step.expectedResult ? `Expected: ${step.expectedResult}` : null,
                            ].filter(Boolean).join(' · ')}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      <Button size="small" startIcon={<Edit />} disabled={!automationLoaded || refreshing} onClick={() => editStep(step)}>Edit</Button>
                      <Button size="small" color="error" aria-label={`Delete Step ${step.stepOrder}`} startIcon={<Delete />} onClick={() => void openDeleteTestStep(step)}>Delete</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </WorkspaceCollection>

      <CreateTestStepDialog
        open={createDialogOpen} testCaseId={testCase.testCaseId}
        scenarioAutomatable={scenarioAutomatable} automationType={testCase.automationType}
        suggestedAutomationOrder={Math.max(0, ...automationSteps.map(s => s.stepOrder)) + 1}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={(step) => {
          setCreateDialogOpen(false);
          setTestSteps(current => [...current, step].sort((a, b) => a.stepOrder - b.stepOrder));
          setSuccessMessage("Test Step saved successfully.");
          void loadPage(true);
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
        open={deleteDialogOpen} title="Delete Test Case?" entityName={testCase.name}
        resourceType="TEST_CASE" resourceId={testCase.id}
        deleting={deleting}
        error={deleteError}
        onClose={() => { if (!deleting) { setDeleteDialogOpen(false); setDeleteError(null); } }}
        onConfirm={() => void handleDeleteTestCase()}
      />
      {editingTestStep && (
        <EditTestStepDialog open testStep={editingTestStep} testCaseId={testCase.testCaseId}
          initialSection={editingSection}
          onAutomationRemoved={id => { setAutomationSteps(current => current.filter(a => a.id !== id)); setSuccessMessage("Automation removed. Test Step preserved."); }}
          scenarioAutomatable={scenarioAutomatable} automationType={testCase.automationType}
          automationStep={automationSteps.find(s => s.sourceTestStepId === editingTestStep.id)}
          suggestedAutomationOrder={Math.max(0, ...automationSteps.map(s => s.stepOrder)) + 1}
          onClose={() => setEditingTestStep(null)}
          onUpdated={(updated) => {
            setTestSteps(current => current.map(step => step.id === updated.id ? updated : step).sort((a, b) => a.stepOrder - b.stepOrder));
            setEditingTestStep(null);
            setSuccessMessage("Test Step saved successfully.");
            void loadPage(true);
          }}
        />
      )}
      {deletingTestStep && (
        <DeleteConfirmationDialog
          open
          title="Delete Test Step?"
          entityName={deletingTestStep.action}
          resourceType="TEST_STEP" resourceId={deletingTestStep.id}
          deleting={deletingStep}
          error={deleteStepError}
          onClose={() => { if (!deletingStep) { setDeletingTestStep(null); setDeleteStepError(null); } }}
          onConfirm={() => void handleDeleteTestStep()}
        />
      )}
    </Stack>
  );
}
