package com.testforge.testforge_backend.testdesignexport;

import com.testforge.testforge_backend.domain.Module;
import com.testforge.testforge_backend.domain.Project;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.repository.ModuleRepository;
import com.testforge.testforge_backend.repository.ProjectRepository;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TestDesignExportServiceTest {
    @Test
    void rejectsCrossProjectModuleScopeBeforeQuerying() {
        Fixture fixture = new Fixture();
        Project selected = project(1L, "PRJ-1", "Portal");
        Module module = new Module();
        module.setId(9L);
        module.setModuleId("MOD-9");
        module.setProject(project(2L, "PRJ-2", "Other"));
        when(fixture.projects.findByProjectId("PRJ-1")).thenReturn(Optional.of(selected));
        when(fixture.modules.findByModuleId("MOD-9")).thenReturn(Optional.of(module));

        assertThatThrownBy(() -> fixture.service.export("PRJ-1", TestDesignExportScope.MODULE, null, "MOD-9"))
                .isInstanceOf(TestDesignExportException.class)
                .hasMessage("Module does not belong to the selected Project.");
    }

    @Test
    void appliesTestPlanScopeAndProducesSafeFilename() {
        Fixture fixture = new Fixture();
        Project selected = project(1L, "PRJ-1", "Customer Portal / QA");
        TestPlan plan = new TestPlan();
        plan.setId(8L);
        plan.setTestPlanId("TP-8");
        plan.setName("Regression");
        plan.setProject(selected);
        when(fixture.projects.findByProjectId("PRJ-1")).thenReturn(Optional.of(selected));
        when(fixture.testPlans.findByTestPlanId("TP-8")).thenReturn(Optional.of(plan));
        when(fixture.entityManager.createNativeQuery(anyString())).thenReturn(fixture.query);
        when(fixture.query.setParameter(anyString(), any())).thenReturn(fixture.query);
        when(fixture.query.getResultList()).thenReturn(List.of());
        when(fixture.writer.write(anyString(), anyString(), any(), any())).thenReturn(new byte[]{7});

        var exported = fixture.service.export("PRJ-1", TestDesignExportScope.TEST_PLAN, "TP-8", null);

        ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
        verify(fixture.entityManager).createNativeQuery(sql.capture());
        assertThat(sql.getValue()).contains("and tp.id = :scopeId").contains("order by tp.id");
        verify(fixture.query).setParameter("scopeId", 8L);
        assertThat(exported.content()).containsExactly(7);
        assertThat(exported.fileName()).matches("customer-portal-qa-test-design-\\d{4}-\\d{2}-\\d{2}\\.xlsx");
    }

    private static Project project(Long id, String businessId, String name) {
        Project project = new Project();
        project.setId(id);
        project.setProjectId(businessId);
        project.setName(name);
        return project;
    }

    private static final class Fixture {
        private final ProjectRepository projects = mock(ProjectRepository.class);
        private final TestPlanRepository testPlans = mock(TestPlanRepository.class);
        private final ModuleRepository modules = mock(ModuleRepository.class);
        private final EntityManager entityManager = mock(EntityManager.class);
        private final Query query = mock(Query.class);
        private final TestDesignWorkbookWriter writer = mock(TestDesignWorkbookWriter.class);
        private final TestDesignExportService service = new TestDesignExportService(
                projects, testPlans, modules, entityManager, writer);
    }
}
