import type {
  AutomationStatus,
  AutomationType,
} from './testCase';

export interface TestSetMember {
  id: number;
  testCaseId: number;
  testCaseBusinessId: string;
  testCaseName: string;
  scenarioId: number;
  scenarioBusinessId: string;
  automationType: AutomationType;
  automationStatus: AutomationStatus;
  itemOrder: number;
}

export interface TestSet {
  id: number;
  testSetId: string;
  testPlanId: number;
  testPlanBusinessId: string;
  testPlanName: string;
  name: string;
  description?: string | null;
  memberCount: number;
  members: TestSetMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TestSetCandidate {
  id: number;
  testCaseId: string;
  name: string;
  scenarioId: number;
  scenarioBusinessId: string;
  automationType: AutomationType;
  automationStatus: AutomationStatus;
}

export interface CreateTestSetRequest {
  testPlanId: number;
  name: string;
  description?: string | null;
  testCaseIds: number[];
}

export interface UpdateTestSetRequest {
  name: string;
  description?: string | null;
  testCaseIds: number[];
}
