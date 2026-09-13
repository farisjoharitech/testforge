import {
  apiClient,
} from './apiClient';

import type {
  CreateTestScenarioRequest,
  TestScenario,
  UpdateTestScenarioRequest,
} from '../types/testScenario';

export const testScenarioApi = {
  getByRequirement(
    requirementId: string,
  ): Promise<TestScenario[]> {
    return apiClient.get<TestScenario[]>(
      `/api/requirements/${encodeURIComponent(
        requirementId,
      )}/scenarios`,
    );
  },

  createTestScenario(
    requirementId: string,
    request: CreateTestScenarioRequest,
  ): Promise<TestScenario> {
    return apiClient.post<
      TestScenario,
      CreateTestScenarioRequest
    >(
      `/api/requirements/${encodeURIComponent(
        requirementId,
      )}/scenarios`,
      request,
    );
  },

  getTestScenario(
    id: number,
  ): Promise<TestScenario> {
    return apiClient.get<TestScenario>(
      `/api/scenarios/${id}`,
    );
  },

  getTestScenarioByBusinessId(
    scenarioId: string,
  ): Promise<TestScenario> {
    return apiClient.get<TestScenario>(
      `/api/scenarios/business/${encodeURIComponent(
        scenarioId,
      )}`,
    );
  },

  updateTestScenario(
    id: number,
    request: UpdateTestScenarioRequest,
  ): Promise<TestScenario> {
    return apiClient.put<
      TestScenario,
      UpdateTestScenarioRequest
    >(
      `/api/scenarios/${id}`,
      request,
    );
  },

  deleteTestScenario(
    id: number,
  ): Promise<void> {
    return apiClient.delete<void>(
      `/api/scenarios/${id}`,
    );
  },
};