package com.testforge.testforge_backend.testsuite.entity;
import com.testforge.testforge_backend.domain.Project;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.*;
@Entity @Table(name="test_suite")
public class TestSuite {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="project_id",nullable=false) private Project project;
 @Column(nullable=false,length=255) private String name; @Column(length=2000) private String description;
 @OneToMany(mappedBy="testSuite",cascade=CascadeType.ALL,orphanRemoval=true) @OrderBy("itemOrder ASC") private List<TestSuiteScenario> scenarios=new ArrayList<>();
 @Column(name="created_at",nullable=false) private LocalDateTime createdAt; @Column(name="updated_at",nullable=false) private LocalDateTime updatedAt;
 @Enumerated(EnumType.STRING) @Column(name="execution_mode",nullable=false) private SuiteExecutionMode executionMode=SuiteExecutionMode.SEQUENTIAL; @Column(name="lifecycle_enabled",nullable=false) private boolean lifecycleEnabled=true; @Column(name="junit_tags",length=1000) private String junitTags; @Column(name="parameter_sets_json",columnDefinition="text") private String parameterSetsJson; @Column(name="junit_extensions",length=1000) private String junitExtensions;
 public Long getId(){return id;} public Project getProject(){return project;} public void setProject(Project v){project=v;} public String getName(){return name;} public void setName(String v){name=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;} public List<TestSuiteScenario> getScenarios(){return scenarios;} public void replaceScenarios(List<TestSuiteScenario> v){scenarios.clear();v.forEach(i->{i.setTestSuite(this);scenarios.add(i);});} public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;} public LocalDateTime getUpdatedAt(){return updatedAt;} public void setUpdatedAt(LocalDateTime v){updatedAt=v;} public SuiteExecutionMode getExecutionMode(){return executionMode;} public void setExecutionMode(SuiteExecutionMode v){executionMode=v;} public boolean isLifecycleEnabled(){return lifecycleEnabled;} public void setLifecycleEnabled(boolean v){lifecycleEnabled=v;} public String getJunitTags(){return junitTags;} public void setJunitTags(String v){junitTags=v;} public String getParameterSetsJson(){return parameterSetsJson;} public void setParameterSetsJson(String v){parameterSetsJson=v;} public String getJunitExtensions(){return junitExtensions;} public void setJunitExtensions(String v){junitExtensions=v;}
}
