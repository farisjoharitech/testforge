import {
  apiClient,
} from './apiClient';

import type {
  CreateTestPlanRequest,
  TestPlan,
  UpdateTestPlanRequest,
} from '../types/testPlan';

export const testPlanApi = {
  getTestPlans(): Promise<TestPlan[]> {
    return apiClient.get<TestPlan[]>(
      '/api/test-plans',
    );
  },

  getTestPlan(
    id: number,
  ): Promise<TestPlan> {
    return apiClient.get<TestPlan>(
      `/api/test-plans/${id}`,
    );
  },

  getTestPlanByBusinessId(
    testPlanId: string,
  ): Promise<TestPlan> {
    return apiClient.get<TestPlan>(
      `/api/test-plans/business/${encodeURIComponent(
        testPlanId,
      )}`,
    );
  },

  createTestPlan(
    request: CreateTestPlanRequest,
  ): Promise<TestPlan> {
    return apiClient.post<
      TestPlan,
      CreateTestPlanRequest
    >(
      '/api/test-plans',
      request,
    );
  },

  updateTestPlan(
    id: number,
    request: UpdateTestPlanRequest,
  ): Promise<TestPlan> {
    return apiClient.put<
      TestPlan,
      UpdateTestPlanRequest
    >(
      `/api/test-plans/${id}`,
      request,
    );
  },

  deleteTestPlan(
    id: number,
  ): Promise<void> {
    return apiClient.delete<void>(
      `/api/test-plans/${id}`,
    );
  },
};