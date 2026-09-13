import {
  apiClient,
} from './apiClient';

import type {
  CreateRequirementRequest,
  Requirement,
  UpdateRequirementRequest,
} from '../types/requirement';

export const requirementApi = {
  getRequirementsByTestPlan(
    testPlanId: string,
  ): Promise<Requirement[]> {
    return apiClient.get<Requirement[]>(
      `/api/test-plans/${encodeURIComponent(
        testPlanId,
      )}/requirements`,
    );
  },

  createRequirement(
    testPlanId: string,
    request: CreateRequirementRequest,
  ): Promise<Requirement> {
    return apiClient.post<
      Requirement,
      CreateRequirementRequest
    >(
      `/api/test-plans/${encodeURIComponent(
        testPlanId,
      )}/requirements`,
      request,
    );
  },

  getRequirement(
    id: number,
  ): Promise<Requirement> {
    return apiClient.get<Requirement>(
      `/api/requirements/${id}`,
    );
  },

  getRequirementByBusinessId(
    requirementId: string,
  ): Promise<Requirement> {
    return apiClient.get<Requirement>(
      `/api/requirements/business/${encodeURIComponent(
        requirementId,
      )}`,
    );
  },

  updateRequirement(
    id: number,
    request: UpdateRequirementRequest,
  ): Promise<Requirement> {
    return apiClient.put<
      Requirement,
      UpdateRequirementRequest
    >(
      `/api/requirements/${id}`,
      request,
    );
  },

  deleteRequirement(
    id: number,
  ): Promise<void> {
    return apiClient.delete<void>(
      `/api/requirements/${id}`,
    );
  },
};