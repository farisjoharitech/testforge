package com.testforge.testforge_backend.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "module", uniqueConstraints = @UniqueConstraint(
        name = "uk_module_project_name", columnNames = {"project_id", "name"}))
public class Module {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "module_id", nullable = false, unique = true, length = 50)
    private String moduleId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_plan_id")
    private TestPlan testPlan;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public TestPlan getTestPlan() { return testPlan; }
    public void setTestPlan(TestPlan testPlan) { this.testPlan = testPlan; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
