package com.testforge.testforge_backend.cleanup.service;

import com.testforge.testforge_backend.automation.exception.AutomationConflictException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthoringCascadeDeleteService {

    private final JdbcTemplate jdbcTemplate;

    public AuthoringCascadeDeleteService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public void deleteRequirement(Long requirementId) {
        blockRunningExecutions(requirementId, true);

        jdbcTemplate.update("""
                DELETE FROM test_set_item tsi
                USING test_case tc, test_scenario ts
                WHERE tsi.test_case_id = tc.id
                  AND tc.scenario_id = ts.id
                  AND ts.requirement_id = ?
                """, requirementId);

        jdbcTemplate.update("""
                DELETE FROM automation_step ast
                USING automation_script script, test_case tc, test_scenario ts
                WHERE ast.automation_script_id = script.id
                  AND script.test_case_id = tc.id
                  AND tc.scenario_id = ts.id
                  AND ts.requirement_id = ?
                """, requirementId);

        jdbcTemplate.update("""
                DELETE FROM test_step step
                USING test_case tc, test_scenario ts
                WHERE step.test_case_id = tc.id
                  AND tc.scenario_id = ts.id
                  AND ts.requirement_id = ?
                """, requirementId);

        jdbcTemplate.update("""
                DELETE FROM automation_script script
                USING test_case tc, test_scenario ts
                WHERE script.test_case_id = tc.id
                  AND tc.scenario_id = ts.id
                  AND ts.requirement_id = ?
                """, requirementId);

        jdbcTemplate.update("""
                DELETE FROM test_case tc
                USING test_scenario ts
                WHERE tc.scenario_id = ts.id
                  AND ts.requirement_id = ?
                """, requirementId);

        jdbcTemplate.update("DELETE FROM test_scenario WHERE requirement_id = ?", requirementId);
        jdbcTemplate.update("DELETE FROM requirement WHERE id = ?", requirementId);
    }

    @Transactional
    public void deleteScenario(Long scenarioId) {
        blockRunningExecutions(scenarioId, false);

        jdbcTemplate.update("""
                DELETE FROM test_set_item tsi
                USING test_case tc
                WHERE tsi.test_case_id = tc.id
                  AND tc.scenario_id = ?
                """, scenarioId);

        jdbcTemplate.update("""
                DELETE FROM automation_step ast
                USING automation_script script, test_case tc
                WHERE ast.automation_script_id = script.id
                  AND script.test_case_id = tc.id
                  AND tc.scenario_id = ?
                """, scenarioId);

        jdbcTemplate.update("""
                DELETE FROM test_step step
                USING test_case tc
                WHERE step.test_case_id = tc.id
                  AND tc.scenario_id = ?
                """, scenarioId);

        jdbcTemplate.update("""
                DELETE FROM automation_script script
                USING test_case tc
                WHERE script.test_case_id = tc.id
                  AND tc.scenario_id = ?
                """, scenarioId);

        jdbcTemplate.update("DELETE FROM test_case WHERE scenario_id = ?", scenarioId);
        jdbcTemplate.update("DELETE FROM test_scenario WHERE id = ?", scenarioId);
    }

    private void blockRunningExecutions(Long id, boolean requirement) {
        String sql = requirement
                ? """
                  SELECT COUNT(*)
                  FROM automation_execution e
                  JOIN test_case tc ON tc.id = e.test_case_id
                  JOIN test_scenario ts ON ts.id = tc.scenario_id
                  WHERE ts.requirement_id = ? AND e.status = 'RUNNING'
                  """
                : """
                  SELECT COUNT(*)
                  FROM automation_execution e
                  JOIN test_case tc ON tc.id = e.test_case_id
                  WHERE tc.scenario_id = ? AND e.status = 'RUNNING'
                  """;

        Long count = jdbcTemplate.queryForObject(sql, Long.class, id);
        if (count != null && count > 0) {
            throw new AutomationConflictException(
                    "Cannot delete authoring hierarchy while a descendant automation execution is RUNNING"
            );
        }
    }
}
