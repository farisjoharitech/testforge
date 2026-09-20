export interface AuthoringDeleteImpact {
  entityType: 'REQUIREMENT' | 'SCENARIO' | 'TEST_CASE';
  entityId: number;
  businessId: string;
  scenarioCount: number;
  testCaseCount: number;
  testStepCount: number;
  automationScriptCount: number;
  automationStepCount: number;
  testSuiteMembershipCount: number;
  historicalExecutionCount: number;
  historicalExecutionsPreserved: boolean;
  blockingDependencies: string[];
}
