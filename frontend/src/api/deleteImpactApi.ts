import { apiClient } from './apiClient';
import type { AuthoringDeleteImpact } from '../types/deleteImpact';

export const deleteImpactApi = {
  getRequirementImpact(id: number): Promise<AuthoringDeleteImpact> {
    return apiClient.get<AuthoringDeleteImpact>(`/api/requirements/${id}/delete-impact`);
  },

  getScenarioImpact(id: number): Promise<AuthoringDeleteImpact> {
    return apiClient.get<AuthoringDeleteImpact>(`/api/scenarios/${id}/delete-impact`);
  },

  getTestCaseImpact(id: number): Promise<AuthoringDeleteImpact> {
    return apiClient.get<AuthoringDeleteImpact>(`/api/test-cases/${id}/delete-impact`);
  },
};
