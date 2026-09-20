package com.testforge.testforge_backend.testsuite.service;

import com.testforge.testforge_backend.automation.entity.AutomationExecution;
import com.testforge.testforge_backend.automation.execution.AutomationExecutionStatus;
import com.testforge.testforge_backend.automation.execution.AutomationRunStatus;
import com.testforge.testforge_backend.domain.*;
import com.testforge.testforge_backend.repository.*;
import com.testforge.testforge_backend.testsuite.dto.SuiteRunResponse;
import com.testforge.testforge_backend.testsuite.entity.*;
import com.testforge.testforge_backend.testsuite.repository.*;
import com.testforge.testforge_backend.testsuite.exception.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SuiteRunPersistenceService {
 private final TestSuiteRepository suites; private final SuiteRunRepository runs; private final TestCaseRepository cases; private final TestStepRepository steps; private final AutomationExecutionRepository executions; private final AutomationRunRepository automationRuns;
 public SuiteRunPersistenceService(TestSuiteRepository suites,SuiteRunRepository runs,TestCaseRepository cases,TestStepRepository steps,AutomationExecutionRepository executions,AutomationRunRepository automationRuns){this.suites=suites;this.runs=runs;this.cases=cases;this.steps=steps;this.executions=executions;this.automationRuns=automationRuns;}

 @Transactional
 public StartResult start(String projectBusinessId,Long suiteId){
  TestSuite suite=suites.findById(suiteId).orElseThrow(()->new TestSuiteNotFoundException("Test Suite not found: "+suiteId));
  if(!suite.getProject().getProjectId().equals(projectBusinessId))throw new InvalidTestSuiteException("Test Suite belongs to another Project");
  if(suite.getScenarios().isEmpty())throw new InvalidTestSuiteException("Test Suite has no selected Scenarios");
  SuiteRun run=new SuiteRun(suite.getProject(),suite,LocalDateTime.now()); List<Long> caseIds=new ArrayList<>();
  for(TestSuiteScenario member:suite.getScenarios()){
   TestScenario scenario=member.getScenario(); if(!scenario.isAutomatable())throw new InvalidTestSuiteException("Scenario is not automatable: "+scenario.getScenarioId());
   SuiteScenarioResult scenarioResult=new SuiteScenarioResult(scenario.getId(),scenario.getScenarioId(),scenario.getDescription());
   for(TestCase testCase:cases.findByTestScenarioOrderByIdAsc(scenario)){
    SuiteTestCaseResult caseResult=new SuiteTestCaseResult(testCase.getId(),testCase.getTestCaseId(),testCase.getName());
    for(TestStep step:steps.findByTestCaseOrderByStepOrderAsc(testCase))caseResult.addStep(new SuiteTestStepResult(step.getId(),step.getTestStepId(),step.getAction(),step.getExpectedResult(),step.getStepOrder()));
    scenarioResult.addTestCase(caseResult); caseIds.add(testCase.getId());
   }
   run.addScenario(scenarioResult);
  }
  if(caseIds.isEmpty())throw new InvalidTestSuiteException("Selected Scenarios have no Test Cases");
  runs.save(run); return new StartResult(run.getId(),List.copyOf(caseIds));
 }

 @Transactional public void attachAutomationRun(Long suiteRunId,Long automationRunId){runs.findById(suiteRunId).orElseThrow().setAutomationRun(automationRuns.getReferenceById(automationRunId));}

 @Transactional public void fail(Long suiteRunId,String error){SuiteRun run=runs.findById(suiteRunId).orElseThrow();int total=run.getScenarioResults().stream().mapToInt(s->s.getTestCaseResults().size()).sum();run.getScenarioResults().forEach(s->{s.getTestCaseResults().stream().filter(c->c.getStatus()==SuiteResultStatus.PENDING).forEach(c->c.skip(error));s.summarize();});run.complete(SuiteResultStatus.FAILED,total,0,0,total,error);}

 @Transactional
 public void complete(Long suiteRunId,Long automationRunId){
  SuiteRun run=runs.findById(suiteRunId).orElseThrow();
  List<AutomationExecution> completed=executions.findByAutomationRun_IdOrderByStartedAtAsc(automationRunId);
  Map<Long,AutomationExecution> byCase=completed.stream().filter(e->e.getTestCase()!=null).collect(Collectors.toMap(e->e.getTestCase().getId(),Function.identity(),(a,b)->b));
  int total=0,passed=0,failed=0,skipped=0; String infrastructureError=null;
  for(SuiteScenarioResult scenario:run.getScenarioResults()){
   for(SuiteTestCaseResult result:scenario.getTestCaseResults()){
    total++; AutomationExecution execution=byCase.get(result.getSourceTestCaseId());
    if(execution==null){result.skip("Execution did not start because the suite run encountered an infrastructure failure");skipped++;infrastructureError="One or more Test Cases did not execute";continue;}
    SuiteResultStatus status=execution.getStatus()==AutomationExecutionStatus.PASSED?SuiteResultStatus.PASSED:SuiteResultStatus.FAILED;
    result.finish(execution.getId(),status,execution.getStartedAt(),execution.getFinishedAt(),execution.getDurationMs(),execution.getErrorMessage(),execution.getFailedStepOrder(),execution.getFailureScreenshotPath(),execution.getArtifactDirectory(),execution.getTracePath());
    if(status==SuiteResultStatus.PASSED)passed++;else failed++;
   }
   scenario.summarize();
  }
  AutomationRunStatus automationStatus=automationRuns.findById(automationRunId).orElseThrow().getStatus();
  if(automationStatus==AutomationRunStatus.ERROR||automationStatus==AutomationRunStatus.TIMED_OUT)infrastructureError="Automation infrastructure ended with "+automationStatus;
  run.complete(failed>0||skipped>0?SuiteResultStatus.FAILED:SuiteResultStatus.PASSED,total,passed,failed,skipped,infrastructureError);
 }

 @Transactional(readOnly=true) public SuiteRunResponse get(Long id){return response(runs.findById(id).orElseThrow(()->new TestSuiteNotFoundException("Suite Run not found: "+id)));}
 @Transactional(readOnly=true) public SuiteRunResponse latest(Long suiteId){return runs.findTopByTestSuiteIdSnapshotOrderByStartedAtDescIdDesc(suiteId).map(this::response).orElse(null);}
 private SuiteRunResponse response(SuiteRun r){return new SuiteRunResponse(r.getId(),r.getProject()==null?null:r.getProject().getId(),r.getProjectBusinessIdSnapshot(),r.getTestSuiteIdSnapshot(),r.getTestSuiteNameSnapshot(),r.getStatus(),r.getStartedAt(),r.getCompletedAt(),r.getDurationMs(),r.getTotal(),r.getPassed(),r.getFailed(),r.getSkipped(),r.getErrorDetails(),r.getScenarioResults().stream().map(s->new SuiteRunResponse.ScenarioResult(s.getScenarioBusinessIdSnapshot(),s.getDescriptionSnapshot(),s.getStatus(),s.getTestCaseResults().stream().map(c->new SuiteRunResponse.TestCaseResult(c.getTestCaseBusinessIdSnapshot(),c.getNameSnapshot(),c.getStatus(),c.getDurationMs(),c.getFailureDetails(),c.getAssertionFailureDetails(),c.getScreenshotPath(),c.getArtifactDirectory(),c.getTracePath(),c.getStepResults().stream().map(st->new SuiteRunResponse.TestStepResult(st.getTestStepBusinessIdSnapshot(),st.getActionSnapshot(),st.getStepOrder(),st.getStatus(),st.getFailureDetails(),st.getScreenshotPath(),st.getArtifactReference())).toList())).toList())).toList());}
 public record StartResult(Long suiteRunId,List<Long> testCaseIds){}
}
