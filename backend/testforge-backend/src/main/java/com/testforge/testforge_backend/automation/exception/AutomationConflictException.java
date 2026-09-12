package com.testforge.testforge_backend.automation.exception;

public class AutomationConflictException
        extends RuntimeException {

    public AutomationConflictException(
            String message
    ) {
        super(message);
    }
}