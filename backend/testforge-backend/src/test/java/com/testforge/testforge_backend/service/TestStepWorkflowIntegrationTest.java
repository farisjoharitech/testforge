package com.testforge.testforge_backend.service;
import com.testforge.testforge_backend.dto.*;
import com.testforge.testforge_backend.automation.dto.UpdateAutomationStepRequest;
import com.testforge.testforge_backend.automation.model.*;
import com.testforge.testforge_backend.automation.validation.AutomationValidationException;
import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import java.time.LocalDateTime;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

/** Service calls commit independently, so rollback assertions inspect real persisted state. */
@SpringBootTest
class TestStepWorkflowIntegrationTest {
 @Autowired JdbcTemplate jdbc;
 @Autowired TestStepService service;
 @Autowired com.testforge.testforge_backend.automation.service.AutomationService automation;
 @Autowired com.testforge.testforge_backend.automation.service.AutomationGenerationService generation;
 long project, plan, module, requirement, scenario, testCase;
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
                "name", "Case snapshot", "expected_result", "Success", "priority", "MEDIUM",
                "status", "DRAFT", "test_type", "FUNCTIONAL", "automation_type", "UI",
                "automation_status", "NOT_AUTOMATED");
    }

 @AfterEach void cleanup() {
  jdbc.update("delete from automation_step where test_step_id in (select id from test_step where test_case_id=?)", testCase);
  jdbc.update("delete from automation_script where test_case_id=?", testCase);
  jdbc.update("delete from test_step where test_case_id=?", testCase);
  jdbc.update("delete from test_case where id=?", testCase);
  jdbc.update("delete from test_scenario where id=?", scenario);
  jdbc.update("delete from requirement where id=?", requirement);
  jdbc.update("delete from module where id=?", module);
  jdbc.update("delete from test_plan where id=?", plan);
  jdbc.update("delete from project where id=?", project);
 }
 @Test void manualCreateAndOmittedAutomationPreserveConfiguration() {
  long id=service.create(caseId(), request(null)).getId();
  assertEquals(0, mappings());
  service.update(id, update(new TestStepAutomationChange(config(AutomationActionType.FILL, "value"), false, null)));
  service.update(id, update(null));
  assertEquals(1, mappings());
 }
 @Test void createEditAndExplicitRemovalAreAtomic() {
  long id=service.create(caseId(), request(new TestStepAutomationChange(config(AutomationActionType.FILL, "first"), false, null))).getId();
  long mapping=mappingId();
  service.update(id, update(new TestStepAutomationChange(config(AutomationActionType.FILL, "second"), false, mapping)));
  assertEquals("second", jdbc.queryForObject("select input_value from automation_step where id=?", String.class, mapping));
  assertThrows(AutomationConflictException.class, () -> service.update(id, update(new TestStepAutomationChange(null, true, null))));
  assertEquals(1, mappings());
  service.update(id, update(new TestStepAutomationChange(null, true, mapping)));
  assertEquals(0, mappings());
  assertEquals(1, jdbc.queryForObject("select count(*) from test_step where id=?", Integer.class,id));
 }
 @ParameterizedTest @EnumSource(value=AutomationActionType.class, names={"FILL","CLICK","NAVIGATE","ASSERT_TEXT"})
 void invalidAutomationRollsBackStepAndNewScript(AutomationActionType action) {
  var invalid=new UpdateAutomationStepRequest(1, action, null, null, null, null, null, false, null, null);
  assertThrows(AutomationValidationException.class, () -> service.create(caseId(), request(new TestStepAutomationChange(invalid,false,null))));
  assertEquals(0,jdbc.queryForObject("select count(*) from test_step where test_case_id=?",Integer.class,testCase));
  assertEquals(0,jdbc.queryForObject("select count(*) from automation_script where test_case_id=?",Integer.class,testCase));
 }
 @Test void invalidEditRollsBackManualAndAutomationChanges() {
  long id=service.create(caseId(), request(new TestStepAutomationChange(config(AutomationActionType.FILL,"original"),false,null))).getId();
  var request=update(new TestStepAutomationChange(config(AutomationActionType.FILL,null),false,mappingId()));
  request.setAction("Must roll back");
  assertThrows(AutomationValidationException.class, () -> service.update(id,request));
  assertEquals("Manual action",jdbc.queryForObject("select action from test_step where id=?",String.class,id));
  assertEquals("original",jdbc.queryForObject("select input_value from automation_step where id=?",String.class,mappingId()));
 }
 @Test void manualScenarioRejectsAutomationWithoutPartialStep() {
  jdbc.update("update test_scenario set automatable=false where id=?",scenario);
  assertThrows(AutomationConflictException.class, () -> service.create(caseId(),request(new TestStepAutomationChange(config(AutomationActionType.FILL,"value"),false,null))));
  assertEquals(0,jdbc.queryForObject("select count(*) from test_step where test_case_id=?",Integer.class,testCase));
 }
 @Test void mixedActionsAreDiscoverableWithoutCrossProjectData() {
  var api = new UpdateAutomationStepRequest(1,AutomationActionType.API_GET,"https://example.test/api",null,null,null,null,false,null,null,
          "{\"headers\":{\"Accept\":\"application/json\"},\"queryParams\":{\"page\":\"1\"}}");
  service.create(caseId(),request(new TestStepAutomationChange(api,false,null)));
  var click = new UpdateAutomationStepRequest(2,AutomationActionType.CLICK,null,SelectorStrategy.LABEL,"Button",null,null,false,null,null);
  service.create(caseId(),request(new TestStepAutomationChange(click,false,null)));
  assertEquals("UI_API",jdbc.queryForObject("select automation_type from test_case where id=?",String.class,testCase));
  String projectId=jdbc.queryForObject("select project_id from project where id=?",String.class,project);
  var overview=automation.overview(projectId);
  assertEquals(2,overview.size());
  assertEquals(AutomationActionType.API_GET,overview.get(0).actionType());
  assertEquals(caseId(),overview.get(0).testCaseId());
  assertTrue(automation.overview("OTHER-PROJECT").isEmpty());
  long script=jdbc.queryForObject("select id from automation_script where test_case_id=?",Long.class,testCase);
  String source=generation.generate(script).source();
  assertTrue(source.contains("apiRequest.get"));
  assertTrue(source.contains("getByLabel"));
 }
 @Test void malformedRequestConfigurationRollsBackBeforeGeneration() {
  var api = new UpdateAutomationStepRequest(1,AutomationActionType.API_POST,"https://example.test/api",null,null,null,null,false,null,null,
          "{\"bodyType\":\"JSON\",\"body\":\"invalid\"}");
  assertThrows(AutomationValidationException.class,()->service.create(caseId(),request(new TestStepAutomationChange(api,false,null))));
  assertEquals(0,mappings());
  assertEquals(0,jdbc.queryForObject("select count(*) from test_step where test_case_id=?",Integer.class,testCase));
 }
 @Test void credentialHeadersRequireRuntimeReferences() {
  var literal = new UpdateAutomationStepRequest(1,AutomationActionType.API_GET,"https://example.test",null,null,null,null,false,null,null,
          "{\"headers\":{\"Authorization\":\"Bearer saved-token\"}}");
  assertThrows(AutomationValidationException.class,()->service.create(caseId(),request(new TestStepAutomationChange(literal,false,null))));
  var reference = new UpdateAutomationStepRequest(1,AutomationActionType.API_GET,"https://example.test",null,null,null,null,false,null,null,
          "{\"headers\":{\"Authorization\":\"Bearer ${authToken}\"}}");
  service.create(caseId(),request(new TestStepAutomationChange(reference,false,null)));
  assertEquals(1,mappings());
 }
 private CreateTestStepRequest request(TestStepAutomationChange change) { var r=new CreateTestStepRequest();r.setAction("Manual action");r.setAutomation(change);return r; }
 private UpdateTestStepRequest update(TestStepAutomationChange change) {var r=new UpdateTestStepRequest();r.setAction("Edited action");r.setStepOrder(1);r.setAutomation(change);return r;}
 private UpdateAutomationStepRequest config(AutomationActionType action,String input) {return new UpdateAutomationStepRequest(1,action,null,SelectorStrategy.LABEL,"Username",null,null,false,input,null);}
 private String caseId() {return jdbc.queryForObject("select test_case_id from test_case where id=?",String.class,testCase);}
 private int mappings() {return jdbc.queryForObject("select count(*) from automation_step where test_step_id in (select id from test_step where test_case_id=?)",Integer.class,testCase);}
 private long mappingId() {return jdbc.queryForObject("select id from automation_step where test_step_id in (select id from test_step where test_case_id=?)",Long.class,testCase);}
 private String uid() {return UUID.randomUUID().toString();}
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
