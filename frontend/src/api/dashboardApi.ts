import {
  apiClient,
} from './apiClient';

import type {
  AutomationTypeSummary,
  DashboardSummary,
  ExecutionStatusSummary,
  RecentExecution,
  PortfolioDashboard,
} from '../types/dashboard';

export const dashboardApi = {

  getSummary():
    Promise<DashboardSummary> {

    return apiClient.get<
      DashboardSummary
    >(
      '/api/dashboard/summary',
    );
  },

  getExecutionStatus():
    Promise<
      ExecutionStatusSummary
    > {

    return apiClient.get<
      ExecutionStatusSummary
    >(
      '/api/dashboard/execution-status',
    );
  },

  getAutomationTypes():
    Promise<
      AutomationTypeSummary
    > {

    return apiClient.get<
      AutomationTypeSummary
    >(
      '/api/dashboard/automation-types',
    );
  },

  getRecentResults():
    Promise<
      RecentExecution[]
    > {

    return apiClient.get<
      RecentExecution[]
    >(
      '/api/dashboard/recent-results',
    );
  },

  getPortfolio(): Promise<PortfolioDashboard> {
    return apiClient.get<PortfolioDashboard>(
      '/api/dashboard/portfolio',
    );
  },

};