package com.testforge.testforge_backend.cleanup.service;

import com.testforge.testforge_backend.exception.ResourceInUseException;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Explicit, transactional cleanup for active Test Design ownership trees. */
@Service
public class AuthoringDeletionService {
    private final EntityManager entityManager;

    public AuthoringDeletionService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional
    public void deleteTestStep(Long id) {
        require("test_step", id, "Test Step");
        blockRunningForStep(id);
        List<Long> scripts = ids("select distinct automation_script_id from automation_step where test_step_id = :id", id);
        execute("delete from automation_step where test_step_id = :id", id);
        for (Long scriptId : scripts) {
            if (count("select count(*) from automation_step where automation_script_id = :id", scriptId) == 0) {
                entityManager.createNativeQuery("delete from automation_script where id = :id")
                        .setParameter("id", scriptId).executeUpdate();
            } else {
                entityManager.createNativeQuery("update automation_script set generated_source=null, generated_class_name=null, generated_at=null, generated_step_count=null where id=:id")
                        .setParameter("id", scriptId).executeUpdate();
            }
        }
        entityManager.createNativeQuery("update test_case set automation_status='NOT_AUTOMATED' where id=(select test_case_id from test_step where id=:id)")
                .setParameter("id", id).executeUpdate();
        execute("delete from test_step where id = :id", id);
        entityManager.clear();
    }

    @Transactional
    public void deleteTestCase(Long id) {
        require("test_case", id, "Test Case");
        deleteCases("tc.id = :id", id);
    }

    @Transactional
    public void deleteScenario(Long id) {
        require("test_scenario", id, "Test Scenario");
        blockSuites("tss.scenario_id = :id", id);
        deleteCases("tc.scenario_id = :id", id);
        execute("delete from test_scenario where id = :id", id);
        entityManager.clear();
    }

    @Transactional
    public void deleteRequirement(Long id) {
        require("requirement", id, "Requirement");
        blockSuites("ts.requirement_id = :id", id);
        deleteCases("ts.requirement_id = :id", id);
        execute("delete from test_scenario where requirement_id = :id", id);
        execute("delete from requirement where id = :id", id);
        entityManager.clear();
    }

    @Transactional
    public void deleteModule(Long id) {
        require("module", id, "Module");
        blockSuites("r.module_id = :id", id);
        deleteCases("r.module_id = :id", id);
        execute("delete from test_scenario where requirement_id in (select id from requirement where module_id = :id)", id);
        execute("delete from requirement where module_id = :id", id);
        execute("delete from module where id = :id", id);
        entityManager.clear();
    }

    @Transactional
    public void deleteTestPlan(Long id) {
        require("test_plan", id, "Test Plan");
        blockSuites("m.test_plan_id = :id", id);
        deleteCases("m.test_plan_id = :id", id);
        execute("delete from test_scenario where requirement_id in (select r.id from requirement r join module m on m.id=r.module_id where m.test_plan_id = :id)", id);
        execute("delete from requirement where module_id in (select id from module where test_plan_id = :id)", id);
        execute("delete from module where test_plan_id = :id", id);
        execute("delete from test_plan where id = :id", id);
        entityManager.clear();
    }

    @Transactional
    public void deleteProject(Long id) {
        require("project", id, "Project");
        if (count("select count(*) from test_suite_run where project_id=:id and status in ('PENDING','RUNNING')", id) > 0) {
            throw new ResourceInUseException("A Suite Run for this Project is currently active. Wait for it to finish.");
        }
        // Test Suites are active configuration owned by the Project.
        execute("delete from test_suite_scenario where test_suite_id in (select id from test_suite where project_id = :id)", id);
        execute("delete from test_suite where project_id = :id", id);
        deleteCases("m.project_id = :id", id);
        execute("delete from test_scenario where requirement_id in (select r.id from requirement r join module m on m.id=r.module_id where m.project_id = :id)", id);
        execute("delete from requirement where module_id in (select id from module where project_id = :id)", id);
        execute("delete from module where project_id = :id", id);
        execute("delete from test_plan where project_id = :id", id);
        execute("delete from git_sync_history where configuration_id in (select id from git_integration_configuration where project_id = :id)", id);
        execute("delete from git_integration_configuration where project_id = :id", id);
        execute("delete from project where id = :id", id);
        entityManager.clear();
    }

    private void deleteCases(String scope, Long id) {
        String joins = scope.startsWith("tc.") ? "" : " join test_scenario ts on ts.id=tc.scenario_id join requirement r on r.id=ts.requirement_id join module m on m.id=r.module_id";
        String cases = "select tc.id from test_case tc" + joins + " where " + scope;
        String steps = "select s.id from test_step s where s.test_case_id in (" + cases + ")";
        if (countSql("select count(*) from automation_execution where test_case_id in (" + cases + ") and status in ('PENDING','RUNNING')", id) > 0
                || countSql("select count(*) from suite_test_case_result c join suite_scenario_result sr on sr.id=c.scenario_result_id join test_suite_run run on run.id=sr.suite_run_id where c.source_test_case_id in (" + cases + ") and run.status in ('PENDING','RUNNING')", id) > 0) {
            throw new ResourceInUseException("An execution using this test design is still running. Wait for it to finish.");
        }
        if (countSql("select count(*) from automation_step a where a.test_step_id in (" + steps + ") and a.automation_script_id not in (select x.id from automation_script x where x.test_case_id in (" + cases + "))", id) > 0) {
            throw new ResourceInUseException("Automation owned by another Test Case uses these Test Steps. Review that automation before deleting.");
        }
        executeSql("delete from automation_step where automation_script_id in (select id from automation_script where test_case_id in (" + cases + "))", id);
        executeSql("delete from automation_script where test_case_id in (" + cases + ")", id);
        executeSql("delete from test_step where test_case_id in (" + cases + ")", id);
        executeSql("delete from test_case tc where tc.id in (" + cases + ")", id);
    }

    private void blockSuites(String scope, Long id) {
        String sql = "select distinct suite.name from test_suite suite join test_suite_scenario tss on tss.test_suite_id=suite.id "
                + "join test_scenario ts on ts.id=tss.scenario_id join requirement r on r.id=ts.requirement_id join module m on m.id=r.module_id where " + scope;
        @SuppressWarnings("unchecked") List<String> names = entityManager.createNativeQuery(sql).setParameter("id", id).getResultList();
        if (!names.isEmpty()) throw new ResourceInUseException("This test design is currently used by active Test Suites: " + String.join(", ", names) + ". Manage Test Suites before deleting it.");
    }

    private void blockRunningForStep(Long id) {
        if (count("select count(*) from automation_execution e join test_step s on s.test_case_id=e.test_case_id where s.id=:id and e.status in ('PENDING','RUNNING')", id) > 0) {
            throw new ResourceInUseException("An automation execution using this Test Step is still running. Wait for it to finish.");
        }
    }

    private void require(String table, Long id, String label) {
        if (count("select count(*) from " + table + " where id=:id", id) == 0) throw new IllegalArgumentException(label + " not found: " + id);
    }
    private int execute(String sql, Long id) { return entityManager.createNativeQuery(sql).setParameter("id", id).executeUpdate(); }
    private int executeSql(String sql, Long id) { return execute(sql, id); }
    private long count(String sql, Long id) { return ((Number) entityManager.createNativeQuery(sql).setParameter("id", id).getSingleResult()).longValue(); }
    private long countSql(String sql, Long id) { return count(sql, id); }
    @SuppressWarnings("unchecked") private List<Long> ids(String sql, Long id) { return ((List<Number>) entityManager.createNativeQuery(sql).setParameter("id", id).getResultList()).stream().map(Number::longValue).toList(); }
}
