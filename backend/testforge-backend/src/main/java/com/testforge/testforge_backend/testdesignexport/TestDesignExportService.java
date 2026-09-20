package com.testforge.testforge_backend.testdesignexport;

import com.testforge.testforge_backend.domain.Module;
import com.testforge.testforge_backend.domain.Project;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.exception.ModuleNotFoundException;
import com.testforge.testforge_backend.exception.ProjectNotFoundException;
import com.testforge.testforge_backend.exception.TestPlanNotFoundException;
import com.testforge.testforge_backend.repository.ModuleRepository;
import com.testforge.testforge_backend.repository.ProjectRepository;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class TestDesignExportService {
    private static final String SELECT = """
            select tp.id, tp.name,
                   m.id, m.name,
                   r.id, r.requirement_id, r.description,
                   s.id, s.scenario_id, s.description, s.automatable,
                   tc.id, tc.test_case_id, tc.name, tc.preconditions, tc.test_data,
                   tc.expected_result, tc.automation_status,
                   st.id, st.step_order, st.action, st.target, st.input_value, st.expected_result
              from project p
              left join test_plan tp on tp.project_id = p.id
              left join module m on m.test_plan_id = tp.id
              left join requirement r on r.module_id = m.id
              left join test_scenario s on s.requirement_id = r.id
              left join test_case tc on tc.scenario_id = s.id
              left join test_step st on st.test_case_id = tc.id
             where p.id = :projectId
            """;
    private static final String ORDER = " order by tp.id, m.id, r.id, s.id, tc.id, st.step_order, st.id";

    private final ProjectRepository projects;
    private final TestPlanRepository testPlans;
    private final ModuleRepository modules;
    private final EntityManager entityManager;
    private final TestDesignWorkbookWriter writer;

    public TestDesignExportService(ProjectRepository projects, TestPlanRepository testPlans,
                                   ModuleRepository modules, EntityManager entityManager,
                                   TestDesignWorkbookWriter writer) {
        this.projects = projects;
        this.testPlans = testPlans;
        this.modules = modules;
        this.entityManager = entityManager;
        this.writer = writer;
    }

    @Transactional(readOnly = true)
    public ExportedWorkbook export(String projectBusinessId, TestDesignExportScope scope,
                                   String testPlanBusinessId, String moduleBusinessId) {
        Project project = projects.findByProjectId(projectBusinessId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + projectBusinessId));
        String condition = "";
        String scopeLabel = "Entire Project";
        Long scopedId = null;
        if (scope == TestDesignExportScope.TEST_PLAN) {
            TestPlan plan = testPlans.findByTestPlanId(required(testPlanBusinessId, "Test Plan"))
                    .orElseThrow(() -> new TestPlanNotFoundException("Test Plan not found: " + testPlanBusinessId));
            requireProject(project, plan.getProject().getId(), "Test Plan");
            condition = " and tp.id = :scopeId";
            scopedId = plan.getId();
            scopeLabel = "Current Test Plan: " + plan.getName();
        } else if (scope == TestDesignExportScope.MODULE) {
            Module module = modules.findByModuleId(required(moduleBusinessId, "Module"))
                    .orElseThrow(() -> new ModuleNotFoundException("Module not found: " + moduleBusinessId));
            requireProject(project, module.getProject().getId(), "Module");
            condition = " and m.id = :scopeId";
            scopedId = module.getId();
            scopeLabel = "Current Module: " + module.getName();
        }

        Query query = entityManager.createNativeQuery(SELECT + condition + ORDER)
                .setParameter("projectId", project.getId());
        if (scopedId != null) query.setParameter("scopeId", scopedId);
        List<TestDesignExportRow> rows = new ArrayList<>();
        for (Object value : query.getResultList()) rows.add(map((Object[]) value));

        byte[] content = writer.write(project.getName(), scopeLabel, rows, LocalDateTime.now());
        String fileName = slug(project.getName()) + "-test-design-" + LocalDate.now() + ".xlsx";
        return new ExportedWorkbook(content, fileName);
    }

    private TestDesignExportRow map(Object[] values) {
        return new TestDesignExportRow(
                number(values[0]), string(values[1]), number(values[2]), string(values[3]),
                number(values[4]), string(values[5]), string(values[6]), number(values[7]),
                string(values[8]), string(values[9]), Boolean.TRUE.equals(values[10]), number(values[11]),
                string(values[12]), string(values[13]), string(values[14]), string(values[15]),
                string(values[16]), automationStatus(string(values[17])), number(values[18]),
                integer(values[19]), string(values[20]), string(values[21]), string(values[22]), string(values[23]));
    }

    private String automationStatus(String stored) {
        if (stored == null) return "";
        return switch (stored) {
            case "AUTOMATED" -> "AUTOMATED";
            case "NOT_APPLICABLE", "NOT_AUTOMATED" -> "MANUAL";
            default -> "INCOMPLETE";
        };
    }

    private void requireProject(Project project, Long actualProjectId, String label) {
        if (!project.getId().equals(actualProjectId))
            throw new TestDesignExportException(label + " does not belong to the selected Project.");
    }

    private String required(String value, String label) {
        if (value == null || value.isBlank()) throw new TestDesignExportException(label + " is required for this export scope.");
        return value.trim();
    }

    private static Long number(Object value) { return value instanceof Number number ? number.longValue() : null; }
    private static Integer integer(Object value) { return value instanceof Number number ? number.intValue() : null; }
    private static String string(Object value) { return value == null ? null : String.valueOf(value); }

    private static String slug(String value) {
        String slug = value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        if (slug.isBlank()) slug = "project";
        return slug.substring(0, Math.min(slug.length(), 80));
    }

    public record ExportedWorkbook(byte[] content, String fileName) { }
}
