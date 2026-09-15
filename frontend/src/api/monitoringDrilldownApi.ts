import {
    apiClient,
} from './apiClient';

import type {
    MonitoringDrilldown,
    MonitoringDrilldownStatus,
    MonitoringScopeType,
} from '../types/monitoringDrilldown';

function getScopePath(
    scopeType: MonitoringScopeType,
    scopeId: string,
): string {
    const encodedId = encodeURIComponent(scopeId);

    switch (scopeType) {
        case 'project':
            return `/api/projects/${encodedId}`;

        case 'test-plan':
            return `/api/test-plans/${encodedId}`;

        case 'requirement':
            return `/api/requirements/${encodedId}`;
    }
}

export const monitoringDrilldownApi = {
    getTestCases(
        scopeType: MonitoringScopeType,
        scopeId: string,
        status: MonitoringDrilldownStatus,
    ): Promise<MonitoringDrilldown> {
        const path = getScopePath(
            scopeType,
            scopeId,
        );

        return apiClient.get<MonitoringDrilldown>(
            `${path}/monitoring/test-cases?status=${encodeURIComponent(status)}`,
        );
    },
};
