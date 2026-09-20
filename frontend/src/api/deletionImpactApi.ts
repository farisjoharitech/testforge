import { apiClient } from './apiClient';
import type { DeletionImpact } from '../types/deletionImpact';

const paths: Record<string, string> = {
  PROJECT: 'projects', TEST_PLAN: 'test-plans', MODULE: 'modules', REQUIREMENT: 'requirements',
  SCENARIO: 'scenarios', TEST_CASE: 'test-cases', TEST_STEP: 'test-steps', TEST_SUITE: 'test-suites',
};

export const deletionImpactApi = {
  get(type: string, id: number): Promise<DeletionImpact> {
    return apiClient.get(`/api/${paths[type]}/${id}/deletion-impact`);
  },
};
