import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Add,
  ArrowBack,
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
  Divider,
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
import EditTestCaseDialog from '../../components/test-cases/EditTestCaseDialog';
import CreateTestStepDialog from '../../components/test-steps/CreateTestStepDialog';
import EditTestStepDialog from '../../components/test-steps/EditTestStepDialog';
import type { AutomationExecution, AutomationScript } from '../../types/automation';
import type { TestCase } from '../../types/testCase';
import type { TestStep } from '../../types/testStep';

function displayValue(value: string | null | undefined): string {
  return value?.trim() || 'Not specified';
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Not specified';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function getPriorityColor(priority: string): 'default' | 'primary' | 'warning' | 'error' {
  if (priority === 'CRITICAL') return 'error';
  if (priority === 'HIGH') return 'warning';
  if (priority === 'MEDIUM') return 'primary';
  return 'default';
}

function getStatusColor(status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  if (status === 'ACTIVE') return 'primary';
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED') return 'error';
  if (status === 'DRAFT') return 'warning';
  return 'default';
}

function getExecutionColor(status?: string): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  if (status === 'RUNNING') return 'primary';
  if (status === 'PASSED') return 'success';
  if (status === 'TIMED_OUT') return 'warning';
  if (status === 'FAILED' || status === 'ERROR') return 'error';
  return 'default';
}

function label(value: string): string {
  return value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
      .replace('Ui Api', 'UI + API')
      .replace(/^Ui$/, 'UI')
      .replace(/^Api$/, 'API');
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

  const loadAutomationWorkspace = useCallback(async (numericTestCaseId: number) => {
    try {
      const script = await automationApi.getScriptByTestCase(numericTestCaseId);
      setAutomationScript(script);

      try {
        const execution = await automationApi.getLatestExecution(script.id);
        setLatestExecution(execution);
      } catch (executionError) {
        if (isNotFound(executionError)) {
          setLatestExecution(null);
        } else {
          throw executionError;
        }
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

  const loadPage = useCallback(async (isRefresh = false) => {
    if (!testCaseId) {
      setError('Test Case ID is missing.');
      setLoading(false);
      return;
    }

    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      const [testCaseResponse, testStepResponse] = await Promise.all([
        testCaseApi.getTestCaseByBusinessId(testCaseId),
        testStepApi.getByTestCase(testCaseId),
      ]);

      setTestCase(testCaseResponse);
      setTestSteps([...testStepResponse].sort((a, b) => a.stepOrder - b.stepOrder));

      if (testCaseResponse.automatable && testCaseResponse.automationType !== 'MANUAL') {
        await loadAutomationWorkspace(testCaseResponse.id);
      } else {
        setAutomationScript(null);
        setLatestExecution(null);
      }
    } catch (err) {
      console.error('Failed to load Test Case workspace:', err);
      setError(err instanceof ApiError ? err.message : 'Unable to load the Test Case workspace.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadAutomationWorkspace, testCaseId]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  const automationReady = Boolean(
      testCase?.automatable &&
      testCase.automationType !== 'MANUAL' &&
      testSteps.length > 0,
  );

  const workflowMessage = useMemo(() => {
    if (!testCase) return '';
    if (!testCase.automatable || testCase.automationType === 'MANUAL') {
      return 'This Test Case is currently manual. Edit it and enable automation before building a Playwright script.';
    }
    if (testSteps.length === 0) {
      return 'Add at least one Test Step before building automation.';
    }
    if (!automationScript) {
      return 'The Test Case is ready for automation. Create its automation script in the Automation Builder.';
    }
    if (testCase.automationStatus === 'NOT_AUTOMATED') {
      return 'Automation script exists. Map the Test Steps to automation actions in the Automation Builder.';
    }
    if (testCase.automationStatus === 'SCRIPT_GENERATED') {
      return 'The Playwright Java script has been generated and is ready for review or execution.';
    }
    if (testCase.automationStatus === 'RUNNING') {
      return 'Automation execution is currently running.';
    }
    if (testCase.automationStatus === 'AUTOMATED') {
      return 'This Test Case has completed the automation workflow. Review the latest execution below.';
    }
    return 'Continue the automation workflow from this workspace.';
  }, [automationScript, testCase, testSteps.length]);

  const handleTestStepCreated = (step: TestStep) => {
    setCreateDialogOpen(false);
    setSuccessMessage(`Test Step "${step.testStepId}" created successfully.`);
    setTestSteps((current) => [...current, step].sort((a, b) => a.stepOrder - b.stepOrder));
  };

  const handleTestCaseUpdated = (updated: TestCase) => {
    setTestCase(updated);
    setEditDialogOpen(false);
    setSuccessMessage(`Test Case "${updated.testCaseId}" updated successfully.`);
    void loadPage(true);
  };

  const handleDeleteTestCase = async () => {
    if (!testCase) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      await testCaseApi.deleteTestCase(testCase.id);
      navigate(`/scenarios/${encodeURIComponent(testCase.scenarioBusinessId)}`);
    } catch (err) {
      setDeleteError(
          err instanceof ApiError
              ? err.message
              : 'Unable to delete the Test Case. Delete its Test Steps or related automation records first.',
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleTestStepUpdated = (updated: TestStep) => {
    setTestSteps((current) =>
        current
            .map((step) => (step.id === updated.id ? updated : step))
            .sort((a, b) => a.stepOrder - b.stepOrder),
    );
    setEditingTestStep(null);
    setSuccessMessage(`Test Step "${updated.testStepId}" updated successfully.`);
  };

  const handleDeleteTestStep = async () => {
    if (!deletingTestStep) return;
    try {
      setDeletingStep(true);
      setDeleteStepError(null);
      await testStepApi.deleteTestStep(deletingTestStep.id);
      setTestSteps((current) => current.filter((step) => step.id !== deletingTestStep.id));
      setSuccessMessage(`Test Step "${deletingTestStep.testStepId}" deleted successfully.`);
      setDeletingTestStep(null);
    } catch (err) {
      setDeleteStepError(err instanceof ApiError ? err.message : 'Unable to delete the Test Step.');
    } finally {
      setDeletingStep(false);
    }
  };

  if (loading) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={2} sx={{ minHeight: 320, alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress />
              <Typography color="text.secondary">Loading Test Case workspace...</Typography>
            </Stack>
          </CardContent>
        </Card>
    );
  }

  if (error && !testCase) {
    return (
        <Stack spacing={2}>
          <Alert severity="error">{error}</Alert>
          <Button variant="contained" onClick={() => void loadPage()} sx={{ alignSelf: 'flex-start' }}>
            Try Again
          </Button>
        </Stack>
    );
  }

  if (!testCase) return null;

  return (
      <Stack spacing={3}>
        <PageHeader
            title={`${testCase.testCaseId} · Workspace`}
            description={testCase.name}
            breadcrumbs={[
              { label: 'Test Plans', to: '/test-plans' },
              {
                label: testCase.scenarioBusinessId,
                to: `/scenarios/${encodeURIComponent(testCase.scenarioBusinessId)}`,
              },
              { label: testCase.testCaseId },
            ]}
            actions={
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/scenarios/${encodeURIComponent(testCase.scenarioBusinessId)}`)}
                >
                  Scenario
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    disabled={refreshing}
                    onClick={() => void loadPage(true)}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditDialogOpen(true)}>
                  Edit
                </Button>
                <Button
                    color="error"
                    variant="outlined"
                    startIcon={<Delete />}
                    onClick={() => {
                      setDeleteError(null);
                      setDeleteDialogOpen(true);
                    }}
                >
                  Delete
                </Button>
              </Stack>
            }
        />

        {successMessage && (
            <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>
        )}
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

        <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 2,
            }}
        >
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Definition</Typography>
              <Typography variant="h6" fontWeight={700}>{testSteps.length} Test Steps</Typography>
              <Typography variant="body2" color="text.secondary">
                {testSteps.length > 0 ? 'Execution flow is defined.' : 'No execution steps yet.'}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Automation</Typography>
              <Typography variant="h6" fontWeight={700}>{label(testCase.automationStatus)}</Typography>
              <Typography variant="body2" color="text.secondary">
                {testCase.automatable ? `${label(testCase.automationType)} automation` : 'Manual Test Case'}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Automation Script</Typography>
              <Typography variant="h6" fontWeight={700}>
                {automationScript ? automationScript.automationScriptId : 'Not Created'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {automationScript ? automationScript.name : 'Create a script when the Test Case is ready.'}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Latest Execution</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" fontWeight={700}>
                  {latestExecution?.status ?? 'Not Run'}
                </Typography>
                {latestExecution && (
                    <Chip size="small" label={latestExecution.status} color={getExecutionColor(latestExecution.status)} />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {latestExecution ? formatDate(latestExecution.finishedAt ?? latestExecution.startedAt) : 'No execution recorded yet.'}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={700}>Test Case Workflow</Typography>
                <Typography variant="body2" color="text.secondary">{workflowMessage}</Typography>
              </Box>
              <Divider />
              <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
                    gap: 2,
                  }}
              >
                <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  1. Define Test Steps
                </Button>
                <Button
                    variant={automationScript ? 'outlined' : 'contained'}
                    startIcon={<AutoAwesome />}
                    disabled={!automationReady}
                    onClick={() => navigate(`/automation/${encodeURIComponent(testCase.testCaseId)}`)}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  2. Automation Builder
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<Code />}
                    disabled={!automationScript}
                    onClick={() => navigate(`/automation/${encodeURIComponent(testCase.testCaseId)}/script`)}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  3. Generate Script
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<PlayArrow />}
                    disabled={!automationScript}
                    onClick={() => navigate(`/automation/${encodeURIComponent(testCase.testCaseId)}/execute`)}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  4. Execute
                </Button>
              </Box>
              {latestExecution && (
                  <Box>
                    <Button
                        size="small"
                        startIcon={<Assessment />}
                        onClick={() => navigate(`/results/${latestExecution.id}`)}
                    >
                      Open Latest Execution Result
                    </Button>
                  </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Test Case Information</Typography>
                  <Typography variant="body2" color="text.secondary">Definition, classification and lifecycle metadata.</Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  <Chip label={label(testCase.testType)} variant="outlined" />
                  <Chip label={testCase.priority} color={getPriorityColor(testCase.priority)} variant="outlined" />
                  <Chip label={testCase.status} color={getStatusColor(testCase.status)} variant="outlined" />
                  <Chip
                      label={testCase.automatable ? 'Automatable' : 'Manual'}
                      color={testCase.automatable ? 'success' : 'default'}
                      variant="outlined"
                  />
                </Stack>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">Name</Typography>
                <Typography>{testCase.name}</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Preconditions</Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{displayValue(testCase.preconditions)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Test Data</Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{displayValue(testCase.testData)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Expected Result</Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{testCase.expectedResult}</Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                <Box><Typography variant="caption" color="text.secondary">Test Case ID</Typography><Typography fontWeight={600}>{testCase.testCaseId}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Scenario</Typography><Typography>{testCase.scenarioBusinessId}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Automation Type</Typography><Typography>{label(testCase.automationType)}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Automation Status</Typography><Typography>{label(testCase.automationStatus)}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Created</Typography><Typography>{formatDate(testCase.createdAt)}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Updated</Typography><Typography>{formatDate(testCase.updatedAt)}</Typography></Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Test Steps</Typography>
            <Typography color="text.secondary">Ordered execution steps used as the source definition for this Test Case.</Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={`${testSteps.length} step${testSteps.length === 1 ? '' : 's'}`} variant="outlined" />
            <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>
              Add Test Step
            </Button>
          </Stack>
        </Box>

        {testSteps.length === 0 ? (
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={2} sx={{ minHeight: 230, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <Typography variant="h6">No Test Steps yet</Typography>
                  <Typography color="text.secondary">Define the Test Case execution flow before creating automation.</Typography>
                  <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>Add First Test Step</Button>
                </Stack>
              </CardContent>
            </Card>
        ) : (
            <Stack spacing={2}>
              {testSteps.map((step) => (
                  <Card key={step.id} variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Chip label={`Step ${step.stepOrder}`} color="primary" />
                            <Box>
                              <Typography variant="h6" fontWeight={700}>{step.testStepId}</Typography>
                              <Typography variant="body2" color="text.secondary">{step.action}</Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" startIcon={<Edit />} onClick={() => setEditingTestStep(step)}>Edit</Button>
                            <Button
                                size="small"
                                color="error"
                                startIcon={<Delete />}
                                onClick={() => {
                                  setDeleteStepError(null);
                                  setDeletingTestStep(step);
                                }}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                          <Box><Typography variant="caption" color="text.secondary">Target</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{displayValue(step.target)}</Typography></Box>
                          <Box><Typography variant="caption" color="text.secondary">Input Value</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{displayValue(step.inputValue)}</Typography></Box>
                          <Box><Typography variant="caption" color="text.secondary">Expected Result</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{displayValue(step.expectedResult)}</Typography></Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
              ))}
            </Stack>
        )}

        <CreateTestStepDialog
            open={createDialogOpen}
            testCaseId={testCase.testCaseId}
            onClose={() => setCreateDialogOpen(false)}
            onCreated={handleTestStepCreated}
        />
        <EditTestCaseDialog
            open={editDialogOpen}
            testCase={testCase}
            onClose={() => setEditDialogOpen(false)}
            onUpdated={handleTestCaseUpdated}
        />
        <DeleteConfirmationDialog
            open={deleteDialogOpen}
            title="Delete Test Case?"
            entityName={testCase.testCaseId}
            description="A Test Case cannot be deleted while Test Steps or related automation records still reference it."
            deleting={deleting}
            error={deleteError}
            onClose={() => {
              if (deleting) return;
              setDeleteDialogOpen(false);
              setDeleteError(null);
            }}
            onConfirm={() => void handleDeleteTestCase()}
        />
        {editingTestStep && (
            <EditTestStepDialog
                open
                testStep={editingTestStep}
                onClose={() => setEditingTestStep(null)}
                onUpdated={handleTestStepUpdated}
            />
        )}
        {deletingTestStep && (
            <DeleteConfirmationDialog
                open
                title="Delete Test Step?"
                entityName={deletingTestStep.testStepId}
                description={`Step ${deletingTestStep.stepOrder} will be permanently deleted.`}
                deleting={deletingStep}
                error={deleteStepError}
                onClose={() => {
                  if (deletingStep) return;
                  setDeletingTestStep(null);
                  setDeleteStepError(null);
                }}
                onConfirm={() => void handleDeleteTestStep()}
            />
        )}
      </Stack>
  );
}
