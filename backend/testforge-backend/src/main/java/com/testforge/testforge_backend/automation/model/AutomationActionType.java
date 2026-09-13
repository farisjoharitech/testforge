package com.testforge.testforge_backend.automation.model;

public enum AutomationActionType {

    /*
     * UI / browser actions
     */
    NAVIGATE,

    CLICK,

    FILL,

    SELECT,

    CHECK,

    UNCHECK,

    PRESS,

    WAIT,

    ASSERT_VISIBLE,

    ASSERT_HIDDEN,

    ASSERT_TEXT,

    ASSERT_VALUE,

    ASSERT_URL,

    ASSERT_TITLE,

    /*
     * API actions
     */
    API_GET,

    API_POST,

    API_PUT,

    API_PATCH,

    API_DELETE,

    ASSERT_API_STATUS,

    ASSERT_API_BODY_CONTAINS
}