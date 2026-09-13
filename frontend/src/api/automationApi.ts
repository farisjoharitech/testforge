import {
  apiClient,
} from './apiClient';

import type {
  AutomationScript,
  AutomationStep,
  CreateAutomationScriptRequest,
  CreateAutomationStepRequest,
  GeneratedScript,
  UpdateAutomationStepRequest,
} from '../types/automation';

export const automationApi = {
  createScript(
    testCaseId: number,
    request: CreateAutomationScriptRequest,
  ): Promise<AutomationScript> {
    return apiClient.post<
      AutomationScript,
      CreateAutomationScriptRequest
    >(
      `/api/test-cases/${testCaseId}/automation-script`,
      request,
    );
  },

  getScriptByTestCase(
    testCaseId: number,
  ): Promise<AutomationScript> {
    return apiClient.get<AutomationScript>(
      `/api/test-cases/${testCaseId}/automation-script`,
    );
  },

  getScript(
    scriptId: number,
  ): Promise<AutomationScript> {
    return apiClient.get<AutomationScript>(
      `/api/automation-scripts/${scriptId}`,
    );
  },

  createStep(
    scriptId: number,
    request: CreateAutomationStepRequest,
  ): Promise<AutomationStep> {
    return apiClient.post<
      AutomationStep,
      CreateAutomationStepRequest
    >(
      `/api/automation-scripts/${scriptId}/steps`,
      request,
    );
  },

  getSteps(
    scriptId: number,
  ): Promise<AutomationStep[]> {
    return apiClient.get<AutomationStep[]>(
      `/api/automation-scripts/${scriptId}/steps`,
    );
  },

  getStep(
    stepId: number,
  ): Promise<AutomationStep> {
    return apiClient.get<AutomationStep>(
      `/api/automation-steps/${stepId}`,
    );
  },

  updateStep(
    stepId: number,
    request: UpdateAutomationStepRequest,
  ): Promise<AutomationStep> {
    return apiClient.put<
      AutomationStep,
      UpdateAutomationStepRequest
    >(
      `/api/automation-steps/${stepId}`,
      request,
    );
  },

  deleteStep(
    stepId: number,
  ): Promise<void> {
    return apiClient.delete<void>(
      `/api/automation-steps/${stepId}`,
    );
  },

  /*
   * Task 36.10
   */
  generateScript(
    scriptId: number,
  ): Promise<GeneratedScript> {
    return apiClient.post<
      GeneratedScript,
      Record<string, never>
    >(
      `/api/automation-scripts/${scriptId}/generate`,
      {},
    );
  },

  /*
   * Task 36.10
   */
  getGeneratedScript(
    scriptId: number,
  ): Promise<GeneratedScript> {
    return apiClient.get<GeneratedScript>(
      `/api/automation-scripts/${scriptId}/generated-script`,
    );
  },
};