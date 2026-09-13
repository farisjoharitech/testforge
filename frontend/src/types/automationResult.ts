import type {
  AutomationExecutionStatus,
} from './automation';

export type AutomationResultStatus =
  Exclude<
    AutomationExecutionStatus,
    'RUNNING'
  >;

export interface AutomationResultSummary {
  id: number;

  executionId: string;

  automationScriptId: number;

  automationScriptBusinessId: string;

  testCaseId: number;

  testCaseBusinessId: string;

  testCaseName: string;

  status: AutomationResultStatus;

  generatedClassName:
    | string
    | null;

  exitCode:
    | number
    | null;

  startedAt: string;

  finishedAt:
    | string
    | null;

  durationMs:
    | number
    | null;

  successful: boolean;
}

export interface AutomationResult {
  id: number;

  executionId: string;

  automationScriptId: number;

  automationScriptBusinessId: string;

  testCaseId: number;

  testCaseBusinessId: string;

  testCaseName: string;

  status: AutomationResultStatus;

  generatedClassName:
    | string
    | null;

  generatedAt:
    | string
    | null;

  exitCode:
    | number
    | null;

  logOutput:
    | string
    | null;

  errorMessage:
    | string
    | null;

  startedAt: string;

  finishedAt:
    | string
    | null;

  durationMs:
    | number
    | null;

  successful: boolean;
}