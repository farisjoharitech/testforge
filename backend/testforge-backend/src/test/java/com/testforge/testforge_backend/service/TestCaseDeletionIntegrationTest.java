package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.cleanup.service.AuthoringDeleteImpactService;
import com.testforge.testforge_backend.cleanup.controller.AuthoringDeleteImpactController;
import com.testforge.testforge_backend.controller.TestCaseController;
import com.testforge.testforge_backend.exception.GlobalExceptionHandler;
import com.testforge.testforge_backend.repository.AutomationScriptRepository;
import com.testforge.testforge_backend.testsuite.controller.SuiteReportingController;
import com.testforge.testforge_backend.testsuite.service.SuiteRunPersistenceService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.time.LocalDateTime;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** No enclosing test transaction: rollback checks inspect committed database state. */
@SpringBootTest
class TestCaseDeletionIntegrationTest {
 @Autowired JdbcTemplate jdbc;
 @Autowired TestCaseService cases;
 @Autowired AuthoringDeleteImpactService preview;
 @Autowired SuiteRunPersistenceService history;
 @Autowired ApplicationContext context;
 @MockitoSpyBean AutomationScriptRepository scripts;
 long project, plan, module, requirement, scenario, testCase;
 String caseBusinessId;
 MockMvc mvc;
 @BeforeEach void setup() {
        project = authoring("project", "project_id", uid(), "name", uid(), "status", "ACTIVE");
        plan = authoring("test_plan", "test_plan_id", uid(), "project_id", project,
                "name", uid(), "status", "DRAFT", "approval_status", "PENDING");
        module = authoring("module", "module_id", uid(), "project_id", project,
                "test_plan_id", plan, "name", uid());
        requirement = authoring("requirement", "requirement_id", uid(), "module_id", module,
                "description", "Requirement", "priority", "MEDIUM", "status", "DRAFT");
        scenario = authoring("test_scenario", "scenario_id", uid(), "requirement_id", requirement,
                "description", "Scenario", "priority", "MEDIUM", "status", "DRAFT",
                "test_type", "FUNCTIONAL", "automatable", true);
        testCase = authoring("test_case", "test_case_id", uid(), "scenario_id", scenario,
                "name", "Dashboard summary API returns HTTP 200", "expected_result", "Success", "priority", "MEDIUM",
                "status", "DRAFT", "test_type", "FUNCTIONAL", "automation_type", "UI",
                "automation_status", "NOT_AUTOMATED");
        caseBusinessId=jdbc.queryForObject("select test_case_id from test_case where id=?",String.class,testCase);
        mvc=MockMvcBuilders.standaloneSetup(context.getBean(TestCaseController.class),context.getBean(AuthoringDeleteImpactController.class),context.getBean(SuiteReportingController.class))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }


 @AfterEach void cleanup() {
  reset(scripts);
  jdbc.update("delete from suite_test_step_result where test_case_result_id in (select c.id from suite_test_case_result c join suite_scenario_result s on s.id=c.scenario_result_id join test_suite_run r on r.id=s.suite_run_id where r.project_id=?)",project);
  jdbc.update("delete from suite_test_case_result where scenario_result_id in (select s.id from suite_scenario_result s join test_suite_run r on r.id=s.suite_run_id where r.project_id=?)",project);
  jdbc.update("delete from suite_scenario_result where suite_run_id in (select id from test_suite_run where project_id=?)",project);
  jdbc.update("delete from test_suite_run where project_id=?",project);
  jdbc.update("delete from test_suite_scenario where test_suite_id in (select id from test_suite where project_id=?)",project);
  jdbc.update("delete from test_suite where project_id=?",project);
  jdbc.update("delete from automation_execution where test_case_business_id_snapshot=?",caseBusinessId);
  jdbc.update("delete from automation_run where run_id=?",caseBusinessId);
  jdbc.update("delete from automation_step where automation_script_id in (select id from automation_script where test_case_id=?)",testCase);
  jdbc.update("delete from automation_script where test_case_id=?",testCase);
  jdbc.update("delete from test_step where test_case_id=?",testCase);
  jdbc.update("delete from test_case where id=?",testCase);
  jdbc.update("delete from test_scenario where id=?",scenario);
  jdbc.update("delete from requirement where id=?",requirement);
  jdbc.update("delete from module where id=?",module);
  jdbc.update("delete from test_plan where id=?",plan);
  jdbc.update("delete from project where id=?",project);
 }
 @Test void emptyCaseAndOwnedStepsCanBeDeleted() throws Exception {
  long step=step(1);
  assertEquals(1,preview.getTestCaseImpact(testCase).testStepCount());
  mvc.perform(delete("/api/test-cases/"+testCase)).andExpect(status().isNoContent());
  gone("test_case",testCase);gone("test_step",step);
 }
 @ParameterizedTest @ValueSource(strings={"CLICK","API_GET"})
 void ownedAutomationIsDeletedAndBothKindsOfHistoryRemainReadable(String action) throws Exception {
  long first=step(1), second=step(2), script=script();
  long a=action(script,first,1,action), b=action(script,second,2,"ASSERT_API_STATUS");
  long execution=execution(script,"PASSED");
  long suite=suite();
  String projectId=jdbc.queryForObject("select project_id from project where id=?",String.class,project);
  long run=history.start(projectId,suite).suiteRunId();history.fail(run,"Completed fixture");
  mvc.perform(get("/api/test-cases/"+testCase+"/delete-impact"))
    .andExpect(status().isOk()).andExpect(jsonPath("$.testStepCount").value(2))
    .andExpect(jsonPath("$.automationScriptCount").value(1)).andExpect(jsonPath("$.automationStepCount").value(2))
    .andExpect(jsonPath("$.historicalExecutionCount").value(1)).andExpect(jsonPath("$.blockingDependencies").isEmpty());
  mvc.perform(delete("/api/test-cases/"+testCase)).andExpect(status().isNoContent());
  gone("test_case",testCase);gone("test_step",first);gone("test_step",second);gone("automation_script",script);gone("automation_step",a);gone("automation_step",b);
  assertNull(jdbc.queryForObject("select test_case_id from automation_execution where id=?",Long.class,execution));
  assertNull(jdbc.queryForObject("select automation_script_id from automation_execution where id=?",Long.class,execution));
  assertEquals("Dashboard summary API returns HTTP 200",jdbc.queryForObject("select test_case_name_snapshot from automation_execution where id=?",String.class,execution));
  assertEquals(1,jdbc.queryForObject("select count(*) from test_suite_scenario where test_suite_id=?",Integer.class,suite));
  mvc.perform(get("/api/projects/"+projectId+"/reporting/suite-runs/"+run)).andExpect(status().isOk())
    .andExpect(jsonPath("$.scenarios[0].testCases[0].name").value("Dashboard summary API returns HTTP 200"))
    .andExpect(jsonPath("$.scenarios[0].testCases[0].steps.length()").value(2))
    .andExpect(jsonPath("$.scenarios[0].testCases[0].steps[0].action").value("Step 1"));
  assertThrows(com.testforge.testforge_backend.testsuite.exception.InvalidTestSuiteException.class,()->history.start(projectId,suite));
 }
 @Test void activeExecutionAndQueuedSuiteRunBlockButAreNotCompletedHistory() throws Exception {
  long script=script();execution(script,"RUNNING");
  long suite=suite();String projectId=jdbc.queryForObject("select project_id from project where id=?",String.class,project);
  history.start(projectId,suite);
  var impact=preview.getTestCaseImpact(testCase);assertEquals(0,impact.historicalExecutionCount());assertEquals(2,impact.blockingDependencies().size());
  mvc.perform(delete("/api/test-cases/"+testCase)).andExpect(status().isConflict());
 }
 @Test void cleanupFailureRollsBackAllActiveDeletesAndHidesDatabaseDetails() throws Exception {
  long step=step(1), script=script(), action=action(script,step,1,"API_GET");
  doThrow(new DataIntegrityViolationException("private SQL FK details")).when(scripts).flush();
  mvc.perform(delete("/api/test-cases/"+testCase)).andExpect(status().isConflict())
    .andExpect(jsonPath("$.message").value("Dependencies changed or are currently in use. Refresh the dependency preview and try again."))
    .andExpect(jsonPath("$.trace").doesNotExist());
  assertEquals(1,jdbc.queryForObject("select count(*) from automation_step where id=?",Integer.class,action));
  assertEquals(1,jdbc.queryForObject("select count(*) from automation_script where id=?",Integer.class,script));
  assertEquals(1,jdbc.queryForObject("select count(*) from test_step where id=?",Integer.class,step));
  assertEquals(1,jdbc.queryForObject("select count(*) from test_case where id=?",Integer.class,testCase));
 }
 private long step(int order){return authoring("test_step","test_step_id",uid(),"test_case_id",testCase,"step_order",order,"action","Step "+order);}
 private long script(){return authoring("automation_script","automation_script_id",uid(),"test_case_id",testCase,"name","Owned configuration");}
 private long action(long script,long step,int order,String action){return authoring("automation_step","automation_step_id",uid(),"automation_script_id",script,"test_step_id",step,"step_order",order,"action_type",action);}
 private long suite(){long suite=authoring("test_suite","project_id",project,"name","Snapshot Suite");insert("test_suite_scenario","test_suite_id",suite,"scenario_id",scenario,"item_order",1);return suite;}
 private long execution(long script,String status){long run=authoring("automation_run","run_id",caseBusinessId,"run_type","SINGLE_TEST_CASE","status",status,"started_at",LocalDateTime.now());return authoring("automation_execution","execution_id",uid(),"automation_run_id",run,"automation_script_id",script,"test_case_id",testCase,"status",status,"generated_class_name","SavedTest","started_at",LocalDateTime.now(),"test_case_business_id_snapshot",caseBusinessId,"test_case_name_snapshot","Dashboard summary API returns HTTP 200");}
 private void gone(String table,long id){assertEquals(0,jdbc.queryForObject("select count(*) from "+table+" where id=?",Integer.class,id));}
 private String uid(){return UUID.randomUUID().toString();}
    private long authoring(String table, Object... fields) {
        List<Object> values = new ArrayList<>(Arrays.asList(fields));
        values.addAll(List.of("created_at", LocalDateTime.now(), "updated_at", LocalDateTime.now()));
        return insert(table, values.toArray());
    }
    private long insert(String table, Object... fields) {
        List<String> columns = new ArrayList<>();
        List<Object> values = new ArrayList<>();
        for (int i = 0; i < fields.length; i += 2) {
            columns.add((String) fields[i]);
            values.add(fields[i + 1]);
        }
        return jdbc.queryForObject("insert into " + table + " (" + String.join(",", columns)
                + ") values (" + String.join(",", Collections.nCopies(values.size(), "?"))
                + ") returning id", Long.class, values.toArray());
    }
}
