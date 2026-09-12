package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.automation.entity.AutomationStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AutomationStepRepository
        extends JpaRepository<AutomationStep, Long> {

    Optional<AutomationStep> findByAutomationStepId(
            String automationStepId
    );

    boolean existsByAutomationStepId(
            String automationStepId
    );

    boolean existsByAutomationScriptIdAndStepOrder(
            Long automationScriptId,
            Integer stepOrder
    );

    List<AutomationStep> findByAutomationScriptIdOrderByStepOrderAsc(
            Long automationScriptId
    );

    List<AutomationStep> findByTestStepIdOrderByStepOrderAsc(
            Long testStepId
    );
}