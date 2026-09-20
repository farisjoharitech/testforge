package com.testforge.testforge_backend.testsuite.entity;

import com.testforge.testforge_backend.automation.entity.AutomationRun;
import com.testforge.testforge_backend.domain.Project;
import jakarta.persistence.*;
import java.time.*;
import java.util.*;
import org.hibernate.annotations.BatchSize;

@Entity @Table(name="test_suite_run")
public class SuiteRun {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="project_id") private Project project;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="test_suite_id",updatable=false) private TestSuite testSuite;
 @Column(name="test_suite_id_snapshot",nullable=false,updatable=false) private Long testSuiteIdSnapshot;
 @Column(name="test_suite_name_snapshot",nullable=false,updatable=false) private String testSuiteNameSnapshot;
 @Column(name="project_business_id_snapshot",nullable=false,updatable=false,length=50) private String projectBusinessIdSnapshot;
 @Column(name="project_name_snapshot",nullable=false,updatable=false) private String projectNameSnapshot;
 @Enumerated(EnumType.STRING) @Column(name="execution_mode_snapshot",nullable=false,updatable=false,length=20) private SuiteExecutionMode executionModeSnapshot;
 @Column(name="lifecycle_enabled_snapshot",nullable=false,updatable=false) private boolean lifecycleEnabledSnapshot;
 @Column(name="junit_tags_snapshot",updatable=false,length=1000) private String junitTagsSnapshot;
 @Column(name="parameter_sets_json_snapshot",updatable=false,columnDefinition="text") private String parameterSetsJsonSnapshot;
 @Column(name="junit_extensions_snapshot",updatable=false,length=1000) private String junitExtensionsSnapshot;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="automation_run_id") private AutomationRun automationRun;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private SuiteResultStatus status;
 @Column(name="started_at",nullable=false) private LocalDateTime startedAt;
 @Column(name="completed_at") private LocalDateTime completedAt;
 @Column(name="duration_ms") private Long durationMs;
 @Column(nullable=false) private int total; @Column(nullable=false) private int passed; @Column(nullable=false) private int failed; @Column(nullable=false) private int skipped;
 @Column(name="error_details",columnDefinition="text") private String errorDetails;
 @OneToMany(mappedBy="suiteRun",cascade=CascadeType.ALL) @OrderBy("id") @BatchSize(size=50) private List<SuiteScenarioResult> scenarioResults=new ArrayList<>();
 public SuiteRun(){}
 public SuiteRun(Project p,TestSuite s,LocalDateTime started){
  project=p;testSuite=s;startedAt=started;status=SuiteResultStatus.RUNNING;
  testSuiteIdSnapshot=s.getId();testSuiteNameSnapshot=s.getName();
  projectBusinessIdSnapshot=p.getProjectId();projectNameSnapshot=p.getName();
  executionModeSnapshot=s.getExecutionMode();lifecycleEnabledSnapshot=s.isLifecycleEnabled();
  junitTagsSnapshot=s.getJunitTags();parameterSetsJsonSnapshot=s.getParameterSetsJson();junitExtensionsSnapshot=s.getJunitExtensions();
 }
 public Long getTestSuiteIdSnapshot(){return testSuiteIdSnapshot;}
 public String getTestSuiteNameSnapshot(){return testSuiteNameSnapshot;}
 public String getProjectBusinessIdSnapshot(){return projectBusinessIdSnapshot;}
 public String getProjectNameSnapshot(){return projectNameSnapshot;}
 public SuiteExecutionMode getExecutionModeSnapshot(){return executionModeSnapshot;}
 public boolean isLifecycleEnabledSnapshot(){return lifecycleEnabledSnapshot;}
 public String getJunitTagsSnapshot(){return junitTagsSnapshot;}
 public String getParameterSetsJsonSnapshot(){return parameterSetsJsonSnapshot;}
 public String getJunitExtensionsSnapshot(){return junitExtensionsSnapshot;}
 public void addScenario(SuiteScenarioResult r){r.setSuiteRun(this);scenarioResults.add(r);} public Long getId(){return id;} public Project getProject(){return project;} public TestSuite getTestSuite(){return testSuite;} public AutomationRun getAutomationRun(){return automationRun;} public void setAutomationRun(AutomationRun v){automationRun=v;} public SuiteResultStatus getStatus(){return status;} public LocalDateTime getStartedAt(){return startedAt;} public LocalDateTime getCompletedAt(){return completedAt;} public Long getDurationMs(){return durationMs;} public int getTotal(){return total;} public int getPassed(){return passed;} public int getFailed(){return failed;} public int getSkipped(){return skipped;} public String getErrorDetails(){return errorDetails;} public List<SuiteScenarioResult> getScenarioResults(){return scenarioResults;}
 public void complete(SuiteResultStatus s,int t,int p,int f,int sk,String error){status=s;total=t;passed=p;failed=f;skipped=sk;errorDetails=error;completedAt=LocalDateTime.now();durationMs=Duration.between(startedAt,completedAt).toMillis();}
}
