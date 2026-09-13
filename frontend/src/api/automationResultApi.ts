import {
  apiClient,
} from './apiClient';

import type {
  AutomationResult,
  AutomationResultStatus,
  AutomationResultSummary,
} from '../types/automationResult';

export const automationResultApi = {

  getAllResults(
    status?: AutomationResultStatus,
  ): Promise<
    AutomationResultSummary[]
  > {

    const query =
      status
        ? `?status=${encodeURIComponent(
            status,
          )}`
        : '';

    return apiClient.get<
      AutomationResultSummary[]
    >(
      `/api/automation-results${query}`,
    );
  },

  getResult(
    executionId: string,
  ): Promise<AutomationResult> {

    return apiClient.get<
      AutomationResult
    >(
      `/api/automation-results/${encodeURIComponent(
        executionId,
      )}`,
    );
  },

  getResultsByScript(
    scriptId: number,
  ): Promise<
    AutomationResultSummary[]
  > {

    return apiClient.get<
      AutomationResultSummary[]
    >(
      `/api/automation-scripts/${scriptId}/results`,
    );
  },

  getResultsByTestCase(
    testCaseId: number,
  ): Promise<
    AutomationResultSummary[]
  > {

    return apiClient.get<
      AutomationResultSummary[]
    >(
      `/api/test-cases/${testCaseId}/automation-results`,
    );
  },
};