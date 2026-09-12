package com.testforge.testforge_backend.exception;

public class InvalidTestCaseAutomationException
        extends RuntimeException {

    public InvalidTestCaseAutomationException(
            String message
    ) {
        super(message);
    }
}