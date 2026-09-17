package com.testforge.testforge_backend.cleanup.dto;

public record AuthoringDeleteImpactResponse(
        String entityType,
        Long entityId,
        String businessId,
        long scenarioCount,
        long testCaseCount,
        long testStepCount,
        long automationScriptCount,
        long automationStepCount,
        long testSetMembershipCount,
        long historicalExecutionCount,
        boolean historicalExecutionsPreserved
) {
}
