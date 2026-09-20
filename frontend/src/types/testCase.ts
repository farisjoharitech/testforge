export type TestCasePriority =
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL';

export type TestCaseStatus =
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

export type AutomationType =
    | 'MANUAL'
    | 'UI'
    | 'API'
    | 'UI_API';

export type AutomationStatus =
    | 'NOT_APPLICABLE'
    | 'NOT_AUTOMATED'
    | 'SCRIPT_GENERATED'
    | 'READY'
    | 'RUNNING'
    | 'AUTOMATED';

export interface CreateTestCaseRequest {

  name: string;

  preconditions?: string;

  testData?: string;

  expectedResult: string;

  priority: TestCasePriority;

  testType: TestType;

  automationType:
      AutomationType;

  status: TestCaseStatus;
}

export interface UpdateTestCaseRequest {
  name: string;

  preconditions?: string;

  testData?: string;

  expectedResult: string;

  priority: TestCasePriority;

  testType: TestType;

  automationType:
      AutomationType;

  status: TestCaseStatus;
}

export interface TestCase {
  id: number;

  testCaseId: string;

  scenarioId: number;

  scenarioBusinessId:
      string;

  name: string;

  preconditions?:
      string | null;

  testData?:
      string | null;

  expectedResult: string;

  priority:
      TestCasePriority;

  testType:
      TestType;

  automatable:
      boolean;

  automationType:
      AutomationType;

  /*
   * Read-only lifecycle state
   * from the backend.
   *
   * Normal Test Case CRUD
   * must not control this value.
   */
  automationStatus:
      AutomationStatus;

  status:
      TestCaseStatus;

  createdAt:
      string;

  updatedAt:
      string;
}
