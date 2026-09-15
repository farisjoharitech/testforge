package com.testforge.testforge_backend.monitoringdrilldown.dto;

import java.util.List;

public record MonitoringDrilldownResponse(
        String scopeType,
        String scopeBusinessId,
        String scopeName,
        MonitoringDrilldownStatus filter,
        long totalCount,
        List<MonitoringDrilldownItemResponse> testCases
) {
}
