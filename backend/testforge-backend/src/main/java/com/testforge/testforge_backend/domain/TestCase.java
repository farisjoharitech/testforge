package com.testforge.testforge_backend.domain;

import com.testforge.testforge_backend.domain.enums.AutomationStatus;
import com.testforge.testforge_backend.domain.enums.AutomationType;
import com.testforge.testforge_backend.domain.enums.TestCasePriority;
import com.testforge.testforge_backend.domain.enums.TestCaseStatus;
import com.testforge.testforge_backend.domain.enums.TestType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_case")
public class TestCase {

    @Id
    @GeneratedValue(
            strategy =
                    GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            name = "test_case_id",
            nullable = false,
            unique = true,
            length = 50
    )
    private String testCaseId;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "scenario_id",
            nullable = false
    )
    private TestScenario testScenario;

    @Column(
            name = "name",
            nullable = false,
            length = 255
    )
    private String name;

    @Column(
            name = "preconditions",
            length = 2000
    )
    private String preconditions;

    @Column(
            name = "test_data",
            length = 2000
    )
    private String testData;

    @Column(
            name = "expected_result",
            nullable = false,
            length = 2000
    )
    private String expectedResult;

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            name = "priority",
            nullable = false,
            length = 50
    )
    private TestCasePriority priority;

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            name = "test_type",
            nullable = false,
            length = 50
    )
    private TestType testType;

@Enumerated(
            EnumType.STRING
    )
    @Column(
            name = "automation_type",
            nullable = false,
            length = 50
    )
    private AutomationType automationType;

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            name = "automation_status",
            nullable = false,
            length = 50
    )
    private AutomationStatus automationStatus;

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            name = "status",
            nullable = false,
            length = 50
    )
    private TestCaseStatus status;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    public TestCase() {
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public String getTestCaseId() {
        return testCaseId;
    }

    public void setTestCaseId(
            String testCaseId
    ) {
        this.testCaseId =
                testCaseId;
    }

    public TestScenario getTestScenario() {
        return testScenario;
    }

    public void setTestScenario(
            TestScenario testScenario
    ) {
        this.testScenario =
                testScenario;
    }

    public String getName() {
        return name;
    }

    public void setName(
            String name
    ) {
        this.name =
                name;
    }

    public String getPreconditions() {
        return preconditions;
    }

    public void setPreconditions(
            String preconditions
    ) {
        this.preconditions =
                preconditions;
    }

    public String getTestData() {
        return testData;
    }

    public void setTestData(
            String testData
    ) {
        this.testData =
                testData;
    }

    public String getExpectedResult() {
        return expectedResult;
    }

    public void setExpectedResult(
            String expectedResult
    ) {
        this.expectedResult =
                expectedResult;
    }

    public TestCasePriority getPriority() {
        return priority;
    }

    public void setPriority(
            TestCasePriority priority
    ) {
        this.priority =
                priority;
    }

    public TestType getTestType() {
        return testType;
    }

    public void setTestType(
            TestType testType
    ) {
        this.testType =
                testType;
    }

    public boolean isAutomatable() {
        return testScenario != null
                && testScenario.isAutomatable();
    }

public AutomationType getAutomationType() {
        return automationType;
    }

    public void setAutomationType(
            AutomationType automationType
    ) {
        this.automationType =
                automationType;
    }

    public AutomationStatus getAutomationStatus() {
        return automationStatus;
    }

    public void setAutomationStatus(
            AutomationStatus automationStatus
    ) {
        this.automationStatus =
                automationStatus;
    }

    public TestCaseStatus getStatus() {
        return status;
    }

    public void setStatus(
            TestCaseStatus status
    ) {
        this.status =
                status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt =
                createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt =
                updatedAt;
    }
}
