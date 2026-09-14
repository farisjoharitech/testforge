export type TestScenarioPriority =
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL';

export type TestScenarioStatus =
    | 'DRAFT'
    | 'ACTIVE'
    | 'APPROVED'
    | 'REJECTED'
    | 'ARCHIVED';

export type TestType =
    | 'SMOKE'
    | 'SANITY'
    | 'REGRESSION'
    | 'FUNCTIONAL'
    | 'INTEGRATION'
    | 'END_TO_END'
    | 'POSITIVE'
    | 'NEGATIVE';

export interface CreateTestScenarioRequest {
  scenarioId: string;
  description: string;
  testType: TestType;
  priority: TestScenarioPriority;
  status: TestScenarioStatus;
}

export interface UpdateTestScenarioRequest {
  description: string;
  testType: TestType;
  priority: TestScenarioPriority;
  status: TestScenarioStatus;
}

export interface TestScenario {
  id: number;
  scenarioId: string;
  requirementId: number;
  requirementBusinessId: string;
  description: string;
  testType: TestType;
  priority: TestScenarioPriority;
  status: TestScenarioStatus;
  createdAt: string;
  updatedAt: string;
}