package com.testforge.testforge_backend.automation.entity;

import com.testforge.testforge_backend.automation.model.AutomationActionType;
import com.testforge.testforge_backend.automation.model.SelectorStrategy;
import com.testforge.testforge_backend.automation.model.UiElementRole;
import com.testforge.testforge_backend.domain.TestStep;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "automation_step",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_automation_step_business_id",
                        columnNames = "automation_step_id"
                ),
                @UniqueConstraint(
                        name = "uq_automation_step_order",
                        columnNames = {
                                "automation_script_id",
                                "step_order"
                        }
                )
        }
)
public class AutomationStep {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            name = "automation_step_id",
            nullable = false,
            length = 50
    )
    private String automationStepId;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "automation_script_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_automation_step_script"
            )
    )
    private AutomationScript automationScript;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "test_step_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_automation_step_test_step"
            )
    )
    private TestStep testStep;

    @Column(
            name = "step_order",
            nullable = false
    )
    private Integer stepOrder;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "action_type",
            nullable = false,
            length = 50
    )
    private AutomationActionType actionType;

    @Column(
            name = "target",
            length = 500
    )
    private String target;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "selector_strategy",
            length = 50
    )
    private SelectorStrategy selectorStrategy;

    @Column(
            name = "selector_value",
            length = 2000
    )
    private String selectorValue;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "selector_role",
            length = 50
    )
    private UiElementRole selectorRole;

    @Column(
            name = "selector_name",
            length = 500
    )
    private String selectorName;

    @Column(
            name = "selector_exact",
            nullable = false
    )
    private boolean selectorExact;

    @Column(
            name = "input_value",
            length = 4000
    )
    private String inputValue;

    @Column(
            name = "expected_value",
            length = 4000
    )
    private String expectedValue;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    protected AutomationStep() {
    }

    public AutomationStep(
            String automationStepId,
            AutomationScript automationScript,
            TestStep testStep,
            Integer stepOrder,
            AutomationActionType actionType
    ) {
        this.automationStepId =
                automationStepId;

        this.automationScript =
                automationScript;

        this.testStep =
                testStep;

        this.stepOrder =
                stepOrder;

        this.actionType =
                actionType;
    }

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt =
                now;

        updatedAt =
                now;
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getAutomationStepId() {
        return automationStepId;
    }

    public void setAutomationStepId(
            String automationStepId
    ) {
        this.automationStepId =
                automationStepId;
    }

    public AutomationScript getAutomationScript() {
        return automationScript;
    }

    public void setAutomationScript(
            AutomationScript automationScript
    ) {
        this.automationScript =
                automationScript;
    }

    public TestStep getTestStep() {
        return testStep;
    }

    public void setTestStep(
            TestStep testStep
    ) {
        this.testStep =
                testStep;
    }

    public Integer getStepOrder() {
        return stepOrder;
    }

    public void setStepOrder(
            Integer stepOrder
    ) {
        this.stepOrder =
                stepOrder;
    }

    public AutomationActionType getActionType() {
        return actionType;
    }

    public void setActionType(
            AutomationActionType actionType
    ) {
        this.actionType =
                actionType;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(
            String target
    ) {
        this.target =
                target;
    }

    public SelectorStrategy getSelectorStrategy() {
        return selectorStrategy;
    }

    public void setSelectorStrategy(
            SelectorStrategy selectorStrategy
    ) {
        this.selectorStrategy =
                selectorStrategy;
    }

    public String getSelectorValue() {
        return selectorValue;
    }

    public void setSelectorValue(
            String selectorValue
    ) {
        this.selectorValue =
                selectorValue;
    }

    public UiElementRole getSelectorRole() {
        return selectorRole;
    }

    public void setSelectorRole(
            UiElementRole selectorRole
    ) {
        this.selectorRole =
                selectorRole;
    }

    public String getSelectorName() {
        return selectorName;
    }

    public void setSelectorName(
            String selectorName
    ) {
        this.selectorName =
                selectorName;
    }

    public boolean isSelectorExact() {
        return selectorExact;
    }

    public void setSelectorExact(
            boolean selectorExact
    ) {
        this.selectorExact =
                selectorExact;
    }

    public String getInputValue() {
        return inputValue;
    }

    public void setInputValue(
            String inputValue
    ) {
        this.inputValue =
                inputValue;
    }

    public String getExpectedValue() {
        return expectedValue;
    }

    public void setExpectedValue(
            String expectedValue
    ) {
        this.expectedValue =
                expectedValue;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}