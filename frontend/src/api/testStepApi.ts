import {
  apiClient,
} from './apiClient';

import type {
  CreateTestStepRequest,
  TestStep,
} from '../types/testStep';

export const testStepApi = {
  getByTestCase(
    testCaseId: string,
  ): Promise<TestStep[]> {
    return apiClient.get<TestStep[]>(
      `/api/test-cases/${encodeURIComponent(
        testCaseId,
      )}/steps`,
    );
  },

  createTestStep(
    testCaseId: string,
    request: CreateTestStepRequest,
  ): Promise<TestStep> {
    return apiClient.post<
      TestStep,
      CreateTestStepRequest
    >(
      `/api/test-cases/${encodeURIComponent(
        testCaseId,
      )}/steps`,
      request,
    );
  },

  getTestStep(
    id: number,
  ): Promise<TestStep> {
    return apiClient.get<TestStep>(
      `/api/test-steps/${id}`,
    );
  },

  getTestStepByBusinessId(
    testStepId: string,
  ): Promise<TestStep> {
    return apiClient.get<TestStep>(
      `/api/test-steps/business/${encodeURIComponent(
        testStepId,
      )}`,
    );
  },
};