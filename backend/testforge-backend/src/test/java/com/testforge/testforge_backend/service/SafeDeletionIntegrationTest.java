package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.controller.*;
import com.testforge.testforge_backend.exception.GlobalExceptionHandler;
import com.testforge.testforge_backend.testsuite.controller.TestSuiteController;
import com.testforge.testforge_backend.testsuite.controller.SuiteReportingController;
import com.testforge.testforge_backend.testsuite.entity.SuiteRun;
import com.testforge.testforge_backend.testsuite.entity.TestSuite;
import com.testforge.testforge_backend.testsuite.entity.SuiteExecutionMode;
import com.testforge.testforge_backend.testsuite.entity.SuiteResultStatus;
import com.testforge.testforge_backend.testsuite.service.SuiteRunPersistenceService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Real services, JPA and migrated PostgreSQL FKs; all fixtures roll back. */
@SpringBootTest
@Transactional
class SafeDeletionIntegrationTest {
    @Autowired ApplicationContext context;
    @Autowired JdbcTemplate jdbc;
    @Autowired EntityManager em;
    MockMvc mvc;
    long project, plan, module, requirement, scenario, testCase;

    @BeforeEach
    void setup() {
        mvc = MockMvcBuilders.standaloneSetup(
                context.getBean(ProjectController.class), context.getBean(TestPlanController.class),
                context.getBean(ModuleController.class), context.getBean(RequirementController.class),
                context.getBean(TestScenarioController.class), context.getBean(TestCaseController.class),
                context.getBean(TestStepController.class), context.getBean(TestSuiteController.class),
                context.getBean(SuiteReportingController.class))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        project = project();
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

    @ParameterizedTest
    @CsvSource({"projects,Test Plans", "test-plans,Modules", "modules,Requirements",
            "requirements,Scenarios", "scenarios,Test Cases"})
    void ownedDesignHierarchyDeletesInOneRequest(String endpoint, String dependency) throws Exception {
        long step = step();
        long id = switch (endpoint) {
            case "projects" -> project;
            case "test-plans" -> plan;
            case "modules" -> module;
            case "requirements" -> requirement;
            case "scenarios" -> scenario;
            default -> testCase;
        };
        remove(endpoint, id);
        assertGone(switch (endpoint) { case "projects" -> "project"; case "test-plans" -> "test_plan"; case "modules" -> "module"; case "requirements" -> "requirement"; case "scenarios" -> "test_scenario"; default -> "test_case"; }, id);
    }

    @Test
    void testCaseWithOnlyOwnedScriptCanBeDeleted() throws Exception {
        long script = script();
        remove("test-cases", testCase);
        assertGone("automation_script", script);
        assertGone("test_case", testCase);
    }

    @Test
    void mappedTestStepDeletesItsOwnedAutomation() throws Exception {
        long step = step();
        long mapping = authoring("automation_step", "automation_step_id", uid(),
                "automation_script_id", script(), "test_step_id", step,
                "step_order", 1, "action_type", "CLICK");
        remove("test-steps", step);
        assertGone("automation_step", mapping);
        assertGone("test_step", step);
    }

    @Test
    void suiteMembershipProtectsScenarioButDoesNotOwnItsCases() throws Exception {
        long suite = suite(project);
        long member = insert("test_suite_scenario", "test_suite_id", suite,
                "scenario_id", scenario, "item_order", 1);
        conflict("scenarios", scenario, "Test Suite");
        remove("test-cases", testCase);
        assertExists("test_scenario", scenario);
        assertExists("test_suite_scenario", member);
    }

    @ParameterizedTest
    @CsvSource({"module,Modules", "suite,Test Suites", "run,historical Suite Runs"})
    void projectOwnsActiveConfigurationAndPreservesHistory(String kind, String dependency) throws Exception {
        long isolated = project();
        switch (kind) {
            case "module" -> authoring("module", "module_id", uid(), "project_id", isolated, "name", uid());
            case "suite" -> suite(isolated);
            // The schema permits independent run.project_id; validate that FK directly too.
            default -> run(isolated, suite(project));
        }
        remove("projects", isolated);
        assertGone("project", isolated);
    }

    @Test
    void deletingSuitePreservesSnapshotsAndProjectReporting() throws Exception {
        step();
        long suite = suite(project);
        long member = insert("test_suite_scenario", "test_suite_id", suite,
                "scenario_id", scenario, "item_order", 1);
        jdbc.update("update test_suite set name='Original Suite', execution_mode='PARALLEL', "
                + "lifecycle_enabled=false, junit_tags='regression', parameter_sets_json='[{\"env\":\"original\"}]', "
                + "junit_extensions='legacy.extension' where id=?", suite);
        jdbc.update("update project set name='Original Project' where id=?", project);
        String projectId = jdbc.queryForObject("select project_id from project where id=?", String.class, project);
        long olderRun = run(project, suite);
        SuiteRunPersistenceService persistence = context.getBean(SuiteRunPersistenceService.class);
        long run = persistence.start(projectId, suite).suiteRunId();
        persistence.fail(run, "Fixture execution failure");
        em.flush();
        em.clear();
        // Historical display/configuration must not track later live edits.
        jdbc.update("update test_suite set name='Renamed Suite', execution_mode='SEQUENTIAL', "
                + "lifecycle_enabled=true, junit_tags=null, parameter_sets_json=null, junit_extensions=null where id=?", suite);
        jdbc.update("update project set name='Renamed Project' where id=?", project);
        remove("test-suites", suite);
        assertGone("test_suite", suite);
        assertGone("test_suite_scenario", member);
        assertExists("test_suite_run", run);
        assertExists("test_suite_run", olderRun);
        assertExists("test_scenario", scenario);
        assertExists("test_case", testCase);
        SuiteRun snapshot = em.find(SuiteRun.class, run);
        assertNull(snapshot.getTestSuite());
        assertEquals(suite, snapshot.getTestSuiteIdSnapshot());
        assertEquals("Original Suite", snapshot.getTestSuiteNameSnapshot());
        assertEquals("Original Project", snapshot.getProjectNameSnapshot());
        assertEquals(projectId, snapshot.getProjectBusinessIdSnapshot());
        assertEquals(SuiteExecutionMode.PARALLEL, snapshot.getExecutionModeSnapshot());
        assertFalse(snapshot.isLifecycleEnabledSnapshot());
        assertEquals("regression", snapshot.getJunitTagsSnapshot());
        assertEquals("[{\"env\":\"original\"}]", snapshot.getParameterSetsJsonSnapshot());
        assertEquals("legacy.extension", snapshot.getJunitExtensionsSnapshot());
        assertEquals(run, persistence.latest(suite).id());
        assertEquals("Original Suite", persistence.get(run).testSuiteName());

        String reporting = "/api/projects/" + projectId + "/reporting";
        mvc.perform(get(reporting + "/test-suites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].testSuiteId").value(suite))
                .andExpect(jsonPath("$[0].suiteName").value("Original Suite"))
                .andExpect(jsonPath("$[0].latestRunId").value(run));
        mvc.perform(get(reporting + "/test-suites/" + suite + "/runs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(run));
        mvc.perform(get(reporting + "/suite-runs/" + run))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.testSuiteName").value("Original Suite"))
                .andExpect(jsonPath("$.testSuiteId").value(suite))
                .andExpect(jsonPath("$.projectBusinessId").value(projectId))
                .andExpect(jsonPath("$.status").value("FAILED"))
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.skipped").value(1))
                .andExpect(jsonPath("$.startedAt").isNotEmpty())
                .andExpect(jsonPath("$.completedAt").isNotEmpty())
                .andExpect(jsonPath("$.scenarios[0].description").value("Scenario"))
                .andExpect(jsonPath("$.scenarios[0].testCases[0].name").value("Case snapshot"))
                .andExpect(jsonPath("$.scenarios[0].testCases[0].steps[0].action").value("Click"));
        mvc.perform(get("/api/projects/OTHER/reporting/test-suites/" + suite + "/runs"))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/projects/OTHER/reporting/suite-runs/" + run))
                .andExpect(status().isNotFound());
        // Direct project ownership still protects access to history after the live Suite is gone.
        assertEquals(project, snapshot.getProject().getId());
    }

    @Test
    void deletingProjectPreservesSnapshotReporting() throws Exception {
        long isolated = project();
        String projectId = jdbc.queryForObject("select project_id from project where id=?", String.class, isolated);
        long suite = suite(isolated);
        long historicalRun = run(isolated, suite);
        remove("projects", isolated);
        assertGone("project", isolated);
        assertExists("test_suite_run", historicalRun);
        assertNull(jdbc.queryForObject("select project_id from test_suite_run where id=?", Long.class, historicalRun));
        mvc.perform(get("/api/projects/" + projectId + "/reporting/test-suites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].testSuiteId").value(suite));
    }

    @Test
    void collectionDeletionRemovesOnlyOwnedMemberships() throws Exception {
        long suite = suite(project);
        long member = insert("test_suite_scenario", "test_suite_id", suite,
                "scenario_id", scenario, "item_order", 1);
        remove("test-suites", suite);
        assertGone("test_suite_scenario", member);
        assertExists("test_scenario", scenario);
    }

    @Test
    void emptyHierarchyCanBeDeletedFromLeafToRoot() throws Exception {
        long step = step();
        remove("test-steps", step);
        remove("test-cases", testCase);
        remove("scenarios", scenario);
        remove("requirements", requirement);
        remove("modules", module);
        remove("test-plans", plan);
        remove("projects", project);
        assertGone("project", project);
        assertGone("test_step", step);
    }

    @Test
    void independentHistoricalSnapshotsSurviveSourceDeletion() throws Exception {
        long step = step();
        long run = run(project, suite(project));
        long sr = insert("suite_scenario_result", "suite_run_id", run, "source_scenario_id", scenario,
                "scenario_business_id_snapshot", "SCN-SNAPSHOT", "status", "PASSED");
        long cr = insert("suite_test_case_result", "scenario_result_id", sr, "source_test_case_id", testCase,
                "test_case_business_id_snapshot", "TC-SNAPSHOT", "name_snapshot", "Case snapshot", "status", "PASSED");
        long tr = insert("suite_test_step_result", "test_case_result_id", cr, "source_test_step_id", step,
                "test_step_business_id_snapshot", "STEP-SNAPSHOT", "action_snapshot", "Click",
                "step_order", 1, "status", "PASSED");
        long ar = authoring("automation_run", "run_id", uid(), "run_type", "SINGLE_TEST_CASE",
                "status", "PASSED", "started_at", LocalDateTime.now());
        long execution = authoring("automation_execution", "execution_id", uid(), "automation_run_id", ar,
                "test_case_id", testCase, "status", "PASSED", "generated_class_name", "SnapshotTest",
                "started_at", LocalDateTime.now(), "test_case_business_id_snapshot", "TC-SNAPSHOT",
                "test_case_name_snapshot", "Case snapshot");
        remove("test-steps", step);
        remove("test-cases", testCase);
        remove("scenarios", scenario);
        assertExists("suite_test_step_result", tr);
        assertEquals("Case snapshot", jdbc.queryForObject(
                "select name_snapshot from suite_test_case_result where id=?", String.class, cr));
        assertEquals("SCN-SNAPSHOT", jdbc.queryForObject(
                "select scenario_business_id_snapshot from suite_scenario_result where id=?", String.class, sr));
        assertNull(jdbc.queryForObject("select test_case_id from automation_execution where id=?", Long.class, execution));
        assertEquals("Case snapshot", jdbc.queryForObject(
                "select test_case_name_snapshot from automation_execution where id=?", String.class, execution));
    }

    @Test
    void runningExecutionProtectsCaseEvenIfItsScriptWasPreviouslyRemoved() throws Exception {
        long ar = authoring("automation_run", "run_id", uid(), "run_type", "SINGLE_TEST_CASE",
                "status", "RUNNING", "started_at", LocalDateTime.now());
        authoring("automation_execution", "execution_id", uid(), "automation_run_id", ar,
                "test_case_id", testCase, "status", "RUNNING", "generated_class_name", "RunningTest",
                "started_at", LocalDateTime.now());
        conflict("test-cases", testCase, "execution is running");
    }

    @Test
    void removingAutomationPreservesHistoryAndBlocksIncompleteGeneration() throws Exception {
        long first = step();
        long second = authoring("test_step", "test_step_id", uid(), "test_case_id", testCase,
                "step_order", 2, "action", "Second step");
        long script = script();
        long firstAction = authoring("automation_step", "automation_step_id", uid(), "automation_script_id", script,
                "test_step_id", first, "step_order", 1, "action_type", "CLICK", "selector_strategy", "LABEL", "selector_value", "Button");
        long lastAction = authoring("automation_step", "automation_step_id", uid(), "automation_script_id", script,
                "test_step_id", second, "step_order", 2, "action_type", "CLICK", "selector_strategy", "LABEL", "selector_value", "Button");
        long suite = suite(project);
        insert("test_suite_scenario", "test_suite_id", suite, "scenario_id", scenario, "item_order", 1);
        String projectId = jdbc.queryForObject("select project_id from project where id=?", String.class, project);
        var history = context.getBean(SuiteRunPersistenceService.class);
        long run = history.start(projectId, suite).suiteRunId();
        history.fail(run, "Snapshot fixture");
        em.flush(); em.clear();
        var generator = context.getBean(com.testforge.testforge_backend.automation.service.AutomationGenerationService.class);
        var automation = context.getBean(com.testforge.testforge_backend.automation.service.AutomationService.class);
        generator.generate(script);
        remove("test-steps", first);
        em.flush(); em.clear();
        assertGone("test_step", first);
        assertExists("automation_step", lastAction);
        assertThrows(com.testforge.testforge_backend.automation.exception.AutomationNotFoundException.class, () -> generator.getGenerated(script));
        assertDoesNotThrow(() -> generator.generate(script));
        assertDoesNotThrow(() -> context.getBean(com.testforge.testforge_backend.testsuite.service.TestSuiteExportService.class).export(projectId, suite));
        automation.deleteStep(lastAction);
        em.flush(); em.clear();
        assertExists("test_step", second);
        assertExists("automation_script", script); // reusable draft preserves historical execution links
        assertNull(jdbc.queryForObject("select generated_source from automation_script where id=?", String.class, script));
        remove("test-steps", second);
        mvc.perform(get("/api/projects/" + projectId + "/reporting/suite-runs/" + run))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scenarios[0].testCases[0].steps.length()").value(2))
                .andExpect(jsonPath("$.scenarios[0].testCases[0].steps[0].action").value("Click"));
    }

    private void conflict(String endpoint, long id, String dependency) throws Exception {
        mvc.perform(delete("/api/" + endpoint + "/" + id))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString(dependency)))
                .andExpect(jsonPath("$.path").value("/api/" + endpoint + "/" + id))
                .andExpect(jsonPath("$.trace").doesNotExist());
    }

    private void remove(String endpoint, long id) throws Exception {
        mvc.perform(delete("/api/" + endpoint + "/" + id)).andExpect(status().isNoContent());
        em.flush(); // Exercise FK enforcement, not merely deferred JPA removal.
        em.clear();
    }

    private long project() { return authoring("project", "project_id", uid(), "name", uid(), "status", "ACTIVE"); }
    private long suite(long p) { return authoring("test_suite", "project_id", p, "name", uid()); }
    private long run(long p, long s) {
        SuiteRun run = new SuiteRun(em.find(com.testforge.testforge_backend.domain.Project.class, p),
                em.find(TestSuite.class, s), LocalDateTime.now());
        run.complete(SuiteResultStatus.PASSED, 0, 0, 0, 0, null);
        em.persist(run);
        em.flush();
        return run.getId();
    }
    private long step() { return authoring("test_step", "test_step_id", uid(), "test_case_id", testCase,
            "step_order", 1, "action", "Click"); }
    private long script() { return authoring("automation_script", "automation_script_id", uid(),
            "test_case_id", testCase, "name", "Automation"); }
    private String uid() { return UUID.randomUUID().toString(); }
    private void assertExists(String table, long id) { assertEquals(1L, count(table, id)); }
    private void assertGone(String table, long id) { assertEquals(0L, count(table, id)); }
    private long count(String table, long id) {
        return jdbc.queryForObject("select count(*) from " + table + " where id=?", Long.class, id);
    }
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
