package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.automation.entity.AutomationScript;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AutomationScriptRepository
        extends JpaRepository<AutomationScript, Long> {

    Optional<AutomationScript> findByAutomationScriptId(
            String automationScriptId
    );

    Optional<AutomationScript> findByTestCaseId(
            Long testCaseId
    );

    boolean existsByAutomationScriptId(
            String automationScriptId
    );

    boolean existsByTestCaseId(
            Long testCaseId
    );
}