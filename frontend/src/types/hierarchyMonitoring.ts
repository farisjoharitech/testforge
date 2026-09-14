export interface MonitoringSummary {
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
}

export interface RequirementMonitoringBreakdown {
    requirementId: number;
    requirementBusinessId: string;
    description: string;
    totalScenarios: number;
    summary: MonitoringSummary;
}

export interface ScenarioMonitoringBreakdown {
    scenarioId: number;
    scenarioBusinessId: string;
    description: string;
    testType: string;
    summary: MonitoringSummary;
}

export interface TestPlanMonitoring {
    testPlanId: number;
    testPlanBusinessId: string;
    testPlanName: string;
    projectBusinessId: string;
    projectName: string;
    totalRequirements: number;
    totalScenarios: number;
    summary: MonitoringSummary;
    requirements: RequirementMonitoringBreakdown[];
}

export interface RequirementMonitoring {
    requirementId: number;
    requirementBusinessId: string;
    description: string;
    testPlanBusinessId: string;
    testPlanName: string;
    totalScenarios: number;
    summary: MonitoringSummary;
    scenarios: ScenarioMonitoringBreakdown[];
}
