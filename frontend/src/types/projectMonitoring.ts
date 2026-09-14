export type ProjectMonitoringExecutionStatus =
    | 'PASSED'
    | 'FAILED'
    | 'TIMED_OUT'
    | 'ERROR';

export interface ProjectMonitoringExecution {
    id: number;
    executionId: string;
    testCaseId: number;
    testCaseBusinessId: string;
    testCaseName: string;
    testPlanBusinessId: string;
    testPlanName: string;
    status: ProjectMonitoringExecutionStatus;
    startedAt: string;
    finishedAt: string | null;
    durationMs: number | null;
}

export interface ProjectTestPlanMonitoring {
    testPlanId: number;
    testPlanBusinessId: string;
    testPlanName: string;
    totalTestCases: number;
    automatableTestCases: number;
    automatedTestCases: number;
    automationCoveragePercentage: number;
    passedTestCases: number;
    needsAttentionTestCases: number;
    notRunTestCases: number;
    manualTestCases: number;
    passRatePercentage: number;
}

export interface ProjectNeedsAttention {
    testCaseId: number;
    testCaseBusinessId: string;
    testCaseName: string;
    testPlanBusinessId: string;
    testPlanName: string;
    automationType: 'UI' | 'API' | 'UI_API';
    status: Exclude<
        ProjectMonitoringExecutionStatus,
        'PASSED'
    >;
    executionId: string;
    startedAt: string;
    durationMs: number | null;
    errorMessage: string | null;
}

export interface ProjectMonitoring {
    projectId: string;
    projectName: string;
    totalTestPlans: number;
    totalTestCases: number;
    automatableTestCases: number;
    automatedTestCases: number;
    automationCoveragePercentage: number;
    passedTestCases: number;
    failedTestCases: number;
    timedOutTestCases: number;
    errorTestCases: number;
    needsAttentionTestCases: number;
    notRunTestCases: number;
    manualTestCases: number;
    currentCompletedTestCases: number;
    passRatePercentage: number;
    latestPassedExecution: ProjectMonitoringExecution | null;
    latestFailedExecution: ProjectMonitoringExecution | null;
    latestNeedsAttentionExecution: ProjectMonitoringExecution | null;
    testPlans: ProjectTestPlanMonitoring[];
    needsAttention: ProjectNeedsAttention[];
}
