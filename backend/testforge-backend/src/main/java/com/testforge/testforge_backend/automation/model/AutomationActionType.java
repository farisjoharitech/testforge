package com.testforge.testforge_backend.automation.model;

public enum AutomationActionType {

    /* Browser / page lifecycle */
    NAVIGATE,
    GO_BACK,
    GO_FORWARD,
    RELOAD,

    /* Element interaction */
    CLICK,
    CLICK_NEW_TAB,
    CLICK_DOWNLOAD,
    DOUBLE_CLICK,
    HOVER,
    FOCUS,
    FILL,
    CLEAR,
    SELECT,
    CHECK,
    UNCHECK,
    PRESS,
    SET_INPUT_FILES,
    FRAME_CLICK,
    FRAME_FILL,

    /* Dialog handling for the next dialog */
    ACCEPT_DIALOG,
    DISMISS_DIALOG,

    /* Explicit waits */
    WAIT,
    WAIT_FOR_SELECTOR,
    WAIT_FOR_URL,
    WAIT_FOR_LOAD_STATE,

    /* Evidence */
    TAKE_SCREENSHOT,

    /* UI assertions */
    ASSERT_VISIBLE,
    ASSERT_HIDDEN,
    ASSERT_TEXT,
    ASSERT_CONTAINS_TEXT,
    ASSERT_VALUE,
    ASSERT_ENABLED,
    ASSERT_DISABLED,
    ASSERT_EDITABLE,
    ASSERT_CHECKED,
    ASSERT_COUNT,
    ASSERT_URL,
    ASSERT_TITLE,

    /* API actions */
    API_GET,
    API_POST,
    API_PUT,
    API_PATCH,
    API_DELETE,
    ASSERT_API_STATUS,
    ASSERT_API_BODY_CONTAINS
}
