export interface CreateTestStepRequest {
  testStepId: string;

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