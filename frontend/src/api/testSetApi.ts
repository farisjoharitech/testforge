import {
  apiClient,
} from './apiClient';

import type {
  CreateTestSetRequest,
  TestSet,
  TestSetCandidate,
  UpdateTestSetRequest,
} from '../types/testSet';

export const testSetApi = {
  getAll(): Promise<TestSet[]> {
    return apiClient.get<TestSet[]>(
      '/api/test-sets',
    );
  },

  getById(
    id: number,
  ): Promise<TestSet> {
    return apiClient.get<TestSet>(
      `/api/test-sets/${id}`,
    );
  },

  getByTestPlan(
    testPlanId: number,
  ): Promise<TestSet[]> {
    return apiClient.get<TestSet[]>(
      `/api/test-sets/test-plan/${testPlanId}`,
    );
  },

  getCandidates(
    testPlanId: number,
  ): Promise<TestSetCandidate[]> {
    return apiClient.get<TestSetCandidate[]>(
      `/api/test-sets/test-plan/${testPlanId}/candidates`,
    );
  },

  create(
    request: CreateTestSetRequest,
  ): Promise<TestSet> {
    return apiClient.post<
      TestSet,
      CreateTestSetRequest
    >(
      '/api/test-sets',
      request,
    );
  },

  update(
    id: number,
    request: UpdateTestSetRequest,
  ): Promise<TestSet> {
    return apiClient.put<
      TestSet,
      UpdateTestSetRequest
    >(
      `/api/test-sets/${id}`,
      request,
    );
  },

  delete(
    id: number,
  ): Promise<void> {
    return apiClient.delete<void>(
      `/api/test-sets/${id}`,
    );
  },
};
