import {
  apiClient,
} from './apiClient';

import type {
  CreateTestCaseRequest,
  TestCase,
} from '../types/testCase';

export const testCaseApi = {
  getByScenario(
    scenarioId: string,
  ): Promise<TestCase[]> {
    return apiClient.get<
      TestCase[]
    >(
      `/api/scenarios/${encodeURIComponent(
        scenarioId,
      )}/test-cases`,
    );
  },

  createTestCase(
    scenarioId: string,
    request:
      CreateTestCaseRequest,
  ): Promise<TestCase> {
    return apiClient.post<
      TestCase,
      CreateTestCaseRequest
    >(
      `/api/scenarios/${encodeURIComponent(
        scenarioId,
      )}/test-cases`,
      request,
    );
  },

  getTestCase(
    id: number,
  ): Promise<TestCase> {
    return apiClient.get<
      TestCase
    >(
      `/api/test-cases/${id}`,
    );
  },

  getTestCaseByBusinessId(
    testCaseId: string,
  ): Promise<TestCase> {
    return apiClient.get<
      TestCase
    >(
      `/api/test-cases/business/${encodeURIComponent(
        testCaseId,
      )}`,
    );
  },
};