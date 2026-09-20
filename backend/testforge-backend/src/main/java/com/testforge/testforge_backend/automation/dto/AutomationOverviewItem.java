package com.testforge.testforge_backend.automation.dto;
import com.testforge.testforge_backend.automation.model.AutomationActionType;
public record AutomationOverviewItem(String scenarioId, String scenarioDescription, String testCaseId,
 String testCaseName, String testStepId, Integer stepOrder, AutomationActionType actionType, boolean automatable) {}
