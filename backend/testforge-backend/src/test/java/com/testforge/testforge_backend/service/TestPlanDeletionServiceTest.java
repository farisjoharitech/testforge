package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.cleanup.service.AuthoringDeletionService;
import com.testforge.testforge_backend.repository.ModuleRepository;
import com.testforge.testforge_backend.repository.ProjectRepository;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.*;

class TestPlanDeletionServiceTest {
    private TestPlanRepository plans;
    private ModuleRepository modules;
    private TestPlanService service;
    private AuthoringDeletionService deletionService;

    @BeforeEach
    void setUp() {
        plans = mock(TestPlanRepository.class);
        modules = mock(ModuleRepository.class);
        deletionService = mock(AuthoringDeletionService.class);
        service = new TestPlanService(plans, mock(ProjectRepository.class), modules,
                mock(BusinessIdGeneratorService.class), deletionService);
    }

    @Test
    void deletesOwnedHierarchyThroughTransactionalOrchestrator() {
        service.delete(7L);
        verify(deletionService).deleteTestPlan(7L);
    }
}
