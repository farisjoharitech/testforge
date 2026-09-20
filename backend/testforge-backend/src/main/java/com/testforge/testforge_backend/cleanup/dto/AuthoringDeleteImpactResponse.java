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
        long testSuiteMembershipCount,
        long historicalExecutionCount,
        boolean historicalExecutionsPreserved,
        java.util.List<String> blockingDependencies
) {
    public AuthoringDeleteImpactResponse(String entityType, Long entityId, String businessId,
            long scenarioCount, long testCaseCount, long testStepCount, long automationScriptCount,
            long automationStepCount, long testSuiteMembershipCount, long historicalExecutionCount,
            boolean historicalExecutionsPreserved) {
        this(entityType, entityId, businessId, scenarioCount, testCaseCount, testStepCount, automationScriptCount,
                automationStepCount, testSuiteMembershipCount, historicalExecutionCount, historicalExecutionsPreserved, java.util.List.of());
    }
}
