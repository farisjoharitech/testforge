import {
    apiClient,
} from './apiClient';

import type {
    RequirementMonitoring,
    TestPlanMonitoring,
} from '../types/hierarchyMonitoring';

export const hierarchyMonitoringApi = {
    getTestPlanMonitoring(
        testPlanId: string,
    ): Promise<TestPlanMonitoring> {
        return apiClient.get<TestPlanMonitoring>(
            `/api/test-plans/${encodeURIComponent(
                testPlanId,
            )}/monitoring`,
        );
    },

    getRequirementMonitoring(
        requirementId: string,
    ): Promise<RequirementMonitoring> {
        return apiClient.get<RequirementMonitoring>(
            `/api/requirements/${encodeURIComponent(
                requirementId,
            )}/monitoring`,
        );
    },
};
