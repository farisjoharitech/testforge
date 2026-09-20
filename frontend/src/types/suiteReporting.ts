import type { SuiteRunStatus } from './testSuite';
export interface SuiteReportSummary { testSuiteId:number; suiteName:string; latestStatus?:SuiteRunStatus|null; total:number; passed:number; failed:number; skipped:number; passPercentage?:number|null; durationMs?:number|null; latestExecutionTime?:string|null; latestRunId?:number|null; }
export interface SuiteRunHistory { id:number; status:SuiteRunStatus; startedAt:string; completedAt?:string|null; durationMs?:number|null; total:number; passed:number; failed:number; skipped:number; }
export interface SuiteStepResult { testStepId:string; action:string; stepOrder:number; status:SuiteRunStatus; failureDetails?:string|null; screenshotPath?:string|null; artifactReference?:string|null; }
export interface SuiteCaseResult { testCaseId:string; name:string; status:SuiteRunStatus; durationMs?:number|null; failureDetails?:string|null; assertionFailureDetails?:string|null; screenshotPath?:string|null; artifactDirectory?:string|null; tracePath?:string|null; steps:SuiteStepResult[]; }
export interface SuiteScenarioResult { scenarioId:string; description?:string|null; status:SuiteRunStatus; testCases:SuiteCaseResult[]; }
export interface SuiteRunDetail extends SuiteRunHistory { projectId:number; projectBusinessId:string; testSuiteId:number; testSuiteName:string; errorDetails?:string|null; scenarios:SuiteScenarioResult[]; }
