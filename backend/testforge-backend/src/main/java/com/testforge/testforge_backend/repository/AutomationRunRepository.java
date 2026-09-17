package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.automation.entity.AutomationRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AutomationRunRepository extends JpaRepository<AutomationRun, Long> {

    Optional<AutomationRun> findByRunId(String runId);
}
