import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Add,
  ArrowBack,
  ContentCopy,
  Delete,
  Refresh,
  Save,
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
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../../api/apiClient';
import { requirementApi } from '../../api/requirementApi';
import { testCaseApi } from '../../api/testCaseApi';
import { testPlanApi } from '../../api/testPlanApi';
import { testScenarioApi } from '../../api/testScenarioApi';
import { testStepApi } from '../../api/testStepApi';
import { PageHeader } from '../../components/common/PageHeader';
import type {
  Requirement,
  RequirementPriority,
  RequirementStatus,
} from '../../types/requirement';
import type {
  AutomationType,
  TestCase,
  TestCasePriority,
  TestCaseStatus,
  TestType as TestCaseTestType,
} from '../../types/testCase';
import type { TestPlan } from '../../types/testPlan';
import type {
  TestScenario,
  TestScenarioPriority,
  TestScenarioStatus,
  TestType as ScenarioTestType,
} from '../../types/testScenario';
import type { TestStep } from '../../types/testStep';

type EntityBase = {
  key: string;
  id?: number;
  businessId?: string;
  isNew: boolean;
  dirty: boolean;
};

type WorkspaceStep = EntityBase & {
  stepOrder: number;
  action: string;
  target: string;
  inputValue: string;
  expectedResult: string;
};

type WorkspaceTestCase = EntityBase & {
  name: string;
  preconditions: string;
  testData: string;
  expectedResult: string;
  priority: TestCasePriority;
  testType: TestCaseTestType;
  automatable: boolean;
  automationType: AutomationType;
  status: TestCaseStatus;
  steps: WorkspaceStep[];
};

type WorkspaceScenario = EntityBase & {
  description: string;
  testType: ScenarioTestType;
  priority: TestScenarioPriority;
  status: TestScenarioStatus;
  testCases: WorkspaceTestCase[];
};

type WorkspaceRequirement = EntityBase & {
  description: string;
  priority: RequirementPriority;
  status: RequirementStatus;
  scenarios: WorkspaceScenario[];
};

type DeletedEntities = {
  requirements: number[];
  scenarios: number[];
  testCases: number[];
  testSteps: number[];
};

type WorkspaceDraft = {
  version: 1;
  testPlanId: string;
  savedAt: string;
  requirements: WorkspaceRequirement[];
  deleted: DeletedEntities;
};

const EMPTY_DELETED: DeletedEntities = {
  requirements: [],
  scenarios: [],
  testCases: [],
  testSteps: [],
};

const REQUIREMENT_PRIORITIES: RequirementPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const REQUIREMENT_STATUSES: RequirementStatus[] = ['DRAFT', 'ACTIVE', 'APPROVED', 'REJECTED', 'ARCHIVED'];
const SCENARIO_PRIORITIES: TestScenarioPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const SCENARIO_STATUSES: TestScenarioStatus[] = ['DRAFT', 'ACTIVE', 'APPROVED', 'REJECTED', 'ARCHIVED'];
const TEST_CASE_PRIORITIES: TestCasePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TEST_CASE_STATUSES: TestCaseStatus[] = ['DRAFT', 'ACTIVE', 'APPROVED', 'REJECTED', 'ARCHIVED'];
const TEST_TYPES: ScenarioTestType[] = [
  'SMOKE', 'SANITY', 'REGRESSION', 'FUNCTIONAL', 'INTEGRATION', 'END_TO_END', 'POSITIVE', 'NEGATIVE',
];
const AUTOMATION_TYPES: AutomationType[] = ['MANUAL', 'UI', 'API', 'UI_API'];

function makeKey(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random()}`;
}

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function unique(values: number[]) {
  return Array.from(new Set(values));
}

function mapStep(step: TestStep): WorkspaceStep {
  return {
    key: `step-${step.id}`,
    id: step.id,
    businessId: step.testStepId,
    isNew: false,
    dirty: false,
    stepOrder: step.stepOrder,
    action: step.action,
    target: step.target ?? '',
    inputValue: step.inputValue ?? '',
    expectedResult: step.expectedResult ?? '',
  };
}

function mapTestCase(testCase: TestCase, steps: TestStep[]): WorkspaceTestCase {
  return {
    key: `test-case-${testCase.id}`,
    id: testCase.id,
    businessId: testCase.testCaseId,
    isNew: false,
    dirty: false,
    name: testCase.name,
    preconditions: testCase.preconditions ?? '',
    testData: testCase.testData ?? '',
    expectedResult: testCase.expectedResult,
    priority: testCase.priority,
    testType: testCase.testType,
    automatable: testCase.automatable,
    automationType: testCase.automationType,
    status: testCase.status,
    steps: [...steps].sort((a, b) => a.stepOrder - b.stepOrder).map(mapStep),
  };
}

function newRequirement(): WorkspaceRequirement {
  return {
    key: makeKey('requirement'),
    isNew: true,
    dirty: true,
    description: '',
    priority: 'MEDIUM',
    status: 'DRAFT',
    scenarios: [],
  };
}

function newScenario(): WorkspaceScenario {
  return {
    key: makeKey('scenario'),
    isNew: true,
    dirty: true,
    description: '',
    testType: 'FUNCTIONAL',
    priority: 'MEDIUM',
    status: 'DRAFT',
    testCases: [],
  };
}

function newTestCase(): WorkspaceTestCase {
  return {
    key: makeKey('test-case'),
    isNew: true,
    dirty: true,
    name: '',
    preconditions: '',
    testData: '',
    expectedResult: '',
    priority: 'MEDIUM',
    testType: 'FUNCTIONAL',
    automatable: false,
    automationType: 'MANUAL',
    status: 'DRAFT',
    steps: [],
  };
}

function newStep(stepOrder: number): WorkspaceStep {
  return {
    key: makeKey('step'),
    isNew: true,
    dirty: true,
    stepOrder,
    action: '',
    target: '',
    inputValue: '',
    expectedResult: '',
  };
}

function copyStep(step: WorkspaceStep, stepOrder: number): WorkspaceStep {
  return {
    ...step,
    key: makeKey('step'),
    id: undefined,
    businessId: undefined,
    isNew: true,
    dirty: true,
    stepOrder,
  };
}

function copyTestCase(testCase: WorkspaceTestCase): WorkspaceTestCase {
  return {
    ...testCase,
    key: makeKey('test-case'),
    id: undefined,
    businessId: undefined,
    isNew: true,
    dirty: true,
    name: testCase.name ? `${testCase.name} (Copy)` : '',
    steps: testCase.steps.map((step, index) => copyStep(step, index + 1)),
  };
}

function copyScenario(scenario: WorkspaceScenario): WorkspaceScenario {
  return {
    ...scenario,
    key: makeKey('scenario'),
    id: undefined,
    businessId: undefined,
    isNew: true,
    dirty: true,
    description: scenario.description ? `${scenario.description} (Copy)` : '',
    testCases: scenario.testCases.map(copyTestCase),
  };
}

function copyRequirement(requirement: WorkspaceRequirement): WorkspaceRequirement {
  return {
    ...requirement,
    key: makeKey('requirement'),
    id: undefined,
    businessId: undefined,
    isNew: true,
    dirty: true,
    description: requirement.description ? `${requirement.description} (Copy)` : '',
    scenarios: requirement.scenarios.map(copyScenario),
  };
}

function hasChanges(requirements: WorkspaceRequirement[], deleted: DeletedEntities) {
  if (
    deleted.requirements.length || deleted.scenarios.length ||
    deleted.testCases.length || deleted.testSteps.length
  ) return true;

  return requirements.some((requirement) =>
    requirement.isNew || requirement.dirty || requirement.scenarios.some((scenario) =>
      scenario.isNew || scenario.dirty || scenario.testCases.some((testCase) =>
        testCase.isNew || testCase.dirty || testCase.steps.some((step) => step.isNew || step.dirty),
      ),
    ),
  );
}

function validate(requirements: WorkspaceRequirement[]): string | null {
  for (const requirement of requirements) {
    if (!requirement.description.trim()) return 'Every Requirement must have a description.';
    for (const scenario of requirement.scenarios) {
      if (!scenario.description.trim()) return 'Every Scenario must have a description.';
      for (const testCase of scenario.testCases) {
        if (!testCase.name.trim()) return 'Every Test Case must have a name.';
        if (!testCase.expectedResult.trim()) return 'Every Test Case must have an expected result.';
        if (!testCase.automatable && testCase.automationType !== 'MANUAL') {
          return 'A non-automatable Test Case must use MANUAL automation type.';
        }
        if (testCase.automatable && testCase.automationType === 'MANUAL') {
          return 'An automatable Test Case must use UI, API, or UI_API automation type.';
        }
        for (const step of testCase.steps) {
          if (!step.action.trim()) return 'Every Test Step must have an action.';
        }
      }
    }
  }
  return null;
}

export default function TestDesignWorkspacePage() {
  const navigate = useNavigate();
  const { testPlanId } = useParams<{ testPlanId: string }>();
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  const [requirements, setRequirements] = useState<WorkspaceRequirement[]>([]);
  const [deleted, setDeleted] = useState<DeletedEntities>(EMPTY_DELETED);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);

  const storageKey = useMemo(
    () => testPlanId ? `testforge:test-design-workspace:${testPlanId}` : '',
    [testPlanId],
  );

  const loadWorkspace = useCallback(async (ignoreDraft = false) => {
    if (!testPlanId) {
      setError('Test Plan ID is missing.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const plan = await testPlanApi.getTestPlanByBusinessId(testPlanId);
      setTestPlan(plan);

      if (!ignoreDraft && storageKey) {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          try {
            const draft = JSON.parse(raw) as WorkspaceDraft;
            if (draft.version === 1 && draft.testPlanId === testPlanId) {
              setRequirements(draft.requirements);
              setDeleted(draft.deleted);
              setDraftMessage(`Local draft restored from ${new Date(draft.savedAt).toLocaleString()}.`);
              return;
            }
          } catch {
            localStorage.removeItem(storageKey);
          }
        }
      }

      const loadedRequirements = await requirementApi.getRequirementsByTestPlan(testPlanId);
      const requirementNodes = await Promise.all(loadedRequirements.map(async (requirement: Requirement) => {
        const scenarios = await testScenarioApi.getByRequirement(requirement.requirementId);
        const scenarioNodes = await Promise.all(scenarios.map(async (scenario: TestScenario) => {
          const testCases = await testCaseApi.getByScenario(scenario.scenarioId);
          const testCaseNodes = await Promise.all(testCases.map(async (testCase: TestCase) => {
            const steps = await testStepApi.getByTestCase(testCase.testCaseId);
            return mapTestCase(testCase, steps);
          }));
          return {
            key: `scenario-${scenario.id}`,
            id: scenario.id,
            businessId: scenario.scenarioId,
            isNew: false,
            dirty: false,
            description: scenario.description,
            testType: scenario.testType,
            priority: scenario.priority,
            status: scenario.status,
            testCases: testCaseNodes,
          } satisfies WorkspaceScenario;
        }));
        return {
          key: `requirement-${requirement.id}`,
          id: requirement.id,
          businessId: requirement.requirementId,
          isNew: false,
          dirty: false,
          description: requirement.description,
          priority: requirement.priority,
          status: requirement.status,
          scenarios: scenarioNodes,
        } satisfies WorkspaceRequirement;
      }));

      setRequirements(requirementNodes);
      setDeleted(EMPTY_DELETED);
      setDraftMessage(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load Test Design Workspace.');
    } finally {
      setLoading(false);
    }
  }, [storageKey, testPlanId]);

  useEffect(() => { void loadWorkspace(); }, [loadWorkspace]);

  const changed = useMemo(() => hasChanges(requirements, deleted), [requirements, deleted]);

  useEffect(() => {
    if (!changed) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [changed]);

  const updateRequirement = (key: string, patch: Partial<WorkspaceRequirement>) => {
    setRequirements((current) => current.map((item) => item.key === key ? { ...item, ...patch, dirty: true } : item));
  };

  const updateScenario = (requirementKey: string, scenarioKey: string, patch: Partial<WorkspaceScenario>) => {
    setRequirements((current) => current.map((requirement) => requirement.key !== requirementKey ? requirement : {
      ...requirement,
      scenarios: requirement.scenarios.map((scenario) => scenario.key === scenarioKey ? { ...scenario, ...patch, dirty: true } : scenario),
    }));
  };

  const updateTestCase = (requirementKey: string, scenarioKey: string, testCaseKey: string, patch: Partial<WorkspaceTestCase>) => {
    setRequirements((current) => current.map((requirement) => requirement.key !== requirementKey ? requirement : {
      ...requirement,
      scenarios: requirement.scenarios.map((scenario) => scenario.key !== scenarioKey ? scenario : {
        ...scenario,
        testCases: scenario.testCases.map((testCase) => testCase.key === testCaseKey ? { ...testCase, ...patch, dirty: true } : testCase),
      }),
    }));
  };

  const updateStep = (requirementKey: string, scenarioKey: string, testCaseKey: string, stepKey: string, patch: Partial<WorkspaceStep>) => {
    setRequirements((current) => current.map((requirement) => requirement.key !== requirementKey ? requirement : {
      ...requirement,
      scenarios: requirement.scenarios.map((scenario) => scenario.key !== scenarioKey ? scenario : {
        ...scenario,
        testCases: scenario.testCases.map((testCase) => testCase.key !== testCaseKey ? testCase : {
          ...testCase,
          steps: testCase.steps.map((step) => step.key === stepKey ? { ...step, ...patch, dirty: true } : step),
        }),
      }),
    }));
  };

  const addScenario = (requirementKey: string) => {
    setRequirements((current) => current.map((requirement) => requirement.key === requirementKey
      ? { ...requirement, scenarios: [...requirement.scenarios, newScenario()] }
      : requirement));
  };

  const addTestCase = (requirementKey: string, scenarioKey: string) => {
    setRequirements((current) => current.map((requirement) => requirement.key !== requirementKey ? requirement : {
      ...requirement,
      scenarios: requirement.scenarios.map((scenario) => scenario.key === scenarioKey
        ? { ...scenario, testCases: [...scenario.testCases, newTestCase()] }
        : scenario),
    }));
  };

  const addStep = (requirementKey: string, scenarioKey: string, testCaseKey: string) => {
    setRequirements((current) => current.map((requirement) => requirement.key !== requirementKey ? requirement : {
      ...requirement,
      scenarios: requirement.scenarios.map((scenario) => scenario.key !== scenarioKey ? scenario : {
        ...scenario,
        testCases: scenario.testCases.map((testCase) => testCase.key === testCaseKey
          ? { ...testCase, steps: [...testCase.steps, newStep(testCase.steps.length + 1)] }
          : testCase),
      }),
    }));
  };

  const duplicateRequirement = (key: string) => {
    setRequirements((current) => {
      const index = current.findIndex((item) => item.key === key);
      if (index < 0) return current;
      const next = [...current];
      next.splice(index + 1, 0, copyRequirement(current[index]));
      return next;
    });
  };

  const duplicateScenario = (requirementKey: string, scenarioKey: string) => {
    setRequirements((current) => current.map((requirement) => {
      if (requirement.key !== requirementKey) return requirement;
      const index = requirement.scenarios.findIndex((item) => item.key === scenarioKey);
      if (index < 0) return requirement;
      const scenarios = [...requirement.scenarios];
      scenarios.splice(index + 1, 0, copyScenario(scenarios[index]));
      return { ...requirement, scenarios };
    }));
  };

  const duplicateTestCase = (requirementKey: string, scenarioKey: string, testCaseKey: string) => {
    setRequirements((current) => current.map((requirement) => requirement.key !== requirementKey ? requirement : {
      ...requirement,
      scenarios: requirement.scenarios.map((scenario) => {
        if (scenario.key !== scenarioKey) return scenario;
        const index = scenario.testCases.findIndex((item) => item.key === testCaseKey);
        if (index < 0) return scenario;
        const testCases = [...scenario.testCases];
        testCases.splice(index + 1, 0, copyTestCase(testCases[index]));
        return { ...scenario, testCases };
      }),
    }));
  };

  const duplicateStep = (requirementKey: string, scenarioKey: string, testCaseKey: string, stepKey: string) => {
    setRequirements((current) => current.map((requirement) => requirement.key !== requirementKey ? requirement : {
      ...requirement,
      scenarios: requirement.scenarios.map((scenario) => scenario.key !== scenarioKey ? scenario : {
        ...scenario,
        testCases: scenario.testCases.map((testCase) => {
          if (testCase.key !== testCaseKey) return testCase;
          const source = testCase.steps.find((item) => item.key === stepKey);
          if (!source) return testCase;
          return { ...testCase, steps: [...testCase.steps, copyStep(source, testCase.steps.length + 1)] };
        }),
      }),
    }));
  };

  const deleteRequirement = (requirement: WorkspaceRequirement) => {
    if (!window.confirm('Delete this Requirement and all child Scenarios, Test Cases and Test Steps?')) return;
    const scenarioIds: number[] = [];
    const testCaseIds: number[] = [];
    const stepIds: number[] = [];
    for (const scenario of requirement.scenarios) {
      if (scenario.id) scenarioIds.push(scenario.id);
      for (const testCase of scenario.testCases) {
        if (testCase.id) testCaseIds.push(testCase.id);
        for (const step of testCase.steps) if (step.id) stepIds.push(step.id);
      }
    }
    setDeleted((current) => ({
      requirements: unique([...current.requirements, ...(requirement.id ? [requirement.id] : [])]),
      scenarios: unique([...current.scenarios, ...scenarioIds]),
      testCases: unique([...current.testCases, ...testCaseIds]),
      testSteps: unique([...current.testSteps, ...stepIds]),
    }));
    setRequirements((current) => current.filter((item) => item.key !== requirement.key));
  };

  const deleteScenario = (requirementKey: string, scenario: WorkspaceScenario) => {
    if (!window.confirm('Delete this Scenario and all child Test Cases and Test Steps?')) return;
    const testCaseIds: number[] = [];
    const stepIds: number[] = [];
    for (const testCase of scenario.testCases) {
      if (testCase.id) testCaseIds.push(testCase.id);
      for (const step of testCase.steps) if (step.id) stepIds.push(step.id);
    }
    setDeleted((current) => ({
      ...current,
      scenarios: unique([...current.scenarios, ...(scenario.id ? [scenario.id] : [])]),
      testCases: unique([...current.testCases, ...testCaseIds]),
      testSteps: unique([...current.testSteps, ...stepIds]),
    }));
    setRequirements((current) => current.map((requirement) => requirement.key === requirementKey
      ? { ...requirement, scenarios: requirement.scenarios.filter((item) => item.key !== scenario.key) }
      : requirement));
  };

  const deleteTestCase = (requirementKey: string, scenarioKey: string, testCase: WorkspaceTestCase) => {
    if (!window.confirm('Delete this Test Case and all of its Test Steps?')) return;
    const stepIds = testCase.steps.flatMap((step) => step.id ? [step.id] : []);
    setDeleted((current) => ({
      ...current,
      testCases: unique([...current.testCases, ...(testCase.id ? [testCase.id] : [])]),
      testSteps: unique([...current.testSteps, ...stepIds]),
    }));
    setRequirements((current) => current.map((requirement) => requirement.key !== requirementKey ? requirement : {
      ...requirement,
      scenarios: requirement.scenarios.map((scenario) => scenario.key === scenarioKey
        ? { ...scenario, testCases: scenario.testCases.filter((item) => item.key !== testCase.key) }
        : scenario),
    }));
  };

  const deleteStep = (requirementKey: string, scenarioKey: string, testCaseKey: string, step: WorkspaceStep) => {
    if (step.id && !window.confirm(
      'Delete this Test Step? If it is mapped to an Automation Step, the mapped Automation Step will also be deleted when you Save All. Any previously generated script will then need to be regenerated before execution.',
    )) {
      return;
    }

    if (step.id) {
      setDeleted((current) => ({ ...current, testSteps: unique([...current.testSteps, step.id!]) }));
    }
    setRequirements((current) => current.map((requirement) => requirement.key !== requirementKey ? requirement : {
      ...requirement,
      scenarios: requirement.scenarios.map((scenario) => scenario.key !== scenarioKey ? scenario : {
        ...scenario,
        testCases: scenario.testCases.map((testCase) => testCase.key !== testCaseKey ? testCase : {
          ...testCase,
          steps: testCase.steps
            .filter((item) => item.key !== step.key)
            .map((item, index) => ({ ...item, stepOrder: index + 1, dirty: true })),
        }),
      }),
    }));
  };

  const saveDraft = () => {
    if (!testPlanId || !storageKey) return;
    const draft: WorkspaceDraft = {
      version: 1,
      testPlanId,
      savedAt: new Date().toISOString(),
      requirements,
      deleted,
    };
    localStorage.setItem(storageKey, JSON.stringify(draft));
    setDraftMessage(`Local draft saved at ${new Date().toLocaleString()}.`);
    setMessage('Workspace draft saved locally.');
  };

  const saveAll = async () => {
    if (!testPlanId) return;
    const validationError = validate(requirements);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      for (const id of deleted.testSteps) await testStepApi.deleteTestStep(id);
      for (const id of deleted.testCases) await testCaseApi.deleteTestCase(id);
      for (const id of deleted.scenarios) await testScenarioApi.deleteTestScenario(id);
      for (const id of deleted.requirements) await requirementApi.deleteRequirement(id);

      for (const requirement of requirements) {
        let requirementBusinessId = requirement.businessId;
        if (requirement.isNew) {
          const created = await requirementApi.createRequirement(testPlanId, {
            description: requirement.description.trim(),
            priority: requirement.priority,
            status: requirement.status,
          });
          requirementBusinessId = created.requirementId;
        } else if (requirement.dirty && requirement.id) {
          await requirementApi.updateRequirement(requirement.id, {
            description: requirement.description.trim(),
            priority: requirement.priority,
            status: requirement.status,
          });
        }
        if (!requirementBusinessId) throw new Error('Requirement business ID is unavailable after save.');

        for (const scenario of requirement.scenarios) {
          let scenarioBusinessId = scenario.businessId;
          if (scenario.isNew) {
            const created = await testScenarioApi.createTestScenario(requirementBusinessId, {
              description: scenario.description.trim(),
              testType: scenario.testType,
              priority: scenario.priority,
              status: scenario.status,
            });
            scenarioBusinessId = created.scenarioId;
          } else if (scenario.dirty && scenario.id) {
            await testScenarioApi.updateTestScenario(scenario.id, {
              description: scenario.description.trim(),
              testType: scenario.testType,
              priority: scenario.priority,
              status: scenario.status,
            });
          }
          if (!scenarioBusinessId) throw new Error('Scenario business ID is unavailable after save.');

          for (const testCase of scenario.testCases) {
            let testCaseBusinessId = testCase.businessId;
            const request = {
              name: testCase.name.trim(),
              preconditions: optional(testCase.preconditions),
              testData: optional(testCase.testData),
              expectedResult: testCase.expectedResult.trim(),
              priority: testCase.priority,
              testType: testCase.testType,
              automatable: testCase.automatable,
              automationType: testCase.automationType,
              status: testCase.status,
            };
            if (testCase.isNew) {
              const created = await testCaseApi.createTestCase(scenarioBusinessId, request);
              testCaseBusinessId = created.testCaseId;
            } else if (testCase.dirty && testCase.id) {
              await testCaseApi.updateTestCase(testCase.id, request);
            }
            if (!testCaseBusinessId) throw new Error('Test Case business ID is unavailable after save.');

            for (const step of testCase.steps) {
              if (step.isNew) {
                await testStepApi.createTestStep(testCaseBusinessId, {
                  action: step.action.trim(),
                  target: optional(step.target),
                  inputValue: optional(step.inputValue),
                  expectedResult: optional(step.expectedResult),
                });
              } else if (step.dirty && step.id) {
                await testStepApi.updateTestStep(step.id, {
                  stepOrder: step.stepOrder,
                  action: step.action.trim(),
                  target: optional(step.target),
                  inputValue: optional(step.inputValue),
                  expectedResult: optional(step.expectedResult),
                });
              }
            }
          }
        }
      }

      if (storageKey) localStorage.removeItem(storageKey);
      setDraftMessage(null);
      setMessage('Test Design Workspace saved successfully.');
      await loadWorkspace(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Unable to save Test Design Workspace.');
    } finally {
      setSaving(false);
    }
  };

  const reload = async () => {
    if (changed && !window.confirm('Discard current workspace changes and reload from the backend?')) return;
    if (storageKey) localStorage.removeItem(storageKey);
    setDeleted(EMPTY_DELETED);
    setDraftMessage(null);
    await loadWorkspace(true);
  };

  if (loading && !testPlan) {
    return <Stack minHeight={320} alignItems="center" justifyContent="center" spacing={2}><CircularProgress /><Typography color="text.secondary">Loading Test Design Workspace...</Typography></Stack>;
  }

  if (!testPlan) return <Alert severity="error">{error ?? 'Test Plan not found.'}</Alert>;

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Test Design Workspace"
        description={`${testPlan.name} · ${testPlan.testPlanId}`}
        breadcrumbs={[
          { label: 'Projects', to: '/projects' },
          { label: testPlan.projectName, to: `/projects/${encodeURIComponent(testPlan.projectBusinessId)}` },
          { label: testPlan.name, to: `/test-plans/${encodeURIComponent(testPlan.testPlanId)}` },
          { label: 'Design Workspace' },
        ]}
        actions={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button size="small" startIcon={<ArrowBack />} onClick={() => navigate(`/test-plans/${encodeURIComponent(testPlan.testPlanId)}`)}>Test Plan</Button>
            <Button size="small" startIcon={<Refresh />} disabled={saving} onClick={() => void reload()}>Reload</Button>
            <Button size="small" variant="outlined" startIcon={<Save />} disabled={saving} onClick={saveDraft}>Save Draft</Button>
            <Button size="small" variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />} disabled={saving || !changed} onClick={() => void saveAll()}>{saving ? 'Saving...' : 'Save All'}</Button>
          </Stack>
        }
      />

      {message && <Alert severity="success" onClose={() => setMessage(null)}>{message}</Alert>}
      {draftMessage && <Alert severity="info" onClose={() => setDraftMessage(null)}>{draftMessage}</Alert>}
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Card variant="outlined">
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>Test Design</Typography>
              <Typography variant="body2" color="text.secondary">Author Requirement → Scenario → Test Case → Test Step without leaving this page.</Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={changed ? 'Unsaved changes' : 'Saved'} color={changed ? 'warning' : 'success'} variant="outlined" />
              <Button variant="contained" startIcon={<Add />} onClick={() => setRequirements((current) => [...current, newRequirement()])}>Requirement</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {requirements.length === 0 && (
        <Card variant="outlined"><CardContent><Stack py={5} spacing={2} alignItems="center"><Typography variant="h6" fontWeight={700}>No Requirements</Typography><Typography color="text.secondary">Create the first Requirement and build the complete test design here.</Typography><Button variant="contained" startIcon={<Add />} onClick={() => setRequirements([newRequirement()])}>Create Requirement</Button></Stack></CardContent></Card>
      )}

      {requirements.map((requirement, requirementIndex) => (
        <Card key={requirement.key} variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', md: 'center' }}>
                <Typography variant="h6" fontWeight={700}>Requirement {requirementIndex + 1}</Typography>
                {requirement.businessId && <Chip size="small" label={requirement.businessId} variant="outlined" />}
                {requirement.isNew && <Chip size="small" label="New" color="info" />}
                {requirement.dirty && <Chip size="small" label="Modified" color="warning" variant="outlined" />}
              </Stack>
              <TextField required multiline minRows={2} label="Requirement Description" value={requirement.description} onChange={(e) => updateRequirement(requirement.key, { description: e.target.value })} />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField select label="Requirement Priority" value={requirement.priority} sx={{ minWidth: 160 }} onChange={(e) => updateRequirement(requirement.key, { priority: e.target.value as RequirementPriority })}>{REQUIREMENT_PRIORITIES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
                <TextField select label="Requirement Status" value={requirement.status} sx={{ minWidth: 160 }} onChange={(e) => updateRequirement(requirement.key, { status: e.target.value as RequirementStatus })}>{REQUIREMENT_STATUSES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
              </Stack>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button size="small" startIcon={<Add />} onClick={() => addScenario(requirement.key)}>Scenario</Button>
                <Button size="small" startIcon={<ContentCopy />} onClick={() => duplicateRequirement(requirement.key)}>Duplicate</Button>
                <Button size="small" color="error" startIcon={<Delete />} onClick={() => deleteRequirement(requirement)}>Delete</Button>
              </Stack>

              {requirement.scenarios.map((scenario, scenarioIndex) => (
                <Card key={scenario.key} variant="outlined" sx={{ ml: { xs: 0, md: 2 } }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography fontWeight={700}>Scenario {scenarioIndex + 1}</Typography>
                        {scenario.businessId && <Chip size="small" label={scenario.businessId} variant="outlined" />}
                        {scenario.isNew && <Chip size="small" label="New" color="info" />}
                      </Stack>
                      <TextField required multiline minRows={2} label="Scenario Description" value={scenario.description} onChange={(e) => updateScenario(requirement.key, scenario.key, { description: e.target.value })} />
                      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                        <TextField select label="Test Type" value={scenario.testType} sx={{ minWidth: 180 }} onChange={(e) => updateScenario(requirement.key, scenario.key, { testType: e.target.value as ScenarioTestType })}>{TEST_TYPES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
                        <TextField select label="Scenario Priority" value={scenario.priority} sx={{ minWidth: 160 }} onChange={(e) => updateScenario(requirement.key, scenario.key, { priority: e.target.value as TestScenarioPriority })}>{SCENARIO_PRIORITIES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
                        <TextField select label="Scenario Status" value={scenario.status} sx={{ minWidth: 160 }} onChange={(e) => updateScenario(requirement.key, scenario.key, { status: e.target.value as TestScenarioStatus })}>{SCENARIO_STATUSES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
                      </Stack>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Button size="small" startIcon={<Add />} onClick={() => addTestCase(requirement.key, scenario.key)}>Test Case</Button>
                        <Button size="small" startIcon={<ContentCopy />} onClick={() => duplicateScenario(requirement.key, scenario.key)}>Duplicate</Button>
                        <Button size="small" color="error" startIcon={<Delete />} onClick={() => deleteScenario(requirement.key, scenario)}>Delete</Button>
                      </Stack>

                      {scenario.testCases.map((testCase, testCaseIndex) => (
                        <Card key={testCase.key} variant="outlined" sx={{ ml: { xs: 0, md: 2 }, bgcolor: 'background.default' }}>
                          <CardContent>
                            <Stack spacing={2}>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Typography fontWeight={700}>Test Case {testCaseIndex + 1}</Typography>
                                {testCase.businessId && <Chip size="small" label={testCase.businessId} variant="outlined" />}
                                {testCase.isNew && <Chip size="small" label="New" color="info" />}
                              </Stack>
                              <TextField required label="Test Case Name" value={testCase.name} onChange={(e) => updateTestCase(requirement.key, scenario.key, testCase.key, { name: e.target.value })} />
                              <TextField multiline minRows={2} label="Preconditions" value={testCase.preconditions} onChange={(e) => updateTestCase(requirement.key, scenario.key, testCase.key, { preconditions: e.target.value })} />
                              <TextField multiline minRows={2} label="Test Data" value={testCase.testData} onChange={(e) => updateTestCase(requirement.key, scenario.key, testCase.key, { testData: e.target.value })} />
                              <TextField required multiline minRows={2} label="Expected Result" value={testCase.expectedResult} onChange={(e) => updateTestCase(requirement.key, scenario.key, testCase.key, { expectedResult: e.target.value })} />
                              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                                <TextField select label="Test Case Priority" value={testCase.priority} sx={{ minWidth: 150 }} onChange={(e) => updateTestCase(requirement.key, scenario.key, testCase.key, { priority: e.target.value as TestCasePriority })}>{TEST_CASE_PRIORITIES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
                                <TextField select label="Test Type" value={testCase.testType} sx={{ minWidth: 180 }} onChange={(e) => updateTestCase(requirement.key, scenario.key, testCase.key, { testType: e.target.value as TestCaseTestType })}>{TEST_TYPES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
                                <TextField select label="Test Case Status" value={testCase.status} sx={{ minWidth: 150 }} onChange={(e) => updateTestCase(requirement.key, scenario.key, testCase.key, { status: e.target.value as TestCaseStatus })}>{TEST_CASE_STATUSES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
                              </Stack>
                              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                                <FormControlLabel
                                  control={<Switch checked={testCase.automatable} onChange={(e) => {
                                    const checked = e.target.checked;
                                    updateTestCase(requirement.key, scenario.key, testCase.key, {
                                      automatable: checked,
                                      automationType: checked ? (testCase.automationType === 'MANUAL' ? 'UI' : testCase.automationType) : 'MANUAL',
                                    });
                                  }} />}
                                  label="Automation Eligible"
                                />
                                <TextField select label="Automation Scope" value={testCase.automationType} disabled={!testCase.automatable} sx={{ minWidth: 180 }} onChange={(e) => updateTestCase(requirement.key, scenario.key, testCase.key, { automationType: e.target.value as AutomationType })}>
                                  {AUTOMATION_TYPES.filter((value) => testCase.automatable ? value !== 'MANUAL' : value === 'MANUAL').map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                                </TextField>
                              </Stack>
                              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                <Button size="small" startIcon={<Add />} onClick={() => addStep(requirement.key, scenario.key, testCase.key)}>Test Step</Button>
                                <Button size="small" startIcon={<ContentCopy />} onClick={() => duplicateTestCase(requirement.key, scenario.key, testCase.key)}>Duplicate</Button>
                                <Button size="small" color="error" startIcon={<Delete />} onClick={() => deleteTestCase(requirement.key, scenario.key, testCase)}>Delete</Button>
                              </Stack>
                              <Divider />

                              {testCase.steps.length === 0 && <Typography variant="body2" color="text.secondary">No Test Steps yet.</Typography>}
                              {testCase.steps.map((step, stepIndex) => (
                                <Card key={step.key} variant="outlined" sx={{ ml: { xs: 0, md: 2 } }}>
                                  <CardContent>
                                    <Stack spacing={1.5}>
                                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                        <Chip size="small" label={`Step ${stepIndex + 1}`} />
                                        {step.businessId && <Chip size="small" variant="outlined" label={step.businessId} />}
                                        {step.isNew && <Chip size="small" color="info" label="New" />}
                                      </Stack>
                                      <TextField required multiline minRows={2} label="Action" value={step.action} onChange={(e) => updateStep(requirement.key, scenario.key, testCase.key, step.key, { action: e.target.value })} />
                                      <TextField label="Target (Optional)" value={step.target} onChange={(e) => updateStep(requirement.key, scenario.key, testCase.key, step.key, { target: e.target.value })} />
                                      <TextField multiline minRows={2} label="Input Value (Optional)" value={step.inputValue} onChange={(e) => updateStep(requirement.key, scenario.key, testCase.key, step.key, { inputValue: e.target.value })} />
                                      <TextField multiline minRows={2} label="Expected Result (Optional)" value={step.expectedResult} onChange={(e) => updateStep(requirement.key, scenario.key, testCase.key, step.key, { expectedResult: e.target.value })} />
                                      <Stack direction="row" spacing={1}>
                                        <Button size="small" startIcon={<ContentCopy />} onClick={() => duplicateStep(requirement.key, scenario.key, testCase.key, step.key)}>Duplicate</Button>
                                        <Button size="small" color="error" startIcon={<Delete />} onClick={() => deleteStep(requirement.key, scenario.key, testCase.key, step)}>Delete</Button>
                                      </Stack>
                                    </Stack>
                                  </CardContent>
                                </Card>
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
