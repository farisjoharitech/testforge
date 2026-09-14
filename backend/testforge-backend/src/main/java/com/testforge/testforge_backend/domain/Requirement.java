package com.testforge.testforge_backend.domain;

import com.testforge.testforge_backend.domain.enums.RequirementPriority;
import com.testforge.testforge_backend.domain.enums.RequirementStatus;
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
@Table(name = "requirement")
public class Requirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "requirement_id",
            nullable = false,
            unique = true,
            length = 50
    )
    private String requirementId;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "test_plan_id",
            nullable = false
    )
    private TestPlan testPlan;

    @Column(
            name = "description",
            nullable = false,
            length = 1000
    )
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "priority",
            nullable = false,
            length = 50
    )
    private RequirementPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 50
    )
    private RequirementStatus status;


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

    public Requirement() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRequirementId() {
        return requirementId;
    }

    public void setRequirementId(
            String requirementId
    ) {
        this.requirementId = requirementId;
    }

    public TestPlan getTestPlan() {
        return testPlan;
    }

    public void setTestPlan(TestPlan testPlan) {
        this.testPlan = testPlan;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public RequirementPriority getPriority() {
        return priority;
    }

    public void setPriority(
            RequirementPriority priority
    ) {
        this.priority = priority;
    }

    public RequirementStatus getStatus() {
        return status;
    }

    public void setStatus(
            RequirementStatus status
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