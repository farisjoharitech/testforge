package com.testforge.testforge_backend.automation.entity;

import com.testforge.testforge_backend.domain.TestCase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
        name = "automation_script",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_automation_script_business_id",
                        columnNames = "automation_script_id"
                ),
                @UniqueConstraint(
                        name = "uq_automation_script_test_case",
                        columnNames = "test_case_id"
                )
        }
)
public class AutomationScript {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            name = "automation_script_id",
            nullable = false,
            length = 50
    )
    private String automationScriptId;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "test_case_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_automation_script_test_case"
            )
    )
    private TestCase testCase;

    @Column(
            name = "name",
            nullable = false,
            length = 255
    )
    private String name;

    @Column(
            name = "generated_class_name",
            length = 255
    )
    private String generatedClassName;

    @Column(
            name = "generated_source",
            columnDefinition = "TEXT"
    )
    private String generatedSource;

    @Column(
            name = "generated_step_count"
    )
    private Integer generatedStepCount;

    @Column(
            name = "generated_at"
    )
    private LocalDateTime generatedAt;

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

    protected AutomationScript() {
    }

    public AutomationScript(
            String automationScriptId,
            TestCase testCase,
            String name
    ) {
        this.automationScriptId =
                automationScriptId;

        this.testCase =
                testCase;

        this.name =
                name;
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

    public String getAutomationScriptId() {
        return automationScriptId;
    }

    public void setAutomationScriptId(
            String automationScriptId
    ) {
        this.automationScriptId =
                automationScriptId;
    }

    public TestCase getTestCase() {
        return testCase;
    }

    public void setTestCase(
            TestCase testCase
    ) {
        this.testCase =
                testCase;
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

    public String getGeneratedClassName() {
        return generatedClassName;
    }

    public void setGeneratedClassName(
            String generatedClassName
    ) {
        this.generatedClassName =
                generatedClassName;
    }

    public String getGeneratedSource() {
        return generatedSource;
    }

    public void setGeneratedSource(
            String generatedSource
    ) {
        this.generatedSource =
                generatedSource;
    }

    public Integer getGeneratedStepCount() {
        return generatedStepCount;
    }

    public void setGeneratedStepCount(
            Integer generatedStepCount
    ) {
        this.generatedStepCount =
                generatedStepCount;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(
            LocalDateTime generatedAt
    ) {
        this.generatedAt =
                generatedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}