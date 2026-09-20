import { apiClient } from './apiClient';

export type TestDesignExportScope = 'PROJECT' | 'TEST_PLAN' | 'MODULE';

export const testDesignExportApi = {
  async download(projectId: string, scope: TestDesignExportScope, testPlanId?: string, moduleId?: string) {
    const params = new URLSearchParams({ scope });
    if (scope === 'TEST_PLAN' && testPlanId) params.set('testPlanId', testPlanId);
    if (scope === 'MODULE' && moduleId) params.set('moduleId', moduleId);
    return apiClient.download(
      `/projects/${encodeURIComponent(projectId)}/test-design/export?${params.toString()}`,
      {
        accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json',
        fallbackFileName: 'test-design.xlsx',
      },
    );
  },
};
