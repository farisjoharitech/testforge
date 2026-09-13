import {
  apiClient,
} from './apiClient';

import type {
  CreateTestStepRequest,
  TestStep,
  UpdateTestStepRequest,
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

  updateTestStep(
    id: number,
    request: UpdateTestStepRequest,
  ): Promise<TestStep> {
    return apiClient.put<
      TestStep,
      UpdateTestStepRequest
    >(
      `/api/test-steps/${id}`,
      request,
    );
  },

  deleteTestStep(
    id: number,
  ): Promise<void> {
    return apiClient.delete<void>(
      `/api/test-steps/${id}`,
    );
  },
};