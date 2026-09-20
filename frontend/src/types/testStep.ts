import type { UpdateAutomationStepRequest } from './automation';

export interface TestStepAutomationChange {
  configuration?: UpdateAutomationStepRequest;
  removeExisting?: boolean;
  expectedAutomationStepId?: number;
}

export interface CreateTestStepRequest {
  automation?: TestStepAutomationChange;
  action: string;
  target?: string;
  inputValue?: string;
  expectedResult?: string;
}

export interface UpdateTestStepRequest {
  automation?: TestStepAutomationChange;
  stepOrder: number;
  action: string;
  target?: string;
  inputValue?: string;
  expectedResult?: string;
}

export interface TestStep {
  id: number;
  testStepId: string;
  testCaseId: number;
  testCaseBusinessId: string;
  stepOrder: number;
  action: string;
  target?: string | null;
  inputValue?: string | null;
  expectedResult?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TestStepDeleteImpact {
  testStepId: number;
  testStepBusinessId: string;
  mappedAutomationStepCount: number;
  affectedAutomationScriptCount: number;
  generatedScriptWillBecomeStale: boolean;
}
