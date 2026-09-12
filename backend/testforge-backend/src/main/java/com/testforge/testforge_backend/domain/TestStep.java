package com.testforge.testforge_backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "test_step",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_test_step_order",
                        columnNames = {
                                "test_case_id",
                                "step_order"
                        }
                )
        }
)
public class TestStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "test_step_id",
            nullable = false,
            unique = true,
            length = 50
    )
    private String testStepId;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "test_case_id",
            nullable = false
    )
    private TestCase testCase;

    @Column(
            name = "step_order",
            nullable = false
    )
    private Integer stepOrder;

    @Column(
            name = "action",
            nullable = false,
            length = 1000
    )
    private String action;

    @Column(
            name = "target",
            length = 500
    )
    private String target;

    @Column(
            name = "input_value",
            length = 2000
    )
    private String inputValue;

    @Column(
            name = "expected_result",
            length = 2000
    )
    private String expectedResult;

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

    public TestStep() {
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public String getTestStepId() {
        return testStepId;
    }

    public void setTestStepId(
            String testStepId
    ) {
        this.testStepId = testStepId;
    }

    public TestCase getTestCase() {
        return testCase;
    }

    public void setTestCase(
            TestCase testCase
    ) {
        this.testCase = testCase;
    }

    public Integer getStepOrder() {
        return stepOrder;
    }

    public void setStepOrder(
            Integer stepOrder
    ) {
        this.stepOrder = stepOrder;
    }

    public String getAction() {
        return action;
    }

    public void setAction(
            String action
    ) {
        this.action = action;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(
            String target
    ) {
        this.target = target;
    }

    public String getInputValue() {
        return inputValue;
    }

    public void setInputValue(
            String inputValue
    ) {
        this.inputValue = inputValue;
    }

    public String getExpectedResult() {
        return expectedResult;
    }

    public void setExpectedResult(
            String expectedResult
    ) {
        this.expectedResult = expectedResult;
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