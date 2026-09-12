package com.testforge.testforge_backend.automation.exception;

public class AutomationNotFoundException
        extends RuntimeException {

    public AutomationNotFoundException(
            String message
    ) {
        super(message);
    }
}