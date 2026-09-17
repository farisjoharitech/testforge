package com.testforge.testforge_backend.testset.entity;

import com.testforge.testforge_backend.domain.TestPlan;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "test_set")
public class TestSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "test_set_id", nullable = false, unique = true, length = 50)
    private String testSetId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "test_plan_id", nullable = false)
    private TestPlan testPlan;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", length = 2000)
    private String description;

    @OneToMany(
            mappedBy = "testSet",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("itemOrder ASC, id ASC")
    private List<TestSetItem> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public TestSet() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTestSetId() {
        return testSetId;
    }

    public void setTestSetId(String testSetId) {
        this.testSetId = testSetId;
    }

    public TestPlan getTestPlan() {
        return testPlan;
    }

    public void setTestPlan(TestPlan testPlan) {
        this.testPlan = testPlan;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<TestSetItem> getItems() {
        return items;
    }

    public void replaceItems(List<TestSetItem> replacementItems) {
        items.clear();
        for (TestSetItem item : replacementItems) {
            item.setTestSet(this);
            items.add(item);
        }
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
