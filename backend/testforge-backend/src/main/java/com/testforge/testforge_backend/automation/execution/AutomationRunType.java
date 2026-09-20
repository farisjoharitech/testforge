package com.testforge.testforge_backend.automation.execution;

public enum AutomationRunType {

    SINGLE_TEST_CASE,

    MULTI_TEST_CASE,

    SCENARIO,

    TEST_PLAN,

    /** Retained only so historical runs created by the retired TestSet model remain readable. */
    @Deprecated
    TEST_SET,

    TEST_SUITE
}
