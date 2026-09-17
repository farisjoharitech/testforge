package com.testforge.testforge_backend.dto;

public record TestStepDeleteImpactResponse(
        Long testStepId,
        String testStepBusinessId,
        int mappedAutomationStepCount,
        long affectedAutomationScriptCount,
        boolean generatedScriptWillBecomeStale
) {
}
