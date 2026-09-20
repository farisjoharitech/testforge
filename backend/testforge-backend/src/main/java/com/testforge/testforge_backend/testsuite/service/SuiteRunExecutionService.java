package com.testforge.testforge_backend.testsuite.service;
import com.testforge.testforge_backend.automation.dto.AutomationRunResponse; import com.testforge.testforge_backend.automation.service.AutomationMultiRunService; import com.testforge.testforge_backend.testsuite.dto.SuiteRunResponse; import org.springframework.stereotype.Service;
@Service public class SuiteRunExecutionService {
 private final SuiteRunPersistenceService persistence; private final AutomationMultiRunService automation; private final TestSuiteService suites;
 public SuiteRunExecutionService(SuiteRunPersistenceService p,AutomationMultiRunService a,TestSuiteService s){persistence=p;automation=a;suites=s;}
 public SuiteRunResponse execute(String projectId,Long suiteId){SuiteRunPersistenceService.StartResult start=persistence.start(projectId,suiteId);try{AutomationRunResponse automationRun=automation.executeTestSuiteTestCases(start.testCaseIds(),suites.configuration(suiteId),completed->{try{persistence.complete(start.suiteRunId(),completed.id());}catch(RuntimeException failure){persistence.fail(start.suiteRunId(),"Unable to persist Suite Run results: "+failure.getMessage());}});persistence.attachAutomationRun(start.suiteRunId(),automationRun.id());return persistence.get(start.suiteRunId());}catch(RuntimeException failure){persistence.fail(start.suiteRunId(),failure.getMessage());throw failure;}}
 public SuiteRunResponse get(Long id){return persistence.get(id);} public SuiteRunResponse latest(Long suiteId){return persistence.latest(suiteId);}
}
