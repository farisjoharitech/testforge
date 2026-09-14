package com.testforge.testforge_backend.domain;

import com.testforge.testforge_backend.domain.enums.TestScenarioPriority;
import com.testforge.testforge_backend.domain.enums.TestScenarioStatus;
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
@Table(name = "test_scenario")
public class TestScenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "scenario_id",
            nullable = false,
            unique = true,
            length = 50
    )
    private String scenarioId;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "requirement_id",
            nullable = false
    )
    private Requirement requirement;

    @Column(
            name = "description",
            nullable = false,
            length = 1000
    )
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "test_type",
            nullable = false,
            length = 50
    )
    private TestType testType;


    @Enumerated(EnumType.STRING)
    @Column(
            name = "priority",
            nullable = false,
            length = 50
    )
    private TestScenarioPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 50
    )
    private TestScenarioStatus status;

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

    public TestScenario() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getScenarioId() {
        return scenarioId;
    }

    public void setScenarioId(String scenarioId) {
        this.scenarioId = scenarioId;
    }

    public Requirement getRequirement() {
        return requirement;
    }

    public void setRequirement(Requirement requirement) {
        this.requirement = requirement;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public TestType getTestType() {
        return testType;
    }

    public void setTestType(
            TestType testType
    ) {
        this.testType = testType;
    }


    public TestScenarioPriority getPriority() {
        return priority;
    }

    public void setPriority(
            TestScenarioPriority priority
    ) {
        this.priority = priority;
    }

    public TestScenarioStatus getStatus() {
        return status;
    }

    public void setStatus(
            TestScenarioStatus status
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