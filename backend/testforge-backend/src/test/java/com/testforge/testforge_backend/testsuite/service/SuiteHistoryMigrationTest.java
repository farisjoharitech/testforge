package com.testforge.testforge_backend.testsuite.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class SuiteHistoryMigrationTest {
    @Autowired JdbcTemplate jdbc;

    @Test
    void backfillsExistingRunsBeforeMakingLiveSuiteOptional() {
        // Isolated transactional schema: exercise the actual V24/V25/V28 SQL,
        // including legacy rows, without changing application data.
        String schema = "suite_history_" + UUID.randomUUID().toString().replace("-", "");
        jdbc.execute("create schema " + schema);
        jdbc.execute("set local search_path to " + schema);
        jdbc.execute("create table project (id bigint primary key, project_id varchar(50), name varchar(255))");
        jdbc.execute("create table test_suite (id bigint primary key, project_id bigint, name varchar(255))");
        jdbc.execute("create table automation_run (id bigint primary key)");
        jdbc.execute("create table automation_execution (id bigint primary key)");
        migrate("V24__create_test_suite_runs.sql");
        migrate("V25__add_test_suite_junit_settings.sql");
        jdbc.update("insert into project values (1, 'PRJ-OLD', 'Legacy Project')");
        jdbc.update("insert into test_suite (id, project_id, name, execution_mode, lifecycle_enabled, "
                + "junit_tags, parameter_sets_json, junit_extensions) values "
                + "(2, 1, 'Legacy Suite', 'PARALLEL', false, 'smoke', '[{\"env\":\"legacy\"}]', 'legacy.extension')");
        jdbc.update("insert into test_suite_run (id, project_id, test_suite_id, status, started_at, total, passed) "
                + "values (3, 1, 2, 'PASSED', current_timestamp, 1, 1)");
        jdbc.update("insert into suite_scenario_result (id, suite_run_id, scenario_business_id_snapshot, status) "
                + "values (4, 3, 'SCN-OLD', 'PASSED')");
        jdbc.update("insert into suite_test_case_result (id, scenario_result_id, test_case_business_id_snapshot, name_snapshot, status) "
                + "values (5, 4, 'TC-OLD', 'Old Case', 'PASSED')");
        jdbc.update("insert into suite_test_step_result (id, test_case_result_id, test_step_business_id_snapshot, action_snapshot, step_order, status) "
                + "values (6, 5, 'STEP-OLD', 'Original action', 1, 'PASSED')");

        migrate("V28__preserve_deleted_suite_history.sql");
        jdbc.update("delete from test_suite where id=2");
        var run = jdbc.queryForMap("select * from test_suite_run where id=3");
        assertNull(run.get("test_suite_id"));
        assertEquals(2L, run.get("test_suite_id_snapshot"));
        assertEquals("Legacy Suite", run.get("test_suite_name_snapshot"));
        assertEquals(1L, run.get("project_id"));
        assertEquals("PRJ-OLD", run.get("project_business_id_snapshot"));
        assertEquals("Legacy Project", run.get("project_name_snapshot"));
        assertEquals("PARALLEL", run.get("execution_mode_snapshot"));
        assertEquals(false, run.get("lifecycle_enabled_snapshot"));
        assertEquals("smoke", run.get("junit_tags_snapshot"));
        assertEquals("[{\"env\":\"legacy\"}]", run.get("parameter_sets_json_snapshot"));
        assertEquals("legacy.extension", run.get("junit_extensions_snapshot"));
        assertEquals("PASSED", run.get("status"));
        assertEquals(1, run.get("total"));
        assertEquals(1, run.get("passed"));
        assertNotNull(run.get("started_at"));
        assertEquals(1L, jdbc.queryForObject("select count(*) from suite_scenario_result", Long.class));
        assertEquals(1L, jdbc.queryForObject("select count(*) from suite_test_case_result", Long.class));
        assertEquals("Original action", jdbc.queryForObject("select action_snapshot from suite_test_step_result where id=6", String.class));
    }

    private void migrate(String name) {
        new ResourceDatabasePopulator(new ClassPathResource("db/migration/" + name))
                .execute(jdbc.getDataSource());
    }
}
