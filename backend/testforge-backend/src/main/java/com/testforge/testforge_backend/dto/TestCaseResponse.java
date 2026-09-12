package com.testforge.testforge_backend.dto;

import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.domain.enums.TestCasePriority;
import com.testforge.testforge_backend.domain.enums.TestCaseStatus;
import com.testforge.testforge_backend.domain.enums.TestType;

import java.time.LocalDateTime;

public class TestCaseResponse {

    private Long id;

    private String testCaseId;

    private Long scenarioId;

    private String scenarioBusinessId;

    private String name;

    private String preconditions;

    private String testData;

    private String expectedResult;

    private TestCasePriority priority;

    private TestType testType;

    private boolean automatable;

    private AutomationType automationType;

    private AutomationStatus automationStatus;

    private TestCaseStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTestCaseId() {
        return testCaseId;
    }

    public void setTestCaseId(
            String testCaseId
    ) {
        this.testCaseId = testCaseId;
    }

    public Long getScenarioId() {
        return scenarioId;
    }

    public void setScenarioId(
            Long scenarioId
    ) {
        this.scenarioId = scenarioId;
    }

    public String getScenarioBusinessId() {
        return scenarioBusinessId;
    }

    public void setScenarioBusinessId(
            String scenarioBusinessId
    ) {
        this.scenarioBusinessId =
                scenarioBusinessId;
    }

    public String getName() {
        return name;
    }

    public void setName(
            String name
    ) {
        this.name = name;
    }

    public String getPreconditions() {
        return preconditions;
    }

    public void setPreconditions(
            String preconditions
    ) {
        this.preconditions = preconditions;
    }

    public String getTestData() {
        return testData;
    }

    public void setTestData(
            String testData
    ) {
        this.testData = testData;
    }

    public String getExpectedResult() {
        return expectedResult;
    }

    public void setExpectedResult(
            String expectedResult
    ) {
        this.expectedResult = expectedResult;
    }

    public TestCasePriority getPriority() {
        return priority;
    }

    public void setPriority(
            TestCasePriority priority
    ) {
        this.priority = priority;
    }

    public TestType getTestType() {
        return testType;
    }

    public void setTestType(
            TestType testType
    ) {
        this.testType = testType;
    }

    public boolean isAutomatable() {
        return automatable;
    }

    public void setAutomatable(
            boolean automatable
    ) {
        this.automatable = automatable;
    }

    public AutomationType getAutomationType() {
        return automationType;
    }

    public void setAutomationType(
            AutomationType automationType
    ) {
        this.automationType = automationType;
    }

    public AutomationStatus getAutomationStatus() {
        return automationStatus;
    }

    public void setAutomationStatus(
            AutomationStatus automationStatus
    ) {
        this.automationStatus = automationStatus;
    }

    public TestCaseStatus getStatus() {
        return status;
    }

    public void setStatus(
            TestCaseStatus status
    ) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt = updatedAt;
    }
}