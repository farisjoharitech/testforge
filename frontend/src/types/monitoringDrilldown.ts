import type {
    AutomationStatus,
    AutomationType,
    TestCasePriority,
    TestType,
} from './testCase';

export type MonitoringDrilldownStatus =
    | 'ALL'
    | 'PASSED'
    | 'FAILED'
    | 'TIMED_OUT'
    | 'ERROR'
    | 'NEEDS_ATTENTION'
    | 'NOT_RUN'
    | 'MANUAL';

export type MonitoringScopeType =
    | 'project'
    | 'test-plan'
    | 'requirement';

export interface MonitoringDrilldownItem {
    testCaseId: number;
    testCaseBusinessId: string;
    testCaseName: string;
    priority: TestCasePriority;
    testType: TestType;
    automatable: boolean;
    automationType: AutomationType;
    automationStatus: AutomationStatus;
    testPlanBusinessId: string;
    testPlanName: string;
    requirementBusinessId: string;
    requirementDescription: string;
    scenarioBusinessId: string;
    scenarioDescription: string;
    currentResult: Exclude<
        MonitoringDrilldownStatus,
        'ALL' | 'NEEDS_ATTENTION'
    >;
    executionId: string | null;
    startedAt: string | null;
    finishedAt: string | null;
    durationMs: number | null;
    errorMessage: string | null;
}

export interface MonitoringDrilldown {
    scopeType: 'PROJECT' | 'TEST_PLAN' | 'REQUIREMENT';
    scopeBusinessId: string;
    scopeName: string;
    filter: MonitoringDrilldownStatus;
    totalCount: number;
    testCases: MonitoringDrilldownItem[];
}
