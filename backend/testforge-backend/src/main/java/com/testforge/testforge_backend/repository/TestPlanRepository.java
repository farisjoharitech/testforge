package com.testforge.testforge_backend.repository;

import com.testforge.testforge_backend.domain.TestPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TestPlanRepository extends JpaRepository<TestPlan, Long> {

    Optional<TestPlan> findByTestPlanId(String testPlanId);

    boolean existsByTestPlanId(String testPlanId);
}