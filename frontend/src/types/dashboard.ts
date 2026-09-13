import type {
  AutomationResultStatus,
} from './automationResult';

export interface DashboardSummary {
  totalTestCases: number;

  automatableTestCases: number;

  automatedTestCases: number;

  automationCoveragePercentage:
    number;

  totalAutomationScripts:
    number;

  generatedScripts:
    number;
}

export interface ExecutionStatusSummary {
  totalExecutions:
    number;

  passed:
    number;

  failed:
    number;

  timedOut:
    number;

  errors:
    number;

  passRatePercentage:
    number;
}

export interface AutomationTypeSummary {
  ui:
    number;

  api:
    number;

  uiApi:
    number;

  totalAutomatable:
    number;
}

export interface RecentExecution {
  executionId:
    string;

  testCaseId:
    number;

  testCaseBusinessId:
    string;

  testCaseName:
    string;

  automationScriptBusinessId:
    string;

  status:
    AutomationResultStatus;

  startedAt:
    string;

  finishedAt:
    | string
    | null;

  durationMs:
    | number
    | null;
}