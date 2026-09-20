import { apiClient } from './apiClient';
import type { CreateModuleRequest, Module, UpdateModuleRequest } from '../types/module';

export const moduleApi = {
  getByTestPlan: (testPlanId: string): Promise<Module[]> =>
    apiClient.get(`/api/test-plans/${encodeURIComponent(testPlanId)}/modules`),
  getByBusinessId: (moduleId: string): Promise<Module> =>
    apiClient.get(`/api/modules/business/${encodeURIComponent(moduleId)}`),
  create: (testPlanId: string, request: CreateModuleRequest): Promise<Module> =>
    apiClient.post(`/api/test-plans/${encodeURIComponent(testPlanId)}/modules`, request),
  update: (id: number, request: UpdateModuleRequest): Promise<Module> =>
    apiClient.put(`/api/modules/${id}`, request),
  delete: (id: number): Promise<void> => apiClient.delete(`/api/modules/${id}`),
};
