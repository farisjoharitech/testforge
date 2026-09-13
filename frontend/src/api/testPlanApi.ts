import {
  apiClient,
} from './apiClient';

import type {
  CreateTestPlanRequest,
  PageResponse,
  TestPlan,
} from '../types/testPlan';

interface GetTestPlansParams {
  projectId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

function buildQueryString(
  params: Record<
    string,
    string | number | undefined
  >,
): string {
  const searchParams =
    new URLSearchParams();

  Object.entries(
    params,
  ).forEach(
    ([key, value]) => {
      if (
        value !== undefined
      ) {
        searchParams.set(
          key,
          String(value),
        );
      }
    },
  );

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : '';
}

export const testPlanApi = {
  getTestPlans(
    params: GetTestPlansParams = {},
  ): Promise<
    PageResponse<TestPlan>
  > {
    const query =
      buildQueryString({
        projectId:
          params.projectId,

        page:
          params.page ?? 0,

        size:
          params.size ?? 20,

        sort:
          params.sort,
      });

    return apiClient.get<
      PageResponse<TestPlan>
    >(
      `/api/test-plans${query}`,
    );
  },

  getTestPlan(
    id: number,
  ): Promise<TestPlan> {
    return apiClient.get<TestPlan>(
      `/api/test-plans/${id}`,
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
};