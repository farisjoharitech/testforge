import type { AutomationResultStatus } from './automationResult';
import type { AutomationRunStatus, AutomationRunType } from './automation';

export interface DashboardSummary {
  totalTestCases: number;
  automatableTestCases: number;
  automatedTestCases: number;
  automationCoveragePercentage: number;
  totalAutomationScripts: number;
  generatedScripts: number;
}

export interface ExecutionStatusSummary {
  totalExecutions: number;
  passed: number;
  failed: number;
  timedOut: number;
  errors: number;
  passRatePercentage: number;
}

export interface AutomationTypeSummary {
  ui: number;
  api: number;
  uiApi: number;
  totalAutomatable: number;
}

export interface RecentExecution {
  executionId: string;
  testCaseId: number;
  testCaseBusinessId: string;
  testCaseName: string;
  automationScriptBusinessId: string;
  status: AutomationResultStatus;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
}

export interface PortfolioProject {
  projectId: string;
  projectName: string;
  totalTestPlans: number;
  totalTestCases: number;
  automatableTestCases: number;
  automatedTestCases: number;
  automationCoveragePercentage: number;
  passedTestCases: number;
  needsAttentionTestCases: number;
  notRunTestCases: number;
  passRatePercentage: number;
}

export interface PortfolioTestPlanAttention {
  projectId: string;
  projectName: string;
  testPlanId: number;
  testPlanBusinessId: string;
  testPlanName: string;
  totalTestCases: number;
  needsAttentionTestCases: number;
  notRunTestCases: number;
  automationCoveragePercentage: number;
  passRatePercentage: number;
}

export interface RecentAutomationRun {
  id: number;
  runId: string;
  runType: AutomationRunType;
  status: AutomationRunStatus;
  totalExecutions: number;
  completedExecutions: number;
  passedExecutions: number;
  failedExecutions: number;
  startedAt: string;
  finishedAt?: string | null;
  durationMs?: number | null;
}

export interface PortfolioDashboard {
  totalProjects: number;
  totalTestPlans: number;
  projectsNeedingAttention: number;
  testPlansNeedingAttention: number;
  projects: PortfolioProject[];
  testPlansNeedingAttentionList: PortfolioTestPlanAttention[];
  recentRuns: RecentAutomationRun[];
}
