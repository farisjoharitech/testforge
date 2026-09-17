import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowBack,
} from '@mui/icons-material';

import {
  Box,
  Breadcrumbs,
  Button,
  Link as MuiLink,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

import {
  Link as RouterLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  automationApi,
} from '../../api/automationApi';

import {
  automationResultApi,
} from '../../api/automationResultApi';

import {
  projectApi,
} from '../../api/projectApi';

import {
  requirementApi,
} from '../../api/requirementApi';

import {
  testCaseApi,
} from '../../api/testCaseApi';

import {
  testPlanApi,
} from '../../api/testPlanApi';

import {
  testScenarioApi,
} from '../../api/testScenarioApi';

import {
  testSetApi,
} from '../../api/testSetApi';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface HierarchyContext {
  projectName: string;
  projectBusinessId: string;
  testPlanName: string;
  testPlanBusinessId: string;
  requirementBusinessId?: string;
  scenarioBusinessId?: string;
  testCaseBusinessId?: string;
}

function enc(value: string): string {
  return encodeURIComponent(value);
}

function projectCrumbs(
  projectName: string,
  projectBusinessId: string,
): BreadcrumbItem[] {
  return [
    {
      label: 'Projects',
      to: '/projects',
    },
    {
      label: projectName,
      to: `/projects/${enc(projectBusinessId)}`,
    },
  ];
}

function hierarchyCrumbs(
  context: HierarchyContext,
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    ...projectCrumbs(
      context.projectName,
      context.projectBusinessId,
    ),
    {
      label: context.testPlanName,
      to: `/test-plans/${enc(context.testPlanBusinessId)}`,
    },
  ];

  if (context.requirementBusinessId) {
    items.push({
      label: context.requirementBusinessId,
      to: `/requirements/${enc(context.requirementBusinessId)}`,
    });
  }

  if (context.scenarioBusinessId) {
    items.push({
      label: context.scenarioBusinessId,
      to: `/scenarios/${enc(context.scenarioBusinessId)}`,
    });
  }

  if (context.testCaseBusinessId) {
    items.push({
      label: context.testCaseBusinessId,
      to: `/test-cases/${enc(context.testCaseBusinessId)}`,
    });
  }

  return items;
}

async function loadPlanHierarchy(
  testPlanBusinessId: string,
): Promise<HierarchyContext> {
  const testPlan = await testPlanApi.getTestPlanByBusinessId(
    testPlanBusinessId,
  );

  const project = await projectApi.getProjectByBusinessId(
    testPlan.projectBusinessId,
  );

  return {
    projectName: project.name,
    projectBusinessId: project.projectId,
    testPlanName: testPlan.name,
    testPlanBusinessId: testPlan.testPlanId,
  };
}

async function loadRequirementHierarchy(
  requirementBusinessId: string,
): Promise<HierarchyContext> {
  const requirement = await requirementApi.getRequirementByBusinessId(
    requirementBusinessId,
  );

  const context = await loadPlanHierarchy(
    requirement.testPlanBusinessId,
  );

  return {
    ...context,
    requirementBusinessId: requirement.requirementId,
  };
}

async function loadScenarioHierarchy(
  scenarioBusinessId: string,
): Promise<HierarchyContext> {
  const scenario = await testScenarioApi.getTestScenarioByBusinessId(
    scenarioBusinessId,
  );

  const context = await loadRequirementHierarchy(
    scenario.requirementBusinessId,
  );

  return {
    ...context,
    scenarioBusinessId: scenario.scenarioId,
  };
}

async function loadTestCaseHierarchy(
  testCaseBusinessId: string,
): Promise<HierarchyContext> {
  const testCase = await testCaseApi.getTestCaseByBusinessId(
    testCaseBusinessId,
  );

  const context = await loadScenarioHierarchy(
    testCase.scenarioBusinessId,
  );

  return {
    ...context,
    testCaseBusinessId: testCase.testCaseId,
  };
}

function staticCrumbs(
  pathname: string,
): BreadcrumbItem[] {
  if (pathname === '/projects') {
    return [{ label: 'Projects' }];
  }

  if (pathname === '/projects/new') {
    return [
      { label: 'Projects', to: '/projects' },
      { label: 'New Project' },
    ];
  }

  if (pathname === '/test-plans') {
    return [{ label: 'Test Plans' }];
  }

  if (pathname === '/test-plans/new') {
    return [
      { label: 'Test Plans', to: '/test-plans' },
      { label: 'New Test Plan' },
    ];
  }

  if (pathname === '/test-sets') {
    return [{ label: 'Test Sets' }];
  }

  if (pathname === '/test-sets/new') {
    return [
      { label: 'Test Sets', to: '/test-sets' },
      { label: 'New Test Set' },
    ];
  }

  if (pathname === '/automation') {
    return [{ label: 'Automation' }];
  }

  if (pathname === '/automation/multi-run') {
    return [
      { label: 'Automation', to: '/automation' },
      { label: 'Run Multiple' },
    ];
  }

  if (pathname === '/results') {
    return [{ label: 'Results' }];
  }

  if (pathname === '/dashboard') {
    return [{ label: 'Dashboard' }];
  }

  const monitoring = pathname.match(
    /^\/monitoring\/([^/]+)\/([^/]+)\/test-cases$/,
  );

  if (monitoring) {
    return [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Monitoring' },
      {
        label: `${decodeURIComponent(monitoring[1]).replaceAll('_', ' ')} · ${decodeURIComponent(monitoring[2])}`,
      },
    ];
  }

  const project = pathname.match(
    /^\/projects\/([^/]+)$/,
  );

  if (project) {
    return [
      { label: 'Projects', to: '/projects' },
      { label: decodeURIComponent(project[1]) },
    ];
  }

  const planDesign = pathname.match(
    /^\/test-plans\/([^/]+)\/design$/,
  );

  if (planDesign) {
    return [
      { label: 'Test Plans', to: '/test-plans' },
      {
        label: decodeURIComponent(planDesign[1]),
        to: `/test-plans/${planDesign[1]}`,
      },
      { label: 'Design Workspace' },
    ];
  }

  const plan = pathname.match(
    /^\/test-plans\/([^/]+)$/,
  );

  if (plan) {
    return [
      { label: 'Test Plans', to: '/test-plans' },
      { label: decodeURIComponent(plan[1]) },
    ];
  }

  const requirement = pathname.match(
    /^\/requirements\/([^/]+)$/,
  );

  if (requirement) {
    return [
      { label: 'Test Plans', to: '/test-plans' },
      { label: decodeURIComponent(requirement[1]) },
    ];
  }

  const scenario = pathname.match(
    /^\/scenarios\/([^/]+)$/,
  );

  if (scenario) {
    return [
      { label: 'Test Plans', to: '/test-plans' },
      { label: decodeURIComponent(scenario[1]) },
    ];
  }

  const testCase = pathname.match(
    /^\/test-cases\/([^/]+)$/,
  );

  if (testCase) {
    return [
      { label: 'Test Plans', to: '/test-plans' },
      { label: decodeURIComponent(testCase[1]) },
    ];
  }

  const testSetEdit = pathname.match(
    /^\/test-sets\/(\d+)\/edit$/,
  );

  if (testSetEdit) {
    return [
      { label: 'Test Sets', to: '/test-sets' },
      {
        label: `Test Set ${testSetEdit[1]}`,
        to: `/test-sets/${testSetEdit[1]}`,
      },
      { label: 'Edit' },
    ];
  }

  const testSet = pathname.match(
    /^\/test-sets\/(\d+)$/,
  );

  if (testSet) {
    return [
      { label: 'Test Sets', to: '/test-sets' },
      { label: `Test Set ${testSet[1]}` },
    ];
  }

  const run = pathname.match(
    /^\/automation\/runs\/(\d+)$/,
  );

  if (run) {
    return [
      { label: 'Automation', to: '/automation' },
      { label: `Run ${run[1]}` },
    ];
  }

  const script = pathname.match(
    /^\/automation\/([^/]+)\/script$/,
  );

  if (script) {
    return [
      { label: 'Automation', to: '/automation' },
      {
        label: decodeURIComponent(script[1]),
        to: `/automation/${script[1]}`,
      },
      { label: 'Script Generation' },
    ];
  }

  const execute = pathname.match(
    /^\/automation\/([^/]+)\/execute$/,
  );

  if (execute) {
    return [
      { label: 'Automation', to: '/automation' },
      {
        label: decodeURIComponent(execute[1]),
        to: `/automation/${execute[1]}`,
      },
      { label: 'Execute' },
    ];
  }

  const automation = pathname.match(
    /^\/automation\/([^/]+)$/,
  );

  if (automation) {
    return [
      { label: 'Automation', to: '/automation' },
      { label: decodeURIComponent(automation[1]) },
    ];
  }

  const result = pathname.match(
    /^\/results\/([^/]+)$/,
  );

  if (result) {
    return [
      { label: 'Results', to: '/results' },
      { label: decodeURIComponent(result[1]) },
    ];
  }

  return [];
}

async function resolveCrumbs(
  pathname: string,
): Promise<BreadcrumbItem[]> {
  const projectMatch = pathname.match(
    /^\/projects\/([^/]+)$/,
  );

  if (
    projectMatch
    && projectMatch[1] !== 'new'
  ) {
    const project = await projectApi.getProjectByBusinessId(
      decodeURIComponent(projectMatch[1]),
    );

    return [
      { label: 'Projects', to: '/projects' },
      { label: project.name },
    ];
  }

  const planDesignMatch = pathname.match(
    /^\/test-plans\/([^/]+)\/design$/,
  );

  if (planDesignMatch) {
    const context = await loadPlanHierarchy(
      decodeURIComponent(planDesignMatch[1]),
    );

    const items = hierarchyCrumbs(context);
    const planItem = items[items.length - 1];

    return [
      ...items.slice(0, -1),
      planItem,
      { label: 'Design Workspace' },
    ];
  }

  const planMatch = pathname.match(
    /^\/test-plans\/([^/]+)$/,
  );

  if (
    planMatch
    && planMatch[1] !== 'new'
  ) {
    const context = await loadPlanHierarchy(
      decodeURIComponent(planMatch[1]),
    );

    const items = hierarchyCrumbs(context);
    return items.map((item, index) => (
      index === items.length - 1
        ? { label: item.label }
        : item
    ));
  }

  const requirementMatch = pathname.match(
    /^\/requirements\/([^/]+)$/,
  );

  if (requirementMatch) {
    const context = await loadRequirementHierarchy(
      decodeURIComponent(requirementMatch[1]),
    );

    const items = hierarchyCrumbs(context);
    return items.map((item, index) => (
      index === items.length - 1
        ? { label: item.label }
        : item
    ));
  }

  const scenarioMatch = pathname.match(
    /^\/scenarios\/([^/]+)$/,
  );

  if (scenarioMatch) {
    const context = await loadScenarioHierarchy(
      decodeURIComponent(scenarioMatch[1]),
    );

    const items = hierarchyCrumbs(context);
    return items.map((item, index) => (
      index === items.length - 1
        ? { label: item.label }
        : item
    ));
  }

  const testCaseMatch = pathname.match(
    /^\/test-cases\/([^/]+)$/,
  );

  if (testCaseMatch) {
    const context = await loadTestCaseHierarchy(
      decodeURIComponent(testCaseMatch[1]),
    );

    const items = hierarchyCrumbs(context);
    return items.map((item, index) => (
      index === items.length - 1
        ? { label: item.label }
        : item
    ));
  }

  const scriptMatch = pathname.match(
    /^\/automation\/([^/]+)\/script$/,
  );

  if (scriptMatch) {
    const testCaseId = decodeURIComponent(scriptMatch[1]);
    const context = await loadTestCaseHierarchy(testCaseId);

    return [
      ...hierarchyCrumbs(context),
      {
        label: 'Automation',
        to: `/automation/${enc(testCaseId)}`,
      },
      { label: 'Script Generation' },
    ];
  }

  const executeMatch = pathname.match(
    /^\/automation\/([^/]+)\/execute$/,
  );

  if (executeMatch) {
    const testCaseId = decodeURIComponent(executeMatch[1]);
    const context = await loadTestCaseHierarchy(testCaseId);

    return [
      ...hierarchyCrumbs(context),
      {
        label: 'Automation',
        to: `/automation/${enc(testCaseId)}`,
      },
      { label: 'Execute' },
    ];
  }

  const automationMatch = pathname.match(
    /^\/automation\/([^/]+)$/,
  );

  if (
    automationMatch
    && automationMatch[1] !== 'multi-run'
    && automationMatch[1] !== 'runs'
  ) {
    const testCaseId = decodeURIComponent(automationMatch[1]);
    const context = await loadTestCaseHierarchy(testCaseId);

    return [
      ...hierarchyCrumbs(context),
      { label: 'Automation' },
    ];
  }

  const runMatch = pathname.match(
    /^\/automation\/runs\/(\d+)$/,
  );

  if (runMatch) {
    const run = await automationApi.getRun(
      Number(runMatch[1]),
    );

    return [
      { label: 'Automation', to: '/automation' },
      { label: run.runId },
    ];
  }

  const resultMatch = pathname.match(
    /^\/results\/([^/]+)$/,
  );

  if (resultMatch) {
    const result = await automationResultApi.getResult(
      decodeURIComponent(resultMatch[1]),
    );

    const context = await loadTestCaseHierarchy(
      result.testCaseBusinessId,
    );

    return [
      ...hierarchyCrumbs(context),
      { label: 'Results', to: '/results' },
      { label: result.executionId },
    ];
  }

  const testSetEditMatch = pathname.match(
    /^\/test-sets\/(\d+)\/edit$/,
  );

  if (testSetEditMatch) {
    const testSet = await testSetApi.getById(
      Number(testSetEditMatch[1]),
    );

    return [
      { label: 'Test Sets', to: '/test-sets' },
      {
        label: testSet.name,
        to: `/test-sets/${testSet.id}`,
      },
      { label: 'Edit' },
    ];
  }

  const testSetMatch = pathname.match(
    /^\/test-sets\/(\d+)$/,
  );

  if (testSetMatch) {
    const testSet = await testSetApi.getById(
      Number(testSetMatch[1]),
    );

    const context = await loadPlanHierarchy(
      testSet.testPlanBusinessId,
    );

    return [
      { label: 'Test Sets', to: '/test-sets' },
      {
        label: context.testPlanName,
        to: `/test-plans/${enc(context.testPlanBusinessId)}`,
      },
      { label: testSet.name },
    ];
  }

  return staticCrumbs(pathname);
}

export default function AppBreadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();

  const fallback = useMemo(
    () => staticCrumbs(location.pathname),
    [location.pathname],
  );

  const [items, setItems] = useState<BreadcrumbItem[]>(
    fallback,
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setItems(fallback);
    setLoading(true);

    void resolveCrumbs(location.pathname)
      .then((resolved) => {
        if (!cancelled) {
          setItems(resolved);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems(fallback);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fallback, location.pathname]);

  if (items.length === 0) {
    return null;
  }

  const parent = [...items]
    .slice(0, -1)
    .reverse()
    .find((item) => Boolean(item.to));

  return (
    <Box
      component="nav"
      aria-label="Page navigation"
      sx={{
        mb: 2.25,
        pb: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.25}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        {parent?.to && (
          <Button
            size="small"
            color="inherit"
            startIcon={<ArrowBack />}
            onClick={() => navigate(parent.to!)}
            sx={{
              flexShrink: 0,
              color: 'text.secondary',
            }}
          >
            Back
          </Button>
        )}

        <Breadcrumbs
          maxItems={7}
          itemsBeforeCollapse={2}
          itemsAfterCollapse={3}
          aria-label="breadcrumb"
          sx={{
            minWidth: 0,
            color: 'text.secondary',
            '& .MuiBreadcrumbs-ol': {
              flexWrap: 'wrap',
            },
          }}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            if (item.to && !isLast) {
              return (
                <MuiLink
                  key={`${item.label}-${index}`}
                  component={RouterLink}
                  to={item.to}
                  underline="hover"
                  color="inherit"
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {item.label}
                </MuiLink>
              );
            }

            return (
              <Typography
                key={`${item.label}-${index}`}
                variant="body2"
                color={isLast ? 'text.primary' : 'text.secondary'}
                fontWeight={isLast ? 700 : 500}
                sx={{
                  overflowWrap: 'anywhere',
                }}
              >
                {item.label}
              </Typography>
            );
          })}
        </Breadcrumbs>

        {loading && (
          <Skeleton
            width={42}
            height={18}
            sx={{ flexShrink: 0 }}
          />
        )}
      </Stack>
    </Box>
  );
}
