const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080';

import {
  apiClient,
} from './apiClient';

import type {
  AutomationExecution,
  AutomationRun,
  CreateMultiTestCaseRunRequest,
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

  /*
   * Task 36.11
   */
  executeScript(
    scriptId: number,
  ): Promise<AutomationExecution> {
    return apiClient.post<
      AutomationExecution,
      Record<string, never>
    >(
      `/api/automation-scripts/${scriptId}/execute`,
      {},
    );
  },

  /*
   * Task 36.11
   */
  getLatestExecution(
    scriptId: number,
  ): Promise<AutomationExecution> {
    return apiClient.get<AutomationExecution>(
      `/api/automation-scripts/${scriptId}/executions/latest`,
    );
  },

  /*
   * Task 36.11
   */
  getExecution(
    executionId: number,
  ): Promise<AutomationExecution> {
    return apiClient.get<AutomationExecution>(
      `/api/automation-executions/${executionId}`,
    );
  },

  executeMultipleTestCases(
    request: CreateMultiTestCaseRunRequest,
  ): Promise<AutomationRun> {
    return apiClient.post<
      AutomationRun,
      CreateMultiTestCaseRunRequest
    >(
      '/api/automation-runs/multi-test-case',
      request,
    );
  },

  executeScenario(
    scenarioId: number,
  ): Promise<AutomationRun> {
    return apiClient.post<
      AutomationRun,
      Record<string, never>
    >(
      `/api/automation-runs/scenario/${scenarioId}`,
      {},
    );
  },

  executeTestPlan(
    testPlanId: number,
  ): Promise<AutomationRun> {
    return apiClient.post<
      AutomationRun,
      Record<string, never>
    >(
      `/api/automation-runs/test-plan/${testPlanId}`,
      {},
    );
  },

  getRun(
    runId: number,
  ): Promise<AutomationRun> {
    return apiClient.get<AutomationRun>(
      `/api/automation-runs/${runId}`,
    );
  },

  getRunExecutions(
    runId: number,
  ): Promise<AutomationExecution[]> {
    return apiClient.get<AutomationExecution[]>(
      `/api/automation-runs/${runId}/executions`,
    );
  },

  getExecutionLogStreamUrl(
    executionId: number,
  ): string {
    return `${API_BASE_URL}/api/automation-executions/${executionId}/log-stream`;
  },

  getRunEventStreamUrl(
    runId: number,
  ): string {
    return `${API_BASE_URL}/api/automation-runs/${runId}/events`;
  },
};