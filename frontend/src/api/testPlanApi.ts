import {
  apiClient,
} from './apiClient';

import type {
  CreateTestPlanRequest,
  TestPlan,
} from '../types/testPlan';

export const testPlanApi = {
  getTestPlans():
    Promise<TestPlan[]> {
    return apiClient.get<
      TestPlan[]
    >(
      '/api/test-plans',
    );
  },

  getTestPlan(
    id: number,
  ): Promise<TestPlan> {
    return apiClient.get<
      TestPlan
    >(
      `/api/test-plans/${id}`,
    );
  },

  getTestPlanByBusinessId(
    testPlanId: string,
  ): Promise<TestPlan> {
    return apiClient.get<
      TestPlan
    >(
      `/api/test-plans/business/${encodeURIComponent(
        testPlanId,
      )}`,
    );
  },

  createTestPlan(
    request:
      CreateTestPlanRequest,
  ): Promise<TestPlan> {
    return apiClient.post<
      TestPlan,
      CreateTestPlanRequest
    >(
      '/api/test-plans',
      request,
    );
  },
};