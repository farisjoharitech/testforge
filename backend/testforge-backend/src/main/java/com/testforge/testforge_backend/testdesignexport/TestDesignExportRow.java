package com.testforge.testforge_backend.testdesignexport;

record TestDesignExportRow(
        Long testPlanKey, String testPlan,
        Long moduleKey, String module,
        Long requirementKey, String requirementId, String requirement,
        Long scenarioKey, String scenarioId, String scenario, boolean scenarioAutomatable,
        Long testCaseKey, String testCaseId, String testCase, String preconditions,
        String testCaseData, String testCaseExpectedResult, String automationStatus,
        Long testStepKey, Integer stepOrder, String testStep, String target,
        String stepData, String stepExpectedResult) {
}
