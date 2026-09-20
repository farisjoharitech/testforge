package com.testforge.testforge_backend.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class BusinessIdGeneratorService {

    private final JdbcTemplate jdbcTemplate;

    public BusinessIdGeneratorService(
            JdbcTemplate jdbcTemplate
    ) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String generateProjectId() {
        return generate(
                "project_business_id_seq",
                "PRJ"
        );
    }

    public String generateTestPlanId() {
        return generate(
                "test_plan_business_id_seq",
                "TP"
        );
    }

    public String generateModuleId() {
        return generate("module_business_id_seq", "MOD");
    }

    public String generateRequirementId() {
        return generate(
                "requirement_business_id_seq",
                "REQ"
        );
    }

    public String generateScenarioId() {
        return generate(
                "test_scenario_business_id_seq",
                "SCN"
        );
    }

    public String generateTestCaseId() {
        return generate(
                "test_case_business_id_seq",
                "TC"
        );
    }

    public String generateTestStepId() {
        return generate(
                "test_step_business_id_seq",
                "STEP"
        );
    }

    private String generate(
            String sequenceName,
            String prefix
    ) {
        Long nextValue =
                jdbcTemplate.queryForObject(
                        "SELECT nextval('"
                                + sequenceName
                                + "')",
                        Long.class
                );

        if (
                nextValue == null
        ) {
            throw new IllegalStateException(
                    "Unable to generate business ID for prefix: "
                            + prefix
            );
        }

        return "%s-%06d".formatted(
                prefix,
                nextValue
        );
    }
}
